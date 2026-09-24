import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import jneLogo from '../../assets/ekspedisi/jne-express.png'
import jntLogo from '../../assets/ekspedisi/j&t-express.png'
import sicepatLogo from '../../assets/ekspedisi/sicepat-ekspres.png'
import anterAjaLogo from '../../assets/ekspedisi/anter-aja.png'
import indahCargoLogo from '../../assets/ekspedisi/indah-cargo.png'
import lionParcelLogo from '../../assets/ekspedisi/lion-parcel.jpg'
import ninjaXpressLogo from '../../assets/ekspedisi/ninja-xpres.jpg'
import posIndonesiaLogo from '../../assets/ekspedisi/pos-indonesia.png'

const partners = [
  { name: 'JNE Express', src: jneLogo, note: 'Reguler & Cargo' },
  { name: 'J&T Express', src: jntLogo, note: 'Antarkota & nasional' },
  { name: 'SiCepat Ekspres', src: sicepatLogo, note: 'Ekspres & distribusi' },
  { name: 'AnterAja', src: anterAjaLogo, note: 'Pengiriman nasional' },
  { name: 'Indah Cargo', src: indahCargoLogo, note: 'Cargo & distribusi' },
  { name: 'Lion Parcel', src: lionParcelLogo, note: 'Paket & cargo' },
  { name: 'Ninja Xpress', src: ninjaXpressLogo, note: 'Antarkota & nasional' },
  { name: 'POS Indonesia', src: posIndonesiaLogo, note: 'Jangkauan nasional' }
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
            <span className="r2-home-courier__eyebrow">MITRA EKSPEDISI KAMI</span>
            <h2 id="r2-home-courier-title">PENGIRIMAN <em>AMAN &amp; TERPERCAYA</em></h2>
            <p>Kami bekerja sama dengan berbagai mitra ekspedisi terpercaya untuk mendukung pengiriman dari gudang Malang ke seluruh Indonesia.</p>
            <div className="r2-home-courier__meta" aria-label="Status jaringan pengiriman">
              <span><i aria-hidden="true" /> NETWORK ACTIVE</span>
              <b>08 MITRA EKSPEDISI</b>
            </div>
          </div>
          <span className="r2-home-courier__status" aria-label="Jaringan mitra pengiriman aktif">
            <i aria-hidden="true" />
            NETWORK ACTIVE
          </span>
        </header>

        <ul className="r2-home-courier__grid" aria-label="Daftar mitra ekspedisi">
          {partners.map((partner) => (
            <li key={partner.name} className="r2-home-courier__item">
              <article className="r2-home-courier__card" style={{ '--courier-index': partners.indexOf(partner) }}>
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
                  <strong>{partner.name}</strong>
                  <span>{partner.note}</span>
                </div>
              </article>
            </li>
          ))}
          <li className="r2-home-courier__item">
            <article className="r2-home-courier__card r2-home-courier__coverage">
              <div className="r2-home-courier__coverage-icon" aria-hidden="true">
                <svg viewBox="0 0 64 40" focusable="false">
                  <path d="M4 7h35v22H4zM39 15h10l9 9v5H39z" />
                  <path d="M48 15v9h10M15 29a6 6 0 1 0 12 0M47 29a6 6 0 1 0 12 0" />
                  <circle cx="21" cy="29" r="3" />
                  <circle cx="53" cy="29" r="3" />
                </svg>
              </div>
              <div className="r2-home-courier__coverage-title">PENGIRIMAN KE<br/><b>SELURUH INDONESIA</b></div>
              <small>Distribusi dari gudang Malang</small>
            </article>
          </li>
        </ul>

        <div className="r2-home-courier__trust" aria-label="Keunggulan layanan pengiriman">
          <div>
            <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg></i>
            <span><b>Paket Aman</b><small>Packing profesional</small></span>
          </div>
          <div>
            <i aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg></i>
            <span><b>Proses Cepat</b><small>Pengiriman tepat waktu</small></span>
          </div>
          <div>
            <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.2"/></svg></i>
            <span><b>Lacak Pesanan</b><small>Status pengiriman real-time</small></span>
          </div>
          <div>
            <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 8.5a7.5 7.5 0 0 1 14 0"/><path d="M5 8.5v5M19 8.5v5M5 13.5c0 2 1.8 3 4 3h2"/><path d="M19 13.5c0 2-1.8 3-4 3h-1.5"/><path d="M12 16.5v2h3"/></svg></i>
            <span><b>Layanan Ramah</b><small>Siap membantu kapan saja</small></span>
          </div>
        </div>

        <div className="r2-home-courier__bottom">
          <span><b aria-hidden="true">✓</b> Terintegrasi dengan alur pemesanan R2 NUSANTARA</span>
          <span className="r2-home-courier__count">MALANG · INDONESIA</span>
        </div>
      </div>

      <style jsx global>{`
        .r2-home-courier-slot{width:100%;min-width:0;background:#f4f8fd;border-top:1px solid #e6edf5;border-bottom:1px solid #e6edf5}
        .r2-home-courier{width:100%;background:linear-gradient(180deg,#f7fbff 0%,#eef6fc 100%);color:#082653;overflow:hidden}
        .r2-home-courier__shell{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:0 0 58px}
        .r2-home-courier__head{position:relative;display:block;text-align:center;margin:0 calc((1180px - min(100vw - 48px,1180px)) / -2);padding:58px max(24px,calc((100vw - 1180px)/2 + 24px)) 74px;background:linear-gradient(135deg,#083e78 0%,#062d62 52%,#0b4f93 100%);color:#fff;clip-path:ellipse(92% 76% at 50% 20%);overflow:hidden}
        .r2-home-courier__head:before,.r2-home-courier__head:after{content:"";position:absolute;pointer-events:none;transform:skewX(-32deg);background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,0))}
        .r2-home-courier__head:before{width:150px;height:280px;left:7%;top:-105px}.r2-home-courier__head:after{width:105px;height:245px;right:8%;top:-90px}
        .r2-home-courier__intro{position:relative;z-index:1}
        .r2-home-courier__eyebrow{display:inline-flex;align-items:center;gap:18px;margin-bottom:15px;color:#fff;font-size:10px;font-weight:900;letter-spacing:.3em}
        .r2-home-courier__eyebrow:before,.r2-home-courier__eyebrow:after{content:"";width:52px;height:1px;background:rgba(255,255,255,.78)}
        .r2-home-courier h2{margin:0;font-size:clamp(30px,4.2vw,50px);line-height:1.04;letter-spacing:-.035em;font-weight:950;color:#fff;text-transform:uppercase}
        .r2-home-courier h2 em{font-style:normal;color:#f3d28a}
        .r2-home-courier__intro p{max-width:720px;margin:14px auto 0;color:rgba(255,255,255,.92);font-size:13px;line-height:1.65}
        .r2-home-courier__meta{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:9px;margin:20px auto 0;flex-wrap:wrap}
        .r2-home-courier__meta span,.r2-home-courier__meta b{display:inline-flex;align-items:center;gap:7px;min-height:25px;padding:5px 10px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.08);backdrop-filter:blur(8px);font-size:7px;letter-spacing:.14em;font-weight:900;color:rgba(255,255,255,.92)}
        .r2-home-courier__meta span i{width:6px;height:6px;border-radius:50%;background:#6dffa8;box-shadow:0 0 0 4px rgba(109,255,168,.12),0 0 12px rgba(109,255,168,.75);animation:r2CourierPulse 1.8s ease-in-out infinite}
        .r2-home-courier__meta b{color:#f5d58f}
        .r2-home-courier__status{display:none}
        @keyframes r2CourierPulse{0%,100%{opacity:.65;transform:scale(.9)}50%{opacity:1;transform:scale(1.08)}}
        .r2-home-courier__grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:-10px 0 0;padding:0;list-style:none}
        .r2-home-courier__item{min-width:0}
        .r2-home-courier__card{position:relative;height:100%;min-height:205px;box-sizing:border-box;padding:10px;border:1px solid #dfe9f2;border-radius:20px;background:rgba(255,255,255,.98);box-shadow:0 12px 30px rgba(20,73,126,.11);overflow:hidden;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}
        .r2-home-courier__card:hover{transform:translateY(-5px);border-color:#a9cbe6;box-shadow:0 20px 42px rgba(20,73,126,.17)}
        .r2-home-courier__card{animation:r2CourierCardIn .65s cubic-bezier(.2,.75,.25,1) both;animation-delay:calc(var(--courier-index, 0) * 70ms)}
        @keyframes r2CourierCardIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        .r2-home-courier__logo-frame{position:relative;display:grid;place-items:center;height:116px;border-radius:15px;background:radial-gradient(circle at 50% 42%,#fff 0%,#f9fcff 48%,#edf5fc 100%);overflow:hidden}
        .r2-home-courier__logo-frame:after{content:"";position:absolute;inset:7px;border:1px solid rgba(71,127,179,.08);border-radius:12px;pointer-events:none}
        .r2-home-courier__shine{position:absolute;inset:-55%;background:linear-gradient(110deg,transparent 43%,rgba(255,255,255,.78) 50%,transparent 57%);transform:translateX(-42%);transition:transform .55s ease;pointer-events:none}
        .r2-home-courier__card:hover .r2-home-courier__shine{transform:translateX(42%)}
        .r2-home-courier__logo-box{position:relative;z-index:1;display:grid;place-items:center;width:90%;height:82px;padding:5px 12px;border:0;border-radius:12px;background:#fff;box-shadow:0 5px 14px rgba(7,48,92,.035)}
        .r2-home-courier__logo-box img{position:relative;z-index:1;display:block;width:100%;height:100%;max-height:72px;object-fit:contain;filter:none;opacity:1;transition:transform .25s ease}
        .r2-home-courier__card:hover .r2-home-courier__logo-box img{transform:scale(1.035)}
        .r2-home-courier__copy{display:flex;align-items:center;justify-content:center;min-height:46px;margin:7px 2px 1px;padding:7px 10px;border-radius:999px;background:linear-gradient(100deg,#eef7ff,#e7f3ff);text-align:center}
        .r2-home-courier__copy strong{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:1.15;color:#103b73;font-weight:900}
        .r2-home-courier__copy span{display:none}
        .r2-home-courier__coverage{display:grid;place-items:center;text-align:center;padding:20px;background:linear-gradient(145deg,#f0f8ff,#deedfc);border-color:#cbdff1}
        .r2-home-courier__coverage-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:8px;border-radius:12px;background:linear-gradient(145deg,#0b4f93,#082f67);color:#fff;box-shadow:0 9px 20px rgba(13,75,140,.2)}
        .r2-home-courier__coverage-icon svg{width:31px;height:31px;display:block;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
        .r2-home-courier__coverage-title{color:#123b70;font-size:14px;line-height:1.25;font-weight:800;letter-spacing:.01em}.r2-home-courier__coverage-title b{font-weight:950}
        .r2-home-courier__coverage small{margin-top:8px;color:#6c829a;font-size:8px}
        .r2-home-courier__trust{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:24px;padding:17px 18px;border:1px solid #d3e4f3;border-radius:20px;background:linear-gradient(90deg,#eaf6ff,#f4faff);box-shadow:0 9px 24px rgba(20,73,126,.06)}
        .r2-home-courier__trust>div{display:flex;align-items:center;gap:10px;padding:4px 17px;border-right:1px solid #c6d9eb}.r2-home-courier__trust>div:last-child{border-right:0}
        .r2-home-courier__trust i{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:linear-gradient(145deg,#0870ca,#0a4d94);color:#fff;font-style:normal;box-shadow:0 7px 14px rgba(8,93,171,.18)}
        .r2-home-courier__trust i svg{width:18px;height:18px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .r2-home-courier__trust span{display:grid;gap:3px}.r2-home-courier__trust b{font-size:10px;color:#123b70}.r2-home-courier__trust small{font-size:7px;line-height:1.35;color:#70849a}
        .r2-home-courier__bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:13px;padding:0 3px;color:#778b9f;font-size:7px}
        .r2-home-courier__bottom>b{display:inline-grid;place-items:center}.r2-home-courier__bottom span>b{display:inline-grid;place-items:center;width:15px;height:15px;margin-right:5px;border-radius:50%;background:#eaf6ee;color:#168a43;font-size:9px;box-shadow:inset 0 0 0 1px rgba(22,138,67,.08)}.r2-home-courier__count{font-weight:900;letter-spacing:.14em}
        @media(max-width:899px){
          .r2-home-courier__shell{width:min(720px,calc(100% - 32px));padding-bottom:46px}
          .r2-home-courier__head{margin:0 calc((720px - min(100vw - 32px,720px)) / -2);padding:48px 24px 62px}
          .r2-home-courier__grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
          .r2-home-courier__trust{grid-template-columns:repeat(2,1fr);gap:10px}
          .r2-home-courier__trust>div{border-right:0;padding:4px 8px}
        }
        @media(max-width:620px){
          .r2-home-courier__shell{width:calc(100% - 16px);padding-bottom:32px}
          .r2-home-courier__head{margin:0 -8px;padding:36px 14px 52px;clip-path:ellipse(112% 73% at 50% 22%)}
          .r2-home-courier__eyebrow{gap:7px;font-size:6.5px;letter-spacing:.2em;margin-bottom:11px}
          .r2-home-courier__meta{margin-top:12px;gap:5px}
          .r2-home-courier__meta span,.r2-home-courier__meta b{min-height:20px;padding:4px 7px;font-size:5.2px}
          .r2-home-courier__eyebrow:before,.r2-home-courier__eyebrow:after{width:23px}
          .r2-home-courier h2{font-size:23px;line-height:1.08}
          .r2-home-courier__intro p{max-width:340px;margin-top:10px;font-size:8.5px;line-height:1.55}
          .r2-home-courier__grid{gap:8px;margin-top:-5px}
          .r2-home-courier__card{min-height:158px;padding:7px;border-radius:15px;box-shadow:0 8px 22px rgba(20,73,126,.09)}
          .r2-home-courier__logo-frame{height:91px;border-radius:11px}
          .r2-home-courier__logo-box{width:92%;height:67px;padding:4px 7px;border-radius:10px}
          .r2-home-courier__logo-box img{max-height:61px}
          .r2-home-courier__copy{min-height:30px;margin:6px 1px 0;padding:6px 6px}
          .r2-home-courier__copy strong{font-size:8.5px}
          .r2-home-courier__coverage{padding:9px}
          .r2-home-courier__coverage-icon{width:32px;height:32px;margin-bottom:6px;border-radius:9px}
          .r2-home-courier__coverage-icon svg{width:21px;height:21px}
          .r2-home-courier__coverage-title{font-size:9px}
          .r2-home-courier__coverage small{margin-top:5px;font-size:5.5px}
          .r2-home-courier__trust{grid-template-columns:1fr 1fr;margin-top:12px;padding:9px;border-radius:15px;gap:3px}
          .r2-home-courier__trust>div{gap:6px;padding:4px}
          .r2-home-courier__trust i{flex-basis:26px;width:26px;height:26px}
          .r2-home-courier__trust i svg{width:13px;height:13px}
          .r2-home-courier__trust b{font-size:7.5px}
          .r2-home-courier__trust small{font-size:5.5px}
          .r2-home-courier__bottom{font-size:5.5px;line-height:1.45;margin-top:10px}
          .r2-home-courier__count{white-space:nowrap;font-size:5px}
        }
        @media(max-width:380px){
          .r2-home-courier__grid{gap:6px}
          .r2-home-courier__card{min-height:148px;padding:6px}
          .r2-home-courier__logo-frame{height:82px}
          .r2-home-courier__logo-box{height:60px}
          .r2-home-courier__logo-box img{max-height:55px}
          .r2-home-courier__copy{min-height:28px}
          .r2-home-courier__copy strong{font-size:8px}
          .r2-home-courier__trust b{font-size:7px}
          .r2-home-courier__trust small{font-size:5px}
        }
        @media(prefers-reduced-motion:reduce){.r2-home-courier__card,.r2-home-courier__shine,.r2-home-courier__logo-box img,.r2-home-courier__meta span i{transition:none;animation:none}.r2-home-courier__card{animation:none}.r2-home-courier__card:hover{transform:none}}
      `}</style>
    </section>
  )

  return createPortal(content, slot)
}
