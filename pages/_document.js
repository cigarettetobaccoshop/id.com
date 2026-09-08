import { Html, Head, Main, NextScript } from 'next/document'

const SITE_URL = 'https://r2nusantara-shop.vercel.app'
const SOCIAL_IMAGE = `${SITE_URL}/assets/logo/preview.jpg`

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta name="application-name" content="R2 NUSANTARA" />
        <meta name="apple-mobile-web-app-title" content="R2 NUSANTARA" />
        <meta name="theme-color" content="#F7F6F2" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="R2 NUSANTARA" />
        <meta property="og:title" content="R2 NUSANTARA — Wholesale Trading Partner" />
        <meta property="og:description" content="Portal B2B eksklusif R2 Nusantara untuk mitra distribusi terverifikasi. Katalog live, stok terstruktur, dan alur pemesanan profesional." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={SOCIAL_IMAGE} />
        <meta property="og:image:secure_url" content={SOCIAL_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content="R2 NUSANTARA — Wholesale Trading Partner" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="R2 NUSANTARA — Wholesale Trading Partner" />
        <meta name="twitter:description" content="Portal B2B eksklusif R2 Nusantara untuk mitra distribusi terverifikasi." />
        <meta name="twitter:image" content={SOCIAL_IMAGE} />
        <link rel="canonical" href={SITE_URL} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
