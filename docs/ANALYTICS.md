# Analytics & Performance — Current Status

## Analytics
Repository menggunakan integrasi analytics yang benar-benar terhubung pada source aktif. Utility lama `lib/analytics.js` telah dihapus setelah audit import/usages membuktikan tidak ada consumer production.

Integrasi yang masih aktif tidak boleh dihapus hanya karena tidak memiliki import langsung yang sederhana.

## Performance
Gunakan audit nyata:
- Lighthouse/PageSpeed untuk UX dan Core Web Vitals.
- Vercel runtime/build logs untuk error server.
- Bundle/import audit sebelum menghapus dependency.
- CSS selector/declaration audit yang konservatif.

## Route demo lama
Dokumentasi lama yang merujuk:
- `/analytics-demo`
- `/api/analytics/track`
- `/api/analytics/dashboard`
- `lib/optimization.js`

tidak lagi menjadi referensi production. `lib/optimization.js` juga telah dihapus setelah terbukti tidak digunakan.

## Quality gate
Setiap optimasi harus mempertahankan:
- katalog dan thumbnail;
- cart dan checkout;
- WhatsApp order flow;
- auth/admin;
- API/Supabase;
- mobile layout dan accessibility.

Tidak boleh mengejar skor performa dengan mengorbankan fungsi production.
