import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const id = String(req.query.handle || '').trim()
  if (!id) return res.status(400).json({ error: 'Product id is required' })

  const { data, error } = await supabase
    .from('products')
    .select('id,name,price,category,segment,segment_name,description,rating,is_active')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Supabase product detail query failed:', error.message)
    return res.status(500).json({ error: 'Failed to load product' })
  }
  if (!data) return res.status(404).json({ error: 'Product not found' })

  return res.status(200).json({ data: {
    Handle: data.id,
    Title: data.name,
    'Body (HTML)': data.description || '',
    Vendor: data.segment_name || data.category || 'R2 Nusantara',
    Type: data.category || 'r2',
    Tags: data.segment || '',
    Published: data.is_active,
    'Option1 Name': 'Segment',
    'Option1 Value': data.segment_name || data.segment || '',
    'Variant SKU': data.id,
    'Variant Price': data.price,
    'Variant Inventory Qty': null,
    Status: data.is_active ? 'active' : 'inactive',
    Catalog: data.category,
  }})
}
