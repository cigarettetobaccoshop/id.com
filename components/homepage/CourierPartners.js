import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import jneLogo from '../../assets/ekspedisi/jne-express.png'
import jntLogo from '../../assets/ekspedisi/j&t-express.png'
import sicepatLogo from '../../assets/ekspedisi/sicepat-ekspres.png'
import indahCargoLogo from '../../assets/ekspedisi/indah-cargo.png'

const partners = [
  { name: 'JNE Express', src: jneLogo, note: 'Reguler & nasional' },
  { name: 'J&T Express', src: jntLogo, note: 'Antarkota & nasional' },
  { name: 'SiCepat Ekspres', src: sicepatLogo, note: 'Ekspres & distribusi' },
  { name: 'Indah Cargo', src: indahCargoLogo, note: 'Volume & cargo' }
]

export default function CourierPartners() {
  const [slot, setSlot] = useState(null)

  useEffect(() => {
    const mount = () => {
      const footer = document.querySelector('.r2-hp-final-footer')
      if (!footer?.parentNode) return false

      const existing = document.querySelector('[data-r2-courier-slot="true"]')
      if (existing) {
        setSlot(existing)
        return true
      }

      const target = document.createElement('div')
      target.className = 'r2-home-courier-slot'
      target.dataset.r2CourierSlot = 'true'
      footer.parentNode.insertBefore(target, footer)
      setSlot(target)
      return true
    }

    if (mount()) return undefined

    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect()
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  if (!slot) return null

  const content = (
    <section className="r2-home-courier" aria-labelledby="r2-home-courier-title">
      <div className="r2-home-courier__shell">
        <header className="r2-home-courier__head">
          <div className="r2-home-courier__intro">
            <span className="r2-home-courier__eyebrow">LOGISTICS NETWORK · 01</span>
            <h2 id="r2-home-courier-title">Mitra Ekspedisi <em>R2 NUSANTARA.</em></h2>
            <p>Partner pengiriman yang mendukung distribusi dari gudang Malang menuju berbagai wilayah Indonesia.</p>
          </div>
          <span className="r2-home-courier__status" aria-label="Jaringan mitra pengiriman aktif">
            <i aria-hidden="true" />
            NETWORK ACTIVE
          </span>
        </header>

        <ul className="r2-home-courier__grid" aria-label="Daftar mitra ekspedisi">
          {partners.map((partner) => (
            <li key={partner.name} className="r2-home-courier__item">
              <article className="r2-home-courier__card">
                <div className="r2-home-courier__logo-frame">
                  <div className="r2-home-courier__shine" aria-hidden="true" />
                  <div className="r2-home-courier__logo-box">
                    <Image
                      src={partner.src}
                      alt={`Logo ${partner.name}`}
                      width={180}
                      height={64}
                      loading="lazy"
                      sizes="(max-width: 620px) 38vw, (max-width: 899px) 20vw, 180px"
                    />
                  </div>
                </div>
                <div className="r2-home-courier__copy">
                  <div>
                    <span>OFFICIAL PARTNER</span>
                    <strong>{partner.name}</strong>
                  </div>
                  <small>{partner.note}</small>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="r2-home-courier__bottom">
          <span><b aria-hidden="true">✓</b> Mitra pengiriman terintegrasi dengan alur pemesanan</span>
          <span className="r2-home-courier__count">04 PARTNERS</span>
        </div>
      </div>

      <style jsx global>{`
        .r2-home-courier-slot{width:100%;min-width:0;background:#f7f9fc;border-top:1px solid #e8edf3;border-bottom:1px solid #e8edf3}
        .r2-home-courier{width:100%;background:linear-gradient(180deg,#f8fafc 0%,#f4f7fb 100%);color:#0a1d36}
        .r2-home-courier__shell{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:clamp(58px,7vw,88px) 0}
        .r2-home-courier__head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:26px}
        .r2-home-courier__intro{min-width:0}
        .r2-home-courier__eyebrow{display:block;margin-bottom:10px;color:#0f3d6e;font-size:8px;font-weight:950;letter-spacing:.2em}
        .r2-home-courier h2{margin:0;font-size:clamp(28px,4vw,44px);line-height:1.02;letter-spacing:-.045em;font-weight:900;color:#071b35}
        .r2-home-courier h2 em{font-style:normal;color:#0f3d6e}
        .r2-home-courier__intro p{max-width:620px;margin:13px 0 0;color:#687b92;font-size:11px;line-height:1.7}
        .r2-home-courier__status{display:inline-flex;align-items:center;gap:7px;flex:0 0 auto;padding:9px 11px;border:1px solid #dce5ee;border-radius:999px;background:rgba(255,255,255,.78);color:#61758d;font-size:7px;font-weight:900;letter-spacing:.13em;box-shadow:0 6px 16px rgba(7,29,73,.045)}
        .r2-home-courier__status i{width:6px;height:6px;border-radius:50%;background:#168a43;box-shadow:0 0 0 3px rgba(22,138,67,.1)}
        .r2-home-courier__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0;padding:0;list-style:none}
        .r2-home-courier__item{min-width:0}
        .r2-home-courier__card{position:relative;height:100%;min-height:214px;box-sizing:border-box;padding:8px;border:1px solid #dfe6ed;border-radius:19px;background:rgba(255,255,255,.9);box-shadow:0 12px 30px rgba(10,42,82,.055);overflow:hidden;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}
        .r2-home-courier__card:hover{transform:translateY(-3px);border-color:#b9c9d9;box-shadow:0 18px 38px rgba(10,42,82,.1)}
        .r2-home-courier__logo-frame{position:relative;display:grid;place-items:center;height:126px;border:1px solid #e3e9ef;border-radius:14px;background:linear-gradient(180deg,#fff,#f8fafc);overflow:hidden}
        .r2-home-courier__shine{position:absolute;inset:-45%;background:linear-gradient(110deg,transparent 42%,rgba(255,255,255,.72) 50%,transparent 58%);transform:translateX(-40%);transition:transform .55s ease;pointer-events:none}
        .r2-home-courier__card:hover .r2-home-courier__shine{transform:translateX(40%)}
        .r2-home-courier__logo-box{position:relative;z-index:1;display:grid;place-items:center;width:78%;height:70px;padding:8px 15px;border:1px solid #d7e0e8;border-radius:12px;background:#fff;box-shadow:0 7px 18px rgba(7,29,73,.055)}
        .r2-home-courier__logo-box:after{content:"";position:absolute;inset:4px;border:1px solid rgba(138,150,168,.2);border-radius:9px;pointer-events:none}
        .r2-home-courier__logo-box img{position:relative;z-index:1;display:block;width:100%;height:auto;max-height:54px;object-fit:contain;filter:grayscale(88%) opacity(.76);transition:filter .25s ease,opacity .25s ease,transform .25s ease}
        .r2-home-courier__card:hover .r2-home-courier__logo-box img,.r2-home-courier__card:focus-within .r2-home-courier__logo-box img{filter:grayscale(0) opacity(1);transform:scale(1.025)}
        .r2-home-courier__copy{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 6px 7px}
        .r2-home-courier__copy div{display:grid;gap:4px;min-width:0}
        .r2-home-courier__copy span{font-size:6px;letter-spacing:.17em;font-weight:950;color:#8a96a8}
        .r2-home-courier__copy strong{font-size:12px;line-height:1.15;color:#0a2a50}
        .r2-home-courier__copy small{font-size:7px;color:#71849a;line-height:1.3;text-align:right}
        .r2-home-courier__bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:14px;padding:0 3px;color:#7a8b9e;font-size:7px;letter-spacing:.03em}
        .r2-home-courier__bottom b{display:inline-grid;place-items:center;width:15px;height:15px;margin-right:5px;border-radius:50%;background:#eaf6ee;color:#168a43;font-size:9px}
        .r2-home-courier__count{font-weight:900;letter-spacing:.14em}
        @media(max-width:899px){.r2-home-courier__shell{width:min(720px,calc(100% - 32px));padding:52px 0}.r2-home-courier__grid{grid-template-columns:repeat(2,minmax(0,1fr))}.r2-home-courier__head{align-items:flex-start}.r2-home-courier__status{margin-top:2px}}
        @media(max-width:620px){.r2-home-courier__shell{width:calc(100% - 24px);padding:48px 0}.r2-home-courier__head{gap:14px;margin-bottom:18px}.r2-home-courier h2{font-size:29px}.r2-home-courier__intro p{font-size:10px;line-height:1.6}.r2-home-courier__status{padding:7px 8px;font-size:5.5px;letter-spacing:.1em}.r2-home-courier__status i{width:5px;height:5px}.r2-home-courier__grid{gap:9px}.r2-home-courier__card{min-height:184px;padding:6px;border-radius:16px}.r2-home-courier__logo-frame{height:105px;border-radius:12px}.r2-home-courier__logo-box{width:82%;height:60px;padding:7px 10px;border-radius:10px}.r2-home-courier__logo-box img{max-height:44px}.r2-home-courier__copy{display:block;padding:10px 4px 5px}.r2-home-courier__copy strong{font-size:10px}.r2-home-courier__copy small{display:block;margin-top:4px;font-size:6.5px;text-align:left}.r2-home-courier__bottom{align-items:flex-start;line-height:1.5;font-size:6.5px}.r2-home-courier__count{white-space:nowrap}}
        @media(max-width:380px){.r2-home-courier__shell{width:calc(100% - 20px);padding:42px 0}.r2-home-courier__grid{gap:7px}.r2-home-courier__card{min-height:174px}.r2-home-courier__logo-frame{height:96px}.r2-home-courier__copy strong{font-size:9px}.r2-home-courier__bottom{font-size:6px}}
        @media(prefers-reduced-motion:reduce){.r2-home-courier__card,.r2-home-courier__shine,.r2-home-courier__logo-box img{transition:none}.r2-home-courier__card:hover{transform:none}}
        @media(min-width:901px){.r2-home-courier__card{min-height:220px}}
      `}</style>
    </section>
  )

  return createPortal(content, slot)
}
