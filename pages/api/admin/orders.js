import { createAdminDataClient, getBearerToken, requireAdmin } from '../../../lib/admin/authorization'

const STATUS = new Set(['pending','confirmed','shipped','completed','cancelled'])

function mapOrder(row) {
  return {
    ...row,
    order_number: row.order_code,
    whatsapp: row.customer_phone,
    courier: row.ekspedisi,
  }
}

function rpcErrorCode(error) {
  const message = String(error?.message || '')
  if (message.includes('ORDER_NOT_FOUND')) return 'ORDER_NOT_FOUND'
  if (message.includes('INVALID_ORDER_STATUS')) return 'INVALID_ORDER_STATUS'
  if (message.includes('INVALID_STATUS_FILTER')) return 'INVALID_STATUS_FILTER'
  if (message.includes('ADMIN_ACCESS_DENIED')) return 'ADMIN_ACCESS_DENIED'
  return 'ADMIN_DATA_REQUEST_FAILED'
}

export default async function handler(req, res) {
  if (!['GET','PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  try {
    const user = await requireAdmin(req)
    if (!user) return res.status(403).json({ error: 'Akses admin ditolak.' })

    const token = getBearerToken(req)
    const db = createAdminDataClient(token)

    if (req.method === 'GET') {
      const { status, limit = '50' } = req.query
      const max = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 100)
      const normalizedStatus = typeof status === 'string' && STATUS.has(status) ? status : null

      if (typeof status === 'string' && status && !normalizedStatus) {
        return res.status(400).json({ error: 'Filter status tidak valid.' })
      }

      const { data, error } = await db.rpc('admin_dashboard_snapshot', {
        p_status: normalizedStatus,
        p_limit: max,
      })

      if (error) throw error

      const snapshot = data || {}
      return res.status(200).json({
        ok: true,
        generated_at: snapshot.generated_at || new Date().toISOString(),
        orders: Array.isArray(snapshot.orders) ? snapshot.orders.map(mapOrder) : [],
        stats: snapshot.stats || null,
        database: snapshot.database || null,
        image_integrity: snapshot.image_integrity || null,
        reservations: [],
        audit_log: [],
      })
    }

    const { id, status } = req.body || {}
    if (!id || !STATUS.has(status)) {
      return res.status(400).json({ error: 'ID order atau status tidak valid.' })
    }

    const { data, error } = await db.rpc('admin_update_order_status', {
      p_order_id: id,
      p_status: status,
    })

    if (error) {
      const code = rpcErrorCode(error)
      if (code === 'ORDER_NOT_FOUND') return res.status(404).json({ error: 'Order tidak ditemukan.' })
      if (code === 'INVALID_ORDER_STATUS') return res.status(400).json({ error: 'Status order tidak valid.' })
      throw error
    }

    const result = data || {}
    return res.status(200).json({
      ok: true,
      unchanged: Boolean(result.unchanged),
      order: result.order ? mapOrder(result.order) : null,
    })
  } catch (error) {
    console.error('admin orders API error:', error?.message || error)
    return res.status(500).json({ error: 'Permintaan admin gagal diproses.' })
  }
}
