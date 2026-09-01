import { supabaseAdmin, supabase } from '../../lib/supabaseRealtimeClient'

export default async function handler(req, res) {
  const { method } = req

  if (method === 'GET') {
    try {
      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        return res.status(403).json({ error: error.message })
      }

      return res.status(200).json({ data })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (method === 'POST') {
    try {
      const { name } = req.body

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid todo name' })
      }

      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('todos')
        .insert([{ name, completed: false }])
        .select()

      if (error) {
        return res.status(403).json({ error: error.message })
      }

      return res.status(201).json({ data: data?.[0] })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (method === 'PUT') {
    try {
      const { id, name, completed } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Missing todo id' })
      }

      const client = supabaseAdmin || supabase
      const { data, error } = await client
        .from('todos')
        .update({ name, completed })
        .eq('id', id)
        .select()

      if (error) {
        return res.status(403).json({ error: error.message })
      }

      return res.status(200).json({ data: data?.[0] })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Missing todo id' })
      }

      const client = supabaseAdmin || supabase
      const { error } = await client
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) {
        return res.status(403).json({ error: error.message })
      }

      return res.status(204).send('')
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
