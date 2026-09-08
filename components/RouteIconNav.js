import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const ICONS = {
  home: { label: 'Beranda', path: '/', d: 'M3 10.8 12 3l9 7.8v8.7a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-8.7Zm5.5 10.2v-6h7v6' },
  products: { label: 'Katalog', path: '/products', d: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z' },
  cart: { label: 'Keranjang', path: '/checkout', d: 'M3.5 4h2l1.3 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.5L20.2 7H6.1M9 19.5h.01M17 19.5h.01' },
  account: { label: 'Akun', path: '/contact', d: 'M20 21a8 8 0 0 0-16 0M12 13a4.2 4.2 0 1 0 0-8.4A4.2 4.2 0 0 0 12 13Z' },
}

export function RouteIcon({ type, size = 21, strokeWidth = 1.9, className = '' }) {
  const icon = ICONS[type] || ICONS.home
  return <svg className={`route-icon route-icon-${type} ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={icon.d}/></svg>
}

export default function RouteIconNav() {
  const router = useRouter()
  const [count, setCount] = useState(0)
  useEffect(() => {
    const sync = () => { try { setCount(JSON.parse(localStorage.getItem('r2-cart') || '[]').length) } catch { setCount(0) } }
    sync()
    window.addEventListener('storage', sync)
    const timer = window.setInterval(sync, 700)
    return () => { window.removeEventListener('storage', sync); window.clearInterval(timer) }
  }, [])
  const active = path => path === '/' ? router.pathname === '/' : router.pathname.startsWith(path)
  return <nav className="route-icon-nav" aria-label="Navigasi utama">
    {Object.entries(ICONS).map(([type, icon]) => <Link href={icon.path} key={type} className={active(icon.path) ? 'is-active' : ''} aria-current={active(icon.path) ? 'page' : undefined}>
      <span className="route-icon-wrap"><RouteIcon type={type} size={21} />{type === 'cart' && count > 0 && <b>{count > 99 ? '99+' : count}</b>}</span>
      <span className="route-icon-label">{icon.label}</span>
    </Link>)}
  </nav>
}
