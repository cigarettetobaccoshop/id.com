import { requireAdmin } from '../../../lib/admin/authorization'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const user = await requireAdmin(req)
    if (!user) return res.status(403).json({ error: 'Verifikasi admin gagal.' })

    return res.status(200).json({
      ok: true,
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    console.error('admin session verification error:', error?.message || error)
    return res.status(500).json({ error: 'Verifikasi admin gagal diproses.' })
  }
}
