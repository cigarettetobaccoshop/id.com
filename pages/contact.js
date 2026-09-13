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
      <section className="r2-contact-card" aria-labelledby="contact-title">
        <a href="/" className="r2-contact-back">← Beranda</a>
        <p className="r2-contact-eyebrow">R2 NUSANTARA</p>
        <h1 id="contact-title">Hubungi Kami</h1>
        <p className="r2-contact-subtitle">Sampaikan pertanyaan atau kebutuhan Anda melalui formulir berikut.</p>
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
