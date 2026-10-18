import Head from 'next/head'
import Link from 'next/link'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const placeholder = '[PLACEHOLDER — menunggu teks resmi dari pemilik bisnis]'

export default function SyaratKetentuan() {
  return <>
    <Head>
      <title>Syarat & Ketentuan — R2 NUSANTARA</title>
      <meta name="description" content="Halaman syarat dan ketentuan R2 NUSANTARA menunggu naskah resmi dari pemilik bisnis." />
      <link rel="canonical" href={`${SITE_URL}/syarat-ketentuan`} />
    </Head>
    <main style={{maxWidth:840,margin:'0 auto',padding:'clamp(24px,5vw,56px) 20px 100px',color:'#10213d',fontFamily:'inherit'}}>
      <Link href="/" style={{color:'#174a86',textDecoration:'none'}}>← Kembali ke Beranda</Link>
      <p style={{marginTop:32,fontSize:12,fontWeight:800,letterSpacing:'.16em',color:'#8a6a2f'}}>DOKUMEN RESMI · R2 NUSANTARA</p>
      <h1 style={{fontSize:'clamp(30px,5vw,44px)',lineHeight:1.15}}>Syarat & Ketentuan</h1>
      <p style={{color:'#52627a',lineHeight:1.7}}>Halaman ini belum memuat syarat dan ketentuan final. Konten berikut adalah penanda yang harus diganti dan disahkan oleh pemilik bisnis sebelum dipublikasikan sebagai ketentuan resmi.</p>
      <section role="note" aria-label="Placeholder syarat dan ketentuan" style={{marginTop:24,padding:20,border:'1px solid #d6b66e',borderLeft:'5px solid #b58a3b',borderRadius:12,background:'#fffaf0',lineHeight:1.8,fontWeight:700}}>{placeholder}</section>
    </main>
  </>
}
