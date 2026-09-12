import '../styles/mobile-lock.css'
import '../styles/r2-premium.css'
import '../styles/catalog-modern.css'
import '../styles/catalog-mobile-grid.css'
import '../styles/homepage-experience.css'
import '../styles/r2-cross-page-theme-final.css'
import '../styles/static-reference-theme.css'
import '../styles/shopify-b2b-premium.css'
import '../styles/navigation-catalog-final.css'
import '../styles/homepage-visual-final.css'
import '../styles/final-polish.css'
import '../styles/homepage-clean-minimal.css'
import '../styles/canva-layout-polish.css'
import '../styles/mobile-locked-desktop.css'
import '../styles/hero-header-final.css'
import '../styles/preview-theme-final.css'
import '../styles/index-header-system.css'
import '../styles/reference-visual-final.css'
import '../styles/r2-blue-reference-ui.css'
import '../styles/r2-reference-precision.css'
import '../styles/r2-pixel-reference-ui.css'
import '../styles/r2-functional-polish.css'
import '../styles/r2-visual-upgrade-v2.css'
import '../styles/r2-modern-visual-v3.css'
import '../styles/r2-footer-catalog-v4.css'
import '../styles/r2-catalog-nav-consistency-v5.css'
import '../styles/performance-responsive-v1.css'
import '../styles/r2-visual-consolidated-v6.css'
import '../styles/r2-product-thumbnail-v7.css'
import '../styles/r2-footer-visual-v8.css'
import '../styles/r2-category-slider-v9.css'
import '../styles/r2-live-catalog-v10.css'
import '../styles/r2-product-card-v11.css'
import '../styles/r2-catalog-233-v13.css'
import '../styles/r2-product-system-v14.css'
import '../styles/product-card-premium.css'
import '../styles/r2-static-catalog-parity-v15.css'
import '../styles/static-catalog-source.css'
import '../styles/r2-elite-design-v17.css'
import '../styles/r2-catalog-product-precision-v18.css'
import '../styles/r2-brand-visual-correction-v19.css'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Analytics } from '@vercel/analytics/react'
import RouteIconNav from '../components/RouteIconNav'
import BrandAssetLoader from '../components/BrandAssetLoader'
import ActivityMonitoringRuntime from '../components/monitoring/ActivityMonitoringRuntime'

const HomepageExperience = dynamic(() => import('../components/HomepageExperience'), { ssr: true })

function CheckoutPrompt() {
  const [count, setCount] = useState(0)
  useEffect(() => { const sync=()=>{try{setCount(JSON.parse(localStorage.getItem('r2-cart')||'[]').length)}catch{setCount(0)}}; sync(); window.addEventListener('storage',sync); const timer=window.setInterval(sync,700); return()=>{window.removeEventListener('storage',sync);window.clearInterval(timer)} },[])
  if (!count) return null
  return <Link href="/checkout" className="global-checkout"><span>🛒 {count} item{count>1?'s':''}</span><strong>Checkout →</strong><style jsx>{`.global-checkout{position:fixed;right:18px;bottom:18px;z-index:120;display:flex;align-items:center;gap:16px;background:#171717;color:#fff;text-decoration:none;border:1px solid rgba(31,94,255,.4);border-radius:999px;padding:10px 12px 10px 15px;box-shadow:0 12px 35px rgba(23,23,23,.18);font-size:10px;font-weight:800}.global-checkout strong{background:#1F5EFF;color:#fff;border-radius:999px;padding:9px 13px;font-size:9px}@media(max-width:700px){.global-checkout{left:18px;right:18px;bottom:87px;justify-content:space-between}}`}</style></Link>
}

function GlobalInteractionGuard(){
  useEffect(()=>{
    const root=document.documentElement
    const syncThemeControl=()=>{
      const dark=root.dataset.r2Theme==='dark'
      document.querySelectorAll('.r2-icon-btn[aria-label="Tampilan"],.r2-icon-btn[data-r2-theme-toggle]').forEach(el=>{
        el.setAttribute('data-r2-theme-toggle','true')
        const label=dark?'Mode terang':'Mode gelap'
        if(el.getAttribute('aria-label')!==label)el.setAttribute('aria-label',label)
        if(el.getAttribute('title')!==label)el.setAttribute('title',label)
      })
    }
    const applyTheme=mode=>{
      const dark=mode==='dark'
      root.dataset.r2Theme=dark?'dark':'light'
      window.localStorage.setItem('r2-theme',dark?'dark':'light')
      syncThemeControl()
    }
    applyTheme(window.localStorage.getItem('r2-theme')==='dark'?'dark':'light')
    const onClick=e=>{
      const theme=e.target.closest?.('.r2-icon-btn[aria-label="Tampilan"],.r2-icon-btn[data-r2-theme-toggle]')
      if(theme){e.preventDefault();applyTheme(root.dataset.r2Theme==='dark'?'light':'dark');return}
      const cart=e.target.closest?.('a.cart-link, a[aria-label="Keranjang"]')
      if(cart && cart.getAttribute('href')!=='/checkout'){e.preventDefault();window.location.assign('/checkout');return}
      const card=e.target.closest?.('.r2-product')
      if(card && !e.target.closest?.('.r2-card-actions') && !e.target.closest?.('a')){e.preventDefault();card.querySelector('.r2-card-actions button')?.click();return}
    }
    const onKeyDown=e=>{if(e.key!=='Enter'||e.isComposing)return;const input=e.target.closest?.('.r2-search input');if(input){const value=input.value.trim();if(value){e.preventDefault();window.location.assign(`/products?q=${encodeURIComponent(value)}`)}}}
    document.addEventListener('click',onClick);document.addEventListener('keydown',onKeyDown)
    const observer=new MutationObserver(syncThemeControl)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>{document.removeEventListener('click',onClick);document.removeEventListener('keydown',onKeyDown);observer.disconnect()}
  },[])
  return null
}

export default function App({ Component, pageProps }) {
  const router=useRouter()
  const isHome=router.pathname==='/'
  return <><BrandAssetLoader/><>{isHome?<HomepageExperience/>:<Component {...pageProps}/>}</><RouteIconNav/><CheckoutPrompt/><GlobalInteractionGuard/><ActivityMonitoringRuntime/><Analytics/></>
}
