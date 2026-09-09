import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { ArrowRight, BadgeCheck, Boxes, CheckCircle2, ChevronRight, Grid2X2, Home, Menu, PackageCheck, Search, ShieldCheck, ShoppingCart, Truck, X } from 'lucide-react'

const COLUMNS='Handle,Title,Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,"Variant Inventory Qty",Status'
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)):'Harga belum tersedia'

// Open-source / CC BY 4.0 imagery from Wikimedia Commons, selected as neutral cigarette/tobacco visuals without brand packaging.
const cigaretteThumbs=[
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/5_cigarettes_in_a_row.jpg/960px-5_cigarettes_in_a_row.jpg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/A_stack_of_5_cigarettes.jpg/960px-A_stack_of_5_cigarettes.jpg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/5_cigarettes_in_a_row.jpg/640px-5_cigarettes_in_a_row.jpg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/A_stack_of_5_cigarettes.jpg/640px-A_stack_of_5_cigarettes.jpg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/5_cigarettes_in_a_row.jpg/1280px-5_cigarettes_in_a_row.jpg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/A_stack_of_5_cigarettes.jpg/1280px-A_stack_of_5_cigarettes.jpg'
]
const categories=[
 {id:'rokok-r2',name:'Rokok R2',subtitle:'Nusantara',icon:PackageCheck,query:'Rokok R2'},
 {id:'rokok-resmi',name:'Rokok Resmi',subtitle:'Premium',icon:BadgeCheck,query:'Rokok Resmi'},
 {id:'tembakau',name:'Tembakau',subtitle:'Premium',icon:Boxes,query:'Tembakau'},
 {id:'aksesoris',name:'Aksesoris',subtitle:'Premium',icon:ShieldCheck,query:'Aksesoris'}
]
const trust=[
 [CheckCircle2,'Produk Original','100% terjamin keaslian'],
 [PackageCheck,'Stok Selalu Ready','Update real-time'],
 [Truck,'Pengiriman Cepat','Seluruh Indonesia'],
 [ShieldCheck,'Layanan Profesional','Tim siap membantu']
]

function Icon({icon:IconComponent,size=19,strokeWidth=1.8}){return <IconComponent size={size} strokeWidth={strokeWidth} aria-hidden="true"/>}
function SearchBar({value,onChange,onSubmit,className=''}){return <form className={`src-search ${className}`} role="search" onSubmit={onSubmit}><Search size={18} strokeWidth={1.8} aria-hidden="true"/><input type="search" value={value} onChange={onChange} placeholder="Cari produk, kategori, merk, atau SKU..." aria-label="Cari produk, kategori, merk, atau SKU"/><button type="submit" aria-label="Cari"><ArrowRight size={18} strokeWidth={1.8}/></button></form>}

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
    <nav className={menu?'open':''}><a onClick={()=>scroll('beranda')}>BERANDA</a><a onClick={()=>scroll('kategori')}>KATEGORI</a><a onClick={()=>scroll('produk')}>PRODUK</a><a href="/contact">KONTAK</a></nav>
    <div className="src-actions"><Link href="/checkout" className="src-cart" aria-label={`Keranjang, ${cart} item`}><Icon icon={ShoppingCart} size={21}/>{cart>0&&<b>{cart}</b>}</Link><Link href="/products" className="src-catalog">KATALOG <ArrowRight size={15}/></Link><button className="src-menu" onClick={()=>setMenu(v=>!v)} aria-label={menu?'Tutup menu':'Buka menu'}>{menu?<X size={22}/>:<Menu size={22}/>}</button></div>
   </header>
   <main>
    <section id="beranda" className="src-hero">
      <div className="src-hero-bg"/>
      <div className="src-hero-copy"><div className="src-eyebrow"><Icon icon={BadgeCheck} size={15}/> OFFICIAL DISTRIBUTION <b>•</b> VERIFIED PARTNERS</div><h1>Wholesale,<br/><em>done</em><br/>precisely.</h1><p>Akses katalog distributor R2 Nusantara dengan data produk terbaru, struktur harga yang jelas, dan alur pemesanan yang dirancang untuk kebutuhan bisnis jangka panjang.</p><Link href="/products" className="src-primary">BUKA KATALOG <ArrowRight size={18}/></Link></div>
    </section>
    <div className="src-floating-search"><SearchBar value={search} onChange={e=>setSearch(e.target.value)} onSubmit={submitSearch}/></div>
    <section className="src-trust"><div className="src-trust-grid">{trust.map(([I,title,sub])=><article key={title}><span className="src-trust-icon"><Icon icon={I} size={20}/></span><strong>{title}</strong><small>{sub}</small></article>)}</div></section>
    <section id="kategori" className="src-section src-category"><div className="src-section-head"><div><label>KATEGORI PRODUK</label><h2>Jelajahi Kategori</h2></div><Link href="/products">Lihat Semua <ArrowRight size={15}/></Link></div><div className="src-category-row">{categories.map(c=>{const I=c.icon;return <button key={c.id} onClick={()=>router.push(`/products?q=${encodeURIComponent(c.query)}`)} className="src-category-card"><div className="src-category-image" style={{backgroundImage:`url(${c.id==='rokok-r2'?cigaretteThumbs[0]:c.id==='rokok-resmi'?cigaretteThumbs[1]:c.id==='tembakau'?cigaretteThumbs[4]:cigaretteThumbs[3]})`}}><span><Icon icon={I} size={24}/></span></div><div><strong>{c.name}</strong><small>({c.subtitle})</small><b><ChevronRight size={17}/></b></div></button>})}</div></section>
    <section id="produk" className="src-section"><div className="src-section-head"><div><label>PRODUK UNGGULAN</label><h2>Produk Pilihan</h2><small>Menampilkan <b>{products.length}</b> produk dari katalog</small></div><Link href="/products">Lihat Katalog <ArrowRight size={15}/></Link></div><div className="src-products">{featured.map((p,i)=><article className="src-product" key={p['Variant SKU']||p.Handle||i}><div className="src-product-image"><img src={cigaretteThumbs[i%cigaretteThumbs.length]} alt="Ilustrasi produk tembakau dan rokok" loading="lazy"/><span>READY STOCK</span></div><div className="src-product-body"><small>{p.Type||p.Vendor||'Katalog R2 Nusantara'}</small><h3>{p.Title}</h3><strong>{money(p['Variant Price'])}</strong><button onClick={()=>add(p)}>TAMBAH <span>+</span></button></div></article>)}</div>{!products.length&&<div className="src-empty">Memuat katalog live…</div>}</section>
    <section className="src-wholesale"><label>WHOLESALE PARTNER</label><h2>Dibangun untuk kebutuhan<br/>distribusi jangka panjang.</h2><p>Akses katalog, ketersediaan produk, dan proses pemesanan dalam satu pengalaman mobile-first yang ringkas.</p><Link href="/products" className="src-primary">JELAJAHI KATALOG <ArrowRight size={18}/></Link></section>
   </main>
   <footer className="src-footer"><div><strong>R2 NUSANTARA</strong><span>WHOLESALE TRADING PARTNER</span></div><p>Gudang Distributor • Malang, Jawa Timur</p><small>© 2026 R2 Nusantara. All rights reserved.</small></footer>
   <div className="src-bottom-nav"><button onClick={()=>scroll('beranda')}><Icon icon={Home}/><span>Beranda</span></button><button onClick={()=>scroll('kategori')}><Icon icon={Grid2X2}/><span>Kategori</span></button><button onClick={()=>scroll('produk')}><Icon icon={Boxes}/><span>Produk</span></button><Link href="/checkout"><Icon icon={ShoppingCart}/><span>Keranjang</span>{cart>0&&<b>{cart}</b>}</Link></div>
  </div>
 </>
}
