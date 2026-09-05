import '../styles/mobile-lock.css'
import '../styles/r2-premium.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'

function CheckoutPrompt() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const sync = () => { try { setCount(JSON.parse(localStorage.getItem('r2-cart') || '[]').length) } catch { setCount(0) } }
    sync(); window.addEventListener('storage', sync); const timer = window.setInterval(sync, 700)
    return () => { window.removeEventListener('storage', sync); window.clearInterval(timer) }
  }, [])
  if (!count) return null
  return <Link href="/checkout" className="global-checkout"><span>🛒 {count} item{count > 1 ? 's' : ''}</span><strong>Checkout →</strong><style jsx>{`.global-checkout{position:fixed;right:18px;bottom:18px;z-index:120;display:flex;align-items:center;gap:16px;background:#080a0d;color:#f4f1e8;text-decoration:none;border:1px solid rgba(201,168,106,.55);border-radius:999px;padding:10px 12px 10px 15px;box-shadow:0 12px 35px rgba(0,0,0,.25);font-size:10px;font-weight:800}.global-checkout strong{background:#c9a86a;color:#080a0d;border-radius:999px;padding:9px 13px;font-size:9px}@media(max-width:700px){.global-checkout{left:18px;right:18px;bottom:87px;justify-content:space-between}}`}</style></Link>
}
export default function App({ Component, pageProps }) { return <><Component {...pageProps}/><CheckoutPrompt/><Analytics/></> }
