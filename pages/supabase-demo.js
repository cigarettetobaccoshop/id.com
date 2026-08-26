import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseDemo() {
  const [email, setEmail] = useState('')
  const [user, setUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    // initial user
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null)).catch(() => {})

    return () => {
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function signIn() {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setMessage(error.message)
    else setMessage('Magic link sent — check your email')
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function loadTodos() {
    setLoading(true)
    const { data, error } = await supabase.from('todos').select('*').limit(20)
    if (error) setMessage(error.message)
    else setTodos(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Quick Demo</h1>

      {!user ? (
        <div>
          <p>Sign in with email (magic link):</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button onClick={signIn} disabled={loading || !email}>Send magic link</button>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <p>Signed in as: {user.email}</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}

      <hr />

      <div>
        <h2>Fetch sample data from `todos`</h2>
        <button onClick={loadTodos} disabled={loading}>Load todos</button>
        {loading && <p>Loading…</p>}
        <pre>{JSON.stringify(todos, null, 2)}</pre>
      </div>

      <p style={{ marginTop: 20, color: '#666' }}>
        Notes: replace `todos` with a table name from your project. For authenticated user-specific queries, use RLS policies in Supabase and include the user's JWT (handled automatically by the client after sign-in).
      </p>
    </div>
  )
}
