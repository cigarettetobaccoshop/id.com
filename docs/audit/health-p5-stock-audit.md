# Audit Angka Stok — R2 NUSANTARA

Tanggal pemeriksaan: 17 Oktober 2026  
Target database: Supabase `r2.com` (`zgsbtexngystdmakqjyi`)  
Mode: read-only; tidak ada data yang diubah.

## Temuan terukur

| Sumber | Total baris | Baris dengan kuantitas 100 | Nilai kuantitas berbeda |
|---|---:|---:|---:|
| `public."Produk Ready Stok"` | 233 | 233 | 1 |
| `public.products` | 233 | 226 | 3 |

Pada `public.products`, distribusi kuantitas yang tersimpan adalah: 99 (1 produk), 100 (226 produk), dan 101 (6 produk). Pada `public."Produk Ready Stok"`, semua 233 baris memiliki `Variant Inventory Qty = 100`.

## Jalur data yang terlihat pada kode

- `pages/api/products.js` membaca `public.products` dan memetakan `Variant Inventory Qty` menjadi `null` secara eksplisit.
- `pages/products.js` juga memetakan produk dari tabel `products` dan mengatur `Variant Inventory Qty` menjadi `null`.
- `components/catalog/ProductCard.jsx` menampilkan kuantitas numerik hanya bila field tersebut berisi angka; bila `null`, kartu menampilkan status ready stock tanpa jumlah spesifik.

Dengan demikian, pada jalur kode ini angka 100 tidak dikirim ke kartu katalog melalui `/api/products` maupun pemetaan halaman `/products`. Nilai seragam 100 memang tersimpan di tabel impor `Produk Ready Stok`, tetapi pemeriksaan read-only ini tidak dapat membuktikan apakah nilai tersebut berasal dari stok Shopify asli, nilai default saat impor/sinkronisasi, atau proses lain.

## Kesimpulan dan rekomendasi

1. Jangan mengubah stok atau menyembunyikan data melalui perubahan database.
2. Audit fungsi sinkronisasi/import Shopify dan riwayat sumber data untuk memastikan asal 100.
3. Jika pemilik menghendaki tampilan tanpa angka sampai sumber diverifikasi, ajukan perubahan UI terpisah setelah menilai dampak pada seluruh halaman dan alur stok.
4. Selidiki perbedaan antara jalur katalog saat ini dan tampilan Production yang dilaporkan, karena kode yang diperiksa tidak mengirim angka 100 ke kartu produk.

## Status

Audit database read-only selesai. Asal historis nilai 100 belum dapat dipastikan tanpa memeriksa alur sinkronisasi dan sumber Shopify. Tidak ada data yang diubah.
