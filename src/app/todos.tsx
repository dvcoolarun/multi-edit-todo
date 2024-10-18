'use client'

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../routes";
import { RealtimeChannel } from "@supabase/supabase-js";

import {
    useListTodo,
    useInsertTodo,
    useUpdateTodo,
    useDeleteTodo,
    Todo,
    InsertTodo,
    UpdateTodo,
} from "../../routes";


const TodoApp = () => {
    const [view, setView] = useState<"all" | "completed" | "completed">('all');
    const [todos, setTodos] = useState<Todo[]>([]);

    const queryClient = useQueryClient();

    useEffect(() => {
        const fetchTodos = async () => {
            const { data, error } = await useListTodo();
            if (data) {
                setTodos(data);
            }
        };

        fetchTodos()

        const subscription: RealtimeChannel = supabase
            .channel('todos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todos' }, (payload) => {
                setTodos((prev) => [...prev, payload.new as Todo]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'todos' }, (payload) => {
                setTodos((prev) => {
                    const index = prev.findIndex((todo) => todo.id === payload.new.id);
                    prev[index] = payload.new as Todo;
                    return [...prev];
                });
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'todos' }, (payload) => {
                setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id));
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        }
    }, []);
    
    const addTodoMutation = useMutation({
        mutationFn: (newTodo: InsertTodo) => useInsertTodo(newTodo)
    });

    const updateTodoMutation = useMutation({
        mutationFn: (todo: UpdateTodo) => useUpdateTodo(todo)
    });

    const deleteTodoMutation = useMutation({
        mutationFn: (id: string) => useDeleteTodo(id)
    });

    const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            
            const target = event.target as HTMLInputElement;
            
            addTodoMutation.mutate({
                title: target.value,
                completed: false,
            });

            target.value = '';
        }
    }

    return (
        <div className="todoapp">
            <h1>todos</h1>
            <input
                type="text"
                className="new-todo"
                placeholder="What needs to be done?"
                autoFocus
                onKeyPress={onKeyPress}
            />
            <ul className="todo-list">
                {todos?.map((todo: Todo) => (
                    <li key={todo.id} className="view">
                        <div className="view">
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={todo.completed}
                            onChange={(e) => {
                                updateTodoMutation.mutate({
                                    id: todo.id,
                                    title: todo.title,
                                    completed: e.target.checked,
                                });
                            }}
                        />
                        <label>{todo.title}</label>
                        <button
                            className="destroy"
                            onClick={() => {
                                deleteTodoMutation.mutate(todo.id);
                            }}
                        ></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoApp;