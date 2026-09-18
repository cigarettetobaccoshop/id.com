import { supabaseServer } from './supabaseServer'

const clean = (value, max = 160) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max)
const normalizePhone = (value) => clean(value, 40).replace(/[^0-9+]/g, '')
const PRODUCT_COLUMNS = 'id,name,price,category,segment,segment_name,description,rating,is_active'

export async function cariProduk({ kata_kunci }) {
  const q = clean(kata_kunci, 80)
  if (!q) return { found: [], message: 'Kata kunci produk wajib diisi.' }
  const pattern = `%${q}%`
  const { data, error } = await supabaseServer.from('products').select(PRODUCT_COLUMNS).eq('is_active', true)
    .or(`name.ilike.${pattern},id.ilike.${pattern},category.ilike.${pattern},segment.ilike.${pattern},segment_name.ilike.${pattern}`)
    .order('name', { ascending: true }).limit(12)
  if (error) throw new Error('Gagal membaca katalog produk.')
  return { found: (data || []).map((p) => ({
    product_id: p.id, title: p.name, vendor: p.segment_name || p.category || null,
    type: p.category || null, sku: p.id, price: p.price, stock: null,
    availability: p.is_active ? 'aktif — jumlah stok tidak disimpan di tabel katalog' : 'tidak aktif',
    option: p.segment_name || p.segment || null, catalog: p.category || null,
  })) }
}

export async function cekStok({ product_id, variant_id }) {
  const id = clean(product_id, 160), variant = clean(variant_id, 160)
  if (!id) return { error: 'product_id wajib diisi.' }
  const { data, error } = await supabaseServer.from('products').select(PRODUCT_COLUMNS)
    .eq('id', id).eq('is_active', true).maybeSingle()
  if (error) throw new Error('Gagal membaca ketersediaan produk.')
  if (!data) return { product_id: id, variant_id: variant || null, matches: [], message: 'Produk tidak ditemukan atau tidak aktif.' }
  return { product_id: data.id, variant_id: variant || null, matches: [{
    title: data.name, sku: data.id, price: data.price, stock: null,
    availability: 'aktif — jumlah stok tidak tersedia pada tabel products',
    option: data.segment_name || data.segment || null,
  }] }
}

export async function cekStatusPesanan({ order_id_atau_email, verifikasi }) {
  const identifier = clean(order_id_atau_email, 160), verification = clean(verifikasi, 80)
  if (!identifier || !verification) return { verified: false, message: 'Nomor pesanan dan nomor HP verifikasi wajib diberikan.' }
  const { data, error } = await supabaseServer.from('orders')
    .select('order_code,customer_name,customer_phone,address,city,province,postal_code,ekspedisi,payment_method,items,subtotal,status,created_at,updated_at')
    .eq('order_code', identifier).maybeSingle()
  if (error) throw new Error('Gagal membaca status pesanan.')
  if (!data) return { verified: false, message: 'Pesanan tidak ditemukan.' }
  if (normalizePhone(data.customer_phone) !== normalizePhone(verification)) {
    return { verified: false, message: 'Verifikasi tidak cocok. Detail pesanan tidak ditampilkan.' }
  }
  return { verified: true, orders: [{
    order_number: data.order_code, customer_name: data.customer_name, status: data.status,
    payment_method: data.payment_method, courier: data.ekspedisi, total: data.subtotal,
    created_at: data.created_at, updated_at: data.updated_at,
  }] }
}

export async function tambahKeKeranjang({ product_id, variant_id, qty }) {
  const id = clean(product_id, 160), variant = clean(variant_id, 300), quantity = Math.max(1, Math.min(Number.parseInt(qty, 10) || 1, 100))
  if (!id || !variant) return { configured: false, message: 'Identifier Shopify product/variant belum tersedia.' }
  const domain = process.env.SHOPIFY_STORE_DOMAIN, token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN, apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION
  if (!domain || !token || !apiVersion) return { configured: false, message: 'Shopify cart adapter belum dikonfigurasi lengkap. Jangan membuat URL checkout secara manual.' }
  const endpoint = `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/${encodeURIComponent(apiVersion)}/graphql.json`
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
