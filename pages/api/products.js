import { supabase } from '../../lib/supabaseClient'

const MAX_CATALOG_ROWS = 250

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ data: [], count: 0, error: 'Method Not Allowed' })
  }

  const rawLimit = Number.parseInt(req.query.limit, 10)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), MAX_CATALOG_ROWS)
    : MAX_CATALOG_ROWS

  const { data, count, error } = await supabase
    .from('products')
    .select('handle,title,body_html,vendor,type,tags,published,option1_name,option1_value,variant_sku,variant_price,variant_inventory_qty,status,catalog', { count: 'exact' })
    .eq('published', true)
    .eq('status', 'active')
    .limit(limit)

  if (error) {
    console.error('Supabase products query failed:', error.message)
    return res.status(500).json({ data: [], count: 0, error: 'Failed to load products' })
  }

  const normalized = (data || []).map((p) => ({
    Handle: p.handle,
    Title: p.title,
    'Body (HTML)': p.body_html,
    Vendor: p.vendor,
    Type: p.type,
    Tags: p.tags,
    Published: p.published,
    'Option1 Name': p.option1_name,
    'Option1 Value': p.option1_value,
    'Variant SKU': p.variant_sku,
    'Variant Price': p.variant_price,
    'Variant Inventory Qty': p.variant_inventory_qty,
    Status: p.status,
    Catalog: p.catalog,
  }))

  return res.status(200).json({ data: normalized, count: count || 0 })
}
