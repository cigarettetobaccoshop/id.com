import { createClient } from '@supabase/supabase-js'

const ADMIN_UUID = '76a6d92e-6de1-45e3-a5d0-90d7905c0d52'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgsbtexngystdmakqjyi.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function adminClient() {
  if (!serviceKey) throw new Error('Server Supabase credentials are not configured')
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Sesi admin tidak ditemukan.' })

    const { data: { user }, error } = await adminClient().auth.getUser(token)
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
