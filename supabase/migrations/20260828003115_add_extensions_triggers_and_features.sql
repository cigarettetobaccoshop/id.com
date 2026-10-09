
-- ============================================================
-- MIGRATION: Extensions, Triggers & Professional Features
-- ============================================================

-- === 1. ENABLE EXTENSIONS ===

-- citext: case-insensitive text (untuk email newsletter)
CREATE EXTENSION IF NOT EXISTS citext;

-- pg_trgm: sudah enabled di migration sebelumnya, pastikan
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- === 2. UPDATE newsletter_subscribers.email to citext ===
-- Memastikan email unik case-insensitive (Test@example.com == test@example.com)
ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN email TYPE citext USING email::citext;

-- === 3. AUTO-UPDATE updated_at TRIGGER ===
-- Function untuk auto-update kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger untuk products.updated_at
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Tambah kolom updated_at ke orders jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Trigger untuk orders.updated_at
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- === 4. GRANT proper permissions untuk API access ===

-- Products: publik bisa baca produk aktif
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;

-- Orders: hanya authenticated/service_role bisa insert
GRANT INSERT ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO service_role;

-- Newsletter: anon bisa subscribe (insert), tidak bisa read
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO service_role;

-- === 5. RLS POLICIES untuk products & orders & newsletter ===

-- Products: siapapun bisa baca produk aktif
DROP POLICY IF EXISTS products_select_active ON public.products;
CREATE POLICY products_select_active
  ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Orders: user hanya bisa lihat order miliknya (jika ada auth)
-- service_role bypass RLS jadi admin bisa akses semua
DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own
  ON public.orders
  FOR SELECT TO authenticated
  USING (true); -- Akan dipersempit dengan auth jika login diaktifkan

DROP POLICY IF EXISTS orders_insert_public ON public.orders;
CREATE POLICY orders_insert_public
  ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Newsletter: siapapun bisa subscribe
DROP POLICY IF EXISTS newsletter_insert_public ON public.newsletter_subscribers;
CREATE POLICY newsletter_insert_public
  ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- === 6. UPDATED AT trigger untuk products sudah aktif ===
-- Pastikan semua product memiliki updated_at terisi
UPDATE public.products SET updated_at = now() WHERE updated_at IS NULL;
