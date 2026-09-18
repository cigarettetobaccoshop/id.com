import { createClient } from '@supabase/supabase-js'

const ADMIN_UUID = '60c5525a-d68a-4b0f-b7fd-b9bd2371bf4a'
const STATUS = new Set(['pending','confirmed','shipped','completed','cancelled'])
const url = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey = 'sb_publishable_mqJp3tqSL1gCjz1xdcgWGQ_mtDFRTmg'

function adminClient() {
  if (!url || !serviceKey) throw new Error('Server Supabase credentials are not configured')
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

function authClient() {
  return createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function requireAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  const { data: { user }, error } = await authClient().auth.getUser(token)
  if (error || !user || user.id !== ADMIN_UUID) return null
  return user
}

function mapOrder(row) {
  return {
    ...row,
    order_number: row.order_code,
    whatsapp: row.customer_phone,
    courier: row.ekspedisi,
  }
}

export default async function handler(req, res) {
  if (!['GET','PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  try {
    const user = await requireAdmin(req)
    if (!user) return res.status(403).json({ error: 'Akses admin ditolak.' })
    const db = adminClient()

    if (req.method === 'GET') {
      const { status, from, to, limit = '50' } = req.query
      const max = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 100)
      let query = db.from('orders')
        .select('id,order_code,customer_name,customer_phone,email,address,city,province,postal_code,ekspedisi,payment_method,items,subtotal,shipping_cost,total,status,notes,created_at,updated_at')
        .order('created_at',{ascending:false})
        .limit(max)

      if (typeof status === 'string' && STATUS.has(status)) query = query.eq('status', status)
      if (typeof from === 'string' && from) query = query.gte('created_at', from)
      if (typeof to === 'string' && to) query = query.lte('created_at', to)

      const [{ data: orders, error }, { data: all, error: statsError }] = await Promise.all([
        query,
        db.from('orders').select('status,total,created_at')
      ])
      if (error) throw error
      if (statsError) throw statsError

      const rows = all || []
      const today = new Date()
      today.setHours(0,0,0,0)
      const stats = {
        total_orders: rows.length,
        today_orders: rows.filter(o => new Date(o.created_at) >= today).length,
        pending: 0, confirmed: 0, shipped: 0, completed: 0, cancelled: 0,
        total_sales: 0
      }
      for (const o of rows) {
        if (stats[o.status] !== undefined) stats[o.status] += 1
        if (o.status !== 'cancelled') stats.total_sales += Number(o.total) || 0
      }

      return res.status(200).json({
        ok: true,
        generated_at: new Date().toISOString(),
        orders: (orders || []).map(mapOrder),
        stats,
        reservations: [],
        audit_log: []
      })
    }

    const { id, status } = req.body || {}
    if (!id || !STATUS.has(status)) return res.status(400).json({ error: 'ID order atau status tidak valid.' })

    const { data: current, error: readError } = await db
      .from('orders')
      .select('id,order_code,status,updated_at')
      .eq('id',id)
      .maybeSingle()
    if (readError) throw readError
    if (!current) return res.status(404).json({ error: 'Order tidak ditemukan.' })
    if (current.status === status) return res.status(200).json({ ok:true, order:mapOrder(current), unchanged:true })

    const { data: updated, error: updateError } = await db
      .from('orders')
      .update({ status, updated_at:new Date().toISOString() })
      .eq('id',id)
      .select('id,order_code,status,updated_at')
      .single()
    if (updateError) throw updateError

    return res.status(200).json({ ok:true, order:mapOrder(updated) })
  } catch (error) {
    console.error('admin orders API error:', error?.message || error)
    return res.status(500).json({ error: 'Permintaan admin gagal diproses.' })
  }
}
