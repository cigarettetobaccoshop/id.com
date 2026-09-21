# Supabase Storage — Status Audit

Helper Storage repository tetap dipertahankan, tetapi dokumentasi demo lama tidak lagi dianggap sebagai production API.

## Helper yang dipertahankan
`lib/supabaseStorage.js` tetap ada karena static import absence saja tidak cukup untuk membuktikan bahwa helper Storage aman dihapus. Utility ini harus diaudit kembali hanya jika seluruh kemungkinan consumer internal, dynamic, dan operational sudah terverifikasi.

## Route demo lama
Route berikut dari dokumentasi lama bukan referensi production:
- `/storage-demo`
- `/api/upload`
- `/api/files`

Jangan membuat endpoint tersebut kembali hanya untuk memenuhi dokumentasi lama.

## Security
Untuk Storage yang benar-benar digunakan:
- validasi tipe dan ukuran file;
- gunakan RLS/policy yang sesuai;
- jangan expose credential privileged;
- gunakan signed URL untuk objek private;
- batasi origin/CORS sesuai kebutuhan.

Setiap perubahan Storage wajib melewati build, deployment, dan smoke test production.
