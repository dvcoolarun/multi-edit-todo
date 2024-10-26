import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Todo, DeleteTodo } from "../../routes";

interface TodoFooterProps {
    view: "all" | "active" | "completed";
    setView: (view: "all" | "active" | "completed") => void;
    todos: Todo[];
}

const TodoFooter = ({ view, setView, todos }: TodoFooterProps) => {

    const activeTodos = todos?.filter(todo => !todo.completed);
    const completedTodos = todos?.filter(todo => todo.completed);


    // Batch delete mutation
    const clearCompletedMutation = useMutation({
        mutationFn: async () => {
            await Promise.all(completedTodos?.map(todo => DeleteTodo(todo.id)) || []);
        }
    });

    return (
        <>
            {/* This footer should be hidden by default and shown when there are todos  */}
            <footer className="footer">
                {/* This should be `0 items left` by default  */}
                <span className="todo-count">
                    <strong>{activeTodos?.length}</strong> {activeTodos?.length === 1 ? "item" : "items"} left
                </span>
                {/* Remove this if you don't implement routing  */}
                <ul className="filters">
                    <li>
                        <a
                            className={view === "all" ? "selected" : ""}
                            href="#"
                            onClick={(e) => {
                                setView("all");
                                e.preventDefault();
                            }}
                        >
                            All
                        </a>
                    </li>
                    <li>
                        <a
                            className={view === "active" ? "selected" : ""}
                            href="#"
                            onClick={(e) => {
                                setView("active");
                                e.preventDefault();
                            }}
                        >
                            Active
                        </a>
                    </li>
                    <li>
                        <a
                            className={view === "completed" ? "selected" : ""}
                            href="#"
                            onClick={(e) => {
                                setView("completed");
                                e.preventDefault();
                            }}
                        >
                            Completed
                        </a>
                    </li>
                </ul>
                {/* Hidden if no completed items are left */}
                {completedTodos &&
                    <button
                        className="clear-completed"
                        onClick={() => {
                            clearCompletedMutation.mutate();
                        }}
                    >
                        Clear completed
                    </button>
                }
            </footer>
        </>
    )
}

export { TodoFooter };