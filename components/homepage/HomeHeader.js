import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, ShoppingBag, X, ArrowRight, LayoutGrid, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const sync = () => {
      try {
        const cart = JSON.parse(window.localStorage.getItem('r2-cart') || '[]')
        setCartCount(Array.isArray(cart) ? cart.length : 0)
      } catch {
        setCartCount(0)
      }
    }
    sync()
    window.addEventListener('storage', sync)
    const timer = window.setInterval(sync, 900)
    return () => {
      window.removeEventListener('storage', sync)
      window.clearInterval(timer)
    }
  }, [])

  const close = () => setMenuOpen(false)

  return (
    <header className="r2-home-header">
      <div className="r2-home-header__inner">
        <Link href="/" className="r2-home-header__brand" aria-label="R2 NUSANTARA">
          <span className="r2-home-header__mark">R2</span>
          <span className="r2-home-header__wordmark">
            <strong>R2 NUSANTARA</strong>
            <small>GUDANG DISTRIBUTOR R2 & RESMI</small>
          </span>
          <span className="r2-home-header__verified" title="Distributor resmi"><ShieldCheck size={13}/></span>
        </Link>

        <nav className="r2-home-header__nav" aria-label="Navigasi utama">
          <Link className="is-active" href="/">Beranda</Link>
          <Link href="/products"><LayoutGrid size={15}/> Katalog</Link>
          <a href="#distributor">Distributor</a>
          <a href="#faq">FAQ</a>
          <Link href="/lokasi"><MapPin size={15}/> Lokasi</Link>
          <Link href="/contact"><MessageCircle size={15}/> Kontak</Link>
        </nav>

        <div className="r2-home-header__actions">
          <Link href="/checkout" className="r2-home-header__cart" aria-label={`Keranjang${cartCount ? `, ${cartCount} item` : ''}`}>
            <ShoppingBag size={18}/>
            {cartCount > 0 && <b>{cartCount > 99 ? '99+' : cartCount}</b>}
          </Link>
          <Link href="/login" className="r2-home-header__admin">Admin <ArrowRight size={14}/></Link>
          <button type="button" className="r2-home-header__menu" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>} 
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="r2-home-header__mobile-panel">
          <Link href="/" onClick={close}>Beranda</Link>
          <Link href="/products" onClick={close}>Katalog Produk</Link>
          <a href="#keunggulan" onClick={close}>Keunggulan</a>
          <a href="#distributor" onClick={close}>Distributor</a>
          <a href="#faq" onClick={close}>FAQ</a>
          <Link href="/lokasi" onClick={close}>Lokasi Gudang</Link>
          <Link href="/contact" onClick={close}>Kontak</Link>
          <Link href="/login" className="is-admin" onClick={close}>Login Admin <ArrowRight size={14}/></Link>
        </div>
      )}
    </header>
  )
}
