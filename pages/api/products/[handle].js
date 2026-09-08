import { supabase } from '../../../lib/supabaseClient'

const COLUMNS = 'Handle,Title,Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,"Variant Inventory Qty",Status'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const handle = String(req.query.handle || '').trim()
  if (!handle) return res.status(400).json({ error: 'Handle is required' })

  const { data, error } = await supabase
    .from('R2 NUSANTARA')
    .select(COLUMNS)
    .eq('Handle', handle)
    .eq('Published', true)
    .eq('Status', 'active')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Supabase product detail query failed:', error.message)
    return res.status(500).json({ error: 'Failed to load product' })
  }
  if (!data) return res.status(404).json({ error: 'Product not found' })
  return res.status(200).json({ data })
}
