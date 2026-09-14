import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgsbtexngystdmakqjyi.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function dbClient() {
  if (!serviceKey) throw new Error('Server Supabase credentials are not configured')
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const db = dbClient()
    const [{ count: activeProducts, error: productsError }, { count: ordersCount, error: ordersError }, { count: reservationsCount, error: reservationsError }] = await Promise.all([
      db.from('products').select('handle', { count: 'exact', head: true }).eq('published', true).eq('status', 'active'),
      db.from('orders').select('id', { count: 'exact', head: true }),
      db.from('inventory_reservations').select('id', { count: 'exact', head: true }),
    ])
    if (productsError) throw productsError
    if (ordersError) throw ordersError
    if (reservationsError) throw reservationsError

    res.setHeader('Cache-Control', 'no-store, max-age=0')
    res.setHeader('X-R2-Health', 'ok')
    if (req.method === 'HEAD') return res.status(200).end()
    return res.status(200).json({
      ok: true,
      service: 'r2-nusantara',
      database: 'connected',
      catalog: { active_products: activeProducts || 0 },
      orders: { total: ordersCount || 0 },
      inventory_reservations: { total: reservationsCount || 0 },
      checked_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('health check failed:', error?.message || error)
    res.setHeader('Cache-Control', 'no-store, max-age=0')
    return res.status(503).json({ ok: false, service: 'r2-nusantara', database: 'unavailable', error: 'Dependency unavailable' })
  }
}
