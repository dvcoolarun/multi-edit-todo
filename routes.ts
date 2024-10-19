'use client'

import { createClient, PostgrestError, PostgrestResponse } from '@supabase/supabase-js';
import { Database } from './supabase';
import { Tables } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Types
type Todo = Tables<'todos'>;
type InsertTodoType = Omit<Todo, 'id' | 'created_at' | 'updated_at'>;
type UpdateTodoType = Partial<Omit<Todo,  'created_at' | 'updated_at'>>;

export type { Todo, InsertTodoType, UpdateTodoType };

// Query functions
const todos = {
  list: () =>
    supabase.from('todos').select(),

  insert: (todo: InsertTodoType) =>
    supabase.from('todos').insert(todo),

  update: (id: string, todo: UpdateTodoType) =>
    supabase.from('todos').update(todo).match({ id }),

  delete: (id: string) =>
    supabase.from('todos').delete().match({ id }),
};

type OperationResult<T> = {
  data: T[] | [] | null;
  error: PostgrestError | Error | null;
};

async function todoOperation<T>(
  operation: () => Promise<OperationResult<T>>
): Promise<OperationResult<T>> {
  try {
    const { data, error } = await operation();
    return { data, error };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

const ListTodos = (): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.list());
};
const InsertTodo = (todo: InsertTodoType): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.insert(todo));
};
const UpdateTodo = (todo: UpdateTodoType): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.update(todo.id!, todo));
};
const DeleteTodo = (id: string): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.delete(id));
};

export { supabase };

export  { ListTodos, InsertTodo, UpdateTodo, DeleteTodo };
