import { supabaseCatalogServer as supabase } from '../lib/supabaseCatalogServer'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const esc = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function getServerSideProps({ res }) {
  const { data, error } = await supabase
    .from('products')
    .select('id,is_active,updated_at')
    .eq('is_active', true)
    .limit(1000)

  const products = error ? [] : (data || [])
  const now = new Date().toISOString()
  const urls = [
    { loc: SITE_URL + '/', lastmod: now },
    { loc: SITE_URL + '/products', lastmod: now },
    { loc: SITE_URL + '/contact', lastmod: now },
    ...products.filter(p => p.id).map(p => ({ loc: SITE_URL + '/products/' + encodeURIComponent(p.id), lastmod: p.updated_at || now })),
  ]

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(({ loc, lastmod }) => '  <url><loc>' + esc(loc) + '</loc><lastmod>' + lastmod + '</lastmod></url>').join('\n') +
    '\n</urlset>'

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.write(xml)
  res.end()
  return { props: {} }
}

export default function Sitemap() { return null }
