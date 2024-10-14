import { createClient, PostgrestResponse } from '@supabase/supabase-js';
import { Database } from './supabase';
import { QueryResult } from '@supabase/supabase-js';
import { Tables } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// types
type Todo = Tables<'todos'>;
type insertTodo = Omit<Todo, 'id' | 'created_at' | 'updated_at'>;
type updateTodo = Omit<Todo, 'created_at' | 'updated_at'>;
type deleteTodo = (id: string) => Promise<unknown>;

export type { Todo, insertTodo, updateTodo, deleteTodo };

// Query functions
export const todos = {
  list: () =>
    supabase.from('todos').select('*'),

  insert: (todo: insertTodo) =>
    supabase.from('todos').insert({ ...todo }),

  update: (id: string, todo: updateTodo) =>
    supabase.from('todos').update({ ...todo }).match({ id }),

  delete: (id: string) =>
    supabase.from('todos').delete().match({ id }),
  
};

type OperationResult<T> = {
  data: T | null;
  error: Error | null;
};

async function todoOperation<T>( 
  operation: Function
): Promise<OperationResult<T>> {
  const { data, error } = await operation()

  if (error) {
    throw error
  }

  return { data, error }
}

export default {
  list: (): Promise<OperationResult<Todo[]>> => {
    return todoOperation<Todo[]>(todos.list)
  },
  insert: (todo: insertTodo): Promise<OperationResult<Todo[]>> => {
    return todoOperation<Todo[]>(() => todos.insert(todo))
  },
  update: (id: string, todo: updateTodo): Promise<OperationResult<Todo[]>> => {
    return todoOperation<Todo[]>(() => todos.update(id, todo))
  },
  delete: (id: string): Promise<OperationResult<Todo[]>> => {
    return todoOperation<Todo[]>(() => todos.delete(id))
  }
}

