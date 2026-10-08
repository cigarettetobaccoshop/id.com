import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta name="application-name" content="R2 NUSANTARA" />
        <meta name="apple-mobile-web-app-title" content="R2 NUSANTARA" />
        <meta name="theme-color" content="#0F3D6E" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="og:locale" content="id_ID" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
