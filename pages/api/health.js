import { supabaseCatalogServer as db } from '../../lib/supabaseCatalogServer'

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const { count: activeProducts, error: productsError } = await db
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (productsError) throw productsError

    res.setHeader('Cache-Control', 'no-store, max-age=0')
    res.setHeader('X-R2-Health', 'ok')
    if (req.method === 'HEAD') return res.status(200).end()

    return res.status(200).json({
      ok: true,
      service: 'r2-nusantara',
      database: 'connected',
      catalog: { active_products: activeProducts || 0 },
      checked_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('health check failed:', error?.message || error)
    res.setHeader('Cache-Control', 'no-store, max-age=0')
    return res.status(503).json({ ok: false, service: 'r2-nusantara', database: 'unavailable', error: 'Dependency unavailable' })
  }
}
