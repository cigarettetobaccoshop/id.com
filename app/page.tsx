import { supabaseAdmin, supabase } from '../lib/supabaseClient'

export default async function Page() {
  // Use server/admin client when available for server-side rendering; fall back to anon client.
  const client = supabaseAdmin || supabase

  try {
    const { data: todos, error } = await client.from('todos').select()
    if (error) {
      console.error('Supabase error', error)
      return <p>Error loading todos: {error.message}</p>
    }

    return (
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    )
  } catch (err) {
    console.error('Unexpected error fetching todos', err)
    return <p>Error loading todos</p>
  }
}
