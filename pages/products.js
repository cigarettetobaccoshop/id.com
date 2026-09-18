import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { BadgeCheck, LayoutGrid, List, PackageCheck, Search, SlidersHorizontal, X } from 'lucide-react';
import { supabaseCatalogServer as supabase } from '../lib/supabaseCatalogServer';
import { RouteIcon } from '../components/RouteIconNav';
import ProductCard from '../components/catalog/ProductCard';

// public.products is the single production source of truth. The mapper keeps
// the existing storefront component contract unchanged.
const COLUMNS = 'id,name,price,category,segment,segment_name,description,rating,is_active';
const PAGE_SIZE = 24;
const text = (value) => String(value ?? '').trim();
const stock = (value) => value == null || value === '' ? null : Math.max(0, Number(value) || 0);
const keyOf = (product) => product?.['Variant SKU'] || product?.Handle || product?.Title || '';
const isResmi = (product) => text(product?.category || product?.Catalog || product?.Type).toLowerCase() === 'resmi';
const mapProduct = (p) => ({
  ...p,
  Handle: p.id,
  Title: p.name,
  Vendor: p.segment_name || p.category || 'R2 Nusantara',
  Type: p.category || 'r2',
  Tags: p.segment || '',
  Published: p.is_active,
  'Option1 Name': 'Segment',
  'Option1 Value': p.segment_name || p.segment || '',
  'Variant SKU': p.id,
  'Variant Price': p.price,
  'Variant Inventory Qty': null,
  'Stock Status': p.is_active ? 'READY STOCK' : 'STOK HABIS',
  Status: p.is_active ? 'active' : 'inactive',
  Catalog: p.category,
});
export async function getServerSideProps({ res, query }) {
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
  const { data, count, error } = await supabase
    .from('products')
    .select(COLUMNS, { count: 'exact' })
    .eq('is_active', true)
    .limit(250);
  const products = error ? [] : (data || []).map(mapProduct);
  return { props: { products, count: count || 0, initialError: Boolean(error), initialCatalog: query?.catalog === 'resmi' ? 'resmi' : 'r2' } };
}

function SkeletonGrid() {
  return <div className="r2-clean-grid">{Array.from({ length: 8 }, (_, i) => <article className="r2-clean-skeleton" key={i}><div /><span /><span /><span /></article>)} </div>;
}

export default function ProductsPage({ products, count, initialError, initialCatalog }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [catalog, setCatalog] = useState(initialCatalog || 'r2');
  const [cat, setCat] = useState('ALL');
  const [sort, setSort] = useState('default');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const [brand, setBrand] = useState('ALL');
  const [variant, setVariant] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQ(typeof router.query.q === 'string' ? router.query.q : '');
    if (router.isReady && (router.query.catalog === 'r2' || router.query.catalog === 'resmi')) {
      setCatalog(router.query.catalog); setCat('ALL'); setVisible(PAGE_SIZE);
    }
  }, [router.isReady, router.query.q, router.query.catalog]);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem('r2-cart') || '[]'));
      setFavorites(JSON.parse(localStorage.getItem('r2-favorites') || '[]'));
    } catch { setCart([]); setFavorites([]); }
    const timer = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(timer);
  }, []);

  const catalogProducts = useMemo(() => products.filter((p) => (isResmi(p) ? 'resmi' : 'r2') === catalog), [products, catalog]);
  const r2Count = useMemo(() => products.filter((p) => !isResmi(p)).length, [products]);
  const resmiCount = products.length - r2Count;
  const cats = useMemo(() => ['ALL', 'KRETEK', 'FILTER', 'MILD', 'PREMIUM', 'INTERNATIONAL'].filter((x) => x === 'ALL' || catalogProducts.some((p) => `${p.Type || ''} ${p.Tags || ''}`.toUpperCase().includes(x))), [catalogProducts]);
  const brands = useMemo(() => ['ALL', ...Array.from(new Set(catalogProducts.map((p) => text(p.Vendor)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'id'))], [catalogProducts]);
  const variants = useMemo(() => ['ALL', ...Array.from(new Set(catalogProducts.map((p) => text(p['Option1 Value'])).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'id'))], [catalogProducts]);
  const suggestions = useMemo(() => { const search = q.trim().toLowerCase(); return search ? catalogProducts.filter((p) => `${p.Title || ''} ${p.Vendor || ''} ${p.Type || ''} ${p.Tags || ''}`.toLowerCase().includes(search)).slice(0, 6) : []; }, [catalogProducts, q]);
  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase(); const lo = minPrice === '' ? null : Number(minPrice); const hi = maxPrice === '' ? null : Number(maxPrice);
    const rows = catalogProducts.filter((p) => {
      const hay = [p.Title, p.Handle, p['Variant SKU'], p.Tags, p.Type, p.Vendor].filter(Boolean).join(' ').toLowerCase();
      const source = `${p.Type || ''} ${p.Tags || ''}`.toUpperCase(); const price = Number(p['Variant Price'] || 0);
      return (!search || hay.includes(search)) && (cat === 'ALL' || source.includes(cat)) && (lo === null || price >= lo) && (hi === null || price <= hi) && (!stockOnly || p.Published === true) && (brand === 'ALL' || text(p.Vendor) === brand) && (variant === 'ALL' || text(p['Option1 Value']) === variant);
    });
    return rows.sort((a, b) => sort === 'price-asc' ? Number(a['Variant Price'] || 0) - Number(b['Variant Price'] || 0) : sort === 'price-desc' ? Number(b['Variant Price'] || 0) - Number(a['Variant Price'] || 0) : sort === 'name' ? text(a.Title).localeCompare(text(b.Title), 'id') : sort === 'stock' ? Number(Boolean(b.Published)) - Number(Boolean(a.Published)) : 0);
  }, [catalogProducts, q, cat, sort, minPrice, maxPrice, stockOnly, brand, variant]);

  const shown = filtered.slice(0, visible);
  const catalogLabel = catalog === 'r2' ? 'Katalog R2 Nusantara' : 'Katalog Resmi';
  const quantity = (product) => cart.reduce((total, item) => total + (keyOf(item) === keyOf(product) ? 1 : 0), 0);
  const add = (product) => { const next = [...cart, product]; setCart(next); localStorage.setItem('r2-cart', JSON.stringify(next)); };
  const decrease = (product) => { const index = cart.findIndex((item) => keyOf(item) === keyOf(product)); if (index < 0) return; const next = cart.slice(0, index).concat(cart.slice(index + 1)); setCart(next); localStorage.setItem('r2-cart', JSON.stringify(next)); };
  const toggleFavorite = (product) => { const id = keyOf(product); const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]; setFavorites(next); localStorage.setItem('r2-favorites', JSON.stringify(next)); };
  const reset = (fn) => { setVisible(PAGE_SIZE); fn(); };
  const clear = () => { setCat('ALL'); setMinPrice(''); setMaxPrice(''); setStockOnly(false); setBrand('ALL'); setVariant('ALL'); setQ(''); setVisible(PAGE_SIZE); };
  const selectCatalog = (next) => { setCatalog(next); setCat('ALL'); setVisible(PAGE_SIZE); router.replace({ pathname: '/products', query: { ...router.query, catalog: next } }, undefined, { shallow: true, scroll: false }); };

  return <>
    <Head><title>{catalogLabel} — R2 NUSANTARA</title><meta name="description" content={`${catalog === 'r2' ? r2Count : resmiCount} produk live ${catalogLabel}, katalog wholesale dengan stok aktif.`} /></Head>
    <a className="r2-skip-link" href="#catalog-content">Lewati ke konten utama</a>
    <main id="catalog-content" className="r2-catalog-clean">
      <header className="r2-clean-header"><Link href="/" className="r2-clean-brand"><img src="/assets/logo/logo.png" alt="R2 NUSANTARA" width="40" height="40" /><span><strong>R2 NUSANTARA</strong><small>Cigarette Tobacco Shop</small></span></Link><div className="r2-clean-head-actions"><Link href="/checkout" aria-label="Keranjang" className="r2-clean-icon"><RouteIcon type="cart" size={21} /><b>{cart.length}</b></Link><Link href="/auth" aria-label="Akun" className="r2-clean-icon"><RouteIcon type="account" size={21} /></Link></div></header>
      <div className="r2-clean-shell">
        <div className="r2-clean-breadcrumb"><Link href="/">Home</Link><span>›</span><strong>Katalog</strong><span>›</span><b>{catalog === 'r2' ? 'R2 Nusantara' : 'Resmi'}</b></div>
        <section className="r2-clean-intro"><div><span>OFFICIAL DISTRIBUTOR · LIVE CATALOG</span><h1>Produk <em>{catalog === 'r2' ? 'R2 Nusantara' : 'Resmi'}</em></h1><p><strong>{catalog === 'r2' ? r2Count : resmiCount}</strong> produk aktif · <strong>{count}</strong> total live</p></div><i><b />LIVE</i></section>
        <section className="r2-clean-search"><label><Search size={18} /><input name="catalog-product-search" value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Cari produk, kategori, atau merk..." aria-label="Cari produk" autoComplete="off" /></label><button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><SlidersHorizontal size={17} />Filter</button>{suggestions.length > 0 && <div className="r2-clean-suggestions">{suggestions.map((p) => <button type="button" key={keyOf(p)} onClick={() => { setQ(p.Title || p.Handle); setVisible(PAGE_SIZE); }}><b>{p.Title || p.Handle}</b><small>{p.Vendor || p.Type || 'Produk'}</small></button>)}</div>}</section>
        <nav className="r2-clean-switch" aria-label="Pilih katalog"><button type="button" className={catalog === 'r2' ? 'active' : ''} onClick={() => selectCatalog('r2')}><PackageCheck size={17} />Katalog R2 <b>{r2Count}</b></button><button type="button" className={catalog === 'resmi' ? 'active' : ''} onClick={() => selectCatalog('resmi')}><BadgeCheck size={17} />Katalog Resmi <b>{resmiCount}</b></button></nav>
        <div className="r2-clean-layout">
          {filtersOpen && <button className="r2-clean-scrim" type="button" aria-label="Tutup filter" onClick={() => setFiltersOpen(false)} />}
          <aside className={`r2-clean-filters ${filtersOpen ? 'open' : ''}`}>
            <div className="r2-clean-filter-head"><strong>Filter Produk</strong><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Tutup filter"><X size={18} /></button></div>
            <div className="r2-filter-group"><span>Kategori</span><div>{cats.map((item) => <button type="button" key={item} className={cat === item ? 'active' : ''} onClick={() => reset(() => setCat(item))}>{item === 'ALL' ? 'Semua' : item}</button>)}</div></div>
            <div className="r2-filter-group"><span>Rentang harga</span><div className="r2-price-fields"><input inputMode="numeric" value={minPrice} onChange={(e) => reset(() => setMinPrice(e.target.value.replace(/\D/g, '')))} placeholder="Min" /><span>—</span><input inputMode="numeric" value={maxPrice} onChange={(e) => reset(() => setMaxPrice(e.target.value.replace(/\D/g, '')))} placeholder="Max" /></div></div>
            <label className="r2-check"><input type="checkbox" checked={stockOnly} onChange={(e) => reset(() => setStockOnly(e.target.checked))} /><span>Ready stock saja</span></label>
            <label className="r2-select-label">Brand / Vendor<select value={brand} onChange={(e) => reset(() => setBrand(e.target.value))}>{brands.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'Semua brand' : item}</option>)}</select></label>
            <label className="r2-select-label">Variant<select value={variant} onChange={(e) => reset(() => setVariant(e.target.value))}>{variants.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'Semua variant' : item}</option>)}</select></label>
            <button type="button" className="r2-clear" onClick={clear}>Reset semua filter</button>
          </aside>
          <section className="r2-clean-results">
            <div className="r2-clean-category-row">{cats.map((item) => <button type="button" key={item} className={cat === item ? 'active' : ''} onClick={() => reset(() => setCat(item))}>{item === 'ALL' ? 'SEMUA' : item}</button>)}</div>
            <div className="r2-clean-meta" aria-live="polite"><span><b>{filtered.length}</b> produk ditemukan · {catalogLabel}</span><div><label>URUTKAN<select value={sort} onChange={(e) => reset(() => setSort(e.target.value))}><option value="default">Rekomendasi</option><option value="name">Nama A-Z</option><option value="price-asc">Harga Terendah</option><option value="price-desc">Harga Tertinggi</option><option value="stock">Stok Terbanyak</option></select></label><div className="r2-view"><button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid"><LayoutGrid size={17} /></button><button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List"><List size={18} /></button></div></div></div>
            {loading ? <SkeletonGrid /> : initialError ? <div className="r2-clean-empty"><strong>Katalog belum tersedia.</strong><span>Periksa koneksi data dan coba kembali.</span></div> : filtered.length === 0 ? <div className="r2-clean-empty"><strong>Produk tidak ditemukan.</strong><span>Coba ubah pencarian atau reset filter.</span><button type="button" onClick={clear}>Reset filter</button></div> : <div className={`r2-clean-grid ${view === 'list' ? 'list' : ''}`}>{shown.map((product, index) => <ProductCard key={keyOf(product)} product={product} index={index} quantity={quantity(product)} favorite={favorites.includes(keyOf(product))} onAdd={add} onDecrease={decrease} onFavorite={toggleFavorite} />)}</div>}
            {!loading && shown.length < filtered.length && <button type="button" className="r2-load-more" onClick={() => setVisible((current) => current + PAGE_SIZE)}>Tampilkan {Math.min(PAGE_SIZE, filtered.length - shown.length)} produk berikutnya</button>}
          </section>
        </div>
      </div>
    </main>
  </>;
}
