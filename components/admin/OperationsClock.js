import { useEffect, useState } from 'react'

const CLOCK_OPTIONS = { timeZone:'Asia/Jakarta', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }
const DATE_OPTIONS = { timeZone:'Asia/Jakarta', weekday:'long', day:'2-digit', month:'long', year:'numeric' }
const FULL_TIME_OPTIONS = { timeZone:'Asia/Jakarta', dateStyle:'medium', timeStyle:'medium', hour12:false }

function getWibState(now) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Jakarta', weekday:'short', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const weekday = values.weekday
  const minutes = Number(values.hour) * 60 + Number(values.minute)
  const workday = ['Mon','Tue','Wed','Thu','Fri','Sat'].includes(weekday)
  const open = workday && minutes >= 480 && minutes < 1020
  return { open, workday, weekday }
}

export default function OperationsClock({ lastSync }) {
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const state = now ? getWibState(now) : null
  const clock = now ? new Intl.DateTimeFormat('id-ID', CLOCK_OPTIONS).format(now) : '--:--:--'
  const date = now ? new Intl.DateTimeFormat('id-ID', DATE_OPTIONS).format(now) : 'Menyiapkan tanggal…'
  const lastSyncLabel = lastSync ? new Intl.DateTimeFormat('id-ID', FULL_TIME_OPTIONS).format(lastSync) + ' WIB' : 'Belum ada sinkronisasi'

  return (
    <section className="ops-clock" aria-label="Jam operasional dan waktu sistem">
      <div className="ops-clock-main">
        <div className="ops-clock-label"><span className="ops-clock-live" /> WAKTU OPERASIONAL</div>
        <div className="ops-clock-digits" aria-label={now ? 'Waktu Indonesia Barat' : 'Jam sedang dimuat'}>{clock}<span> WIB</span></div>
        <div className="ops-clock-date">{date}</div>
      </div>
      <div className="ops-clock-side">
        <div className="ops-clock-status"><span className={state?.open ? 'ops-clock-status-dot open' : 'ops-clock-status-dot'} />{state ? (state.open ? 'JAM LAYANAN BUKA' : 'DI LUAR JAM LAYANAN') : 'MEMERIKSA JAM LAYANAN'}</div>
        <div className="ops-clock-hours"><span>JAM LAYANAN</span><strong>Senin–Sabtu · 08.00–17.00 WIB</strong></div>
        <div className="ops-clock-sync"><span>SINKRONISASI DASHBOARD TERAKHIR</span><strong>{lastSyncLabel}</strong><small>Data diperbarui otomatis setiap 15 detik saat dashboard aktif.</small></div>
      </div>
      <style jsx>{`
        .ops-clock{max-width:1240px;margin:12px auto 0;position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.9fr);gap:20px;align-items:center;padding:18px 22px;border:1px solid #d9e5f0;border-radius:18px;background:linear-gradient(120deg,rgba(255,255,255,.98),rgba(244,249,255,.96));box-shadow:0 10px 30px rgba(20,57,95,.055);font-variant-numeric:tabular-nums}
        .ops-clock-label{display:flex;align-items:center;gap:8px;color:#6b8199;font-size:7px;font-weight:950;letter-spacing:.16em}
        .ops-clock-live{width:6px;height:6px;border-radius:50%;background:#1eaa72;box-shadow:0 0 0 4px rgba(30,170,114,.1)}
        .ops-clock-digits{margin-top:7px;color:#082b58;font-size:clamp(30px,4vw,42px);line-height:1.1;font-weight:850;letter-spacing:-.055em}
        .ops-clock-digits span{font-size:10px;letter-spacing:.12em;color:#a47c38;vertical-align:middle;margin-left:4px}
        .ops-clock-date{margin-top:5px;color:#70849a;font-size:10px;text-transform:capitalize}
        .ops-clock-side{display:grid;gap:10px;border-left:1px solid #e0e9f1;padding-left:20px}
        .ops-clock-status{display:flex;align-items:center;gap:7px;color:#506981;font-size:7px;font-weight:950;letter-spacing:.1em}
        .ops-clock-status-dot{width:7px;height:7px;border-radius:50%;background:#d39a43;box-shadow:0 0 0 4px rgba(211,154,67,.12)}
        .ops-clock-status-dot.open{background:#22a66c;box-shadow:0 0 0 4px rgba(34,166,108,.12)}
        .ops-clock-hours,.ops-clock-sync{display:grid;gap:4px}
        .ops-clock-hours span,.ops-clock-sync span{color:#8a9bad;font-size:6.5px;font-weight:900;letter-spacing:.12em}
        .ops-clock-hours strong,.ops-clock-sync strong{color:#213e5b;font-size:9px;font-weight:850}
        .ops-clock-sync small{color:#8797a8;font-size:7px;line-height:1.5}
        @media(max-width:760px){.ops-clock{grid-template-columns:1fr;gap:14px;padding:16px;border-radius:15px}.ops-clock-side{border-left:0;border-top:1px solid #e0e9f1;padding:13px 0 0;grid-template-columns:1fr 1fr;gap:12px}.ops-clock-status{grid-column:1/-1}.ops-clock-sync{grid-column:1/-1}.ops-clock-digits{font-size:34px}}
        @media(max-width:380px){.ops-clock-side{grid-template-columns:1fr}.ops-clock-status,.ops-clock-sync{grid-column:auto}.ops-clock-digits{font-size:30px}}
        @media(prefers-reduced-motion:reduce){.ops-clock *{animation:none!important;transition:none!important}}
      `}</style>
    </section>
  )
}
