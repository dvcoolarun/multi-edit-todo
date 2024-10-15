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
type InsertTodo = Omit<Todo, 'id' | 'created_at' | 'updated_at'>;
type UpdateTodo = Partial<Omit<Todo,  'created_at' | 'updated_at'>>;

export type { Todo, InsertTodo, UpdateTodo };

// Query functions
const todos = {
  list: () =>
    supabase.from('todos').select(),

  insert: (todo: InsertTodo) =>
    supabase.from('todos').insert(todo),

  update: (id: string, todo: UpdateTodo) =>
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

const useListTodo = (): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.list());
};
const useInsertTodo = (todo: InsertTodo): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.insert(todo));
};
const useUpdateTodo = (todo: UpdateTodo): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.update(todo.id!, todo));
};
const useDeleteTodo = (id: string): Promise<OperationResult<Todo>> => {
  return todoOperation(async () => await todos.delete(id));
};

export { useListTodo, useInsertTodo, useUpdateTodo, useDeleteTodo };
