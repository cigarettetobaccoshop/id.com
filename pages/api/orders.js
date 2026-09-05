import { randomUUID } from 'crypto'
import { supabase } from '../../lib/supabaseClient'

const COURIERS = { JNE: 25000, 'J&T': 22000, SiCepat: 22000, Pickup: 0 }
const PAYMENT_METHODS = new Set(['Bank Transfer', 'Escrow (Bayar Setelah Resi)'])
const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { customer, items } = req.body || {}
    if (!customer || !Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Data checkout belum lengkap.' })
    const customer_name = clean(customer.name, 120)
    const whatsapp = clean(customer.whatsapp, 40)
    const email = clean(customer.email, 160)
    const address = clean(customer.address, 500)
    const city = clean(customer.city, 100)
    const postal_code = clean(customer.postal_code, 10)
    const courier = clean(customer.courier, 30)
    const payment_method = clean(customer.payment_method, 60)
    const notes = clean(customer.notes, 500)
    if (!customer_name || !whatsapp || !address || !courier || !payment_method) return res.status(400).json({ error: 'Nama, WhatsApp, alamat, kurir, dan pembayaran wajib diisi.' })
    if (!COURIERS[courier] && courier !== 'Pickup') return res.status(400).json({ error: 'Kurir tidak valid.' })
    if (!PAYMENT_METHODS.has(payment_method)) return res.status(400).json({ error: 'Metode pembayaran tidak valid.' })

    const { data: catalog, error: catalogError } = await supabase.from('R2 NUSANTARA').select('Handle,Title,Vendor,Type,"Variant SKU","Variant Price","Variant Inventory Qty",Published,Status').eq('Published', true).eq('Status', 'active').limit(250)
    if (catalogError) throw catalogError
    const byKey = new Map()
    for (const p of catalog || []) { if (p['Variant SKU']) byKey.set(`sku:${p['Variant SKU']}`, p); if (p.Handle) byKey.set(`handle:${p.Handle}`, p) }
    const normalized = []
    let subtotal = 0
    for (const raw of items.slice(0, 50)) {
      const qty = Math.max(1, Math.min(999, Number(raw.qty || raw.quantity || 1)))
      const key = raw.sku ? `sku:${clean(raw.sku, 120)}` : `handle:${clean(raw.handle, 200)}`
      const product = byKey.get(key)
      if (!product) return res.status(400).json({ error: 'Ada produk yang sudah tidak tersedia.' })
      const stock = Math.max(0, Number(product['Variant Inventory Qty']) || 0)
      if (qty > stock) return res.status(400).json({ error: `${product.Title || 'Produk'} melebihi stok tersedia (${stock}).` })
      const unit_price = Number(product['Variant Price']) || 0
      if (unit_price < 0) return res.status(400).json({ error: 'Harga produk tidak valid.' })
      subtotal += unit_price * qty
      normalized.push({ sku: product['Variant SKU'] || null, handle: product.Handle || null, title: product.Title || product.Handle, qty, unit_price })
    }
    const shipping_cost = COURIERS[courier] ?? 0
    const total = subtotal + shipping_cost
    const order_number = `R2-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`
    const { error: insertError } = await supabase.from('orders').insert({ order_number, customer_name, whatsapp, email: email || null, address, city: city || null, postal_code: postal_code || null, courier, payment_method, notes: notes || null, items: normalized, subtotal, shipping_cost, total })
    if (insertError) throw insertError
    return res.status(201).json({ order_number, subtotal, shipping_cost, total, status: 'pending' })
  } catch (error) {
    console.error('create order error', error)
    return res.status(500).json({ error: 'Pesanan belum dapat dibuat. Silakan coba kembali.' })
  }
}
