import { useEffect, useState } from 'react'
import { setupRealtimeSubscription } from '../lib/supabaseRealtimeClient'

export default function RealtimeDemo() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Subscribe to real-time changes on todos table
    const subscription = setupRealtimeSubscription(
      'todos',
      (payload) => {
        console.log('Real-time update:', payload)
        
        if (payload.eventType === 'INSERT') {
          setTodos(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setTodos(prev =>
            prev.map(t => (t.id === payload.new.id ? payload.new : t))
          )
        } else if (payload.eventType === 'DELETE') {
          setTodos(prev => prev.filter(t => t.id !== payload.old.id))
        }
      },
      { schema: 'public' }
    )

    // Load initial data
    loadTodos()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadTodos() {
    setLoading(true)
    try {
      const { data, error } = await fetch('/api/todos').then(r => r.json())
      if (error) {
        setMessage(`Error: ${error}`)
      } else {
        setTodos(data || [])
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  async function addTodo() {
    if (!newTodo.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTodo }),
      })
      const result = await response.json()
      
      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setNewTodo('')
        setMessage('Todo added successfully!')
        // Real-time subscription will auto-update the list
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>📡 Supabase Real-time Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        />
        <button
          onClick={addTodo}
          disabled={loading || !newTodo.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3ECF8E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Adding...' : 'Add Todo'}
        </button>
      </div>

      {message && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          {message}
        </p>
      )}

      <div>
        <h2>Todo List ({todos.length})</h2>
        {todos.length === 0 ? (
          <p style={{ color: '#999' }}>No todos yet. Add one to get started!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f5f5f5',
                  borderLeft: '4px solid #3ECF8E',
                  borderRadius: '4px',
                }}
              >
                <strong>{todo.name}</strong>
                <br />
                <small style={{ color: '#999' }}>
                  Created: {new Date(todo.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr style={{ marginTop: '30px' }} />
      <p style={{ fontSize: '12px', color: '#999' }}>
        💡 Tip: Open this page in multiple tabs to see real-time updates across all windows!
      </p>
    </div>
  )
}
