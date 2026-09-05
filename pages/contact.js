import { useState } from 'react'

const initialForm = { name: '', email: '', subject: '', message: '' }
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 14, border: '1px solid #2b3440', background: '#0b0f14', color: '#f4f5f7', outline: 'none', font: 'inherit' }

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
    <main style={styles.page}>
      <section style={styles.card}>
        <a href="/" style={styles.back}>← Beranda</a>
        <p style={styles.eyebrow}>R2 NUSANTARA</p>
        <h1 style={styles.title}>Hubungi Kami</h1>
        <p style={styles.subtitle}>Sampaikan pertanyaan atau kebutuhan Anda melalui formulir berikut.</p>
        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>Nama<input style={fieldStyle} name="name" value={form.name} onChange={update} maxLength={120} required autoComplete="name" /></label>
          <label style={styles.label}>Email<input style={fieldStyle} type="email" name="email" value={form.email} onChange={update} maxLength={254} required autoComplete="email" /></label>
          <label style={styles.label}>Subject<input style={fieldStyle} name="subject" value={form.subject} onChange={update} maxLength={180} autoComplete="off" /></label>
          <label style={styles.label}>Pesan<textarea style={{ ...fieldStyle, resize: 'vertical' }} name="message" value={form.message} onChange={update} minLength={10} maxLength={5000} rows={7} required /></label>
          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Mengirim...' : 'Kirim Pesan'}</button>
          {status.text && <p role="status" style={{ ...styles.status, color: status.type === 'success' ? '#78d7a4' : '#ff9d9d' }}>{status.text}</p>}
        </form>
      </section>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', padding: '24px 16px', display: 'grid', placeItems: 'center', background: '#0b0d10', color: '#f4f5f7', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  card: { width: 'min(100%, 680px)', padding: 'clamp(24px, 6vw, 48px)', border: '1px solid #27303b', borderRadius: 28, background: 'linear-gradient(145deg, #15191f, #0e1115)', boxShadow: '0 25px 80px rgba(0,0,0,.35)' },
  back: { display: 'inline-block', marginBottom: 30, color: '#b9c7db', textDecoration: 'none' },
  eyebrow: { margin: 0, color: '#79b8ff', letterSpacing: '.18em', fontSize: 12, fontWeight: 700 },
  title: { margin: '8px 0', fontSize: 'clamp(38px, 8vw, 64px)', letterSpacing: '-.045em' },
  subtitle: { margin: '0 0 30px', color: '#8e99a8', lineHeight: 1.6 },
  form: { display: 'grid', gap: 18 },
  label: { display: 'grid', gap: 8, color: '#c7cfda', fontSize: 13, fontWeight: 600 },
  button: { padding: '14px 18px', border: 0, borderRadius: 14, background: '#d8e6fb', color: '#101419', fontWeight: 800, cursor: 'pointer' },
  status: { margin: 0, fontSize: 14 },
}
