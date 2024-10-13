import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase';
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


// Query functions
export const todos = {
  list: () =>
    supabase.from('todos').select('*'),

  insert: (todo: insertTodo) =>
    supabase.from('todos').insert(todo),

  update: (id: string, todo: updateTodo) =>
    supabase.from('todos').update(todo).match({ id }),

  delete: (id: string) =>
    supabase.from('todos').delete().match({ id }),
}

// types for query results
type ListTodos = Awaited<ReturnType<typeof todos.list>>;
type InsertTodo = Awaited<ReturnType<typeof todos.insert>>;
type UpdateTodo = Awaited<ReturnType<typeof todos.update>>;
type DeleteTodo = Awaited<ReturnType<typeof todos.delete>>;
