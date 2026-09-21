# Protected Cleanup Gate

## Tujuan

Mulai 22 September 2026, cleanup kode tidak lagi dinilai dengan penghapusan file manual. Setiap Pull Request yang berisi perubahan source JS/JSX/TS/TSX melewati gate otomatis sebelum dapat dianggap aman:

1. **Dependency scan** — mendeteksi modul yang dihapus tetapi masih direferensikan oleh import statis/dinamis relatif.
2. **Protected registry** — modul yang pernah terbukti sensitif terhadap build/dependency chain ditolak untuk dihapus secara otomatis.
3. **Production build** — `npm run build` wajib berhasil.
4. **Production verification** — setelah merge, deployment Vercel production wajib READY dan runtime error harus diverifikasi sebelum cleanup dinyatakan selesai.

## Command lokal

```bash
npm ci
npm run audit:protected-deps
npm run build
npm test
```

Pada Pull Request, workflow `.github/workflows/protected-cleanup.yml` menjalankan dependency scan dan production build.

## Prinsip fail-closed

Audit tidak menganggap pencarian kosong sebagai bukti bahwa file aman dihapus. Jika file masih direferensikan, berada di protected registry, atau audit tidak dapat membuktikan keamanan perubahan, gate gagal.

Dependency scan mencakup:

- `import ... from './...'`
- `export ... from './...'`
- `require('./...')`
- `import('./...')`

Khusus dependency dinamis, ini penting karena static search sebelumnya terbukti dapat melewatkan `DeferredWarehouseMap`.

## Protected modules saat ini

- `components/homepage/DeferredWarehouseMap.js`
- `components/BentoGrid.jsx`
- `components/BentoItem.jsx`
- `components/thumbnails/ThumbnailProvider.tsx`
- `lib/curatedBadges.js`
- `utils/supabase-server.ts`
- `lib/supabaseStorage.js`

Daftar ini bersifat konservatif. Modul hanya dapat dikeluarkan setelah dependency graph, build, dan production verification memberikan bukti yang cukup.

## Production gate

CI tidak mempromosikan production deployment secara manual. Setelah PR merge, Vercel melakukan deployment production melalui integrasi Git. Cleanup baru dianggap selesai setelah:

- deployment target production = **READY**
- canonical alias = `r2nusantara-shop.vercel.app`
- runtime errors = **0** pada verification window
- smoke test route/API penting tetap sehat

Gate production ini sengaja dipisahkan dari script dependency scan agar cleanup tidak dapat melewati build/runtime verification hanya karena static scan berhasil.

## Kebijakan cleanup berikutnya

Tidak ada penghapusan file production secara manual di luar PR yang melewati gate ini. Untuk kandidat baru:

**candidate → dependency scan → build → PR/preview → merge → production READY → runtime verification → selesai.**
