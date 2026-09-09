import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const COLUMNS='Handle,Title,Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,"Variant Inventory Qty",Status'
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)):'Harga belum tersedia'
const categories=[
  {id:'rokok-r2',name:'Rokok R2',subtitle:'Nusantara',icon:'◈',image:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',query:'Rokok R2'},
  {id:'rokok-resmi',name:'Rokok Resmi',subtitle:'Premium',icon:'◇',image:'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=700&q=85',query:'Rokok Resmi'},
  {id:'tembakau',name:'Tembakau',subtitle:'Premium',icon:'▣',image:'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=700&q=85',query:'Tembakau'},
  {id:'aksesoris',name:'Aksesoris',subtitle:'Premium',icon:'□',image:'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=700&q=85',query:'Aksesoris'}
]
const trust=[['✓','Produk Original','100% terjamin keaslian'],['▣','Stok Selalu Ready','Update real-time'],['→','Pengiriman Cepat','Seluruh Indonesia'],['◎','Layanan Profesional','Tim siap membantu']]
const nav=[['⌂','Beranda','#beranda'],['▦','Kategori','#kategori'],['◉','Produk','#produk'],['🛒','Keranjang','/checkout']]

function Icon({children}){return <span className="src-icon" aria-hidden="true">{children}</span>}
function SearchBar({value,onChange,onSubmit,className=''}){return <form className={`src-search ${className}`} role="search" onSubmit={onSubmit}><span>⌕</span><input type="search" value={value} onChange={onChange} placeholder="Cari produk, kategori, merk, atau SKU..." aria-label="Cari produk, kategori, merk, atau SKU"/><button type="submit" aria-label="Cari">→</button></form>}

export default function HomepageExperience(){
 const router=useRouter()
 const [products,setProducts]=useState([]),[search,setSearch]=useState(''),[menu,setMenu]=useState(false),[cart,setCart]=useState(0)
 useEffect(()=>{let mounted=true;supabase.from('R2 NUSANTARA').select(COLUMNS).eq('Published',true).eq('Status','active').limit(100).then(({data})=>{if(mounted)setProducts(data||[])});return()=>{mounted=false}},[])
 useEffect(()=>{const sync=()=>{try{setCart(JSON.parse(localStorage.getItem('r2-cart')||'[]').length)}catch{setCart(0)}};sync();window.addEventListener('storage',sync);const t=setInterval(sync,700);return()=>{window.removeEventListener('storage',sync);clearInterval(t)}},[])
 useEffect(()=>{if(typeof router.query.q==='string')setSearch(router.query.q)},[router.query.q])
 const submitSearch=e=>{e.preventDefault();const q=search.trim();router.push(q?`/products?q=${encodeURIComponent(q)}`:'/products')}
 const add=p=>{try{const next=[...JSON.parse(localStorage.getItem('r2-cart')||'[]'),p];localStorage.setItem('r2-cart',JSON.stringify(next));setCart(next.length)}catch{}}
 const featured=useMemo(()=>products.slice(0,6),[products])
 const scroll=id=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});setMenu(false)}
 return <>
  <Head><title>R2 Nusantara | Wholesale Trading Partner</title><meta name="description" content="R2 Nusantara — distributor grosir terpercaya. Katalog live, stok ready, pengiriman seluruh Indonesia."/><meta name="theme-color" content="#111827"/></Head>
  <div className="src-shell">
   <div className="src-trustbar">DISTRIBUTOR RESMI <b>•</b> STOK READY <b>•</b> PENGIRIMAN SELURUH INDONESIA</div>
   <header className="src-header">
    <Link href="/" className="src-brand"><span className="src-logo"><img src="/assets/logo/logo.png" alt="R2 Nusantara"/></span><span><strong>R2 NUSANTARA <i>✓</i></strong><small>WHOLESALE TRADING PARTNER</small></span></Link>
    <SearchBar value={search} onChange={e=>setSearch(e.target.value)} onSubmit={submitSearch} className="src-header-search"/>
    <nav className={menu?'open':''}><a onClick={()=>scroll('beranda')}>BERANDA</a><a onClick={()=>scroll('kategori')}>KATEGORI</a><a onClick={()=>scroll('produk')}>PRODUK</a><a href="/contact">KONTAK</a></nav>
    <div className="src-actions"><Link href="/checkout" className="src-cart"><Icon>🛒</Icon><b>{cart}</b></Link><Link href="/products" className="src-catalog">KATALOG →</Link><button className="src-menu" onClick={()=>setMenu(v=>!v)} aria-label="Menu">{menu?'×':'☰'}</button></div>
   </header>
   <main>
    <section id="beranda" className="src-hero">
      <div className="src-hero-bg"/>
      <div className="src-hero-copy"><div className="src-eyebrow"><span>✓</span> OFFICIAL DISTRIBUTION <b>•</b> VERIFIED PARTNERS</div><h1>Wholesale,<br/><em>done</em><br/>precisely.</h1><p>Akses katalog distributor R2 Nusantara dengan data produk terbaru, struktur harga yang jelas, dan alur pemesanan yang dirancang untuk kebutuhan bisnis jangka panjang.</p><Link href="/products" className="src-primary">BUKA KATALOG <span>→</span></Link></div>
    </section>
    <div className="src-floating-search"><SearchBar value={search} onChange={e=>setSearch(e.target.value)} onSubmit={submitSearch}/></div>
    <section className="src-trust"><div className="src-trust-grid">{trust.map(([ico,title,sub])=><article key={title}><span className="src-trust-icon"><Icon>{ico}</Icon></span><strong>{title}</strong><small>{sub}</small></article>)}</div></section>
    <section id="kategori" className="src-section src-category"><div className="src-section-head"><div><label>KATEGORI PRODUK</label><h2>Jelajahi Kategori</h2></div><Link href="/products">Lihat Semua →</Link></div><div className="src-category-row">{categories.map(c=><button key={c.id} onClick={()=>router.push(`/products?q=${encodeURIComponent(c.query)}`)} className="src-category-card"><div className="src-category-image" style={{backgroundImage:`url(${c.image})`}}><span>{c.icon}</span></div><div><strong>{c.name}</strong><small>({c.subtitle})</small><b>›</b></div></button>)}</div></section>
    <section id="produk" className="src-section"><div className="src-section-head"><div><label>PRODUK UNGGULAN</label><h2>Produk Pilihan</h2><small>Menampilkan <b>{products.length}</b> produk dari katalog</small></div><Link href="/products">Lihat Katalog →</Link></div><div className="src-products">{featured.map((p,i)=><article className="src-product" key={p['Variant SKU']||p.Handle||i}><div className="src-product-image"><span>READY STOCK</span><strong>R2</strong><small>WHOLESALE</small></div><div className="src-product-body"><small>{p.Type||p.Vendor||'Katalog R2 Nusantara'}</small><h3>{p.Title}</h3><strong>{money(p['Variant Price'])}</strong><button onClick={()=>add(p)}>TAMBAH <span>+</span></button></div></article>)}</div>{!products.length&&<div className="src-empty">Memuat katalog live…</div>}</section>
    <section className="src-wholesale"><label>WHOLESALE PARTNER</label><h2>Dibangun untuk kebutuhan<br/>distribusi jangka panjang.</h2><p>Akses katalog, ketersediaan produk, dan proses pemesanan dalam satu pengalaman mobile-first yang ringkas.</p><Link href="/products" className="src-primary">JELAJAHI KATALOG →</Link></section>
   </main>
   <footer className="src-footer"><div><strong>R2 NUSANTARA</strong><span>WHOLESALE TRADING PARTNER</span></div><p>Gudang Distributor • Malang, Jawa Timur</p><small>© 2026 R2 Nusantara. All rights reserved.</small></footer>
   <div className="src-bottom-nav">{nav.map(([ico,label,to])=>to.startsWith('/')?<Link key={label} href={to}><Icon>{ico}</Icon><span>{label}</span>{label==='Keranjang'&&cart>0&&<b>{cart}</b>}</Link>:<button key={label} onClick={()=>scroll(to.slice(1))}><Icon>{ico}</Icon><span>{label}</span></button>)}</div>
  </div>
 </>
}
