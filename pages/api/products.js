import supabaseServer from '../../lib/supabaseCatalogServer'

const MAX_CATALOG_ROWS = 250

function mapProduct(p) {
  return {
    Handle: p.id,
    Title: p.name,
    'Body (HTML)': p.description || '',
    Vendor: p.segment_name || p.category || 'R2 Nusantara',
    Type: p.category || 'r2',
    Tags: p.segment || '',
    Published: p.is_active,
    'Option1 Name': 'Segment',
    'Option1 Value': p.segment_name || p.segment || '',
    'Variant SKU': p.id,
    'Variant Price': p.price,
    'Variant Inventory Qty': null,
    'Stock Status': p.is_active ? 'READY STOCK' : 'STOK HABIS',
    Status: p.is_active ? 'active' : 'inactive',
    Catalog: p.category,
  }
}

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

  const { data, count, error } = await supabaseServer
    .from('products')
    .select('id,name,price,category,segment,segment_name,description,rating,is_active', { count: 'exact' })
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Supabase products query failed:', error.message)
    return res.status(500).json({ data: [], count: 0, error: 'Failed to load products' })
  }

  return res.status(200).json({ data: (data || []).map(mapProduct), count: count || 0 })
}
