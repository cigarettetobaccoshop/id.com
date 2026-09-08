import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const { count, error } = await supabase
      .from('R2 NUSANTARA')
      .select('Handle', { count: 'exact', head: true })
      .eq('Published', true)
      .eq('Status', 'active')

    if (error) throw error

    res.setHeader('Cache-Control', 'no-store, max-age=0')
    res.setHeader('X-R2-Health', 'ok')

    if (req.method === 'HEAD') return res.status(200).end()
    return res.status(200).json({ ok: true, service: 'r2-nusantara', catalog: { active_products: count || 0 } })
  } catch (error) {
    console.error('health check failed', error.message)
    return res.status(503).json({ ok: false, service: 'r2-nusantara', error: 'Dependency unavailable' })
  }
}
