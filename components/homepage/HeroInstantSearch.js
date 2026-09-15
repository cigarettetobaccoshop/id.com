import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Search } from 'lucide-react'
import { useRouter } from 'next/router'

const text = (value) => String(value ?? '').trim()
const keyOf = (product) => product?.['Variant SKU'] || product?.Handle || product?.Title || ''

export default function HeroInstantSearch() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [target, setTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    let active = true
    fetch('/api/products?limit=250', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('catalog')
        return response.json()
      })
      .then((payload) => {
        if (active) setProducts(Array.isArray(payload?.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setProducts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!mounted) return undefined
    const locate = () => setTarget(document.querySelector('.r2-hp-final-copy'))
    locate()
    const observer = new MutationObserver(locate)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [mounted])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products
      .filter((product) => [product.Title, product.Handle, product.Vendor, product.Type, product.Tags, product['Variant SKU']].filter(Boolean).join(' ').toLowerCase().includes(q))
      .slice(0, 6)
  }, [products, query])

  const goToCatalog = (value = query) => {
    const q = value.trim()
    if (!q) {
      router.push('/products')
      return
    }
    router.push({ pathname: '/products', query: { q } })
  }

  if (!mounted || !target) return null

  return createPortal(
    <div className="r2-hero-instant-search" data-r2-hero-search>
      <form className="r2-hero-search-shell" onSubmit={(event) => { event.preventDefault(); goToCatalog() }} role="search">
        <div className="r2-hero-search-icon" aria-hidden="true"><Search size={19} strokeWidth={2.25} /></div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari produk, merek, kategori, atau SKU..."
          aria-label="Cari produk, merek, kategori, atau SKU"
          autoComplete="off"
          spellCheck="false"
        />
        <span className="r2-hero-search-status" aria-hidden="true">{loading ? 'SYNC' : products.length ? `${products.length}+` : 'CATALOG'}</span>
        <button type="submit" aria-label="Buka hasil pencarian"><ArrowRight size={17} /></button>
      </form>

      {query.trim() && (
        <div className="r2-hero-search-results" role="listbox" aria-label="Hasil pencarian instan">
          {suggestions.length ? suggestions.map((product) => (
            <button type="button" role="option" key={keyOf(product)} onClick={() => goToCatalog(product.Title || product.Handle)}>
              <span><b>{product.Title || product.Handle}</b><small>{text(product.Vendor || product.Type || 'Produk')} · SKU {text(product['Variant SKU'] || '—')}</small></span>
              <ArrowRight size={15} />
            </button>
          )) : (
            <div className="r2-hero-search-empty">{loading ? 'Memuat katalog live...' : 'Produk belum ditemukan. Tekan Enter untuk membuka katalog.'}</div>
          )}
        </div>
      )}
    </div>,
    target
  )
}
