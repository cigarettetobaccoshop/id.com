import { supabaseServer } from './supabaseServer'

const clean = (value, max = 160) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max)
const normalizePhone = (value) => clean(value, 40).replace(/[^0-9+]/g, '')

export async function cariProduk({ kata_kunci }) {
  const q = clean(kata_kunci, 80)
  if (!q) return { found: [], message: 'Kata kunci produk wajib diisi.' }
  const pattern = `%${q}%`
  const { data, error } = await supabaseServer.from('products').select('handle,title,vendor,type,tags,variant_sku,variant_price,variant_inventory_qty,status,catalog,option1_name,option1_value').eq('published', true).eq('status', 'active').or(`title.ilike.${pattern},handle.ilike.${pattern},vendor.ilike.${pattern},tags.ilike.${pattern}`).order('title', { ascending: true }).limit(12)
  if (error) throw new Error('Gagal membaca katalog produk.')
  return { found: (data || []).map((p) => ({ product_id: p.handle, title: p.title, vendor: p.vendor, type: p.type, sku: p.variant_sku, price: p.variant_price, stock: p.variant_inventory_qty, option: p.option1_value || null, catalog: p.catalog || null })) }
}

export async function cekStok({ product_id, variant_id }) {
  const id = clean(product_id, 160), variant = clean(variant_id, 160)
  if (!id) return { error: 'product_id wajib diisi.' }
  const { data, error } = await supabaseServer.from('products').select('handle,title,variant_sku,variant_price,variant_inventory_qty,status,published,option1_value').eq('handle', id).eq('published', true).eq('status', 'active').limit(25)
  if (error) throw new Error('Gagal membaca stok produk.')
  const rows = (data || []).filter((p) => !variant || p.variant_sku === variant || p.option1_value === variant)
  return { product_id: id, variant_id: variant || null, matches: rows.map((p) => ({ title: p.title, sku: p.variant_sku, price: p.variant_price, stock: p.variant_inventory_qty, option: p.option1_value || null })) }
}

export async function cekStatusPesanan({ order_id_atau_email, verifikasi }) {
  const identifier = clean(order_id_atau_email, 160), verification = clean(verifikasi, 160)
  if (!identifier || !verification) return { verified: false, message: 'Nomor pesanan/email dan verifikasi email atau nomor HP wajib diberikan.' }
  let query = supabaseServer.from('orders').select('order_number,customer_name,whatsapp,email,courier,total,status,payment_status,fulfillment_status,created_at,reservation_expires_at').limit(5)
  query = identifier.includes('@') ? query.eq('email', identifier) : query.eq('order_number', identifier)
  const { data, error } = await query
  if (error) throw new Error('Gagal membaca status pesanan.')
  const vEmail = verification.toLowerCase(), vPhone = normalizePhone(verification)
  const matches = (data || []).filter((order) => String(order.email || '').toLowerCase() === vEmail || normalizePhone(order.whatsapp) === vPhone)
  if (!matches.length) return { verified: false, message: 'Verifikasi tidak cocok. Detail pesanan tidak ditampilkan.' }
  return { verified: true, orders: matches.map((order) => ({ order_number: order.order_number, status: order.status, payment_status: order.payment_status, fulfillment_status: order.fulfillment_status, courier: order.courier, total: order.total, created_at: order.created_at, reservation_expires_at: order.reservation_expires_at })) }
}

export async function tambahKeKeranjang({ product_id, variant_id, qty }) {
  const id = clean(product_id, 160), variant = clean(variant_id, 300), quantity = Math.max(1, Math.min(Number.parseInt(qty, 10) || 1, 100))
  if (!id || !variant) return { configured: false, message: 'Identifier Shopify product/variant belum tersedia.' }
  const domain = process.env.SHOPIFY_STORE_DOMAIN, token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!domain || !token) return { configured: false, message: 'Shopify cart adapter belum dikonfigurasi. Jangan membuat URL checkout secara manual.' }
  const endpoint = `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/2025-07/graphql.json`
  const mutation = `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl } userErrors { field message } } }`
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token }, body: JSON.stringify({ query: mutation, variables: { input: { lines: [{ merchandiseId: variant, quantity }] } } }) })
  if (!response.ok) throw new Error('Shopify cart request gagal.')
  const payload = await response.json(), errors = payload?.data?.cartCreate?.userErrors || payload?.errors || []
  if (errors.length) return { configured: true, success: false, errors }
  return { configured: true, success: true, product_id: id, variant_id: variant, qty: quantity, checkout_url: payload?.data?.cartCreate?.cart?.checkoutUrl || null }
}

export const AI_TOOLS = [
  { name: 'cari_produk', description: 'Cari produk aktif di katalog R2 Nusantara. Gunakan sebelum menyebut produk, harga, atau stok.', input_schema: { type: 'object', properties: { kata_kunci: { type: 'string' } }, required: ['kata_kunci'], additionalProperties: false } },
  { name: 'cek_stok', description: 'Cek stok aktual produk dari database. Jangan mengarang hasil.', input_schema: { type: 'object', properties: { product_id: { type: 'string' }, variant_id: { type: 'string' } }, required: ['product_id'], additionalProperties: false } },
  { name: 'tambah_ke_keranjang', description: 'Buat Shopify cart dan ambil checkout URL resmi. Hanya gunakan jika identifier Shopify valid dan environment Shopify terkonfigurasi.', input_schema: { type: 'object', properties: { product_id: { type: 'string' }, variant_id: { type: 'string' }, qty: { type: 'integer', minimum: 1, maximum: 100 } }, required: ['product_id', 'variant_id', 'qty'], additionalProperties: false } },
  { name: 'cek_status_pesanan', description: 'Tampilkan status pesanan hanya setelah identifier dan verifikasi email atau nomor HP cocok.', input_schema: { type: 'object', properties: { order_id_atau_email: { type: 'string' }, verifikasi: { type: 'string' } }, required: ['order_id_atau_email', 'verifikasi'], additionalProperties: false } },
]

export async function executeAiTool(name, input) {
  switch (name) {
    case 'cari_produk': return cariProduk(input)
    case 'cek_stok': return cekStok(input)
    case 'tambah_ke_keranjang': return tambahKeKeranjang(input)
    case 'cek_status_pesanan': return cekStatusPesanan(input)
    default: throw new Error(`Tool tidak dikenal: ${name}`)
  }
}
