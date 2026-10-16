import Head from 'next/head'
import { useState } from 'react'

const initialForm = { name: '', email: '', subject: '', message: '' }

export default function ContactPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setStatus({ type: '', text: '' })
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Pesan gagal dikirim.')
      setStatus({ type: 'success', text: result.message || 'Pesan berhasil dikirim.' })
      setForm(initialForm)
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Terjadi kesalahan.' })
    } finally { setLoading(false) }
  }

  return (
    <main className="r2-contact-page">
      <Head>
        <title>{`Kontak R2 NUSANTARA — Distributor Malang`}</title>
        <meta name="description" content="Hubungi R2 NUSANTARA, gudang distributor di Karangduren, Pakisaji, Kabupaten Malang. Layanan Senin–Sabtu pukul 08.00–17.00 WIB." />
        <link rel="canonical" href="https://r2nusantara-shop.vercel.app/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="R2 NUSANTARA" />
        <meta property="og:title" content="Kontak R2 NUSANTARA — Distributor Malang" />
        <meta property="og:description" content="Hubungi R2 NUSANTARA di Karangduren, Pakisaji, Kabupaten Malang. Layanan Senin–Sabtu 08.00–17.00 WIB." />
        <meta property="og:url" content="https://r2nusantara-shop.vercel.app/contact" />
        <meta property="og:image" content="https://r2nusantara-shop.vercel.app/assets/logo/logo.png" />
        <meta property="og:locale" content="id_ID" />
      </Head>
      <section className="r2-contact-card" aria-labelledby="contact-title">
        <a href="/" className="r2-contact-back">← Beranda</a>
        <p className="r2-contact-eyebrow">R2 NUSANTARA</p>
        <h1 id="contact-title">Hubungi Kami</h1>
        <p className="r2-contact-subtitle">Sampaikan pertanyaan atau kebutuhan Anda melalui formulir berikut.</p>
        <div className="r2-contact-info" aria-label="Kontak resmi R2 NUSANTARA">
          <a href="https://wa.me/6285715905079" target="_blank" rel="noreferrer" aria-label="Hubungi R2 NUSANTARA melalui WhatsApp">WhatsApp <strong>+62 857-1590-5079</strong></a>
          <a href="mailto:cigaratetobacoshop@gmail.com" aria-label="Kirim email ke R2 NUSANTARA">Email <strong>cigaratetobacoshop@gmail.com</strong></a>
          <a href="https://r2nusantara-shop.vercel.app/" aria-label="Buka website R2 NUSANTARA">Website <strong>r2nusantara-shop.vercel.app</strong></a>
          <p><b>Jam operasional</b><span>Senin—Sabtu · 08.00—17.00 WIB</span></p>
          <p><b>Lokasi gudang</b><span>Karangduren, Pakisaji, Kabupaten Malang</span></p>
        </div>
        <style jsx>{`
          .r2-contact-info{display:grid;gap:8px;margin:20px 0 24px}
          .r2-contact-info a,.r2-contact-info p{box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:5px;min-height:48px;margin:0;padding:12px 14px;border:1px solid #dce5ef;border-radius:12px;background:#f8fafc;color:#16304f;text-decoration:none;font-size:12px;overflow-wrap:anywhere}
          .r2-contact-info a:focus-visible{outline:3px solid #2563eb;outline-offset:2px}
          .r2-contact-info a strong{font-size:13px;color:#0b316b}
          .r2-contact-info p b{font-size:11px}.r2-contact-info p span{font-size:12px;color:#64748b;line-height:1.5}
          @media(min-width:700px){.r2-contact-info{grid-template-columns:1fr 1fr}.r2-contact-info p{min-height:70px}}
        `}</style>
        <form onSubmit={submit} className="r2-contact-form">
          <label>Nama<input name="name" value={form.name} onChange={update} maxLength={120} required autoComplete="name" /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={update} maxLength={254} required autoComplete="email" /></label>
          <label>Subjek<input name="subject" value={form.subject} onChange={update} maxLength={180} autoComplete="off" /></label>
          <label>Pesan<textarea name="message" value={form.message} onChange={update} minLength={10} maxLength={5000} rows={7} required /></label>
          <button type="submit" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Pesan'}</button>
          {status.text && <p role="status" className={`r2-contact-status ${status.type}`}>{status.text}</p>}
        </form>
      </section>
    </main>
  )
}
