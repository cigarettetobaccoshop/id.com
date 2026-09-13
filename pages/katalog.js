import dynamic from 'next/dynamic';
import Head from 'next/head';

const CatalogPage = dynamic(() => import('../components/catalog/CatalogPage'), { ssr: false });

function KatalogPage() {
  return (
    <>
      <Head>
        <title>Katalog R2 Nusantara</title>
        <meta name="description" content="Katalog produk R2 Nusantara dengan pengalaman belanja mobile-first." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <CatalogPage />
    </>
  );
}

export async function getStaticProps() {
  return { props: {} };
}

KatalogPage.displayName = 'KatalogPage';

export default KatalogPage;
