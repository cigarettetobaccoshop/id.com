import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Legacy route compatibility.
 * /products is the canonical production catalog backed by public.products.
 * Keep /katalog reachable without maintaining a second mock-data catalog.
 */
export default function KatalogPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const query = new URLSearchParams();
    if (typeof router.query.q === 'string' && router.query.q) query.set('q', router.query.q);
    if (router.query.catalog === 'r2' || router.query.catalog === 'resmi') query.set('catalog', router.query.catalog);
    const target = query.toString() ? `/products?${query.toString()}` : '/products';
    router.replace(target);
  }, [router.isReady, router.query.q, router.query.catalog, router]);

  return (
    <main
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px 20px',
        background: '#f8fafc',
        color: '#111827',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section style={{ textAlign: 'center', maxWidth: 420 }}>
        <strong style={{ display: 'block', letterSpacing: '.12em', fontSize: 12, opacity: .65 }}>R2 NUSANTARA</strong>
        <h1 style={{ margin: '10px 0 8px', fontSize: 24 }}>Membuka katalog terbaru…</h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#475569' }}>
          Anda akan diarahkan ke katalog produksi resmi dengan data produk live.
        </p>
      </section>
    </main>
  );
}
