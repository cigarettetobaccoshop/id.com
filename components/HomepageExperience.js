import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { ArrowRight, BadgeCheck, Boxes, CheckCircle2, ChevronRight, Grid2X2, Home, Menu, PackageCheck, Search, ShieldCheck, ShoppingCart, Truck, X, MapPin } from 'lucide-react'

const COLUMNS='Handle,Title,Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,"Variant Inventory Qty",Status'
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)):'Harga belum tersedia'

const cigaretteThumbs=[
 '/assets/products/r2-thumb-01.svg',
 '/assets/products/r2-thumb-02.svg',
 '/assets/products/r2-thumb-03.svg',
 '/assets/products/r2-thumb-04.svg'
]
const categoryImages=[
 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85',
 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85',
 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',
 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=85'
]
const thumbFallback='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="#0b2b5c"/><circle cx="760" cy="120" r="220" fill="#1769e0" opacity=".35"/><text x="72" y="165" fill="#fff" font-family="Arial,sans-serif" font-size="38" font-weight="700" letter-spacing="7">R2 NUSANTARA</text><text x="72" y="215" fill="#cfe2ff" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="5">WHOLESALE TRADING PARTNER</text></svg>')
const categories=[
 {id:'rokok-r2',name:'Rokok R2',subtitle:'Nusantara',icon:PackageCheck,query:'Rokok R2',image:categoryImages[0]},
 {id:'rokok-resmi',name:'Rokok Resmi',subtitle:'Premium',icon:BadgeCheck,query:'Rokok Resmi',image:categoryImages[1]},
 {id:'tembakau',name:'Tembakau',subtitle:'Premium',icon:Boxes,query:'Tembakau',image:categoryImages[2]},
 {id:'aksesoris',name:'Aksesoris',subtitle:'Premium',icon:ShieldCheck,query:'Aksesoris',image:categoryImages[3]}
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
 useEffect(()=>{const sync=()=>{try{setCart(JSON.parse(localStorage.getItem('r2-cart')||'[]').length)}catch{setCart(0)}};sync();window.addEventListener('storage',sync);const t=setInterval(sync,700);return()=>{window.removeEventListener('storage',sync);clearInterval(t)},[]})
 useEffect(()=>{if(typeof router.query.q==='string')setSearch(router.query.q)},[router.query.q])
 useEffect(()=>{document.body.classList.toggle('r2-drawer-open',menu);return()=>document.body.classList.remove('r2-drawer-open')},[menu])
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 const submitSearch=e=>{e.preventDefault();const q=search.trim();router.push(q?`/products?q=${encodeURIComponent(q)}`:'/products')}
 const add=p=>{try{const next=[...JSON.parse(localStorage.getItem('r2-cart')||'[]'),p];localStorage.setItem('r2-cart',JSON.stringify(next));setCart(next.length)}catch{}}
 const featured=useMemo(()=>products.slice(0,6),[products])
 const scroll=id=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});setMenu(false)}
 const goContact=()=>{setMenu(false);router.push('/contact')}
 return <>
  <Head><title>R2 Nusantara | Wholesale Trading Partner</title><meta name="description" content="R2 Nusantara — distributor grosir terpercaya. Katalog live, stok ready, pengiriman seluruh Indonesia."/><meta name="theme-color" content="#0B2B5C"/></Head>
  <div className="src-shell">
   <div className="src-trustbar" aria-label="Informasi layanan R2 Nusantara"><div className="src-trustbar-track"><span>DISTRIBUTOR RESMI <b>•</b> STOK READY <b>•</b> PENGIRIMAN SELURUH INDONESIA</span><span aria-hidden="true">DISTRIBUTOR RESMI <b>•</b> STOK READY <b>•</b> PENGIRIMAN SELURUH INDONESIA</span></div></div>
   <header className="src-header">
    <Link href="/" className="src-brand"><span className="src-logo-r2"><img src="/assets/logo/logo.png" alt="R2 Nusantara"/><span className="src-logo-check" aria-label="Terverifikasi"><CheckCircle2 size={11} strokeWidth={3}/></span></span><span><strong>R2 NUSANTARA <i>✓</i></strong><small>WHOLESALE TRADING PARTNER</small></span></Link>
    <nav className={menu?'open':''}><a onClick={()=>scroll('beranda')}>BERANDA</a><a onClick={()=>scroll('kategori')}>KATEGORI</a><a onClick={()=>scroll('produk')}>PRODUK</a><a href="/contact" onClick={()=>setMenu(false)}>KONTAK</a></nav>
    <div className="src-actions"><Link href="/checkout" className="src-cart" aria-label={`Keranjang, ${cart} item`}><Icon icon={ShoppingCart} size={21}/>{cart>0&&<b>{cart}</b>}</Link><Link href="/products" className="src-catalog">KATALOG <ArrowRight size={15}/></Link><button type="button" className="src-menu" onClick={()=>setMenu(v=>!v)} aria-label={menu?'Tutup menu':'Buka menu'} aria-expanded={menu} aria-controls="r2-mobile-drawer">{menu?<X size={22}/>:<Menu size={22}/>}</button></div>
   </header>
   <div className={`r2-drawer-overlay${menu?' is-open':''}`} aria-hidden={!menu} onClick={()=>setMenu(false)} />
   <aside id="r2-mobile-drawer" className={`r2-mobile-drawer${menu?' is-open':''}`} aria-hidden={!menu} aria-label="Menu navigasi" aria-modal={menu||undefined}>
    <div className="r2-drawer-head"><div><span>R2 NUSANTARA</span><small>WHOLESALE TRADING PARTNER</small></div><button type="button" onClick={()=>setMenu(false)} aria-label="Tutup menu"><X size={22}/></button></div>
    <nav className="r2-drawer-nav"><button type="button" onClick={()=>scroll('beranda')}><Home size={20}/><span>Beranda</span><ChevronRight size={17}/></button><button type="button" onClick={()=>scroll('kategori')}><Grid2X2 size={20}/><span>Kategori</span><ChevronRight size={17}/></button><Link href="/products" onClick={()=>setMenu(false)}><Boxes size={20}/><span>Produk</span><ChevronRight size={17}/></Link><Link href="/checkout" onClick={()=>setMenu(false)}><ShoppingCart size={20}/><span>Keranjang</span>{cart>0&&<b>{cart}</b>}<ChevronRight size={17}/></Link><Link href="/contact" onClick={goContact}><ShieldCheck size={20}/><span>Kontak</span><ChevronRight size={17}/></Link></nav>
    <div className="r2-drawer-foot"><span>Distributor resmi • Stok ready</span><small>Malang, Jawa Timur</small></div>
   </aside>
   <main>
    <section id="beranda" className="src-hero"><div className="src-hero-bg"/><div className="src-hero-copy"><div className="src-eyebrow"><Icon icon={BadgeCheck} size={15}/> OFFICIAL DISTRIBUTION <b>•</b> VERIFIED PARTNERS</div><h1>Wholesale,<br/><em>done</em><br/>precisely.</h1><p>Akses katalog distributor R2 Nusantara dengan data produk terbaru, struktur harga yang jelas, dan alur pemesanan yang dirancang untuk kebutuhan bisnis jangka panjang.</p><Link href="/products" className="src-primary">BUKA KATALOG <ArrowRight size={18}/></Link></div></section>
    <div className="src-floating-search"><SearchBar value={search} onChange={e=>setSearch(e.target.value)} onSubmit={submitSearch}/></div>
    <section className="src-trust"><div className="src-trust-grid">{trust.map(([I,title,sub])=><article key={title}><span className="src-trust-icon"><Icon icon={I} size={20}/></span><strong>{title}</strong><small>{sub}</small></article>)}</div></section>
    <section id="kategori" className="src-section src-category"><div className="src-section-head"><div><label>KATEGORI PRODUK</label><h2>Jelajahi Kategori</h2></div><Link href="/products">Lihat Semua <ArrowRight size={15}/></Link></div><div className="src-category-row">{categories.map(c=>{const I=c.icon;return <button key={c.id} onClick={()=>router.push(`/products?q=${encodeURIComponent(c.query)}`)} className="src-category-card"><div className="src-category-image" style={{backgroundImage:`url(${c.image})`}}><span><Icon icon={I} size={24}/></span></div><div><strong>{c.name}</strong><small>({c.subtitle})</small><b><ChevronRight size={17}/></b></div></button>})}</div></section>
    <section id="produk" className="src-section"><div className="src-section-head"><div><label>PRODUK UNGGULAN</label><h2>Produk Pilihan</h2><small>Menampilkan <b>{products.length}</b> produk dari katalog</small></div><Link href="/products">Lihat Katalog <ArrowRight size={15}/></Link></div><div className="src-products">{featured.map((p,i)=><article className="src-product" key={p['Variant SKU']||p.Handle||i}><div className="src-product-image"><img src={cigaretteThumbs[i%cigaretteThumbs.length]} alt="Visual produk R2 Nusantara" loading="lazy" decoding="async" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=thumbFallback}}/><div aria-hidden="true" style={{position:'absolute',left:0,right:0,bottom:0,zIndex:1,padding:'38px 9px 9px',background:'linear-gradient(180deg,transparent,rgba(7,17,30,.78))',pointerEvents:'none'}}><strong style={{display:'block',color:'#E5C385',font:'900 8px/1 Inter,sans-serif',letterSpacing:'.15em'}}>R2 NUSANTARA</strong><span style={{display:'block',marginTop:3,color:'rgba(255,255,255,.78)',font:'700 5px/1.2 Inter,sans-serif',letterSpacing:'.16em'}}>WHOLESALE TRADING PARTNER</span></div><span>READY STOCK</span></div><div className="src-product-body"><small>{p.Type||p.Vendor||'Katalog R2 Nusantara'}</small><h3>{p.Title}</h3><strong>{money(p['Variant Price'])}</strong><button onClick={()=>add(p)}>TAMBAH <span>+</span></button></div></article>)}</div>{!products.length&&<div className="src-empty">Memuat katalog live…</div>}</section>
    <section className="src-wholesale"><label>WHOLESALE PARTNER</label><h2>Dibangun untuk kebutuhan<br/>distribusi jangka panjang.</h2><p>Akses katalog, ketersediaan produk, dan proses pemesanan dalam satu pengalaman mobile-first yang ringkas.</p><Link href="/products" className="src-primary">JELAJAHI KATALOG <ArrowRight size={18}/></Link></section>
   </main>
   <footer className="src-footer"><div className="src-footer-map"><div className="src-footer-info"><strong>R2 NUSANTARA</strong><span>WHOLESALE TRADING PARTNER</span><p>Gudang Distributor • Malang, Jawa Timur</p><div className="src-footer-links"><Link href="/">Beranda</Link><Link href="/products">Katalog</Link><Link href="/checkout">Keranjang</Link><Link href="/contact">Kontak</Link></div></div><div className="src-footer-mapbox"><div className="src-footer-mapframe"><iframe title="Lokasi Gudang Distributor R2 Nusantara" src="https://www.google.com/maps?q=WJMC%2BWG8%2C%20Karangduren%2C%20Kec.%20Pakisaji%2C%20Kabupaten%20Malang%2C%20Jawa%20Timur%2065162&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></div><div className="src-footer-mapcard"><span className="src-footer-pin"><MapPin size={17}/></span><div><strong>Gudang Distributor - R2 Nusantara</strong><p>WJMC+WG8, Karangduren, Kec. Pakisaji, Kabupaten Malang, Jawa Timur 65162</p><a href="https://maps.app.goo.gl/UeWb8iJvcE9bLYEfA?g_st=ac" target="_blank" rel="noopener noreferrer">Buka di Google Maps</a></div></div></div></div><small className="src-footer-copy">© 2026 R2 Nusantara. All rights reserved.</small></footer>
   <div className="src-bottom-nav"><button onClick={()=>scroll('beranda')}><Icon icon={Home}/><span>Beranda</span></button><button onClick={()=>scroll('kategori')}><Icon icon={Grid2X2}/><span>Kategori</span></button><button onClick={()=>scroll('produk')}><Icon icon={Boxes}/><span>Produk</span></button><Link href="/checkout"><Icon icon={ShoppingCart}/><span>Keranjang</span>{cart>0&&<b>{cart}</b>}</Link></div>
  </div>
 </>
}
