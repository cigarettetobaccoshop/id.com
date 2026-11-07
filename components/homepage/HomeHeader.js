import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, LayoutGrid, MapPin, Menu, MessageCircle, ShoppingBag, X } from 'lucide-react'
import styles from './HomepageModern.module.css'
import { bodyFont, headingFont } from './fonts'

const WHATSAPP_URL = 'https://wa.me/6285715905079?text=Halo%20R2%20NUSANTARA%2C%20saya%20ingin%20tanya%20produk%20grosir.'

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const menuButtonRef = useRef(null)
  const panelRef = useRef(null)

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

  useEffect(() => {
    if (!menuOpen) return undefined
    panelRef.current?.querySelector('a')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <>
      <a className={`${styles.skipLink} ${bodyFont.variable} ${headingFont.variable}`} href="#main-content">
        Lewati ke konten utama
      </a>
      <header className={`${styles.header} ${bodyFont.variable} ${headingFont.variable}`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="R2 NUSANTARA — Beranda">
            <span className={styles.brandLogo}>
              <img src="/assets/logo/logo.png" alt="" width="46" height="46" />
            </span>
            <span className={styles.brandText}>
              <strong>R2 NUSANTARA</strong>
              <small>GUDANG DISTRIBUTOR R2 &amp; RESMI</small>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Navigasi utama">
            <Link className={styles.navLink} href="/">Beranda</Link>
            <Link className={styles.navLink} href="/products"><LayoutGrid size={16} aria-hidden="true" /> Katalog</Link>
            <Link className={styles.navLink} href="#keunggulan">Keunggulan</Link>
            <Link className={styles.navLink} href="#faq">FAQ</Link>
            <Link className={styles.navLink} href="/lokasi"><MapPin size={16} aria-hidden="true" /> Lokasi</Link>
            <Link className={styles.navLink} href="/contact"><MessageCircle size={16} aria-hidden="true" /> Kontak</Link>
          </nav>

          <div className={styles.actions}>
            <Link href="/checkout" className={styles.cart} aria-label="Keranjang" title={cartCount ? `Keranjang, ${cartCount} item` : 'Keranjang'}>
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && <span className={styles.cartBadge} aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            <a className={styles.headerWhatsapp} href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> Chat WhatsApp
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menuOpen}
              aria-controls="r2-home-mobile-menu"
            >
              {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <>
            <button type="button" className={styles.mobileBackdrop} aria-label="Tutup menu" onClick={closeMenu} />
            <nav id="r2-home-mobile-menu" ref={panelRef} className={styles.mobilePanel} aria-label="Navigasi mobile">
              <Link href="/" onClick={() => setMenuOpen(false)}>Beranda <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/products" onClick={() => setMenuOpen(false)}>Katalog Produk <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="#keunggulan" onClick={() => setMenuOpen(false)}>Keunggulan <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="#faq" onClick={() => setMenuOpen(false)}>FAQ <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/lokasi" onClick={() => setMenuOpen(false)}>Lokasi Gudang <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>Kontak <ArrowRight size={16} aria-hidden="true" /></Link>
            </nav>
          </>
        )}
      </header>
    </>
  )
}
