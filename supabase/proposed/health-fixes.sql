-- R2 NUSANTARA health-fixes proposal
-- IMPORTANT: PREPARED FOR MANUAL REVIEW ONLY. DO NOT RUN AUTOMATICALLY.
-- Target Supabase project: r2.com (zgsbtexngystdmakqjyi)
-- No Production database changes were executed while preparing this file.
--
-- Review notes:
-- 1) Run policy statements only after reviewing current policy definitions and testing with representative user/admin roles.
-- 2) CREATE/DROP INDEX CONCURRENTLY cannot run inside a transaction block. Execute each concurrent index statement individually in a maintenance window.
-- 3) The two orders SELECT policies are permissive and their predicates overlap. orders_select_own already allows owners OR is_admin(); orders_admin_select allows is_admin(). Their union is semantically redundant, but removal is intentionally not included below; obtain owner approval first.
-- 4) Keep inventory_reservations_order_id_idx; propose removing the duplicate inventory_reservations_order_idx only after confirming no external tooling depends on the name.
-- 5) Do not add a primary key to "Produk Ready Stok" until its Shopify/catalog synchronization dependencies and duplicate-row semantics are mapped. It currently has Shopify-export-like columns including Handle, Variant SKU, and Variant Inventory Qty.
-- 6) Do not remove any of the 10 unused indexes based on low-traffic statistics alone.
--
-- === PROPOSED FORWARD CHANGES (manual review) ===
--
-- A. RLS initplan optimization. Preserve the existing predicates and access semantics.
-- Inspect the exact policies first; these definitions reflect the read-only snapshot collected on 2026-10-17.
DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT TO authenticated
  USING (((SELECT auth.uid()) = user_id) OR is_admin());

DROP POLICY IF EXISTS inventory_reservations_select_own ON public.inventory_reservations;
CREATE POLICY inventory_reservations_select_own ON public.inventory_reservations
  FOR SELECT TO authenticated
  USING (
    is_admin() OR EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = inventory_reservations.order_id
        AND o.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "authenticated audit log insert" ON public.audit_logs;
CREATE POLICY "authenticated audit log insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = (SELECT auth.uid()));

-- B. Duplicate index: keep inventory_reservations_order_id_idx.
-- Run this statement separately (CONCURRENTLY is not allowed inside a transaction block).
-- DROP INDEX CONCURRENTLY IF EXISTS public.inventory_reservations_order_idx;

-- C. Missing foreign-key indexes. Run each statement separately, outside a transaction block.
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_logs_actor_id_idx
--   ON public.audit_logs (actor_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS cash_transactions_created_by_idx
--   ON public.cash_transactions (created_by);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS inventory_movements_created_by_idx
--   ON public.inventory_movements (created_by);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS inventory_opening_balances_created_by_idx
--   ON public.inventory_opening_balances (created_by);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS inventory_opening_balances_item_id_idx
--   ON public.inventory_opening_balances (item_id);

-- === ROLLBACK (manual; only after forward changes have been applied) ===
-- Restore the original orders_select_own predicate captured from pg_policies:
-- DROP POLICY IF EXISTS orders_select_own ON public.orders;
-- CREATE POLICY orders_select_own ON public.orders
--   FOR SELECT TO authenticated
--   USING ((auth.uid() = user_id) OR is_admin());
--
-- Restore the original inventory_reservations_select_own predicate:
-- DROP POLICY IF EXISTS inventory_reservations_select_own ON public.inventory_reservations;
-- CREATE POLICY inventory_reservations_select_own ON public.inventory_reservations
--   FOR SELECT TO authenticated
--   USING (
--     is_admin() OR EXISTS (
--       SELECT 1
--       FROM public.orders o
--       WHERE o.id = inventory_reservations.order_id
--         AND o.user_id = auth.uid()
--     )
--   );
--
-- Restore the original audit-log INSERT policy:
-- DROP POLICY IF EXISTS "authenticated audit log insert" ON public.audit_logs;
-- CREATE POLICY "authenticated audit log insert" ON public.audit_logs
--   FOR INSERT TO authenticated
--   WITH CHECK (actor_id = auth.uid());
--
-- Restore the duplicate index only if it was actually removed and a rollback is required.
-- Run separately, outside a transaction block:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS inventory_reservations_order_idx
--   ON public.inventory_reservations USING btree (order_id);
--
-- Remove any newly added foreign-key indexes if rollback is required. Run each separately:
-- DROP INDEX CONCURRENTLY IF EXISTS public.audit_logs_actor_id_idx;
-- DROP INDEX CONCURRENTLY IF EXISTS public.cash_transactions_created_by_idx;
-- DROP INDEX CONCURRENTLY IF EXISTS public.inventory_movements_created_by_idx;
-- DROP INDEX CONCURRENTLY IF EXISTS public.inventory_opening_balances_created_by_idx;
-- DROP INDEX CONCURRENTLY IF EXISTS public.inventory_opening_balances_item_id_idx;
