import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import jneLogo from '../../assets/ekspedisi/jne-express.png'
import jntLogo from '../../assets/ekspedisi/j&t-express.png'
import sicepatLogo from '../../assets/ekspedisi/sicepat-ekspres.png'
import indahCargoLogo from '../../assets/ekspedisi/indah-cargo.png'

const partners = [
  { name: 'JNE Express', src: jneLogo, note: 'Reguler & Cargo' },
  { name: 'J&T Express', src: jntLogo, note: 'Antarkota & nasional' },
  { name: 'SiCepat Ekspres', src: sicepatLogo, note: 'Ekspres & distribusi' },
  { name: 'AnterAja', mark: 'anteraja', tone: 'pink', note: 'Pengiriman nasional' },
  { name: 'Lion Parcel', mark: 'lion parcel', tone: 'red', note: 'Paket & cargo' },
  { name: 'Ninja Xpress', mark: 'ninja xpress', tone: 'red-dark', note: 'Antarkota & nasional' },
  { name: 'POS Indonesia', mark: 'POS INDONESIA', tone: 'orange', note: 'Jangkauan nasional' }
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
                  <div className={`r2-home-courier__logo-box ${partner.mark ? `r2-home-courier__mark r2-home-courier__mark--${partner.tone}` : ''}`}>
                    {partner.src ? (
                      <Image
                        src={partner.src}
                        alt={`Logo ${partner.name}`}
                        width={180}
                        height={64}
                        loading="lazy"
                        sizes="(max-width: 620px) 38vw, (max-width: 899px) 20vw, 180px"
                      />
                    ) : (
                      <span aria-label={partner.name}>{partner.mark}</span>
                    )}
                  </div>
                </div>
                <div className="r2-home-courier__copy">
                  <div>
                    <span>MITRA EKSPEDISI</span>
                    <strong>{partner.name}</strong>
                  </div>
                  <small>{partner.note}</small>
                </div>
              </article>
            </li>
          ))}
          <li className="r2-home-courier__item">
            <article className="r2-home-courier__card r2-home-courier__coverage">
              <div className="r2-home-courier__coverage-icon" aria-hidden="true">↗</div>
              <div className="r2-home-courier__coverage-title">PENGIRIMAN KE<br/><b>SELURUH INDONESIA</b></div>
              <small>Distribusi dari gudang Malang</small>
            </article>
          </li>
        </ul>

        <div className="r2-home-courier__trust">
          <div><i aria-hidden="true">✓</i><span><b>Paket Aman</b><small>Dengan packing profesional</small></span></div>
          <div><i aria-hidden="true">◷</i><span><b>Proses Cepat</b><small>Pengiriman tepat waktu</small></span></div>
          <div><i aria-hidden="true">⌖</i><span><b>Lacak Pesanan</b><small>Status pengiriman real-time</small></span></div>
          <div><i aria-hidden="true">◉</i><span><b>Layanan Ramah</b><small>Siap membantu kapan saja</small></span></div>
        </div>

        <div className="r2-home-courier__bottom">
          <span><b aria-hidden="true">✓</b> Mitra pengiriman terintegrasi dengan alur pemesanan</span>
          <span className="r2-home-courier__count">07 PARTNERS · NATIONAL COVERAGE</span>
        </div>
      </div>

      <style jsx global>{`
        .r2-home-courier-slot{width:100%;min-width:0;background:#f4f8fd;border-top:1px solid #e6edf5;border-bottom:1px solid #e6edf5}
        .r2-home-courier{width:100%;background:#f7faff;color:#082653;overflow:hidden}
        .r2-home-courier__shell{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:0 0 58px}
        .r2-home-courier__head{position:relative;display:block;text-align:center;margin:0 calc((1180px - min(100vw - 48px,1180px)) / -2);padding:58px max(24px,calc((100vw - 1180px)/2 + 24px)) 66px;background:linear-gradient(135deg,#0a4380 0%,#082f67 58%,#0a4b8e 100%);color:#fff;clip-path:ellipse(88% 72% at 50% 24%)}
        .r2-home-courier__head:before,.r2-home-courier__head:after{content:"";position:absolute;pointer-events:none;transform:skewX(-32deg);background:rgba(255,255,255,.06)}
        .r2-home-courier__head:before{width:110px;height:210px;left:9%;top:-80px}.r2-home-courier__head:after{width:80px;height:190px;right:7%;top:-70px}
        .r2-home-courier__intro{position:relative;z-index:1}
        .r2-home-courier__eyebrow{display:inline-flex;align-items:center;gap:18px;margin-bottom:14px;color:#fff;font-size:9px;font-weight:900;letter-spacing:.28em}
        .r2-home-courier__eyebrow:before,.r2-home-courier__eyebrow:after{content:"";width:52px;height:1px;background:rgba(255,255,255,.75)}
        .r2-home-courier h2{margin:0;font-size:clamp(30px,4.3vw,48px);line-height:1.04;letter-spacing:-.035em;font-weight:900;color:#fff;text-transform:uppercase}
        .r2-home-courier h2 em{font-style:normal;color:#f0d28b}
        .r2-home-courier__intro p{max-width:700px;margin:14px auto 0;color:rgba(255,255,255,.9);font-size:12px;line-height:1.65}
        .r2-home-courier__status{display:none}
        .r2-home-courier__grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:-8px 0 0;padding:0;list-style:none}
        .r2-home-courier__item{min-width:0}
        .r2-home-courier__card{position:relative;height:100%;min-height:198px;box-sizing:border-box;padding:10px;border:1px solid #e1eaf3;border-radius:18px;background:linear-gradient(180deg,#fff 0%,#fbfdff 100%);box-shadow:0 12px 30px rgba(20,73,126,.09);overflow:hidden;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}
        .r2-home-courier__card:hover{transform:translateY(-3px);border-color:#c5d7e9;box-shadow:0 18px 36px rgba(20,73,126,.13)}
        .r2-home-courier__logo-frame{position:relative;display:grid;place-items:center;height:108px;border-radius:13px;background:linear-gradient(180deg,#fff 0%,#f5faff 100%);overflow:hidden}
        .r2-home-courier__shine{position:absolute;inset:-55%;background:linear-gradient(110deg,transparent 43%,rgba(255,255,255,.7) 50%,transparent 57%);transform:translateX(-42%);transition:transform .55s ease;pointer-events:none}
        .r2-home-courier__card:hover .r2-home-courier__shine{transform:translateX(42%)}
        .r2-home-courier__logo-box{position:relative;z-index:1;display:grid;place-items:center;width:82%;height:70px;padding:7px 13px;border:1px solid #e3ebf3;border-radius:11px;background:#fff;box-shadow:0 6px 16px rgba(7,48,92,.045)}
        .r2-home-courier__logo-box img{position:relative;z-index:1;display:block;width:100%;height:auto;max-height:55px;object-fit:contain;filter:none;opacity:1;transition:transform .25s ease}
        .r2-home-courier__card:hover .r2-home-courier__logo-box img{transform:scale(1.025)}
        .r2-home-courier__mark{font-family:Arial,sans-serif;font-weight:900;letter-spacing:-.045em;text-transform:lowercase;font-size:25px;white-space:nowrap}
        .r2-home-courier__mark--pink{color:#e62c88}.r2-home-courier__mark--red{color:#e3262e;font-style:italic}.r2-home-courier__mark--red-dark{color:#c71927}.r2-home-courier__mark--orange{color:#f26b1d;font-size:18px;letter-spacing:.03em}
        .r2-home-courier__copy{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;padding:11px 5px 4px}
        .r2-home-courier__copy div{display:grid;gap:4px;min-width:0}
        .r2-home-courier__copy span{font-size:6px;letter-spacing:.16em;font-weight:950;color:#8b9bad}
        .r2-home-courier__copy strong{font-size:11px;line-height:1.15;color:#123b70}
        .r2-home-courier__copy small{font-size:7px;color:#71869d;line-height:1.3;text-align:right}
        .r2-home-courier__coverage{display:grid;place-items:center;text-align:center;padding:20px;background:linear-gradient(160deg,#f5faff,#e8f3ff);border-color:#d7e6f5}
        .r2-home-courier__coverage-icon{display:grid;place-items:center;width:44px;height:44px;margin-bottom:8px;border-radius:50%;background:#0d4b8c;color:#fff;font-size:25px;font-weight:900;box-shadow:0 8px 20px rgba(13,75,140,.18)}
        .r2-home-courier__coverage-title{color:#123b70;font-size:13px;line-height:1.25;font-weight:800;letter-spacing:.01em}.r2-home-courier__coverage-title b{font-weight:950}
        .r2-home-courier__coverage small{margin-top:7px;color:#6c829a;font-size:7px}
        .r2-home-courier__trust{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:22px;padding:16px 18px;border:1px solid #d9e7f5;border-radius:18px;background:linear-gradient(90deg,#edf7ff,#f5faff);box-shadow:0 8px 22px rgba(20,73,126,.055)}
        .r2-home-courier__trust>div{display:flex;align-items:center;gap:10px;padding:3px 17px;border-right:1px solid #c7d9ea}.r2-home-courier__trust>div:last-child{border-right:0}
        .r2-home-courier__trust i{display:grid;place-items:center;flex:0 0 35px;width:35px;height:35px;border-radius:50%;background:#0d62b3;color:#fff;font-style:normal;font-size:16px;font-weight:900}
        .r2-home-courier__trust span{display:grid;gap:3px}.r2-home-courier__trust b{font-size:10px;color:#123b70}.r2-home-courier__trust small{font-size:7px;line-height:1.35;color:#70849a}
        .r2-home-courier__bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:13px;padding:0 3px;color:#778b9f;font-size:7px}
        .r2-home-courier__bottom>b{display:inline-grid;place-items:center}.r2-home-courier__bottom span>b{display:inline-grid;place-items:center;width:15px;height:15px;margin-right:5px;border-radius:50%;background:#eaf6ee;color:#168a43;font-size:9px}.r2-home-courier__count{font-weight:900;letter-spacing:.14em}
        @media(max-width:899px){.r2-home-courier__shell{width:min(720px,calc(100% - 32px));padding-bottom:46px}.r2-home-courier__head{margin:0 calc((720px - min(100vw - 32px,720px)) / -2);padding:48px 24px 58px}.r2-home-courier__grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.r2-home-courier__trust{grid-template-columns:repeat(2,1fr);gap:10px}.r2-home-courier__trust>div{border-right:0;padding:4px 8px}}
        @media(max-width:620px){.r2-home-courier__shell{width:calc(100% - 20px);padding-bottom:38px}.r2-home-courier__head{margin:0 -10px;padding:42px 16px 50px;clip-path:ellipse(108% 70% at 50% 23%)}.r2-home-courier__eyebrow{gap:9px;font-size:6px;letter-spacing:.22em}.r2-home-courier__eyebrow:before,.r2-home-courier__eyebrow:after{width:25px}.r2-home-courier h2{font-size:25px}.r2-home-courier__intro p{font-size:9px;line-height:1.55}.r2-home-courier__grid{gap:8px;margin-top:-4px}.r2-home-courier__card{min-height:164px;padding:6px;border-radius:14px}.r2-home-courier__logo-frame{height:88px}.r2-home-courier__logo-box{height:54px;width:86%;padding:5px 8px}.r2-home-courier__logo-box img{max-height:40px}.r2-home-courier__mark{font-size:18px}.r2-home-courier__mark--orange{font-size:13px}.r2-home-courier__copy{display:block;padding:8px 3px 3px}.r2-home-courier__copy span{font-size:5px}.r2-home-courier__copy strong{font-size:9px}.r2-home-courier__copy small{display:block;margin-top:3px;font-size:6px;text-align:left}.r2-home-courier__coverage{padding:10px}.r2-home-courier__coverage-icon{width:34px;height:34px;font-size:19px}.r2-home-courier__coverage-title{font-size:10px}.r2-home-courier__coverage small{font-size:6px}.r2-home-courier__trust{grid-template-columns:1fr 1fr;margin-top:14px;padding:10px;border-radius:14px;gap:4px}.r2-home-courier__trust>div{gap:7px;padding:4px}.r2-home-courier__trust i{flex-basis:28px;width:28px;height:28px;font-size:12px}.r2-home-courier__trust b{font-size:8px}.r2-home-courier__trust small{font-size:6px}.r2-home-courier__bottom{font-size:6px;line-height:1.45}.r2-home-courier__count{white-space:nowrap}}
        @media(max-width:380px){.r2-home-courier__grid{gap:6px}.r2-home-courier__card{min-height:154px}.r2-home-courier__logo-frame{height:80px}.r2-home-courier__copy strong{font-size:8px}.r2-home-courier__trust b{font-size:7px}.r2-home-courier__trust small{font-size:5.5px}}
        @media(prefers-reduced-motion:reduce){.r2-home-courier__card,.r2-home-courier__shine,.r2-home-courier__logo-box img{transition:none}.r2-home-courier__card:hover{transform:none}}
      `}</style>
    </section>
  )

  return createPortal(content, slot)
}
