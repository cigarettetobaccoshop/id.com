import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  try {
    // Replace 'todos' with a real table name from your Supabase project for testing
    const { data, error } = await supabase.from('todos').select('*').limit(10)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
