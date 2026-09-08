import { randomUUID } from 'crypto'
import { supabaseServer as supabase } from '../../lib/supabaseServer'

const COURIERS = { JNE: 25000, 'J&T': 22000, SiCepat: 22000, Pickup: 0 }
const PAYMENT_METHODS = new Set(['Bank Transfer', 'Escrow (Bayar Setelah Resi)'])
const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max)
const money = (v) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)||0)

function whatsappUrl(order, items) {
  const phone = clean(process.env.WHATSAPP_BUSINESS_PHONE, 30).replace(/\D/g,'')
  if (!phone) return null
  const lines = ['Halo R2 NUSANTARA, saya ingin konfirmasi pesanan.',`No. Pesanan: ${order.order_number}`,`Nama: ${order.customer_name}`,`Total: ${money(order.total)}`,`Pembayaran: ${order.payment_method}`,`Kurir: ${order.courier}`,'','Detail:',...items.map((x) => `- ${x.title} (${x.sku}) x${x.qty}`),'','Mohon diproses dan dikonfirmasi. Terima kasih.']
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
}

async function sendCloudWhatsApp(order) {
  const token = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0'
  if (!token || !phoneId) return { sent: false }
  const to = clean(order.whatsapp, 40).replace(/\D/g,'')
  if (!to) return { sent: false }
  try {
    const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:`Order ${order.order_number} diterima. Total ${money(order.total)}. Metode ${order.payment_method}. Tim R2 NUSANTARA akan melakukan konfirmasi melalui WhatsApp.`}})})
    return { sent: response.ok }
  } catch { return { sent:false } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { customer, items } = req.body || {}
    if (!customer || !Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Data checkout belum lengkap.' })
    const customer_name = clean(customer.name, 120), whatsapp = clean(customer.whatsapp, 40), email = clean(customer.email, 160), address = clean(customer.address, 500), city = clean(customer.city, 100), postal_code = clean(customer.postal_code, 10), courier = clean(customer.courier, 30), payment_method = clean(customer.payment_method, 60), notes = clean(customer.notes, 500)
    if (!customer_name || !whatsapp || !address || !courier || !payment_method) return res.status(400).json({ error: 'Nama, WhatsApp, alamat, kurir, dan pembayaran wajib diisi.' })
    if (!(courier in COURIERS)) return res.status(400).json({ error: 'Kurir tidak valid.' })
    if (!PAYMENT_METHODS.has(payment_method)) return res.status(400).json({ error: 'Metode pembayaran tidak valid.' })
    const { data: catalog, error: catalogError } = await supabase.from('R2 NUSANTARA').select('Handle,Title,Vendor,Type,"Variant SKU","Variant Price","Variant Inventory Qty",Published,Status').eq('Published', true).eq('Status', 'active').limit(250)
    if (catalogError) throw catalogError
    const byKey = new Map(); for (const p of catalog || []) { if (p['Variant SKU']) byKey.set(`sku:${p['Variant SKU']}`, p); if (p.Handle) byKey.set(`handle:${p.Handle}`, p) }
    const normalized = []; let subtotal = 0
    for (const raw of items.slice(0,50)) {
      const qty = Math.max(1,Math.min(999,Number(raw.qty||raw.quantity||1))), key = raw.sku ? `sku:${clean(raw.sku,120)}` : `handle:${clean(raw.handle,200)}`, product = byKey.get(key)
      if (!product) return res.status(400).json({ error:'Ada produk yang sudah tidak tersedia.' })
      const stock = Math.max(0,Number(product['Variant Inventory Qty'])||0); if (qty > stock) return res.status(409).json({ error:`${product.Title||'Produk'} melebihi stok tersedia (${stock}). Silakan refresh katalog.` })
      const unit_price = Number(product['Variant Price'])||0; if (unit_price <= 0) return res.status(400).json({error:'Harga produk tidak valid.'})
      subtotal += unit_price*qty; normalized.push({sku:product['Variant SKU']||null,handle:product.Handle||null,title:product.Title||product.Handle,qty,unit_price})
    }
    const shipping_cost = COURIERS[courier], total = subtotal + shipping_cost, order_number = `R2-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`
    const { data: created, error: rpcError } = await supabase.rpc('create_order_atomic',{p_order_number:order_number,p_customer_name:customer_name,p_whatsapp:whatsapp,p_email:email,p_address:address,p_city:city,p_postal_code:postal_code,p_courier:courier,p_payment_method:payment_method,p_notes:notes,p_items:normalized,p_subtotal:subtotal,p_shipping_cost:shipping_cost,p_total:total,p_reservation_minutes:30})
    if (rpcError) { if (String(rpcError.message||'').includes('INSUFFICIENT_STOCK')) return res.status(409).json({error:'Stok baru saja berubah. Silakan kembali ke katalog dan coba lagi.'}); throw rpcError }
    const order = {order_number,customer_name,whatsapp,courier,payment_method,total}, wa_url = whatsappUrl(order,normalized), cloud = await sendCloudWhatsApp(order)
    const { error: updateError } = await supabase.from('orders').update({whatsapp_status:cloud.sent?'sent':'pending',whatsapp_last_sent_at:cloud.sent?new Date().toISOString():null}).eq('id',created.order_id)
    if (updateError) console.error('order WhatsApp status update error', updateError)
    return res.status(201).json({order_number,subtotal,shipping_cost,total,status:'pending',reservation_expires_at:created.reservation_expires_at,whatsapp_url:wa_url,whatsapp_sent:cloud.sent})
  } catch (error) { console.error('create order error',error); return res.status(500).json({error:'Pesanan belum dapat dibuat. Silakan coba kembali.'}) }
}
