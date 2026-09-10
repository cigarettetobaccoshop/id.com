import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [message, setMessage] = useState('Menyelesaikan autentikasi…')

  useEffect(() => {
    let active = true
    let redirectTimer

    const complete = async () => {
      try {
        const errorCode = typeof router.query.error === 'string' ? router.query.error : ''
        const errorDescription = typeof router.query.error_description === 'string' ? router.query.error_description : ''
        if (errorCode) throw new Error(errorDescription || `OAuth error: ${errorCode}`)

        const code = typeof router.query.code === 'string' ? router.query.code : ''
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) throw new Error('Sesi Google tidak ditemukan. Silakan ulangi login.')

        if (active) {
          setMessage('Login Google berhasil. Mengalihkan…')
          await router.replace('/auth')
        }
      } catch (error) {
        if (active) {
          setMessage(`Autentikasi gagal: ${error?.message || 'Terjadi kesalahan.'}`)
          redirectTimer = setTimeout(() => router.replace('/auth'), 1800)
        }
      }
    }

    if (router.isReady) complete()
    return () => {
      active = false
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [router.isReady, router.query.code, router.query.error, router.query.error_description, router])

  return (
    <>
      <Head><title>Autentikasi — R2 NUSANTARA</title></Head>
      <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#FAFAF8',fontFamily:'Inter,system-ui,sans-serif'}}>
        <section style={{width:'min(420px,100%)',padding:28,border:'1px solid #E2E8F0',borderRadius:18,background:'#fff',textAlign:'center',boxShadow:'0 18px 50px rgba(16,42,67,.08)'}}>
          <div style={{width:42,height:42,margin:'0 auto 16px',borderRadius:12,display:'grid',placeItems:'center',background:'#EEF4FA',color:'#0F3D6E',fontWeight:900}}>R2</div>
          <strong style={{display:'block',fontSize:12,letterSpacing:'.12em',color:'#0F3D6E'}}>R2 NUSANTARA</strong>
          <p style={{margin:'12px 0 0',fontSize:11,lineHeight:1.6,color:'#627D98'}}>{message}</p>
        </section>
      </main>
    </>
  )
}
