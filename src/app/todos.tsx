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
    const [newTodo, setNewTodo] = useState<string>('');
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
    

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error</p>;



    return (
        <div>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
            />
            <button
                onClick={() => {
                    addTodoMutation.mutate({
                        title: newTodo,
                        completed: false,
                    });
                    setNewTodo('');
                }}
            >
                Add Todo
            </button>
            <ul>
                {todosData?.data?.map((todo: Todo) => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => {
                                updateTodoMutation.mutate({
                                    id: todo.id,
                                    title: todo.title,
                                    completed: e.target.checked,
                                });
                            }}
                        />
                        <span>{todo.title}</span>
                        <button
                            onClick={() => {
                                deleteTodoMutation.mutate(todo.id);
                            }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoApp;