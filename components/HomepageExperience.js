import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import styles from './homepage/HomepageModern.module.css'
import { bodyFont, headingFont } from './homepage/fonts'

const WHATSAPP_URL = 'https://wa.me/6285715905079?text=Halo%20R2%20NUSANTARA%2C%20saya%20ingin%20tanya%20produk%20grosir.'
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Malang%2C%20Jawa%20Timur'
const MAP_EMBED_URL = 'https://maps.google.com/maps?q=Malang%2C%20Jawa%20Timur&z=12&output=embed&hl=id'
const EMAIL = 'cigaratetobacoshop@gmail.com'
const ALAMAT_LENGKAP = ''

const benefits = [
  {
    icon: Database,
    title: 'Katalog live',
    description: 'Produk aktif ditampilkan dari katalog yang berjalan.',
  },
  {
    icon: PackageCheck,
    title: 'Stok aktif',
    description: 'Status ketersediaan mengikuti data yang tersedia di sistem.',
  },
  {
    icon: Truck,
    title: 'Distribusi nasional',
    description: 'Pengiriman disiapkan dari gudang Malang ke berbagai kota.',
  },
  {
    icon: ShieldCheck,
    title: 'Alur profesional',
    description: 'Pemesanan melalui katalog, checkout, dan konfirmasi admin.',
  },
]

const orderSteps = [
  {
    icon: ShoppingBag,
    title: 'Pilih produk',
    description: 'Jelajahi katalog dan pilih produk yang dibutuhkan.',
  },
  {
    icon: CheckCircle2,
    title: 'Lanjut checkout',
    description: 'Periksa keranjang dan lengkapi informasi pemesanan.',
  },
  {
    icon: MessageCircle,
    title: 'Konfirmasi admin',
    description: 'Admin membantu konfirmasi detail pesanan dan pengiriman.',
  },
]

const faqs = [
  ['Bagaimana cara melakukan pemesanan?', 'Pilih produk dari katalog, masukkan ke keranjang, lanjut checkout, lalu ikuti proses konfirmasi admin.'],
  ['Apakah katalog menggunakan data stok live?', 'Ya. Katalog di beranda menampilkan produk aktif dan ketersediaan stok yang diperbarui langsung dari sistem kami.'],
  ['Berapa minimal program gratis ongkir?', 'Program subsidi ongkir dimulai dari minimal 1 bal (20 slop), mengikuti ketentuan operasional yang berlaku.'],
  ['Di mana lokasi gudang?', 'Gudang R2 NUSANTARA berada di Malang, Jawa Timur. Detail kunjungan dapat dikonfirmasi terlebih dahulu.'],
]

const formatPrice = (value) => {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) return 'Harga belum tersedia'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

function ProductMockup() {
  return (
    <span className={styles.pack} aria-hidden="true">
      R2
    </span>
  )
}

function ProductSkeleton({ featured = false }) {
  return featured ? (
    <div className={styles.skeleton} aria-hidden="true" />
  ) : (
    <article className={styles.productCard} aria-hidden="true">
      <div className={styles.skeleton} style={{ minHeight: 164, borderRadius: 0 }} />
      <div className={styles.productInfo}>
        <div className={styles.skeleton} style={{ minHeight: 14 }} />
        <div className={styles.skeleton} style={{ minHeight: 14, marginTop: 8 }} />
      </div>
    </article>
  )
}

export default function HomepageExperience() {
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState(false)
  const [openFaq, setOpenFaq] = useState(-1)

  const featuredProducts = useMemo(() => products.slice(0, 4), [products])

  useEffect(() => {
    let active = true
    fetch('/api/products?limit=8', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('catalog')
        return response.json()
      })
      .then((payload) => {
        if (!active) return
        setProducts(Array.isArray(payload?.data) ? payload.data : [])
        setCount(Number(payload?.count) || Number(payload?.meta?.total) || 0)
        setDataError(false)
      })
      .catch(() => {
        if (!active) return
        setProducts([])
        setCount(0)
        setDataError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-home-reveal]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }
    elements.forEach((element) => element.setAttribute('data-reveal-ready', 'true'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const catalogUnavailable = dataError || (!loading && featuredProducts.length === 0)

  return (
    <>
      <Head>
        <title>R2 NUSANTARA — Gudang Distributor R2 &amp; Resmi</title>
        <meta name="description" content="R2 NUSANTARA — gudang distributor Malang dengan katalog produk aktif, alur pemesanan terstruktur, dan distribusi nasional." />
        <meta name="theme-color" content="#0F3D6E" />
      </Head>

      <main id="main-content" className={`${styles.page} ${bodyFont.variable} ${headingFont.variable}`}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy} data-home-reveal>
              <span className={styles.eyebrow}>OFFICIAL DISTRIBUTOR</span>
              <h1 id="home-title" className={styles.heroTitle}>
                Grosir langsung dari <em>gudang Malang.</em>
              </h1>
              <p className={styles.heroLead}>
                Katalog produk aktif, alur pemesanan terstruktur, dan pengiriman ke seluruh Indonesia.
              </p>
              <div className={styles.heroActions}>
                <Link href="/products" className={styles.primaryButton}>
                  Lihat Katalog <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a href={WHATSAPP_URL} className={styles.secondaryButton} target="_blank" rel="noreferrer">
                  <MessageCircle size={17} aria-hidden="true" /> Chat WhatsApp
                </a>
              </div>
              <div className={styles.heroFacts} aria-label="Informasi operasional">
                <span className={styles.heroFact}><MapPin size={16} aria-hidden="true" /> Gudang Malang</span>
                <span className={styles.heroFact}><Clock3 size={16} aria-hidden="true" /> Senin–Sabtu, 08.00–17.00 WIB</span>
                <span className={styles.heroFact}><Truck size={16} aria-hidden="true" /> Distribusi nasional</span>
              </div>
            </div>

            <aside className={styles.featuredPanel} aria-label="Produk unggulan dari katalog" aria-busy={loading} data-home-reveal>
              <div className={styles.panelHeader}>
                <span>Produk pilihan dari katalog</span>
                <small>{loading ? 'Memuat' : dataError ? 'Pembaruan' : `${count.toLocaleString('id-ID')} produk aktif`}</small>
              </div>
              {loading ? (
                <div className={styles.featuredList} role="status" aria-label="Memuat katalog produk">
                  {Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} featured />)}
                </div>
              ) : catalogUnavailable ? (
                <div className={styles.stateMessage} role="status">
                  <strong>Katalog sedang diperbarui</strong>
                  <p>Hubungi admin melalui WhatsApp untuk informasi produk.</p>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.secondaryButton}>
                    Hubungi admin <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              ) : (
                <div className={styles.featuredList}>
                  {featuredProducts.map((product) => (
                    <div className={styles.featuredItem} key={product['Variant SKU'] || product.Handle || product.Title}>
                      <span className={styles.productVisual}><ProductMockup /></span>
                      <span className={styles.featuredMeta}>
                        <strong className={styles.featuredName}>{product.Title || product.Handle || 'Produk R2 NUSANTARA'}</strong>
                        <small className={styles.featuredCategory}>{product.Type || product.Catalog || 'Produk grosir'}</small>
                      </span>
                      <strong className={styles.featuredPrice}>{formatPrice(product['Variant Price'])}</strong>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className={styles.section} id="keunggulan" aria-labelledby="benefits-title">
          <div className={styles.sectionHeading} data-home-reveal>
            <span>R2 NUSANTARA</span>
            <h2 id="benefits-title">Dukungan distribusi yang lebih terarah.</h2>
            <p>Informasi katalog dan proses pemesanan disajikan dengan jelas dari awal.</p>
          </div>
          <div className={styles.benefitsGrid}>
            {benefits.map(({ icon: Icon, title, description }) => (
              <article className={styles.benefitCard} key={title} data-home-reveal>
                <span className={styles.iconBox}><Icon size={22} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.orderSection} aria-labelledby="order-title">
          <div className={styles.orderInner}>
            <div className={styles.sectionHeading} data-home-reveal>
              <span>CARA ORDER</span>
              <h2 id="order-title">Tiga langkah pemesanan.</h2>
              <p>Alur sederhana untuk membantu proses pemesanan lebih terstruktur.</p>
            </div>
            <div className={styles.orderSteps}>
              {orderSteps.map(({ icon: Icon, title, description }, index) => (
                <article className={styles.step} key={title} data-home-reveal>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <Icon size={21} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.productsSection}`} aria-labelledby="products-title">
          <div className={styles.sectionHeading} data-home-reveal>
            <span>KATALOG R2 &amp; RESMI</span>
            <h2 id="products-title">Produk unggulan.</h2>
            <p>Produk ditampilkan berdasarkan data katalog yang tersedia saat halaman dibuka.</p>
          </div>

          {loading ? (
            <div className={styles.productsGrid} role="status" aria-label="Memuat produk">
              {Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}
            </div>
          ) : catalogUnavailable ? (
            <div className={styles.stateMessage}>
              <strong>Katalog sedang diperbarui</strong>
              <p>Hubungi admin melalui WhatsApp untuk informasi produk.</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.primaryButton}>
                Chat WhatsApp <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {featuredProducts.map((product) => {
                const title = product.Title || product.Handle || 'Produk R2 NUSANTARA'
                const available = product.Published === true || product.Status === 'active'
                return (
                  <article className={styles.productCard} key={product['Variant SKU'] || product.Handle || title} data-home-reveal>
                    <div className={styles.productVisualLarge}><ProductMockup /></div>
                    <div className={styles.productInfo}>
                      <span className={styles.productCategory}>{product.Type || product.Catalog || 'Produk grosir'}</span>
                      <h3 className={styles.productName}>{title}</h3>
                      <strong className={styles.productPrice}>{formatPrice(product['Variant Price'])}</strong>
                      <span className={styles.productStock}>{available ? (product['Stock Status'] || 'Ready stock') : 'Ketersediaan dikonfirmasi admin'}</span>
                      <Link className={styles.productLink} href="/products">
                        Lihat produk <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
          <div className={styles.sectionFooter}>
            <Link href="/products" className={styles.primaryButton}>
              Lihat semua produk <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`} id="faq" aria-labelledby="faq-title">
          <div className={styles.sectionHeading} data-home-reveal>
            <span>BANTUAN</span>
            <h2 id="faq-title">Pertanyaan yang sering diajukan.</h2>
            <p>Informasi singkat sebelum Anda menghubungi tim R2 NUSANTARA.</p>
          </div>
          <div className={styles.faqList}>
            {faqs.map(([question, answer], index) => {
              const isOpen = openFaq === index
              const answerId = `r2-home-faq-answer-${index + 1}`
              return (
                <article className={styles.faqItem} key={question} data-home-reveal>
                  <h3>
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      {question}
                      <ChevronDown size={19} aria-hidden="true" />
                    </button>
                  </h3>
                  {isOpen && <div className={styles.faqAnswer} id={answerId} role="region">{answer}</div>}
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.section} id="lokasi-gudang" aria-labelledby="location-title">
          <div className={styles.sectionHeading} data-home-reveal>
            <span>LOKASI</span>
            <h2 id="location-title">Gudang R2 NUSANTARA.</h2>
            <p>Lokasi operasional di Malang, Jawa Timur.</p>
          </div>
          <div className={styles.locationGrid}>
            <div className={styles.locationCard} data-home-reveal>
              <span className={styles.eyebrow}>GUDANG MALANG</span>
              <h3>Malang, Jawa Timur</h3>
              <p>Untuk detail kunjungan dan informasi operasional, silakan hubungi admin terlebih dahulu.</p>
              <div className={styles.locationDetail}><Clock3 size={18} aria-hidden="true" /> Senin–Sabtu, 08.00–17.00 WIB</div>
              <div className={styles.locationDetail}><Truck size={18} aria-hidden="true" /> Distribusi ke seluruh Indonesia</div>
              {ALAMAT_LENGKAP && <div className={styles.locationDetail}><MapPin size={18} aria-hidden="true" /> {ALAMAT_LENGKAP}</div>}
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className={styles.mapLink}>
                Buka Google Maps <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.mapFrame} data-home-reveal>
              <iframe
                src={MAP_EMBED_URL}
                title="Peta area Gudang R2 NUSANTARA di Malang, Jawa Timur"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div>
              <Link href="/" className={styles.footerBrand} aria-label="R2 NUSANTARA — Beranda">
                <span className={styles.brandLogo}><img src="/assets/logo/logo.png" alt="" width="48" height="48" /></span>
                <strong>R2 NUSANTARA</strong>
              </Link>
              <p className={styles.footerDescription}>Gudang distributor R2 &amp; Resmi untuk kebutuhan toko dan pembelian grosir.</p>
            </div>
            <nav className={styles.footerLinks} aria-label="Navigasi footer">
              <strong className={styles.footerTitle}>NAVIGASI</strong>
              <Link href="/">Beranda</Link>
              <Link href="/products">Katalog produk</Link>
              <Link href="/checkout">Keranjang</Link>
              <Link href="/contact">Kontak</Link>
              <Link href="/lokasi">Lokasi gudang</Link>
              <Link href="/login">Login Admin</Link>
            </nav>
            <div className={styles.footerContact}>
              <strong className={styles.footerTitle}>HUBUNGI KAMI</strong>
              <a href="https://wa.me/6285715905079" target="_blank" rel="noreferrer"><MessageCircle size={17} aria-hidden="true" /> +62 857-1590-5079</a>
              <a href={`mailto:${EMAIL}`}><Mail size={17} aria-hidden="true" /> {EMAIL}</a>
              <span><Clock3 size={17} aria-hidden="true" /> Senin–Sabtu, 08.00–17.00 WIB</span>
              <span><MapPin size={17} aria-hidden="true" /> Gudang Malang, Jawa Timur</span>
            </div>
          </div>
          <div className={styles.footerBottom}>©2026 R2 NUSANTARA - Cigarette Tobacco Shop</div>
        </footer>

        <a className={styles.floatingWhatsapp} href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp">
          <MessageCircle size={25} aria-hidden="true" />
        </a>
      </main>
    </>
  )
}
