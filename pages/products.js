import { useEffect, useState } from 'react'

const formatIDR = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Harga belum tersedia'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/products?limit=250')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Gagal memuat katalog.')
        if (active) {
          setProducts(Array.isArray(result.data) ? result.data : [])
          setCount(Number(result.count) || 0)
        }
      })
      .catch((err) => { if (active) setError(err.message || 'Gagal memuat katalog.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.back}>← Beranda</a>
        <div><p style={styles.eyebrow}>R2 NUSANTARA</p><h1 style={styles.title}>Katalog Produk</h1><p style={styles.subtitle}>{count} produk terpublikasi</p></div>
      </header>
      {loading && <section style={styles.state}>Memuat katalog...</section>}
      {error && <section style={{ ...styles.state, color: '#ff9d9d' }}>{error}</section>}
      {!loading && !error && (
        <section style={styles.grid} aria-label="Katalog produk">
          {products.map((product, index) => (
            <article key={product['Variant SKU'] || product.Handle || index} style={styles.card}>
              <div style={styles.cardTop}><span style={styles.badge}>{product.Vendor || product.Type || 'R2 Nusantara'}</span><span style={styles.status}>{product.Status || 'Active'}</span></div>
              <h2 style={styles.productTitle}>{product.Title || product.Handle || 'Produk'}</h2>
              {product.Tags && <p style={styles.meta}>{product.Tags}</p>}
              {product['Option1 Value'] && <p style={styles.meta}>{product['Option1 Name'] || 'Varian'}: {product['Option1 Value']}</p>}
              <div style={styles.price}>{formatIDR(product['Variant Price'])}</div>
              <div style={styles.details}><span>SKU: {product['Variant SKU'] || '—'}</span><span>Stok: {product['Variant Inventory Qty'] ?? 0}</span></div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', padding: '32px 20px 60px', background: '#0b0d10', color: '#f4f5f7', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  header: { maxWidth: 1180, margin: '0 auto 28px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  back: { color: '#b9c7db', textDecoration: 'none', border: '1px solid #27303b', borderRadius: 14, padding: '10px 14px' },
  eyebrow: { margin: 0, color: '#79b8ff', letterSpacing: '0.18em', fontSize: 12, fontWeight: 700 },
  title: { margin: '5px 0 4px', fontSize: 'clamp(32px, 7vw, 58px)', lineHeight: 1, letterSpacing: '-0.04em' },
  subtitle: { margin: 0, color: '#8e99a8' },
  state: { maxWidth: 1180, margin: '40px auto', padding: 28, border: '1px solid #27303b', borderRadius: 22, textAlign: 'center', color: '#aab4c2' },
  grid: { maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 },
  card: { padding: 20, border: '1px solid #252c35', borderRadius: 22, background: 'linear-gradient(145deg, #15191f, #0e1115)', boxShadow: '0 18px 50px rgba(0,0,0,.22)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  badge: { fontSize: 11, color: '#b9c7db', background: '#1c2632', borderRadius: 999, padding: '6px 9px' },
  status: { fontSize: 10, color: '#76d6a5', textTransform: 'uppercase', letterSpacing: '.1em' },
  productTitle: { margin: '22px 0 8px', fontSize: 21, lineHeight: 1.2 },
  meta: { margin: '4px 0', color: '#8893a2', fontSize: 13 },
  price: { marginTop: 22, fontSize: 21, fontWeight: 800, color: '#d9e8ff' },
  details: { marginTop: 14, paddingTop: 12, borderTop: '1px solid #252c35', display: 'flex', justifyContent: 'space-between', gap: 8, color: '#778291', fontSize: 11 },
}
