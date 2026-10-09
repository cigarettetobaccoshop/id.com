import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../../../lib/admin/authorization'

const SUPABASE_URL = 'https://nwrqdcrknipnfvhogjyg.supabase.co'
const CATEGORIES = new Set(['r2', 'resmi'])
const MAX_PRICE = 100000000

function clean(value, max = 240) {
  return String(value ?? '').trim().slice(0, max)
}

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function jakartaDayStart() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), -7)).toISOString()
}

function normalizeProduct(body, creating = false) {
  const result = {}
  if (creating || body.name !== undefined) {
    result.name = clean(body.name, 160)
    if (!result.name) throw new Error('Nama produk wajib diisi.')
  }
  if (creating || body.price !== undefined) {
    const price = Number(body.price)
    if (!Number.isSafeInteger(price) || price < 1 || price > MAX_PRICE) throw new Error('Harga harus berupa angka bulat yang valid.')
    result.price = price
  }
  if (creating || body.category !== undefined) {
    const category = clean(body.category, 20).toLowerCase()
    if (!CATEGORIES.has(category)) throw new Error('Kategori harus R2 atau Resmi.')
    result.category = category
  }
  for (const field of ['segment', 'segment_name', 'description']) {
    if (body[field] !== undefined) result[field] = clean(body[field], field === 'description' ? 2000 : 120) || null
  }
  if (body.is_active !== undefined) {
    if (typeof body.is_active !== 'boolean') throw new Error('Status produk tidak valid.')
    result.is_active = body.is_active
  } else if (creating) result.is_active = true
  return result
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('Vary', 'Authorization')
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH')
    return res.status(405).json({ error: 'Method tidak diizinkan.' })
  }

  try {
    const user = await requireAdmin(req)
    if (!user) return res.status(403).json({ error: 'Akses admin ditolak.' })
    const db = getServiceClient()
    if (!db) return res.status(503).json({ error: 'Katalog admin belum aktif: konfigurasi server SUPABASE_SERVICE_ROLE_KEY belum tersedia.' })

    if (req.method === 'GET') {
      const [productsResult, todayResult] = await Promise.all([
        db.from('products').select('id,name,price,category,segment,segment_name,description,is_active,updated_at').order('name', { ascending: true }).limit(250),
        db.from('orders').select('id,total,status,created_at').gte('created_at', jakartaDayStart()).limit(1000),
      ])
      if (productsResult.error) throw productsResult.error
      if (todayResult.error) throw todayResult.error
      const products = productsResult.data || []
      const todaysOrders = todayResult.data || []
      const revenue = todaysOrders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + (Number(order.total) || 0), 0)
      return res.status(200).json({
        ok: true,
        products,
        metrics: {
          active_skus: products.filter((product) => product.is_active).length,
          total_skus: products.length,
          today_orders: todaysOrders.length,
          today_revenue: revenue,
          timezone: 'Asia/Jakarta',
          generated_at: new Date().toISOString(),
        },
      })
    }

    if (req.method === 'POST') {
      const product = normalizeProduct(req.body || {}, true)
      product.id = randomUUID()
      const { data, error } = await db.from('products').insert(product).select('id,name,price,category,segment,segment_name,description,is_active,updated_at').single()
      if (error) throw error
      return res.status(201).json({ ok: true, product: data })
    }

    const id = clean(req.body?.id, 120)
    if (!id) return res.status(400).json({ error: 'ID produk wajib diisi.' })
    const patch = normalizeProduct(req.body || {})
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Tidak ada perubahan produk.' })
    patch.updated_at = new Date().toISOString()
    const { data, error } = await db.from('products').update(patch).eq('id', id).select('id,name,price,category,segment,segment_name,description,is_active,updated_at').maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Produk tidak ditemukan.' })
    return res.status(200).json({ ok: true, product: data })
  } catch (error) {
    const message = String(error?.message || '')
    if (message.includes('wajib') || message.includes('harus') || message.includes('valid') || message.includes('Tidak ada perubahan')) {
      return res.status(400).json({ error: message })
    }
    console.error('admin products API error:', error?.message || error)
    return res.status(500).json({ error: 'Permintaan katalog admin gagal diproses.' })
  }
}
