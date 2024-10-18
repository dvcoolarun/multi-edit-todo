'use client'

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

    const queryClient = useQueryClient();

    const { data: todosData, isLoading, isError } = useQuery({
        queryKey: ['todos'], // Wrap the string value in an array to make it a valid QueryKey
        queryFn: () => useListTodo(),
    });
    
    const addTodoMutation = useMutation({
        mutationFn: (newTodo: InsertTodo) => useInsertTodo(newTodo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] })
        }
    });

    const updateTodoMutation = useMutation({
        mutationFn: (todo: UpdateTodo) => useUpdateTodo(todo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] })
        }
    });

    const deleteTodoMutation = useMutation({
        mutationFn: (id: string) => useDeleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] })
        }
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

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;


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
                {todosData?.data?.map((todo: Todo) => (
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