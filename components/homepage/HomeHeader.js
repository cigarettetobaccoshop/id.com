import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, ShoppingBag, X, ArrowRight, LayoutGrid, MapPin, MessageCircle, BadgeCheck } from 'lucide-react'

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
    <>
      <a className="r2-skip-link" href="#main-content">Lewati ke konten utama</a>
      <header className="r2-home-header">
        <div className="r2-home-header__inner">
          <Link href="/" className="r2-home-header__brand" aria-label="R2 NUSANTARA">
            <span className="r2-home-header__logo-shell" aria-hidden="true">
              <span className="r2-home-header__logo-ring" />
              <span className="r2-home-header__logo-core">
                <img src="/assets/logo/logo.png" alt="" width="44" height="44" />
              </span>
            </span>
            <span className="r2-home-header__wordmark">
              <strong>R2 NUSANTARA</strong>
              <small>GUDANG DISTRIBUTOR R2 & RESMI</small>
            </span>
            <span className="r2-home-header__verified" title="Distributor resmi terverifikasi" aria-label="Distributor resmi terverifikasi">
              <BadgeCheck size={16} strokeWidth={2.4} />
            </span>
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

      <style jsx global>{`
        .r2-home-header{position:sticky;top:0;z-index:110;width:100%;background:rgba(255,255,255,.88)!important;border-bottom:1px solid rgba(11,63,149,.10)!important;backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);box-shadow:0 8px 30px rgba(7,29,73,.07)}
        .r2-home-header__inner{width:min(1280px,calc(100% - 28px));min-height:66px;margin:0 auto;display:flex;align-items:center;gap:18px}
        .r2-home-header__brand{display:flex;align-items:center;gap:10px;min-width:250px;position:relative}
        .r2-home-header__logo-shell{position:relative;width:48px;height:48px;display:grid;place-items:center;flex:0 0 48px}
        .r2-home-header__logo-ring{position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(from 0deg,#0a66c2,#5eb6ff,#d8b36c,#0a66c2);animation:r2LogoOrbit 5.5s linear infinite;filter:drop-shadow(0 0 8px rgba(31,119,229,.25))}
        .r2-home-header__logo-ring:after{content:"";position:absolute;inset:3px;border-radius:50%;background:#fff}
        .r2-home-header__logo-core{position:relative;z-index:1;width:44px;height:44px;border-radius:50%;overflow:hidden;background:#0b3f95;border:1px solid rgba(255,255,255,.82);box-shadow:0 6px 16px rgba(7,29,73,.18)}
        .r2-home-header__logo-core img{display:block;width:100%;height:100%;object-fit:cover}
        .r2-home-header__wordmark{display:flex;flex-direction:column;line-height:1.05;min-width:0}
        .r2-home-header__wordmark strong{font-size:13px;letter-spacing:.12em;font-weight:900;color:#0a1d36;white-space:nowrap}
        .r2-home-header__wordmark small{margin-top:5px;font-size:7px;letter-spacing:.14em;font-weight:800;color:#73839a;white-space:nowrap}
        .r2-home-header__verified{display:grid;place-items:center;color:#0a66c2;filter:drop-shadow(0 2px 4px rgba(10,102,194,.18));margin-left:-4px}
        .r2-home-header__nav{display:flex;align-items:center;justify-content:center;gap:4px;flex:1}
        .r2-home-header__nav a{display:inline-flex;align-items:center;gap:6px;position:relative;padding:10px 11px;border-radius:10px;color:#5d6e84;font-size:10px;font-weight:850;letter-spacing:.01em;transition:color .2s ease,background .2s ease,transform .2s ease}
        .r2-home-header__nav a:hover{color:#0a1d36;background:#f3f7fc;transform:translateY(-1px)}
        .r2-home-header__nav a.is-active{color:#0b3f95;background:#eef5ff}
        .r2-home-header__nav a.is-active:after{content:"";position:absolute;left:12px;right:12px;bottom:4px;height:2px;border-radius:999px;background:linear-gradient(90deg,#1f78e8,#d8b36c)}
        .r2-home-header__actions{display:flex;align-items:center;gap:8px}
        .r2-home-header__cart{position:relative;width:40px;height:40px;display:grid;place-items:center;border:1px solid #dbe5f0;border-radius:12px;color:#17395f;background:#fff;transition:.2s ease}
        .r2-home-header__cart:hover{transform:translateY(-2px);border-color:#9dc3ef;box-shadow:0 8px 18px rgba(11,63,149,.12)}
        .r2-home-header__cart b{position:absolute;right:-5px;top:-6px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;display:grid;place-items:center;background:#0a66c2;color:#fff;border:2px solid #fff;font-size:7px;font-weight:900}
        .r2-home-header__admin{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 14px;border-radius:12px;background:#0b3f95;color:#fff!important;font-size:9px;font-weight:900;letter-spacing:.04em;box-shadow:0 8px 18px rgba(11,63,149,.18);transition:.2s ease}
        .r2-home-header__admin:hover{transform:translateY(-2px);background:#0a66c2}
        .r2-home-header__menu{display:none;width:40px;height:40px;border:1px solid #dbe5f0;border-radius:12px;background:#fff;color:#0a1d36;place-items:center}
        .r2-home-header__mobile-panel{display:none}
        @keyframes r2LogoOrbit{to{transform:rotate(360deg)}}

        .r2-hp-final-section{padding-top:clamp(64px,8vw,104px)!important;padding-bottom:clamp(64px,8vw,104px)!important}
        .r2-hp-final-head{gap:28px!important;margin-bottom:30px!important}
        .r2-hp-final-benefits{gap:14px!important}
        .r2-hp-final-benefits article{padding:24px!important;border-radius:18px!important}        .r2-hp-final-distributor{margin-top:0!important;margin-bottom:0!important;padding:clamp(58px,8vw,100px) clamp(20px,5vw,60px)!important}
        .r2-hp-final-faq{gap:10px!important}
        .r2-hp-final-location{padding-top:clamp(58px,7vw,92px)!important;padding-bottom:clamp(58px,7vw,92px)!important}
        .r2-hp-final-footer{padding-top:clamp(52px,7vw,78px)!important}
        .r2-hp-final-footer-grid{grid-template-columns:minmax(0,1.5fr) repeat(2,minmax(150px,1fr))!important;gap:42px!important;align-items:start!important}
        .r2-hp-final-brand{display:flex!important;align-items:center!important;gap:12px!important}
        .r2-hp-final-brand>span{width:46px!important;height:46px!important;flex:0 0 46px!important;border-radius:50%!important;overflow:hidden!important;font-size:0!important;background:#0b3f95 url('/assets/logo/logo.png') center/cover no-repeat!important;border:2px solid rgba(216,179,108,.72)!important;box-shadow:0 0 0 4px rgba(216,179,108,.08),0 10px 24px rgba(0,0,0,.18)!important}
        .r2-hp-final-brand strong{display:flex!important;flex-direction:column!important;gap:4px!important}
        .r2-hp-final-brand strong small{font-size:7px!important;letter-spacing:.13em!important;opacity:.65!important}
        .r2-hp-final-footer-grid>b,.r2-hp-final-footer-grid>div>b{letter-spacing:.13em!important}
        .r2-hp-final-footer-bottom{gap:18px!important;padding-top:24px!important;margin-top:34px!important}
        .r2-hp-final-footer a,.r2-hp-final-footer button{transition:color .2s ease,transform .2s ease,opacity .2s ease}
        .r2-hp-final-footer a:hover{transform:translateX(2px)}
        @media (max-width:1024px){.r2-home-header__inner{min-height:68px}.r2-home-header__nav{gap:0}.r2-home-header__nav a{padding:9px 8px;font-size:9px}.r2-home-header__brand{min-width:220px}.r2-hp-final-footer-grid{grid-template-columns:1.3fr 1fr 1fr!important}}
        @media (max-width:767px){
          .r2-home-header{position:sticky}
          .r2-home-header__inner{width:calc(100% - 16px);min-height:58px;gap:7px}
          .r2-home-header__brand{min-width:0;flex:1;gap:8px}
          .r2-home-header__logo-shell{width:40px;height:40px;flex-basis:40px}
          .r2-home-header__logo-core{width:36px;height:36px}
          .r2-home-header__logo-ring{inset:-2px}
          .r2-home-header__wordmark strong{font-size:10px;letter-spacing:.09em}
          .r2-home-header__wordmark small{font-size:5.5px;letter-spacing:.09em;margin-top:3px}
          .r2-home-header__verified{margin-left:-3px}.r2-home-header__verified svg{width:14px;height:14px}
          .r2-home-header__nav{display:none}
          .r2-home-header__cart{width:36px;height:36px;border-radius:11px}
          .r2-home-header__admin{display:none}
          .r2-home-header__menu{display:grid;width:36px;height:36px;border-radius:11px}
          .r2-home-header__mobile-panel{display:flex;flex-direction:column;gap:4px;width:calc(100% - 20px);margin:0 10px 10px;padding:10px;border:1px solid #dfe7f0;border-radius:18px;background:rgba(255,255,255,.97);box-shadow:0 20px 45px rgba(7,29,73,.14);backdrop-filter:blur(18px)}
          .r2-home-header__mobile-panel a{display:flex;align-items:center;justify-content:space-between;padding:13px 14px;border-radius:12px;color:#17395f;font-size:11px;font-weight:850}
          .r2-home-header__mobile-panel a:hover{background:#eef5ff}
          .r2-home-header__mobile-panel .is-admin{background:#0b3f95;color:#fff!important}
          .r2-hp-final-section{padding-top:56px!important;padding-bottom:56px!important}
          .r2-hp-final-head{margin-bottom:22px!important;gap:14px!important}
          .r2-hp-final-benefits article{padding:18px!important}
          .r2-hp-final-distributor{padding:56px 18px!important}
          .r2-hp-final-footer-grid{grid-template-columns:1fr!important;gap:28px!important}
          .r2-hp-final-footer-bottom{flex-direction:column!important;align-items:flex-start!important;gap:9px!important}
        }
        @media (max-width:380px){
          .r2-home-header__inner{width:calc(100% - 14px)}
          .r2-home-header__wordmark small{display:none}
          .r2-home-header__verified{display:none}
          .r2-hp-final-section{padding-top:48px!important;padding-bottom:48px!important}
          .r2-hp-final-footer{padding-left:16px!important;padding-right:16px!important}
        }
        @media (prefers-reduced-motion:reduce){.r2-home-header__logo-ring{animation:none!important}.r2-home-header__nav a,.r2-home-header__cart,.r2-home-header__admin,.r2-hp-final-footer a{transition:none!important}.r2-hp-final [data-r2-reveal]{opacity:1!important;transform:none!important;transition:none!important}}
        /* Screenshot parity: larger mobile header and matching floating dock */
        @media(max-width:767px){
          .r2-home-header__inner{min-height:96px!important;width:calc(100% - 30px)!important;gap:12px!important}
          .r2-home-header__brand{gap:12px!important}
          .r2-home-header__logo-shell{width:62px!important;height:62px!important;flex-basis:62px!important}
          .r2-home-header__logo-core{width:58px!important;height:58px!important}
          .r2-home-header__logo-ring{inset:-3px!important}
          .r2-home-header__wordmark strong{font-size:13px!important;letter-spacing:.11em!important}
          .r2-home-header__wordmark small{font-size:7px!important;letter-spacing:.11em!important;margin-top:5px!important}
          .r2-home-header__verified{margin-left:0!important;width:38px;height:38px;border-radius:50%;background:#e9f6ff!important;box-shadow:0 4px 14px rgba(29,155,240,.12)!important}
          .r2-home-header__verified svg{width:20px!important;height:20px!important}
          .r2-home-header__actions{gap:14px!important}
          .r2-home-header__cart,.r2-home-header__menu{width:62px!important;height:62px!important;border-radius:18px!important}
          .r2-home-header__cart svg,.r2-home-header__menu svg{width:27px!important;height:27px!important}
          .r2-hp-final{padding-bottom:148px!important}
          .r2-hp-final ~ .route-icon-nav{width:min(calc(100% - 44px),740px)!important;min-height:130px!important;padding:12px 14px!important;gap:10px!important;bottom:max(16px,env(safe-area-inset-bottom))!important;border-radius:30px!important}
          .r2-hp-final ~ .route-icon-nav a{min-height:100px!important;border-radius:24px!important;gap:8px!important}
          .r2-hp-final ~ .route-icon-nav .route-icon-wrap{width:36px!important;height:36px!important}
          .r2-hp-final ~ .route-icon-nav .route-icon{width:31px!important;height:31px!important;stroke-width:1.7!important}
          .r2-hp-final ~ .route-icon-nav .route-icon-label{font-size:14px!important;font-weight:750!important}
          .r2-hp-final ~ .route-icon-nav a.is-active::before{top:7px!important;width:34px!important;height:4px!important}
        }
        @media(max-width:599px){
          .r2-home-header__inner{min-height:76px!important;width:calc(100% - 18px)!important;gap:7px!important}
          .r2-home-header__brand{gap:8px!important}
          .r2-home-header__logo-shell{width:46px!important;height:46px!important;flex-basis:46px!important}
          .r2-home-header__logo-core{width:42px!important;height:42px!important}
          .r2-home-header__wordmark strong{font-size:10px!important;letter-spacing:.07em!important}
          .r2-home-header__wordmark small{font-size:5.5px!important;letter-spacing:.06em!important;margin-top:3px!important}
          .r2-home-header__verified{width:26px!important;height:26px!important}
          .r2-home-header__verified svg{width:15px!important;height:15px!important}
          .r2-home-header__actions{gap:7px!important}
          .r2-home-header__cart,.r2-home-header__menu{width:44px!important;height:44px!important;border-radius:13px!important}
          .r2-home-header__cart svg,.r2-home-header__menu svg{width:21px!important;height:21px!important}
          .r2-hp-final{padding-bottom:100px!important}
          .r2-hp-final ~ .route-icon-nav{width:calc(100% - 28px)!important;min-height:76px!important;padding:7px!important;gap:4px!important;bottom:max(8px,env(safe-area-inset-bottom))!important;border-radius:22px!important}
          .r2-hp-final ~ .route-icon-nav a{min-height:60px!important;border-radius:15px!important;gap:4px!important}
          .r2-hp-final ~ .route-icon-nav .route-icon-wrap{width:27px!important;height:27px!important}
          .r2-hp-final ~ .route-icon-nav .route-icon{width:23px!important;height:23px!important}
          .r2-hp-final ~ .route-icon-nav .route-icon-label{font-size:10px!important}
          .r2-hp-final ~ .route-icon-nav a.is-active::before{top:3px!important;width:20px!important;height:3px!important}
        }
        @media(prefers-reduced-motion:reduce){.r2-home-header__logo-ring{animation:none!important}}
      `}</style>
    </>
  )
}
