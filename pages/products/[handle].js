import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const money = value => Number.isFinite(Number(value)) ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value)) : 'Harga belum tersedia'
const stock = value => Math.max(0, Number(value) || 0)

export async function getServerSideProps({ params, req }) {
  const host = req.headers.host || 'r2nusantara-shop.vercel.app'
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${protocol}://${host}`
  try {
    const response = await fetch(`${origin}/api/products/${encodeURIComponent(params.handle)}`)
    if (!response.ok) return { notFound: true }
    const payload = await response.json()
    return { props: { product: payload.data || null } }
  } catch {
    return { notFound: true }
  }
}

export default function ProductDetail({ product }) {
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('r2-cart') || '[]')) } catch { setCart([]) }
  }, [])

  const add = () => {
    const next = [...cart, product]
    setCart(next)
    localStorage.setItem('r2-cart', JSON.stringify(next))
    setToast('Produk ditambahkan ke keranjang')
    setTimeout(() => setToast(''), 2200)
  }

  const url = `${SITE_URL}/products/${encodeURIComponent(product.Handle)}`
  const description = `${product.Title || product.Handle} — katalog wholesale R2 Nusantara. Harga ${money(product['Variant Price'])}, stok ${stock(product['Variant Inventory Qty'])}.`

  return <>
    <Head>
      <title>{product.Title || product.Handle} — R2 NUSANTARA</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="R2 NUSANTARA" />
      <meta property="og:title" content={`${product.Title || product.Handle} — R2 NUSANTARA`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}/assets/logo/preview.jpg`} />
      <meta property="og:image:alt" content={`R2 NUSANTARA — ${product.Title || product.Handle}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={url} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.Title || product.Handle,
        sku: product['Variant SKU'] || product.Handle,
        category: product.Type || 'Wholesale',
        brand: { '@type': 'Brand', name: product.Vendor || 'R2 NUSANTARA' },
        offers: { '@type': 'Offer', url, priceCurrency: 'IDR', price: Number(product['Variant Price'] || 0), availability: stock(product['Variant Inventory Qty']) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
      }) }} />
    </Head>
    <main className="catalog-app product-detail-page">
      <header className="catalog-mobile-header">
        <Link href="/products" className="brand"><span className="brand-mark"><span>R2</span></span><span className="brand-copy"><strong>R2 NUSANTARA</strong><small>DISTRIBUTOR</small></span></Link>
        <Link href="/checkout" className="cart-link" aria-label="Keranjang">□<b>{cart.length}</b></Link>
      </header>
      <section className="catalog-top"><Link href="/products" className="desktop-back">← Kembali ke katalog</Link><div><span className="eyebrow">LIVE PRODUCT DATA · WHOLESALE</span><h1>{product.Title || product.Handle}</h1><p>Informasi produk bersumber dari katalog R2 NUSANTARA yang terintegrasi.</p></div><div className="live-dot"><i/> LIVE</div></section>
      <section className="quick-modal product-detail-card" style={{ position: 'relative', maxWidth: 760, margin: '24px auto' }}>
        <div className="product-visual tone-0"><span className="badge">{stock(product['Variant Inventory Qty']) > 0 ? 'READY STOCK' : 'OUT OF STOCK'}</span><div className="pack-art"><span>R2</span><small>WHOLESALE</small><i>01</i></div></div>
        <span className="category">{product.Type || product.Vendor || 'WHOLESALE'}</span>
        <h2>{product.Title || product.Handle}</h2>
        {product['Option1 Value'] && <p className="variant">{product['Option1 Name'] || 'VARIANT'} · {product['Option1 Value']}</p>}
        <div className="price">{money(product['Variant Price'])}</div>
        <p><strong>SKU:</strong> {product['Variant SKU'] || '—'}</p>
        <p><strong>Stok real-time:</strong> {stock(product['Variant Inventory Qty'])} unit</p>
        <p><strong>Vendor:</strong> {product.Vendor || 'R2 NUSANTARA'}</p>
        <p><strong>Tags:</strong> {product.Tags || '—'}</p>
        <button type="button" className="modal-add" disabled={stock(product['Variant Inventory Qty']) <= 0} onClick={add}>{stock(product['Variant Inventory Qty']) > 0 ? 'ADD TO CART →' : 'STOK HABIS'}</button>
      </section>
      <footer className="footer">© {new Date().getFullYear()} R2 NUSANTARA · WHOLESALE DISTRIBUTION PARTNER</footer>
    </main>
    <nav className="bottom-nav"><Link href="/"><span>⌂</span>Beranda</Link><Link href="/products" className="active"><span>⊞</span>Katalog</Link><Link href="/checkout"><span>□<b>{cart.length}</b></span>Keranjang</Link><Link href="/contact"><span>○</span>Akun</Link></nav>
    {toast && <div className="toast">✓ {toast}</div>}
  </>
}
