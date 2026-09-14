import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const handle = String(req.query.handle || '').trim()
  if (!handle) return res.status(400).json({ error: 'Handle is required' })

  const { data, error } = await supabase
    .from('products')
    .select('handle,title,body_html,vendor,type,tags,published,option1_name,option1_value,variant_sku,variant_price,variant_inventory_qty,status,catalog')
    .eq('handle', handle)
    .eq('published', true)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Supabase product detail query failed:', error.message)
    return res.status(500).json({ error: 'Failed to load product' })
  }
  if (!data) return res.status(404).json({ error: 'Product not found' })

  return res.status(200).json({ data: {
    Handle: data.handle,
    Title: data.title,
    'Body (HTML)': data.body_html,
    Vendor: data.vendor,
    Type: data.type,
    Tags: data.tags,
    Published: data.published,
    'Option1 Name': data.option1_name,
    'Option1 Value': data.option1_value,
    'Variant SKU': data.variant_sku,
    'Variant Price': data.variant_price,
    'Variant Inventory Qty': data.variant_inventory_qty,
    Status: data.status,
    Catalog: data.catalog,
  }})
}
