'use client'

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../routes";
import { RealtimeChannel } from "@supabase/supabase-js";
import { TodoFooter } from "./TodoFooter";

import {
    Todo,
    InsertTodoType,
    UpdateTodoType,
    ListTodos,
    InsertTodo,
    UpdateTodo,
    DeleteTodo,
} from "../../routes";

const TodoApp = () => {
    const [view, setView] = useState<"all" | "active" | "completed">('all');
    const queryClient = useQueryClient();
    
    const { data: todos } = useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            const { data, error } = await ListTodos();
            if (error) {
                throw error; 
            }
            return data;
        }
    });

    // Filter todo based on view
    const filterTodo = todos?.filter(todo => {
        if (view === 'active') return !todo.completed;
        if (view === 'completed') return todo.completed;
        return true
    })

    // New batch update mutation
    const updateAllMutation = useMutation({
        mutationFn: (todos: UpdateTodoType[]) => Promise.all(todos.map(todo => UpdateTodo(todo)))
    });

    const handleTodoChange = (event: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) => {
        queryClient.setQueryData(['todos'], (old: Todo[] = []) => {
            switch (event) {
                case 'INSERT':
                    return [...old, payload.new];
                case 'UPDATE':
                    return old.map(todo =>
                        todo.id === payload.new.id ? { ...todo, ...payload.new } : todo
                    );
                case 'DELETE':
                    return old.filter(todo => todo.id !== payload.old.id);
                default:
                    return old;
            }
        });
    };

    useEffect(() => {
        const subscription: RealtimeChannel = supabase
            .channel('todos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todos' }, (payload) => handleTodoChange('INSERT', payload))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'todos' }, (payload) => handleTodoChange('UPDATE', payload))
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'todos' }, (payload) => handleTodoChange('DELETE', payload))
            .subscribe();
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    const addTodoMutation = useMutation({
        mutationFn: (newTodo: InsertTodoType) => InsertTodo(newTodo)
    });

    const updateTodoMutation = useMutation({
        mutationFn: (todo: UpdateTodoType) => UpdateTodo(todo)
    });

    const deleteTodoMutation = useMutation({
        mutationFn: (id: string) => DeleteTodo(id)
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
        <div>
            <div className="todoapp">
                <h1>todos</h1>
                <input
                    type="text"
                    className="new-todo"
                    placeholder="What needs to be done?"
                    autoFocus
                    onKeyPress={onKeyPress}
                />
                {!! todos?.length && (
                    <>
                        <section className="main">
                            <input
                                id="toggle-all"
                                className="toggle-all"
                                type="checkbox"
                                onClick={(event) =>
                                updateAllMutation.mutate(
                                    todos.map((todo) => ({
                                        id: todo.id,
                                        completed: event.currentTarget.checked,
                                    }))
                                )
                                }
                            />
                            <label htmlFor="toggle-all">Mark all as complete</label>
                            <ul className="todo-list">
                                {filterTodo?.map((todo: Todo) => (
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
                        </section>
                        <TodoFooter todos={todos} view={view} setView={setView} />
                    </>
                )}
            </div>
            <footer className="info">
                <p>Double-click to edit a todo</p>
                <p>
                    Created by <a href="http://todomvc.com">YousefED</a>
                </p>
                <p>
                    {" "}
                    Part of <a href="http://todomvc.com">TodoMVC</a>
                </p>
            </footer> 
        </div>
    );
}

export default TodoApp;
