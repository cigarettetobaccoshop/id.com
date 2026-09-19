import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../../../lib/supabase/config'
import { ADMIN_UUID } from '../../../lib/admin/constants'

function authClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Sesi admin tidak ditemukan.' })

    const { data: { user }, error } = await authClient().auth.getUser(token)
    if (error || !user || user.id !== ADMIN_UUID) {
      return res.status(403).json({ error: 'Verifikasi admin gagal.' })
    }

    return res.status(200).json({
      ok: true,
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    console.error('admin session verification error:', error?.message || error)
    return res.status(500).json({ error: 'Verifikasi admin gagal diproses.' })
  }
}
