import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import jneLogo from '../../assets/ekspedisi/jne-express.png'
import jntLogo from '../../assets/ekspedisi/j&t-express.png'
import sicepatLogo from '../../assets/ekspedisi/sicepat-ekspres.png'
import indahCargoLogo from '../../assets/ekspedisi/indah-cargo.png'

const partners = [
  { name: 'JNE Express', src: jneLogo, note: 'Pengiriman reguler & nasional' },
  { name: 'J&T Express', src: jntLogo, note: 'Jaringan pengiriman antarkota' },
  { name: 'SiCepat Ekspres', src: sicepatLogo, note: 'Layanan ekspres & distribusi' },
  { name: 'Indah Cargo', src: indahCargoLogo, note: 'Solusi kiriman volume & cargo' }
]

export default function CourierPartners() {
  const [slot, setSlot] = useState(null)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(1)
  const [paused, setPaused] = useState(false)

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

  useEffect(() => {
    const sync = () => setVisible(window.innerWidth >= 900 ? 2 : 1)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  const maxIndex = useMemo(() => Math.max(0, partners.length - visible), [visible])

  useEffect(() => {
    setIndex(current => Math.min(current, maxIndex))
  }, [maxIndex])

  useEffect(() => {
    if (paused || maxIndex === 0) return undefined
    const timer = window.setInterval(() => {
      setIndex(current => current >= maxIndex ? 0 : current + 1)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [maxIndex, paused])

  if (!slot) return null

  const previous = () => setIndex(current => current <= 0 ? maxIndex : current - 1)
  const next = () => setIndex(current => current >= maxIndex ? 0 : current + 1)

  const content = (
    <section className="r2-home-courier" aria-labelledby="r2-home-courier-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="r2-home-courier__head">
        <div className="r2-home-courier__intro">
          <span className="r2-home-courier__eyebrow">LOGISTICS NETWORK · 01</span>
          <h2 id="r2-home-courier-title">Mitra Ekspedisi <em>R2 NUSANTARA.</em></h2>
          <p>Partner pengiriman yang mendukung distribusi dari gudang Malang menuju berbagai wilayah Indonesia.</p>
        </div>
        <div className="r2-home-courier__controls" aria-label="Kontrol slider mitra ekspedisi">
          <button type="button" onClick={previous} aria-label="Mitra ekspedisi sebelumnya">←</button>
          <button type="button" onClick={next} aria-label="Mitra ekspedisi berikutnya">→</button>
        </div>
      </div>

      <div className="r2-home-courier__viewport" role="region" aria-roledescription="carousel" aria-label="Mitra ekspedisi" tabIndex="0" onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className="r2-home-courier__track" style={{ transform: `translateX(-${index * (100 / visible)}%)` }}>
          {partners.map((partner, i) => (
            <article className="r2-home-courier__card" key={partner.name} aria-label={`${partner.name}, slide ${i + 1} dari ${partners.length}`}>
              <div className="r2-home-courier__frame">
                <div className="r2-home-courier__frame-glow" aria-hidden="true" />
                <div className="r2-home-courier__logo-box">
                  <Image src={partner.src} alt={`Logo ${partner.name}`} width={180} height={64} loading="lazy" sizes="(max-width: 620px) 72vw, 35vw" />
                </div>
              </div>
              <div className="r2-home-courier__copy">
                <div><span>OFFICIAL PARTNER</span><strong>{partner.name}</strong></div>
                <small>{partner.note}</small>
              </div>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </div>

      <div className="r2-home-courier__bottom">
        <div className="r2-home-courier__dots" aria-label="Posisi slide">
          {partners.map((partner, i) => <button key={partner.name} type="button" className={i >= index && i < index + visible ? 'is-active' : ''} onClick={() => setIndex(Math.min(i, maxIndex))} aria-label={`Tampilkan ${partner.name}`} />)}
        </div>
        <span>{paused ? 'SLIDER DIJEDA' : 'AUTO SLIDE · 4.2s'}</span>
      </div>

      <style jsx global>{`
        .r2-home-courier-slot{width:100%;min-width:0;background:#f5f8fc}
        .r2-home-courier{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:clamp(58px,7vw,88px) 0;background:#f5f8fc;color:#0a1d36}
        .r2-home-courier__head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:28px}
        .r2-home-courier__intro{min-width:0}
        .r2-home-courier__eyebrow{display:block;margin-bottom:10px;color:#0F3D6E;font-size:8px;font-weight:950;letter-spacing:.2em}
        .r2-home-courier h2{margin:0;font-size:clamp(28px,4vw,44px);line-height:1;letter-spacing:-.045em;font-weight:900;color:#071b35}
        .r2-home-courier h2 em{font-style:normal;color:#0F3D6E}
        .r2-home-courier__head p{max-width:620px;margin:13px 0 0;color:#687b92;font-size:11px;line-height:1.7}
        .r2-home-courier__controls{display:flex;gap:7px;flex:0 0 auto}
        .r2-home-courier__controls button{width:44px;height:44px;border:1px solid #d5dee8;border-radius:13px;background:#fff;color:#0F3D6E;font-size:18px;font-weight:800;box-shadow:0 8px 20px rgba(7,29,73,.07);cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease,box-shadow .2s ease}
        .r2-home-courier__controls button:hover{transform:translateY(-2px);border-color:#8A96A8;background:#f3f6f9;box-shadow:0 12px 24px rgba(7,63,149,.12)}
        .r2-home-courier__controls button:focus-visible,.r2-home-courier__dots button:focus-visible{outline:3px solid rgba(15,61,110,.22);outline-offset:2px}
        .r2-home-courier__viewport{overflow:hidden;border-radius:26px;outline:none}
        .r2-home-courier__viewport:focus-visible{box-shadow:0 0 0 3px rgba(15,61,110,.2)}
        .r2-home-courier__track{display:flex;width:100%;transition:transform .65s cubic-bezier(.22,.75,.22,1);will-change:transform}
        .r2-home-courier__card{position:relative;box-sizing:border-box;flex:0 0 calc(100% / 2);padding:9px;min-width:0}
        .r2-home-courier__card:before{content:"";position:absolute;inset:9px;border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.99),rgba(242,246,250,.96));border:1px solid #dce4ec;box-shadow:0 18px 45px rgba(10,42,82,.08)}
        .r2-home-courier__frame{position:relative;z-index:1;height:142px;margin:0;display:grid;place-items:center;border-radius:19px;background:#fff;border:1px solid #e3e9ef;overflow:hidden}
        .r2-home-courier__frame-glow{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(15,61,110,.09),transparent 68%);filter:blur(4px)}
        .r2-home-courier__logo-box{position:relative;z-index:2;display:grid;place-items:center;width:min(78%,230px);height:84px;padding:10px 22px;border:1px solid #cfd9e4;border-radius:14px;background:linear-gradient(180deg,#fff,#f8fafc);box-shadow:0 10px 24px rgba(7,29,73,.07),inset 0 0 0 1px rgba(255,255,255,.8)}
        .r2-home-courier__logo-box:after{content:"";position:absolute;inset:5px;border:1px solid rgba(138,150,168,.28);border-radius:10px;pointer-events:none}
        .r2-home-courier__logo-box img{position:relative;z-index:1;display:block;width:100%;height:auto;max-height:62px;object-fit:contain;filter:drop-shadow(0 5px 9px rgba(7,29,73,.08))}
        .r2-home-courier__copy{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 15px 16px}
        .r2-home-courier__copy div{display:grid;gap:5px;min-width:0}
        .r2-home-courier__copy span{font-size:6px;letter-spacing:.18em;font-weight:950;color:#8A96A8}
        .r2-home-courier__copy strong{font-size:13px;line-height:1.1;color:#0a2a50}
        .r2-home-courier__copy small{font-size:8px;color:#71849a;line-height:1.35;text-align:right}
        .r2-home-courier__card>i{position:absolute;z-index:3;right:20px;top:20px;width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.95);border:1px solid #dbe2e9;color:#0F3D6E;font-size:11px;font-style:normal;box-shadow:0 5px 12px rgba(7,29,73,.08)}
        .r2-home-courier__bottom{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:16px;padding:0 10px}
        .r2-home-courier__dots{display:flex;align-items:center;gap:6px}
        .r2-home-courier__dots button{width:8px;height:8px;padding:0;border:0;border-radius:999px;background:#cbd4dd;cursor:pointer;transition:width .25s ease,background .25s ease}
        .r2-home-courier__dots button.is-active{width:22px;background:#0F3D6E}
        .r2-home-courier__bottom>span{font-size:7px;font-weight:900;letter-spacing:.15em;color:#8A96A8}
        @media(max-width:899px){.r2-home-courier{width:min(720px,calc(100% - 32px));padding:52px 0}.r2-home-courier__card{flex-basis:100%}.r2-home-courier__frame{height:150px}.r2-home-courier__head{align-items:flex-start}}
        @media(max-width:620px){.r2-home-courier{width:calc(100% - 24px);padding:48px 0}.r2-home-courier__head{gap:16px;margin-bottom:20px}.r2-home-courier__head p{font-size:10px;line-height:1.6}.r2-home-courier h2{font-size:29px}.r2-home-courier__controls button{width:44px;height:44px;border-radius:11px}.r2-home-courier__viewport{border-radius:22px}.r2-home-courier__card{padding:7px}.r2-home-courier__card:before{inset:7px;border-radius:19px}.r2-home-courier__frame{height:145px;border-radius:17px}.r2-home-courier__logo-box{width:82%;height:82px;padding:9px 18px;border-radius:13px}.r2-home-courier__logo-box:after{border-radius:9px}.r2-home-courier__copy{padding:13px 13px 14px}.r2-home-courier__copy strong{font-size:12px}.r2-home-courier__copy small{font-size:7px}.r2-home-courier__bottom{padding:0 7px}.r2-home-courier__bottom>span{font-size:6px}}
        @media(prefers-reduced-motion:reduce){.r2-home-courier__track{transition:none}.r2-home-courier__controls button,.r2-home-courier__dots button{transition:none}.r2-home-courier__track{will-change:auto}}
      `}</style>
    </section>
  )

  return createPortal(content, slot)
}
