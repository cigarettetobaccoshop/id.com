import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const ADMIN_UUID = '76a6d92e-6de1-45e3-a5d0-90d7905c0d52'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (data.user?.id === ADMIN_UUID) router.replace('/admin/dashboard')
      else setLoading(false)
    }).catch(() => active && setLoading(false))
    return () => { active = false }
  }, [router])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) throw authError
      if (data.user?.id !== ADMIN_UUID) {
        await supabase.auth.signOut()
        throw new Error('Akun ini tidak memiliki akses admin.')
      }
      const next = typeof router.query.next === 'string' && router.query.next.startsWith('/admin') ? router.query.next : '/admin/dashboard'
      await router.replace(next)
    } catch (err) {
      setError(err?.message || 'Login gagal. Periksa email dan password.')
      setSubmitting(false)
    }
  }

  if (loading) return <main className="login-page"><div className="login-card loading">Memverifikasi sesi…</div></main>

  return (
    <>
      <Head>
        <title>Login Admin — R2 NUSANTARA</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="login-page">
        <section className="login-card" aria-labelledby="login-title">
          <div className="brand"><div className="mark">R2</div><div><strong>R2 NUSANTARA</strong><span>Admin Console</span></div></div>
          <div className="eyebrow">AREA TERLINDUNGI</div>
          <h1 id="login-title">Masuk ke Admin</h1>
          <p className="lead">Gunakan akun admin yang telah diverifikasi. Akses selain akun admin akan ditolak.</p>
          <form onSubmit={handleSubmit}>
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
            {error && <div className="error" role="alert">{error}</div>}
            <button disabled={submitting}>{submitting ? 'Memverifikasi…' : 'Masuk ke Dashboard'}</button>
          </form>
          <a href="/" className="back">← Kembali ke website</a>
        </section>
      </main>
      <style jsx>{`
        .login-page{min-height:100vh;display:grid;place-items:center;padding:24px 14px;background:radial-gradient(circle at 50% 0%,rgba(28,101,190,.12),transparent 42%),#f5f8fc;color:#0b1d41}.login-card{width:min(430px,100%);background:#fff;border:1px solid #dce5ef;border-radius:24px;padding:28px;box-shadow:0 24px 70px rgba(15,45,80,.12)}.loading{text-align:center;color:#65768c;font-size:13px}.brand{display:flex;align-items:center;gap:10px;margin-bottom:26px}.mark{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(145deg,#082b61,#1469ce);color:#fff;font-weight:950}.brand div:last-child{display:grid;gap:2px}.brand strong{font-size:11px;letter-spacing:.08em}.brand span{font-size:8px;color:#77869b}.eyebrow{display:inline-block;padding:6px 8px;border-radius:7px;background:#edf5ff;color:#1767c2;font-size:8px;font-weight:950;letter-spacing:.14em}h1{margin:14px 0 7px;font-size:31px;letter-spacing:-.04em}.lead{font-size:11px;line-height:1.6;color:#697991;margin:0 0 22px}form{display:grid;gap:14px}label{display:grid;gap:6px;font-size:9px;font-weight:850;color:#263a56}input{width:100%;box-sizing:border-box;height:46px;border:1px solid #d3deea;border-radius:11px;padding:0 12px;font:inherit;font-size:12px;color:#12233d;background:#fbfdff;outline:none}input:focus{border-color:#3980d0;box-shadow:0 0 0 3px rgba(57,128,208,.12)}button{height:48px;border:0;border-radius:12px;background:#0b316b;color:#fff;font-size:10px;font-weight:950;cursor:pointer;box-shadow:0 10px 24px rgba(11,49,107,.2)}button:disabled{opacity:.6;cursor:wait}.error{padding:10px 11px;border-radius:10px;background:#fff1f1;border:1px solid #f1cccc;color:#a33636;font-size:9px;line-height:1.45}.back{display:block;text-align:center;margin-top:18px;color:#6d7d93;text-decoration:none;font-size:9px;font-weight:800}.back:hover{color:#1767c2}@media(max-width:480px){.login-card{padding:22px;border-radius:20px}}
      `}</style>
    </>
  )
}
