import { supabaseAdmin, supabase } from '../lib/supabaseClient'

export default async function Page() {
  // Use server/admin client when available for server-side rendering; fall back to anon client.
  const client = supabaseAdmin || supabase

  try {
    const { data: todos, error } = await client.from('todos').select()
    if (error) {
      console.error('Supabase error', error)
      return (
        <main className="app-shell app-shell-error">
          <section className="status-card" role="alert">
            <span className="status-kicker">R2 Nusantara</span>
            <h1>Data sedang disiapkan</h1>
            <p>Error loading todos: {error.message}</p>
          </section>
        </main>
      )
    }

    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <span className="status-kicker">R2 Nusantara</span>
            <h1>Daftar pesanan</h1>
          </div>
          <span className="header-mark" aria-hidden="true">ID</span>
        </header>
        <section className="todo-panel" aria-label="Daftar pesanan">
          <div className="panel-heading">
            <span>Aktivitas terbaru</span>
            <span className="panel-count">{todos?.length ?? 0}</span>
          </div>
          <ul className="todo-list">
            {todos?.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <span className="todo-dot" aria-hidden="true" />
                <span>{todo.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    )
  } catch (err) {
    console.error('Unexpected error fetching todos', err)
    return <p>Error loading todos</p>
  }
}
