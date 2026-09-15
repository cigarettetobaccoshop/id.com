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
    return () => { active = false }
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
    if (!q) return router.push('/products')
    return router.push({ pathname: '/products', query: { q } })
  }

  if (!mounted || !target) return null

  return createPortal(
    <>
      <div className="r2-hero-instant-search" data-r2-hero-search>
        <form className="r2-hero-search-shell" onSubmit={(event) => { event.preventDefault(); goToCatalog() }} role="search">
          <div className="r2-hero-search-icon" aria-hidden="true"><Search size={19} strokeWidth={2.25} /></div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk, merek, kategori, atau SKU..." aria-label="Cari produk, merek, kategori, atau SKU" autoComplete="off" spellCheck="false" />
          <span className="r2-hero-search-status" aria-hidden="true">{loading ? 'SYNC' : products.length ? `${products.length}+` : 'CATALOG'}</span>
          <button type="submit" aria-label="Buka hasil pencarian"><ArrowRight size={17} /></button>
        </form>

        {query.trim() && <div className="r2-hero-search-results" role="listbox" aria-label="Hasil pencarian instan">
          {suggestions.length ? suggestions.map((product) => <button type="button" role="option" key={keyOf(product)} onClick={() => goToCatalog(product.Title || product.Handle)}>
            <span><b>{product.Title || product.Handle}</b><small>{text(product.Vendor || product.Type || 'Produk')} · SKU {text(product['Variant SKU'] || '—')}</small></span><ArrowRight size={15} />
          </button>) : <div className="r2-hero-search-empty">{loading ? 'Memuat katalog live...' : 'Produk belum ditemukan. Tekan Enter untuk membuka katalog.'}</div>}
        </div>}
      </div>
      <style jsx global>{`
        .r2-hero-instant-search{position:relative;width:min(100%,700px);margin:24px 0 2px;z-index:30}
        .r2-hero-search-shell{position:relative;display:flex;align-items:center;min-height:64px;padding:7px 7px 7px 18px;border:1px solid rgba(255,255,255,.24);border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.07));box-shadow:0 18px 48px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(18px) saturate(145%);-webkit-backdrop-filter:blur(18px) saturate(145%);transition:border-color .22s ease,box-shadow .22s ease,transform .22s ease}
        .r2-hero-search-shell:focus-within{border-color:rgba(126,190,255,.72);box-shadow:0 20px 52px rgba(0,0,0,.26),0 0 0 4px rgba(72,145,232,.13),inset 0 1px 0 rgba(255,255,255,.22);transform:translateY(-1px)}
        .r2-hero-search-icon{width:40px;height:40px;display:grid;place-items:center;flex:0 0 40px;border-radius:12px;color:#cfe5ff;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.10)}
        .r2-hero-search-shell input{min-width:0;flex:1;height:48px;padding:0 12px;border:0;outline:0;background:transparent;color:#fff;font:700 13px/1.2 Inter,"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif;letter-spacing:.005em}
        .r2-hero-search-shell input::placeholder{color:rgba(224,237,255,.66);font-weight:600}
        .r2-hero-search-status{display:inline-flex;align-items:center;justify-content:center;min-width:48px;height:28px;padding:0 9px;margin-right:7px;border:1px solid rgba(255,255,255,.14);border-radius:9px;color:#bcd7ff;background:rgba(255,255,255,.06);font-size:7px;font-weight:950;letter-spacing:.12em}
        .r2-hero-search-shell>button{width:48px;height:48px;display:grid;place-items:center;border:0;border-radius:13px;color:#092042;background:linear-gradient(135deg,#fff,#dceeff);box-shadow:0 8px 18px rgba(0,0,0,.18);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
        .r2-hero-search-shell>button:hover{transform:translateX(2px);box-shadow:0 10px 22px rgba(0,0,0,.24)}
        .r2-hero-search-shell>button:focus-visible{outline:3px solid rgba(255,255,255,.58);outline-offset:2px}
        .r2-hero-search-results{position:absolute;left:0;right:0;top:calc(100% + 9px);overflow:hidden;padding:7px;border:1px solid rgba(145,196,250,.24);border-radius:16px;background:rgba(8,28,56,.97);box-shadow:0 24px 55px rgba(0,0,0,.34);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .r2-hero-search-results button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 12px;border:0;border-radius:11px;background:transparent;color:#fff;text-align:left;cursor:pointer;transition:background .18s ease,transform .18s ease}
        .r2-hero-search-results button:hover,.r2-hero-search-results button:focus-visible{background:rgba(255,255,255,.09);transform:translateX(2px);outline:0}
        .r2-hero-search-results button>span{display:flex;min-width:0;flex-direction:column;gap:4px}.r2-hero-search-results b{overflow:hidden;color:#fff;font-size:11px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.r2-hero-search-results small{overflow:hidden;color:#9fb6d4;font-size:8px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.r2-hero-search-results button>svg{flex:0 0 auto;color:#8fc4ff}.r2-hero-search-empty{padding:14px 13px;color:#b8cbe2;font-size:9px;font-weight:700;line-height:1.5}
        @media (max-width:767px){.r2-hero-instant-search{width:100%;margin:20px 0 1px}.r2-hero-search-shell{min-height:58px;padding:6px 6px 6px 12px;border-radius:16px}.r2-hero-search-icon{width:36px;height:36px;flex-basis:36px;border-radius:10px}.r2-hero-search-shell input{height:44px;padding:0 8px;font-size:11px}.r2-hero-search-shell input::placeholder{font-size:10px}.r2-hero-search-status{display:none}.r2-hero-search-shell>button{width:44px;height:44px;border-radius:11px}.r2-hero-search-results{top:calc(100% + 7px);border-radius:14px}.r2-hero-search-results button{padding:10px 9px}.r2-hero-search-results b{font-size:10px}.r2-hero-search-results small{font-size:7.5px}}
        @media (max-width:380px){.r2-hero-search-shell input::placeholder{font-size:9px}.r2-hero-search-icon{width:34px;height:34px;flex-basis:34px}.r2-hero-search-shell>button{width:42px;height:42px}}
        @media (prefers-reduced-motion:reduce){.r2-hero-search-shell,.r2-hero-search-shell>button,.r2-hero-search-results button{transition:none!important}}
      `}</style>
    </>,
    target
  )
}
