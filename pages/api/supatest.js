import { supabase, supabaseAdmin } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  // Simple, robust test route. Use query param `table` to select from a table (default: todos).
  const table = (req.query.table || 'todos').toString()
  const limit = Number(req.query.limit || 10)

  if (!table) {
    return res.status(400).json({ error: 'Missing table name' })
  }
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: 'Invalid limit' })
  }

  try {
    // Prefer admin client for server-side queries if available (privileged)
    const client = supabaseAdmin || supabase

    const { data, error } = await client.from(table).select('*').limit(limit)

    if (error) {
      // If using anon key and RLS denies access, return 403 so user knows to check policies
      const status = error.status === 400 ? 400 : (error.status === 401 ? 401 : 403)
      return res.status(status).json({ error: error.message, hint: error.hint })
    }

    return res.status(200).json({ data })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
