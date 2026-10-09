import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RouteIcon } from '../../components/RouteIconNav'
import { supabaseCatalogServer } from '../../lib/supabaseCatalogServer'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const money = value => Number.isFinite(Number(value)) ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value)) : 'Harga belum tersedia'
const stock = value => value == null || value === '' ? null : Math.max(0, Number(value) || 0)
const isAvailable = product => product?.['Variant Inventory Qty'] == null
  ? Boolean(product?.Published && product?.Status === 'active')
  : stock(product['Variant Inventory Qty']) > 0

export async function getServerSideProps({ params }) {
  const id = String(params?.handle || '').trim()
  if (!id) return { notFound: true }

  // Query the same Supabase source as /api/products/[handle] directly.
  // Avoid a server-side HTTP self-request, which fails on Vercel-protected Previews.
  const { data, error } = await supabaseCatalogServer
    .from('products')
    .select('id,name,price,category,segment,segment_name,description,rating,is_active')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Supabase product detail query failed:', error.message)
    return { notFound: true }
  }
  if (!data) return { notFound: true }

  return {
    props: {
      product: {
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
        'Stock Status': data.is_active ? 'READY STOCK' : 'STOK HABIS',
        Status: data.is_active ? 'active' : 'inactive',
        Catalog: data.category,
      },
    },
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
  const available = isAvailable(product)
  const availabilityText = available ? 'READY STOCK' : 'STOK HABIS'
  const description = `${product.Title || product.Handle} — katalog wholesale R2 Nusantara. Harga ${money(product['Variant Price'])}, ketersediaan ${availabilityText}.`

  return <>
    <Head>
      <title>{product.Title || product.Handle} — R2 NUSANTARA</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="R2 NUSANTARA" />
      <meta property="og:title" content={`${product.Title || product.Handle} — R2 NUSANTARA`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}/assets/ui/r2-detail-pack.svg`} />
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
        image: [`${SITE_URL}/assets/ui/r2-detail-pack.svg`],
        offers: { '@type': 'Offer', url, priceCurrency: 'IDR', price: Number(product['Variant Price'] || 0), availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
      }) }} />
    </Head>
    <main className="catalog-app product-detail-page">
      <header className="catalog-mobile-header">
        <Link href="/products" className="brand"><span className="brand-mark"><img src="/assets/logo/logo.png" alt="R2 NUSANTARA" width="40" height="40" /></span><span className="brand-copy"><strong>R2 NUSANTARA</strong><small>DISTRIBUTOR</small></span></Link>
        <Link href="/checkout" className="cart-link" aria-label="Keranjang"><RouteIcon type="cart" size={21}/><b>{cart.length}</b></Link>
      </header>
      <section className="catalog-top"><Link href="/products" className="desktop-back">← Kembali ke katalog</Link><div><span className="eyebrow">DISTRIBUTOR ROKOK ONLINE · LIVE PRODUCT DATA</span><h1>{product.Title || product.Handle}</h1><p>Informasi produk bersumber dari katalog R2 NUSANTARA yang terintegrasi.</p></div><div className="live-dot"><i/> LIVE</div></section>
      <section className="quick-modal product-detail-card">
        <div className="product-visual tone-0">
          <span className="badge">{available ? 'READY STOCK' : 'STOK HABIS'}</span>
          <img className="r2-detail-image" src="/assets/ui/r2-detail-pack.svg" alt="R2 NUSANTARA — produk" width="720" height="720" loading="eager" decoding="async" />
        </div>
        <span className="category">{product.Type || product.Vendor || 'WHOLESALE'}</span>
        <h2>{product.Title || product.Handle}</h2>
        {product['Option1 Value'] && <p className="variant">{product['Option1 Name'] || 'VARIANT'} · {product['Option1 Value']}</p>}
        <div className="price">{money(product['Variant Price'])}</div>
        <p><strong>SKU:</strong> {product['Variant SKU'] || '—'}</p>
        <p><strong>Ketersediaan:</strong> {available ? 'READY STOCK' : 'STOK HABIS'}{product['Variant Inventory Qty'] != null ? ` · ${stock(product['Variant Inventory Qty'])} unit` : ''}</p>
        <p><strong>Vendor:</strong> {product.Vendor || 'R2 NUSANTARA'}</p>
        <p><strong>Tags:</strong> {product.Tags || '—'}</p>
        <button type="button" className="modal-add" disabled={!available} onClick={add}>{available ? 'ADD TO CART →' : 'STOK HABIS'}</button>
      </section>
      <footer className="footer">© {new Date().getFullYear()} R2 NUSANTARA · WHOLESALE DISTRIBUTION PARTNER</footer>
    </main>
    {toast && <div className="toast">✓ {toast}</div>}
  </>
}
