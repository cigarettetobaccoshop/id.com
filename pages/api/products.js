import { supabase } from '../../lib/supabaseClient'

const PRODUCT_COLUMNS = [
  'Handle',
  'Title',
  'Vendor',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Price',
  'Variant Inventory Qty',
  'Status',
]

const SELECT_COLUMNS = PRODUCT_COLUMNS.map((column) =>
  column.includes(' ') ? `"${column}"` : column
).join(',')

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ data: [], count: 0, error: 'Method Not Allowed' })
  }

  const rawLimit = Number.parseInt(req.query.limit, 10)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 250) : 100

  const { data, count, error } = await supabase
    .from('R2 NUSANTARA')
    .select(SELECT_COLUMNS, { count: 'exact' })
    .eq('Published', true)
    .limit(limit)

  if (error) {
    console.error('Supabase products query failed:', error.message)
    return res.status(500).json({ data: [], count: 0, error: 'Failed to load products' })
  }

  return res.status(200).json({
    data: data || [],
    count: count || 0,
  })
}
