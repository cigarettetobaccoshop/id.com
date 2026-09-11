import Head from 'next/head'
import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {useRouter} from 'next/router'
import {supabase} from '../lib/supabaseClient'
import {RouteIcon} from '../components/RouteIconNav'
import ProductGrid from '../components/ProductGrid'

const COLUMNS='Handle,Title,Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,"Variant Inventory Qty",Status'
const PAGE_SIZE=24
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)):'Harga belum tersedia'
const stock=v=>Math.max(0,Number(v)||0)
const keyOf=p=>p['Variant SKU']||p.Handle||p.Title||''
const soldOf=p=>{const values=[p.sold_count,p.sold,p['Sold Count'],p['Jumlah Terjual']];for(const value of values){const n=Number(value);if(Number.isFinite(n)&&n>=0)return n}const match=String(p.Tags||'').match(/(?:terjual|sold)\s*[:=-]?\s*(\d+)/i);return match?Number(match[1]):null}
const cardOf=(p,qty)=>({id:keyOf(p),name:p.Title||p.Handle||'Produk R2 NUSANTARA',category:p.Type||p.Vendor||'WHOLESALE',discountPrice:Number.isFinite(Number(p['Variant Price']))?Number(p['Variant Price']):undefined,stockStatus:`Stok Tersedia: ${stock(p['Variant Inventory Qty'])}`,imageUrl:'/assets/ui/r2-detail-pack.svg',quantity:qty})

const Visual=({i=0,favorite=false,onFavorite,title='',inventory=0,sold=null})=><div className={`product-visual tone-${i%4}`}><span className="badge">READY STOCK</span><button type="button" className={`heart ${favorite?'is-favorite':''}`} aria-label={favorite?'Hapus dari favorit':'Favorit'} aria-pressed={favorite} onClick={e=>{e.stopPropagation();onFavorite?.()}}>{favorite?'♥':'♡'}</button><div className="pack-art"><span>R2</span><small>WHOLESALE</small><i>{String(i+1).padStart(2,'0')}</i></div><div className="product-metrics"><span className="product-metric stock-live"><strong>{inventory}</strong> stok</span>{sold!==null&&<span className="product-metric"><strong>{sold}</strong> terjual</span>}</div><strong className="visual-label">{title||'R2 NUSANTARA'}</strong></div>

export async function getServerSideProps({res}){res.setHeader('Cache-Control','public, s-maxage=10, stale-while-revalidate=59');const {data,count,error}=await supabase.from('R2 NUSANTARA').select(COLUMNS,{count:'exact'}).eq('Published',true).eq('Status','active').limit(250);return{props:{products:error?[]:data||[],count:count||0,initialError:Boolean(error)}}}

export default function ProductsPage({products,count,initialError}){
 const router=useRouter();const [q,setQ]=useState(''),[cat,setCat]=useState('ALL'),[sort,setSort]=useState('default'),[visible,setVisible]=useState(PAGE_SIZE),[cart,setCart]=useState([]),[selected,setSelected]=useState(null),[toast,setToast]=useState(''),[favorites,setFavorites]=useState([])
 useEffect(()=>{const query=typeof router.query.q==='string'?router.query.q:'';setQ(query)},[router.query.q])
 useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('r2-cart')||'[]'));setFavorites(JSON.parse(localStorage.getItem('r2-favorites')||'[]'))}catch{setCart([]);setFavorites([])}},[])
 const cats=useMemo(()=>['ALL','KRETEK','FILTER','MILD','PREMIUM','INTERNATIONAL'].filter(x=>x==='ALL'||products.some(p=>`${p.Type||''} ${p.Tags||''}`.toUpperCase().includes(x))),[products])
 const filtered=useMemo(()=>{const s=q.trim().toLowerCase();const rows=products.filter(p=>{const hay=[p.Title,p.Handle,p['Variant SKU'],p.Tags,p.Type,p.Vendor].filter(Boolean).join(' ').toLowerCase();const source=`${p.Type||''} ${p.Tags||''}`.toUpperCase();return(!s||hay.includes(s))&&(cat==='ALL'||source.includes(cat))});return rows.sort((a,b)=>sort==='price-asc'?Number(a['Variant Price']||0)-Number(b['Variant Price']||0):sort==='price-desc'?Number(b['Variant Price']||0)-Number(a['Variant Price']||0):sort==='name'?String(a.Title||'').localeCompare(String(b.Title||''),'id'):sort==='stock'?stock(b['Variant Inventory Qty'])-stock(a['Variant Inventory Qty']):0)},[products,q,cat,sort])
 const shown=filtered.slice(0,visible);const reset=f=>{setVisible(PAGE_SIZE);f()}
 const add=p=>{const next=[...cart,p];setCart(next);localStorage.setItem('r2-cart',JSON.stringify(next));setToast(`${p.Title||'Produk'} ditambahkan`);setTimeout(()=>setToast(''),2000)}
 const decrease=p=>{const id=keyOf(p);const index=cart.findIndex(item=>keyOf(item)===id);if(index<0)return;const next=cart.slice(0,index).concat(cart.slice(index+1));setCart(next);localStorage.setItem('r2-cart',JSON.stringify(next))}
 const quantity=p=>cart.reduce((n,item)=>n+(keyOf(item)===keyOf(p)?1:0),0)
 const toggleFavorite=p=>{const id=keyOf(p);const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);localStorage.setItem('r2-favorites',JSON.stringify(next))};const openDetail=p=>setSelected(p)
 const findLegacy=card=>products.find(p=>String(keyOf(p))===String(card.id))||null
 const addCard=card=>{const p=findLegacy(card);if(p)add(p)}
 const increaseCard=card=>{const p=findLegacy(card);if(p)add(p)}
 const decreaseCard=card=>{const p=findLegacy(card);if(p)decrease(p)}
 const openCard=card=>{const p=findLegacy(card);if(p)openDetail(p)}
 const toggleCard=card=>{const p=findLegacy(card);if(p)toggleFavorite(p)}
 return <>
 <Head><title>Katalog — R2 NUSANTARA</title><meta name="description" content={`${count} produk live R2 Nusantara untuk mitra distribusi.`}/></Head>
 <main className="catalog-app">
 <header className="catalog-mobile-header"><Link href="/" className="brand"><span className="brand-mark"><img src="/assets/logo/logo.png" alt="R2 NUSANTARA" width="40" height="40" /></span><span className="brand-copy"><strong>R2 NUSANTARA</strong><small>DISTRIBUTOR</small></span></Link><div className="catalog-head-actions"><Link href="/checkout" className="cart-link" aria-label="Keranjang"><RouteIcon type="cart" size={21}/><b>{cart.length}</b></Link><Link href="/auth" className="user-link" aria-label="Akun"><RouteIcon type="account" size={21}/></Link></div></header>
 <section className="catalog-top"><Link href="/" className="desktop-back">← R2 NUSANTARA</Link><div><span className="eyebrow">OFFICIAL DISTRIBUTOR · LIVE CATALOG</span><h1>Produk <em>R2 Nusantara</em></h1><p><strong>{count}</strong> produk aktif tersedia untuk mitra distribusi.</p></div><div className="live-dot"><i/> LIVE</div></section>
 <section className="catalog-tools"><label className="search-box">⌕<input value={q} onChange={e=>reset(()=>setQ(e.target.value))} placeholder="Cari produk, kategori, atau merk..." aria-label="Cari produk"/></label><button className="filter-button" type="button" onClick={()=>document.querySelector('.filters')?.scrollIntoView({behavior:'smooth'})}>☷</button></section>
 <section className="filters">{cats.map(x=><button type="button" key={x} className={cat===x?'active':''} onClick={()=>reset(()=>setCat(x))}>{x==='ALL'?'SEMUA':x}</button>)}</section>
 <section className="catalog-meta"><span>{filtered.length} PRODUK</span><label><span>URUTKAN</span><select value={sort} onChange={e=>reset(()=>setSort(e.target.value))}><option value="default">Rekomendasi</option><option value="name">Nama A-Z</option><option value="price-asc">Harga Terendah</option><option value="price-desc">Harga Tertinggi</option><option value="stock">Stok Terbanyak</option></select></label></section>
 {initialError?<section className="empty"><strong>Katalog belum tersedia.</strong><span>Periksa koneksi data dan coba kembali.</span></section>:shown.length===0?<section className="empty"><strong>Produk tidak ditemukan.</strong><span>Ubah kata kunci atau kategori.</span></section>:<ProductGrid products={shown.map(p=>cardOf(p,quantity(p)))} wishlistIds={favorites} onOpen={openCard} onAddToCart={addCard} onIncrease={increaseCard} onDecrease={decreaseCard} onQuickView={openCard} onToggleWishlist={toggleCard}/>} 
 {shown.length<filtered.length&&<div className="load-more"><button type="button" onClick={()=>setVisible(n=>Math.min(n+PAGE_SIZE,filtered.length))}>MUAT LEBIH BANYAK · {filtered.length-shown.length}</button></div>}
 <section className="trust-banner"><div className="trust-mark">✓</div><div><strong>Mitra Terverifikasi, Transaksi Aman</strong><p>Data katalog live dan komunikasi langsung dengan partner.</p></div><Link href="/contact">PARTNER ACCESS →</Link></section><footer className="footer">© {new Date().getFullYear()} R2 NUSANTARA · WHOLESALE DISTRIBUTION PARTNER</footer>
 </main>
 {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="quick-modal" onClick={e=>e.stopPropagation()}><button type="button" className="close" onClick={()=>setSelected(null)} aria-label="Tutup">×</button><Visual title={selected.Title||selected.Handle} inventory={stock(selected['Variant Inventory Qty'])} sold={soldOf(selected)} favorite={favorites.includes(keyOf(selected))} onFavorite={()=>toggleFavorite(selected)}/><span className="category">{selected.Type||selected.Vendor||'WHOLESALE'}</span><h2>{selected.Title||selected.Handle}</h2><div className="price">{money(selected['Variant Price'])}</div><p>SKU: {selected['Variant SKU']||'—'} · Stok: {stock(selected['Variant Inventory Qty'])} · Jumlah di keranjang: {quantity(selected)}</p><button type="button" className="modal-add" onClick={()=>{add(selected);setSelected(null)}}>ADD TO CART →</button></section></div>}
 {toast&&<div className="toast">✓ {toast}</div>}
 </>
}
