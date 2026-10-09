
-- ============================================================
-- MIGRATION: Fix extension schema + remove duplicate RLS policies
-- ============================================================

-- === 1. MOVE EXTENSIONS OUT OF public SCHEMA ===

-- Drop trigram index first, then move extension
DROP INDEX IF EXISTS public.idx_products_name_trgm;
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
-- Recreate trigram index using extensions schema operator
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name extensions.gin_trgm_ops);

-- Move citext to extensions schema
ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN email TYPE text USING email::text;
DROP EXTENSION IF EXISTS citext;
CREATE EXTENSION IF NOT EXISTS citext SCHEMA extensions;
-- Re-apply citext type using schema-qualified type
ALTER TABLE public.newsletter_subscribers
  ALTER COLUMN email TYPE extensions.citext USING email::extensions.citext;

-- === 2. DROP OLD DUPLICATE RLS POLICIES ===

-- Products: drop old "Public read active products" (keeping products_select_active)
DROP POLICY IF EXISTS "Public read active products" ON public.products;

-- Orders: drop old "Public can insert orders" (keeping orders_insert_public)
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;

-- Newsletter: drop old "Public can subscribe" (keeping newsletter_insert_public)
DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscribers;

-- === 3. Clean up old unused indexes from initial migration ===
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_segment;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_created_at;
