import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PRODUCT_COLUMNS = [
  'Handle', 'Title', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Price',
  'Variant Inventory Qty', 'Status',
]

const SELECT_COLUMNS = PRODUCT_COLUMNS.map((column) => column.includes(' ') ? `"${column}"` : column).join(',')
const PAGE_SIZE = 24

const formatIDR = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Harga belum tersedia'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const stockLabel = (value) => {
  const stock = Number(value)
  if (!Number.isFinite(stock) || stock <= 0) return 'OUT OF STOCK'
  if (stock <= 10) return `LOW · ${stock}`
  return `STOCK · ${stock}`
}

export default function ProductsPage({ products, count, initialError }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('default')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const categories = useMemo(() => {
    const values = new Set(['ALL'])
    products.forEach((product) => {
      const source = `${product.Type || ''} ${product.Tags || ''}`.toUpperCase()
      ;['MILD', 'KRETEK', 'FILTER', 'PREMIUM', 'INTERNATIONAL'].forEach((item) => {
        if (source.includes(item)) values.add(item)
      })
    })
    return [...values]
  }, [products])

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const haystack = [product.Title, product.Handle, product['Variant SKU'], product.Tags, product.Type, product.Vendor].filter(Boolean).join(' ').toLowerCase()
      const categorySource = `${product.Type || ''} ${product.Tags || ''}`.toUpperCase()
      return (!normalized || haystack.includes(normalized)) && (category === 'ALL' || categorySource.includes(category))
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'price-asc') return Number(a['Variant Price'] || 0) - Number(b['Variant Price'] || 0)
      if (sort === 'price-desc') return Number(b['Variant Price'] || 0) - Number(a['Variant Price'] || 0)
      if (sort === 'name') return String(a.Title || '').localeCompare(String(b.Title || ''), 'id')
      if (sort === 'stock') return Number(b['Variant Inventory Qty'] || 0) - Number(a['Variant Inventory Qty'] || 0)
      return 0
    })
  }, [products, query, category, sort])

  const renderedProducts = visibleProducts.slice(0, visibleCount)
  const hasMore = renderedProducts.length < visibleProducts.length

  const resetDiscovery = (next) => {
    setVisibleCount(PAGE_SIZE)
    next()
  }

  return (
    <>
      <Head>
        <title>Katalog — R2 NUSANTARA Wholesale</title>
        <meta name="description" content={`Katalog wholesale R2 Nusantara dengan ${count} produk terpublikasi.`} />
        <meta name="theme-color" content="#080A0D" />
      </Head>

      <main className="catalog-shell">
        <header className="catalog-header">
          <div className="heading-row">
            <Link href="/" className="back-link">← <span>R2 NUSANTARA</span></Link>
            <div className="heading-copy">
              <p className="eyebrow"><b /> WHOLESALE CATALOG / LIVE DATABASE</p>
              <h1>Product <em>Archive.</em></h1>
              <p className="subtitle"><strong>{count}</strong> produk terpublikasi · server-rendered dari sumber produksi.</p>
            </div>
            <div className="live-badge"><span /> LIVE</div>
          </div>

          <div className="tools">
            <label className="search"><span>⌕</span><input value={query} onChange={(event) => resetDiscovery(() => setQuery(event.target.value))} placeholder="Cari produk, SKU, vendor, atau tag..." aria-label="Cari katalog" /></label>
            <label className="sort"><span>SORT</span><select value={sort} onChange={(event) => resetDiscovery(() => setSort(event.target.value))} aria-label="Urutkan katalog"><option value="default">Default</option><option value="price-asc">Harga ↑</option><option value="price-desc">Harga ↓</option><option value="name">Nama A-Z</option><option value="stock">Stok tertinggi</option></select></label>
          </div>
          <div className="filters" aria-label="Filter kategori">
            {categories.map((item) => <button type="button" key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => resetDiscovery(() => setCategory(item))}>{item}</button>)}
          </div>
        </header>

        {initialError ? (
          <section className="error-state"><strong>Katalog belum dapat ditampilkan.</strong><span>Data source sedang tidak tersedia. Silakan coba kembali.</span></section>
        ) : (
          <>
            <div className="result-line"><span>{visibleProducts.length} RESULT{visibleProducts.length === 1 ? '' : 'S'}</span><span>LIVE / {count}</span></div>
            {renderedProducts.length === 0 ? (
              <section className="empty-state"><strong>Tidak ada hasil.</strong><span>Coba kata kunci atau filter lain.</span></section>
            ) : (
              <section className="catalog-grid" aria-label="Katalog produk">
                {renderedProducts.map((product, index) => {
                  const stock = Number(product['Variant Inventory Qty'] || 0)
                  return (
                    <article className="product-card" key={product['Variant SKU'] || product.Handle || index}>
                      <div className="card-top"><span className="category-label">{product.Type || product.Vendor || 'WHOLESALE'}</span><span className={stock > 0 ? 'status' : 'status offline'}><b /> {stock > 0 ? 'ACTIVE' : 'SOLD OUT'}</span></div>
                      <div className="index">{String(index + 1).padStart(3, '0')}</div>
                      <h2>{product.Title || product.Handle || 'Produk R2 Nusantara'}</h2>
                      {product['Option1 Value'] && <p className="variant">{product['Option1 Name'] || 'VARIANT'} · {product['Option1 Value']}</p>}
                      {product.Tags && <p className="tags">{product.Tags}</p>}
                      <div className="price">{formatIDR(product['Variant Price'])}</div>
                      <div className="meta-grid"><div><span>SKU</span><strong>{product['Variant SKU'] || '—'}</strong></div><div><span>INVENTORY</span><strong>{stockLabel(product['Variant Inventory Qty'])}</strong></div></div>
                      <div className="card-footer"><span>R2 / DATA MODULE</span><span>DETAIL ↗</span></div>
                    </article>
                  )
                })}
              </section>
            )}
            {hasMore && <div className="load-more"><button type="button" onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, visibleProducts.length))}>LOAD MORE · {visibleProducts.length - renderedProducts.length} REMAINING</button></div>}
          </>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <Link href="/"><span>⌂</span>HOME</Link>
        <Link href="/products" className="active"><span>▦</span>CATALOG</Link>
        <a href="/#partner"><span>◉</span>PARTNER</a>
        <Link href="/contact"><span>◌</span>CONTACT</Link>
      </nav>

      <style jsx global>{`
        :root{--bg:#080A0D;--surface:rgba(255,255,255,.045);--surface-strong:rgba(255,255,255,.075);--text:#F4F1E8;--muted:#8E96A3;--accent:#C9A86A;--border:rgba(255,255,255,.10);--radius-sm:12px;--radius-md:18px;--radius-lg:28px;--shadow-soft:0 20px 60px rgba(0,0,0,.30)}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}.catalog-shell{min-height:100vh;padding:0 20px 110px;background:radial-gradient(circle at 80% 0%,rgba(201,168,106,.08),transparent 26%),radial-gradient(circle at 5% 55%,rgba(255,255,255,.025),transparent 28%),var(--bg)}.catalog-header{max-width:1240px;margin:0 auto;padding:26px 0 22px;position:sticky;top:0;z-index:15;background:linear-gradient(var(--bg) 78%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.heading-row{display:grid;grid-template-columns:180px 1fr auto;gap:28px;align-items:start}.back-link{padding-top:8px;color:#8d949d;text-decoration:none;font-size:10px;letter-spacing:.12em}.back-link span{color:#c5c9ce}.heading-copy .eyebrow{margin:0;color:var(--muted);font-size:8px;font-weight:800;letter-spacing:.2em}.eyebrow b{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--accent);margin-right:7px;box-shadow:0 0 14px rgba(201,168,106,.55)}.heading-copy h1{margin:10px 0 7px;font-size:clamp(48px,7vw,86px);line-height:.88;letter-spacing:-.065em}.heading-copy h1 em{font-family:Georgia,"Times New Roman",serif;font-weight:400;color:#aaa69c}.subtitle{margin:0;color:var(--muted);font-size:12px}.subtitle strong{color:#d7d2c8}.live-badge{margin-top:8px;padding:8px 11px;border:1px solid var(--border);border-radius:999px;color:#aeb4bc;font-size:8px;letter-spacing:.14em;white-space:nowrap}.live-badge span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--accent);margin-right:6px}.tools{display:flex;gap:10px;margin-top:28px}.search{flex:1;display:flex;align-items:center;gap:10px;height:48px;padding:0 15px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);color:#777f8a}.search span{font-size:22px}.search input{width:100%;border:0;outline:0;background:transparent;color:var(--text);font:inherit;font-size:12px}.search input::placeholder{color:#666e79}.sort{display:flex;align-items:center;gap:10px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface)}.sort span{font-size:7px;letter-spacing:.15em;color:#69717c}.sort select{border:0;outline:0;background:transparent;color:#c4c8cd;font-size:11px}.sort option{background:#111419;color:#fff}.filters{display:flex;gap:7px;overflow:auto;padding:12px 0 2px;scrollbar-width:none}.filters::-webkit-scrollbar{display:none}.filter{flex:0 0 auto;border:1px solid var(--border);border-radius:999px;background:transparent;color:#767e89;padding:8px 12px;font-size:8px;letter-spacing:.12em;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease,color .2s ease}.filter:hover{transform:translateY(-2px);color:#cfd2d6}.filter.active{border-color:rgba(201,168,106,.45);background:rgba(201,168,106,.08);color:#ddd5c5}.result-line{max-width:1240px;margin:4px auto 14px;display:flex;justify-content:space-between;color:#626a74;font-size:8px;letter-spacing:.15em}.catalog-grid{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.product-card{position:relative;min-height:285px;padding:18px;border:1px solid var(--border);border-radius:var(--radius-md);background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.025));overflow:hidden;content-visibility:auto;contain-intrinsic-size:285px;transition:transform .22s ease,border-color .22s ease,background .22s ease,box-shadow .22s ease;box-shadow:0 15px 45px rgba(0,0,0,.18)}.product-card:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.35}.product-card:hover{transform:translateY(-3px);border-color:rgba(201,168,106,.28);background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.03));box-shadow:0 20px 55px rgba(0,0,0,.25)}.card-top{display:flex;justify-content:space-between;gap:8px;align-items:center}.category-label{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#7f8792;font-size:8px;letter-spacing:.12em;text-transform:uppercase}.status{font-size:7px;color:#aeb4bc;letter-spacing:.12em}.status b{display:inline-block;width:4px;height:4px;border-radius:50%;background:var(--accent);margin-right:4px}.status.offline{color:#777}.status.offline b{background:#6f7378}.index{margin-top:26px;color:#4e555e;font-size:8px;letter-spacing:.12em}.product-card h2{margin:8px 0 0;font-size:20px;line-height:1.12;letter-spacing:-.035em;font-weight:800}.variant,.tags{margin:7px 0 0;color:#727a85;font-size:9px;line-height:1.4}.tags{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.price{margin-top:24px;color:var(--text);font-size:20px;font-weight:800;letter-spacing:-.03em}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;padding-top:13px;border-top:1px solid rgba(255,255,255,.07)}.meta-grid div{min-width:0}.meta-grid span{display:block;color:#5f6771;font-size:7px;letter-spacing:.14em}.meta-grid strong{display:block;margin-top:5px;color:#aeb4bc;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.card-footer{display:flex;justify-content:space-between;margin-top:16px;color:#5e6670;font-size:7px;letter-spacing:.12em}.card-footer span:last-child{color:var(--accent)}.load-more{display:flex;justify-content:center;padding:26px 0}.load-more button{min-height:46px;padding:0 18px;border:1px solid rgba(201,168,106,.32);border-radius:999px;background:rgba(201,168,106,.06);color:#d7cdb9;font-size:9px;font-weight:800;letter-spacing:.14em;cursor:pointer;transition:transform .2s ease,background .2s ease}.load-more button:hover{transform:translateY(-2px);background:rgba(201,168,106,.11)}.error-state,.empty-state{max-width:700px;margin:70px auto;padding:32px;text-align:center;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface)}.error-state strong,.empty-state strong{display:block;font-size:18px}.error-state span,.empty-state span{display:block;margin-top:8px;color:var(--muted);font-size:12px}.bottom-nav{display:none}
        @media(max-width:980px){.catalog-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.heading-row{grid-template-columns:130px 1fr auto}}
        @media(max-width:700px){.catalog-shell{padding:0 14px 108px}.catalog-header{padding-top:16px}.heading-row{grid-template-columns:1fr auto;gap:10px}.back-link{grid-column:1/-1}.heading-copy h1{font-size:56px}.live-badge{grid-column:2;grid-row:2}.tools{display:grid;grid-template-columns:1fr}.sort{height:44px}.catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.product-card{min-height:260px;padding:14px;border-radius:15px}.product-card h2{font-size:17px}.price{font-size:17px;margin-top:20px}.meta-grid{display:block}.meta-grid div+div{margin-top:8px}.card-footer{margin-top:13px}.bottom-nav{position:fixed;display:grid;grid-template-columns:repeat(4,1fr);left:10px;right:10px;bottom:10px;z-index:50;padding:8px;border:1px solid var(--border);border-radius:18px;background:rgba(10,12,15,.88);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:var(--shadow-soft);padding-bottom:calc(8px + env(safe-area-inset-bottom))}.bottom-nav a{display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 2px;color:#727a85;text-decoration:none;font-size:7px;letter-spacing:.1em}.bottom-nav a span{font-size:17px;line-height:1;color:#9da3ab}.bottom-nav a.active,.bottom-nav a:hover{color:var(--text)}.bottom-nav a.active span{color:var(--accent)}}
        @media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
      `}</style>
    </>
  )
}

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')

  const { data, count, error } = await supabase
    .from('R2 NUSANTARA')
    .select(SELECT_COLUMNS, { count: 'exact' })
    .eq('Published', true)
    .limit(250)

  if (error) {
    console.error('SSR Supabase products query failed:', error.message)
    return { props: { products: [], count: 0, initialError: true } }
  }

  return {
    props: {
      products: data || [],
      count: count || 0,
      initialError: false,
    },
  }
}
