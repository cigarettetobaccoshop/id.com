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
import '../styles/r2-catalog-nav-consistency-v5.css'
import '../styles/performance-responsive-v1.css'
import '../styles/r2-product-thumbnail-v7.css'
import '../styles/r2-footer-visual-v8.css'
import '../styles/r2-live-catalog-v10.css'
import '../styles/r2-product-card-v11.css'
import '../styles/r2-catalog-233-v13.css'
import '../styles/product-card-premium.css'
import '../styles/r2-static-catalog-parity-v15.css'
import '../styles/static-catalog-source.css'
import '../styles/r2-catalog-product-precision-v18.css'
import '../styles/r2-final-apple-grade-v20.css'
import '../styles/r2-global-theme-sync-v21.css'
import '../styles/r2-catalog-product-interaction-v22.css'
import '../styles/catalog-premium-final.css'
import '../styles/r2-home-final-v24.css'
import '../styles/r2-home-final-v25.css'
import '../styles/r2-catalog-mobile-touch-v26.css'
import '../styles/r2-release-final-qa.css'
import '../styles/r2-stable-visual-baseline-v32.css'
import '../styles/r2-luxury-brand-system-v34.css'
import '../styles/r2-hero-luxury-typography-v36.css'
import '../styles/r2-catalog-clean-v37.css'
import '../styles/r2-accessibility-contrast-v38.css'
import '../styles/homepage-international-polish-v40.css'
import '../styles/r2-home-international-v41.css'
import '../styles/r2-home-precision-v42.css'
import '../styles/r2-home-hero-motion-final.css'
import '../styles/r2-home-density-premium-v43.css'
import '../styles/r2-home-final-qa-v45.css'
import '../styles/r2-home-upgrade-v46.css'
import '../styles/r2-home-hero-structure-v47.css'
import '../styles/r2-accessibility-touch-contrast-v48.css'
import '../styles/r2-home-readability-touch-v1.css'
import '../styles/r2-hero-pr99-visual-baseline-v1.css'
import '../styles/r2-ai-chat.css'
import '../styles/r2-home-verification-cleanup-v1.css'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Analytics } from '@vercel/analytics/next'
import HomeHeader from '../components/homepage/HomeHeader'
import R2AiChatWidget from '../components/R2AiChatWidget'

const HomepageExperience = dynamic(() => import('../components/HomepageExperience'), { ssr: false })
const RouteIconNav = dynamic(() => import('../components/RouteIconNav'), { ssr: false })
const BrandAssetLoader = dynamic(() => import('../components/BrandAssetLoader'), { ssr: false })
const ActivityMonitoringRuntime = dynamic(() => import('../components/monitoring/ActivityMonitoringRuntime'), { ssr: false })

function CheckoutPrompt() {
  const [count, setCount] = useState(0)
  useEffect(() => { const sync=()=>{try{setCount(JSON.parse(localStorage.getItem('r2-cart')||'[]').length)}catch{setCount(0)}}; sync(); window.addEventListener('storage',sync); const timer=window.setInterval(sync,700); return()=>{window.removeEventListener('storage',sync);window.clearInterval(timer)} },[])
  if (!count) return null
  return <Link href="/checkout" className="global-checkout"><span>🛒 {count} item{count>1?'s':''}</span><strong>Checkout →</strong><style jsx>{`.global-checkout{position:fixed;right:18px;bottom:18px;z-index:120;display:flex;align-items:center;gap:16px;background:#171717;color:#fff;text-decoration:none;border:1px solid rgba(31,94,255,.4);border-radius:999px;padding:10px 12px 10px 15px;box-shadow:0 12px 35px rgba(23,23,23,.18);font-size:10px;font-weight:800}.global-checkout strong{background:#1F5EFF;color:#fff;border-radius:999px;padding:9px 13px;font-size:9px}@media(max-width:700px){.global-checkout{left:18px;right:18px;bottom:87px;justify-content:space-between}}`}</style></Link>
}

function GlobalInteractionGuard(){
  useEffect(()=>{
    const root=document.documentElement
    const socialTargets=[
      {selector:'.r2-hp-final-footer-grid>div:nth-child(3)>span:nth-of-type(1)',url:'https://www.facebook.com/share/1CExeV8ix3/',label:'Facebook'},
      {selector:'.r2-hp-final-footer-grid>div:nth-child(3)>span:nth-of-type(2)',url:'https://wa.me/6285715905079',label:'WhatsApp Business'}
    ]
    const enhanceSocialLinks=()=>socialTargets.forEach(({selector,url,label})=>document.querySelectorAll(selector).forEach(el=>{el.setAttribute('role','link');el.setAttribute('tabindex','0');el.setAttribute('aria-label',`Buka ${label}`);el.dataset.r2SocialUrl=url;el.dataset.r2SocialLabel=label}))
    const syncThemeControl=()=>{const dark=root.dataset.r2Theme==='dark';document.querySelectorAll('.r2-icon-btn[aria-label="Tampilan"],.r2-icon-btn[data-r2-theme-toggle]').forEach(el=>{el.setAttribute('data-r2-theme-toggle','true');const label=dark?'Mode terang':'Mode gelap';if(el.getAttribute('aria-label')!==label)el.setAttribute('aria-label',label);if(el.getAttribute('title')!==label)el.setAttribute('title',label)});enhanceSocialLinks()}
    const applyTheme=mode=>{const dark=mode==='dark';root.dataset.r2Theme=dark?'dark':'light';window.localStorage.setItem('r2-theme',dark?'dark':'light');syncThemeControl()}
    applyTheme(window.localStorage.getItem('r2-theme')==='dark'?'dark':'light')
    const openSocial=url=>{window.open(url,'_blank','noopener,noreferrer')}
    const onClick=e=>{const social=e.target.closest?.('[data-r2-social-url]');if(social){e.preventDefault();openSocial(social.dataset.r2SocialUrl);return}const theme=e.target.closest?.('.r2-icon-btn[aria-label="Tampilan"],.r2-icon-btn[data-r2-theme-toggle]');if(theme){e.preventDefault();applyTheme(root.dataset.r2Theme==='dark'?'light':'dark');return}const cart=e.target.closest?.('a.cart-link, a[aria-label="Keranjang"]');if(cart&&cart.getAttribute('href')!=='/checkout'){e.preventDefault();window.location.assign('/checkout');return}const card=e.target.closest?.('.r2-product');if(card&&!e.target.closest?.('.r2-card-actions')&&!e.target.closest?.('a')){e.preventDefault();card.querySelector('.r2-card-actions button')?.click();return}}
    const onKeyDown=e=>{const social=e.target.closest?.('[data-r2-social-url]');if(social&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openSocial(social.dataset.r2SocialUrl);return}if(e.key!=='Enter'||e.isComposing)return;const input=e.target.closest?.('.r2-search input');if(input){const value=input.value.trim();if(value){e.preventDefault();window.location.assign(`/products?q=${encodeURIComponent(value)}`)}}}
    document.addEventListener('click',onClick);document.addEventListener('keydown',onKeyDown);const observer=new MutationObserver(syncThemeControl);observer.observe(document.body,{childList:true,subtree:true});return()=>{document.removeEventListener('click',onClick);document.removeEventListener('keydown',onKeyDown);observer.disconnect()}
  },[])
  return null
}

export default function App({ Component, pageProps }) {
  const router=useRouter();const isHome=router.pathname==='/'
  const isAdminChrome=router.pathname==='/login'||router.pathname.startsWith('/admin')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return <>
    {isHome&&<Head>
      <title>R2 NUSANTARA | Distributor Rokok Online & Grosir Malang</title>
      <meta name="description" content="R2 NUSANTARA adalah website distributor rokok online dan grosir dari gudang Malang, dengan katalog produk live, informasi harga, dan layanan pengiriman Indonesia." />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <link rel="canonical" href="https://r2nusantara-shop.vercel.app/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="R2 NUSANTARA" />
      <meta property="og:title" content="R2 NUSANTARA | Distributor Rokok Online & Grosir Malang" />
      <meta property="og:description" content="Website distributor rokok online dan grosir dari gudang Malang dengan katalog produk live dan pengiriman Indonesia." />
      <meta property="og:url" content="https://r2nusantara-shop.vercel.app/" />
      <meta property="og:image" content="https://r2nusantara-shop.vercel.app/assets/logo/logo.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Organization','name':'R2 NUSANTARA','url':'https://r2nusantara-shop.vercel.app/','logo':'https://r2nusantara-shop.vercel.app/assets/logo/logo.png','description':'Distributor rokok online dan grosir dari gudang Malang, Indonesia.','areaServed':'ID'})}} />
    </Head>}
    {isHome&&<HomeHeader/>}{!isHome&&router.pathname!=='/katalog'&&<BrandAssetLoader/>}<>{isHome?<HomepageExperience/>:<Component {...pageProps}/>}</>{mounted&&<>{!isAdminChrome&&<RouteIconNav/>}{!isAdminChrome&&<CheckoutPrompt/>}{!isAdminChrome&&<R2AiChatWidget/>}<GlobalInteractionGuard/><ActivityMonitoringRuntime/><Analytics/></>}</>
}
