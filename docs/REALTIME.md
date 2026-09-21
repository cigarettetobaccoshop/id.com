# Supabase Realtime — Status Audit

Dokumen lama repository sebelumnya mendeskripsikan demo `todos` dan route `/realtime-demo`. Demo tersebut bukan bagian dari arsitektur production R2 Nusantara dan tidak boleh digunakan sebagai panduan endpoint production.

## Production policy
Realtime hanya boleh dianggap aktif untuk fitur yang memiliki implementasi dan dependency nyata di source code production.

## Audit
- Tidak ada route `/api/todos` yang dipertahankan sebagai API production.
- Tidak ada `/realtime-demo` yang menjadi halaman production.
- Jangan membuat tabel/policy `todos` hanya untuk memenuhi dokumentasi lama.
- Modul dan konfigurasi Supabase yang terkait katalog, order, auth, admin, dan monitoring tetap dipertahankan.

## Validasi perubahan
Jika fitur realtime baru benar-benar ditambahkan:
1. Identifikasi tabel dan consumer yang nyata.
2. Validasi RLS.
3. Uji reconnect dan lifecycle subscription.
4. Uji production tanpa mengubah alur order/checkout yang sudah berjalan.
