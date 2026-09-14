import { createClient } from '@supabase/supabase-js'

const ADMIN_UUID = '76a6d92e-6de1-45e3-a5d0-90d7905c0d52'
const STATUS = new Set(['pending','confirmed','processing','shipped','completed','cancelled'])
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgsbtexngystdmakqjyi.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function adminClient() {
  if (!serviceKey) throw new Error('Server Supabase credentials are not configured')
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function requireAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  const client = adminClient()
  const { data: { user }, error } = await client.auth.getUser(token)
  if (error || !user || user.id !== ADMIN_UUID) return null
  return user
}

export default async function handler(req, res) {
  if (!['GET','PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' })
  try {
    const user = await requireAdmin(req)
    if (!user) return res.status(403).json({ error: 'Akses admin ditolak.' })
    const db = adminClient()

    if (req.method === 'GET') {
      const { status, from, to, limit = '30' } = req.query
      const max = Math.min(Math.max(Number.parseInt(limit, 10) || 30, 1), 100)
      let query = db.from('orders').select('id,order_number,customer_name,whatsapp,address,city,postal_code,courier,payment_method,items,subtotal,shipping_cost,total,status,payment_status,fulfillment_status,created_at,reservation_expires_at').order('created_at',{ascending:false}).limit(max)
      if (typeof status === 'string' && STATUS.has(status)) query = query.eq('status', status)
      if (typeof from === 'string' && from) query = query.gte('created_at', from)
      if (typeof to === 'string' && to) query = query.lte('created_at', to)
      const { data: orders, error } = await query
      if (error) throw error

      const { data: all, error: statsError } = await db.from('orders').select('status,total,created_at')
      if (statsError) throw statsError
      const rows = all || [], today = new Date(); today.setHours(0,0,0,0)
      const stats = { total_orders:rows.length, today_orders:rows.filter(o=>new Date(o.created_at)>=today).length, pending:0, confirmed:0, processing:0, shipped:0, completed:0, cancelled:0, total_sales:0 }
      for (const o of rows) { if (stats[o.status] !== undefined) stats[o.status] += 1; if (o.status !== 'cancelled') stats.total_sales += Number(o.total)||0 }
      return res.status(200).json({ orders: orders || [], stats })
    }

    const { id, status } = req.body || {}
    if (!id || !STATUS.has(status)) return res.status(400).json({ error: 'ID order atau status tidak valid.' })
    const { data: current, error: readError } = await db.from('orders').select('id,order_number,status').eq('id',id).maybeSingle()
    if (readError) throw readError
    if (!current) return res.status(404).json({ error: 'Order tidak ditemukan.' })
    if (current.status === status) return res.status(200).json({ order: current, unchanged: true })

    // Keep the existing production schema intact: orders has no updated_at column.
    // fulfillment_status is synchronized with the admin-visible order status.
    const { data: updated, error: updateError } = await db.from('orders').update({ status, fulfillment_status: status }).eq('id',id).select('id,order_number,status,fulfillment_status').single()
    if (updateError) throw updateError
    const { error: auditError } = await db.from('audit_log').insert({ user_id: user.id, event_type: 'order_status_updated', metadata: { order_id:id, order_number:current.order_number, from:current.status, to:status } })
    if (auditError) console.error('audit log insert failed:', auditError.message)
    return res.status(200).json({ order: updated })
  } catch (error) {
    console.error('admin orders API error:', error?.message || error)
    return res.status(500).json({ error: 'Permintaan admin gagal diproses.' })
  }
}
