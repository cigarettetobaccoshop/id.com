import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Home, Grid2X2, ShoppingCart, UserRound } from 'lucide-react'

const ICONS = {
  home: { label: 'Beranda', path: '/', Icon: Home },
  products: { label: 'Katalog', path: '/products', Icon: Grid2X2 },
  cart: { label: 'Keranjang', path: '/checkout', Icon: ShoppingCart },
  account: { label: 'Akun', path: '/contact', Icon: UserRound },
}

export function RouteIcon({ type, size = 20, strokeWidth = 1.8, className = '' }) {
  const item = ICONS[type] || ICONS.home
  const Icon = item.Icon
  return <Icon className={`route-icon route-icon-${type} ${className}`} width={size} height={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" />
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
    {Object.entries(ICONS).map(([type, item]) => {
      const isActive = active(item.path)
      return <Link href={item.path} key={type} className={isActive ? 'is-active' : ''} aria-current={isActive ? 'page' : undefined}>
        <span className="route-icon-wrap"><RouteIcon type={type} size={20} />{type === 'cart' && count > 0 && <b>{count > 99 ? '99+' : count}</b>}</span>
        <span className="route-icon-label">{item.label}</span>
      </Link>
    })}
  </nav>
}
