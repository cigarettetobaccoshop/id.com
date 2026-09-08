import { supabase } from '../lib/supabaseClient'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const esc = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function getServerSideProps({ res }) {
  const { data, error } = await supabase
    .from('R2 NUSANTARA')
    .select('Handle,Published,Status')
    .eq('Published', true)
    .eq('Status', 'active')
    .limit(1000)

  const products = error ? [] : (data || [])
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/products`,
    `${SITE_URL}/contact`,
    ...products.filter(p => p.Handle).map(p => `${SITE_URL}/products/${encodeURIComponent(p.Handle)}`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.write(xml)
  res.end()
  return { props: {} }
}

export default function Sitemap() {
  return null
}
