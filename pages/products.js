import Head from 'next/head'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {useRouter} from 'next/router'
import {supabase} from '../lib/supabaseClient'
import {RouteIcon} from '../components/RouteIconNav'

const COLUMNS='Handle,Title,Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,"Variant Inventory Qty",Status'
const PAGE_SIZE=24
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)):'Harga belum tersedia'
const stock=v=>Math.max(0,Number(v)||0)
const keyOf=p=>p['Variant SKU']||p.Handle||p.Title||''
const normalizeName=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'')

/* Source-of-truth mapping from the existing catalog dataset: official SKU names. */
const OFFICIAL_NAMES=new Set([
 'A Mild 12','A Mild 16','A Mild Menthol','Dji Sam Soe Filter','Dji Sam Soe Kretek (SKT)','Dji Sam Soe Magnum Mild',
 'Marlboro Gold','Marlboro Ice Blast','Marlboro Menthol','Marlboro Red','Sampoerna Hijau (SKT)','Sampoerna Kretek','Sampoerna Mild 12','Sampoerna Mild 16','Sampoerna Mild Menthol','Sampoerna U Bold','Sampoerna U Mild','Sampoerna U Mild 12',
 'Gudang Garam Djaja (SKT)','Gudang Garam Filter','Gudang Garam Inter','Gudang Garam Merah','Gudang Garam Signature Mild','Surya 12','Surya 16','Surya Pro 12','Surya Pro 16','Surya Promild',
 'Djarum 76','Djarum 76 Menthol','Djarum Black','Djarum Black Menthol','Djarum Coklat (SKT)','Djarum Super (SKT)','Djarum Super 12','Djarum Super Mild','Djarum Super Mild 12','Djarum Super Mild Menthol',
 'LA Bold','LA Lights 12','LA Lights 16','LA Lights Menthol','Bentoel Biru','Bentoel Filter','Bentoel Mild','Bentoel Sejati (SKT)',
 'Camel Filter','Camel Yellow','Dunhill Filter','Dunhill Mild','Lucky Strike Filter','Pall Mall Filter','Class Filter','Class Mild 12','Class Mild 16','Class Mild Menthol','Clas Mild 12','Clas Mild 16',
 'Minak Djinggo Original','Minak Djinggo Rempah','Galan Filter','Galan Kretek','Wismilak Filter','Wismilak Kretek (SKT)','Wismilak Mild','Wismilak Special'
].map(normalizeName))

const catalogOf=p=>p?.category==='resmi'||OFFICIAL_NAMES.has(normalizeName(p?.Title||p?.Handle))?'resmi':'r2'

/* Presentation-only product artwork. */
const Visual=({i=0,favorite=false,onFavorite,title='',inventory=0,catalog='r2',product})=>{
 const ready=inventory>0
 const rawTitle=String(title||product?.Title||product?.Handle||'R2 NUSANTARA').trim()
 const words=rawTitle.split(/\s+/).filter(Boolean)
 const brand=(words.slice(0,Math.min(2,words.length)).join(' ')||'R2 NUSANTARA').slice(0,26)
 const variant=String(product?.['Option1 Value']||product?.Type||(catalog==='resmi'?'RESMI':'GROSIR')).trim()
 return <div className={`product-visual tone-${i%4} ${catalog==='resmi'?'catalog-resmi':'catalog-r2'}`}>
  <span className="badge">{ready?'READY STOCK':'STOK HABIS'}</span>
  <button type="button" className={`heart ${favorite?'is-favorite':''}`} aria-label={favorite?'Hapus dari favorit':'Favorit'} aria-pressed={favorite} onClick={e=>{e.stopPropagation();onFavorite?.()}}>{favorite?'♥':'♡'}</button>
  <div className="pack-art" aria-hidden="true">
   <span className="watermark">{brand}</span>
   <div className="pack-shell">
    <div className="pack-warning">PERINGATAN KESEHATAN · PRODUK TEMBAKAU</div>
    <div className="pack-brand">{brand}</div>
    <div className="pack-variant">{variant||'GROSIR'}</div>
    <div className="pack-barcode"/>
   </div>
  </div>
  <strong className="visual-label">{rawTitle}</strong>
 </div>
}

export async function getServerSideProps({res}){
 res.setHeader('Cache-Control','public, s-maxage=10, stale-while-revalidate=59')
 const {data,count,error}=await supabase.from('R2 NUSANTARA').select(COLUMNS,{count:'exact'}).eq('Published',true).eq('Status','active').limit(250)
 return{props:{products:error?[]:data||[],count:count||0,initialError:Boolean(error)}}
}

export default function ProductsPage({products,count,initialError}){
 const router=useRouter()
 const [q,setQ]=useState(''),[catalog,setCatalog]=useState('r2'),[cat,setCat]=useState('ALL'),[sort,setSort]=useState('default'),[visible,setVisible]=useState(PAGE_SIZE),[cart,setCart]=useState([]),[selected,setSelected]=useState(null),[toast,setToast]=useState(''),[favorites,setFavorites]=useState([])
 useEffect(()=>{const query=typeof router.query.q==='string'?router.query.q:'';setQ(query)},[router.query.q])
 useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('r2-cart')||'[]'));setFavorites(JSON.parse(localStorage.getItem('r2-favorites')||'[]'))}catch{setCart([]);setFavorites([])}},[])
 const r2Count=useMemo(()=>products.filter(p=>catalogOf(p)==='r2').length,[products])
 const resmiCount=useMemo(()=>products.filter(p=>catalogOf(p)==='resmi').length,[products])
 const catalogProducts=useMemo(()=>products.filter(p=>catalogOf(p)===catalog),[products,catalog])
 const cats=useMemo(()=>['ALL','KRETEK','FILTER','MILD','PREMIUM','INTERNATIONAL'].filter(x=>x==='ALL'||catalogProducts.some(p=>`${p.Type||''} ${p.Tags||''}`.toUpperCase().includes(x))),[catalogProducts])
 const filtered=useMemo(()=>{const s=q.trim().toLowerCase();const rows=catalogProducts.filter(p=>{const hay=[p.Title,p.Handle,p['Variant SKU'],p.Tags,p.Type,p.Vendor].filter(Boolean).join(' ').toLowerCase();const source=`${p.Type||''} ${p.Tags||''}`.toUpperCase();return(!s||hay.includes(s))&&(cat==='ALL'||source.includes(cat))});return rows.sort((a,b)=>sort==='price-asc'?Number(a['Variant Price']||0)-Number(b['Variant Price']||0):sort==='price-desc'?Number(b['Variant Price']||0)-Number(a['Variant Price']||0):sort==='name'?String(a.Title||'').localeCompare(String(b.Title||''),'id'):sort==='stock'?stock(b['Variant Inventory Qty'])-stock(a['Variant Inventory Qty']):0)},[catalogProducts,q,cat,sort])
 const shown=filtered.slice(0,visible)
 const reset=f=>{setVisible(PAGE_SIZE);f()}
 const switchCatalog=next=>{setCatalog(next);setCat('ALL');setVisible(PAGE_SIZE)}
 const add=p=>{const next=[...cart,p];setCart(next);localStorage.setItem('r2-cart',JSON.stringify(next));setToast(`${p.Title||'Produk'} ditambahkan`);setTimeout(()=>setToast(''),2000)}
 const decrease=p=>{const id=keyOf(p);const index=cart.findIndex(item=>keyOf(item)===id);if(index<0)return;const next=cart.slice(0,index).concat(cart.slice(index+1));setCart(next);localStorage.setItem('r2-cart',JSON.stringify(next))}
 const quantity=p=>cart.reduce((n,item)=>n+(keyOf(item)===keyOf(p)?1:0),0)
 const toggleFavorite=p=>{const id=keyOf(p);const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);localStorage.setItem('r2-favorites',JSON.stringify(next))}
 const openDetail=p=>setSelected(p)
 const catalogLabel=catalog==='r2'?'Katalog R2 Nusantara':'Katalog Resmi'
 return <>
 <Head><title>{catalogLabel} — R2 NUSANTARA</title><meta name="description" content={`${count} produk live R2 Nusantara, dipisahkan dalam katalog R2 dan katalog Resmi.`}/></Head>
 <main className="catalog-app">
  <header className="catalog-mobile-header"><Link href="/" className="brand"><span className="brand-mark"><img src="/assets/logo/logo.png" alt="R2 NUSANTARA" width="40" height="40" /></span><span className="brand-copy"><strong>R2 NUSANTARA</strong><small>DISTRIBUTOR</small></span></Link><div className="catalog-head-actions"><Link href="/checkout" className="cart-link" aria-label="Keranjang"><RouteIcon type="cart" size={21}/><b>{cart.length}</b></Link><Link href="/auth" className="user-link" aria-label="Akun"><RouteIcon type="account" size={21}/></Link></div></header>
  <section className="catalog-top"><Link href="/" className="desktop-back">← R2 NUSANTARA</Link><div><span className="eyebrow">OFFICIAL DISTRIBUTOR · LIVE CATALOG</span><h1>Produk <em>{catalogLabel.replace('Katalog ','')}</em></h1><p><strong>{catalog==='r2'?r2Count:resmiCount}</strong> produk aktif pada katalog ini · <strong>{count}</strong> total live.</p></div><div className="live-dot"><i/> LIVE</div></section>
  <section className="catalog-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={q} onChange={e=>reset(()=>setQ(e.target.value))} placeholder="Cari produk, kategori, atau merk..." aria-label="Cari produk"/></label><button className="filter-button" type="button" onClick={()=>document.querySelector('.filters')?.scrollIntoView({behavior:'smooth'})}>☷</button></section>
  <nav className="catalog-switch" aria-label="Pilih katalog"><button type="button" className={catalog==='r2'?'active':''} onClick={()=>switchCatalog('r2')} aria-selected={catalog==='r2'}>◉ Katalog R2 <span className="count">{r2Count}</span></button><button type="button" className={`resmi ${catalog==='resmi'?'active':''}`} onClick={()=>switchCatalog('resmi')} aria-selected={catalog==='resmi'}>✦ Katalog Resmi <span className="count">{resmiCount}</span></button></nav>
  <section className="filters">{cats.map(x=><button type="button" key={x} className={cat===x?'active':''} onClick={()=>reset(()=>setCat(x))}>{x==='ALL'?'SEMUA':x}</button>)}</section>
  <section className="catalog-meta"><span>{filtered.length} PRODUK · {catalogLabel.toUpperCase()}</span><label><span>URUTKAN</span><select value={sort} onChange={e=>reset(()=>setSort(e.target.value))}><option value="default">Rekomendasi</option><option value="name">Nama A-Z</option><option value="price-asc">Harga Terendah</option><option value="price-desc">Harga Tertinggi</option><option value="stock">Stok Terbanyak</option></select></label></section>
  {initialError?<section className="catalog-empty"><strong>Katalog belum tersedia.</strong><span>Periksa koneksi data dan coba kembali.</span></section>:shown.length===0?<section className="catalog-empty"><strong>Produk tidak ditemukan.</strong><span>Ubah kata kunci, kategori, atau pilih katalog lainnya.</span></section>:<section className="catalog-grid">{shown.map((p,i)=>{const id=keyOf(p),favorite=favorites.includes(id),qty=quantity(p),inventory=stock(p['Variant Inventory Qty']);const categoryLabel=catalog==='r2'?'R2 KATALOG · NUSANTARA':'KATALOG RESMI · BRAND NASIONAL/INTERNASIONAL';return <article className="product-card" key={id||i} role="button" tabIndex={0} onClick={()=>openDetail(p)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDetail(p)}}}>
   <div className="card-media"><Visual i={i} title={p.Title||p.Handle} inventory={inventory} catalog={catalog} favorite={favorite} onFavorite={()=>toggleFavorite(p)} product={p}/></div>
   <div className="product-body"><span className="category">{categoryLabel}</span><h2 onClick={e=>{e.stopPropagation();openDetail(p)}}>{p.Title||p.Handle}</h2>{p['Option1 Value']&&<small className="variant">{p['Option1 Name']||'VARIANT'} · {p['Option1 Value']}</small>}<p className="tagline">{p.Type||p.Tags||'Produk wholesale R2 Nusantara'}</p><div className="static-rating" aria-label="Rating estimasi"><span aria-hidden="true">★★★★★</span><strong>{(4.3+((String(id).split('').reduce((n,c)=>n+c.charCodeAt(0),0)%7)*0.1)).toFixed(1)}</strong></div><div className="price">{money(p['Variant Price'])}</div><span className={`stock ${inventory>0?'':'out'}`}><i/>{inventory>0?'Ready Stock Gudang':'Stok tidak tersedia'} {inventory>0&&<strong>{inventory}</strong>}</span></div>
   <div className="card-actions v11-actions" onClick={e=>e.stopPropagation()}>{qty>0?<div className="quantity-control" aria-label={`Jumlah ${p.Title||p.Handle}`}><button type="button" aria-label="Kurangi jumlah" disabled={!qty} onClick={()=>decrease(p)}>−</button><output aria-live="polite">{qty}</output><button type="button" aria-label="Tambah jumlah" onClick={()=>add(p)}>+</button></div>:<button type="button" className="static-add" onClick={()=>add(p)}>🛒 Keranjang</button>}<button type="button" className="detail" aria-label="Lihat detail" onClick={()=>openDetail(p)}>DETAIL</button></div>
  </article>})}</section>}
  {shown.length<filtered.length&&<div className="load-more"><button type="button" onClick={()=>setVisible(n=>Math.min(n+PAGE_SIZE,filtered.length))}>MUAT LEBIH BANYAK · {filtered.length-shown.length}</button></div>}
  <section className="trust-banner"><div className="trust-mark">✓</div><div><strong>Katalog live terhubung ke inventory aktif.</strong><p>Pemisahan R2 dan Resmi hanya pada layer katalog/visual; data transaksi, keranjang, dan checkout tetap menggunakan alur yang sudah ada.</p></div><Link href="/contact">KONTAK ADMIN →</Link></section><footer className="footer">© {new Date().getFullYear()} R2 NUSANTARA · WHOLESALE DISTRIBUTION</footer>
 </main>
 {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="quick-modal" onClick={e=>e.stopPropagation()}><button type="button" className="close" onClick={()=>setSelected(null)} aria-label="Tutup">×</button><Visual title={selected.Title||selected.Handle} inventory={stock(selected['Variant Inventory Qty'])} catalog={catalogOf(selected)} favorite={favorites.includes(keyOf(selected))} onFavorite={()=>toggleFavorite(selected)} product={selected}/><span className="category">{catalogOf(selected)==='r2'?'R2 KATALOG · NUSANTARA':'KATALOG RESMI'}</span><h2>{selected.Title||selected.Handle}</h2><div className="price">{money(selected['Variant Price'])}</div><p>SKU: {selected['Variant SKU']||'—'} · Stok: {stock(selected['Variant Inventory Qty'])} · Jumlah di keranjang: {quantity(selected)}</p><button type="button" className="modal-add" onClick={()=>{add(selected);setSelected(null)}}>ADD TO CART →</button></section></div>}
 {toast&&<div className="toast">✓ {toast}</div>}
 </>
}
