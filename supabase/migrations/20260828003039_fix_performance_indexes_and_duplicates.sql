
-- ============================================================
-- MIGRATION: Performance Optimization - Indexes & Duplicates
-- Fixes: unindexed_foreign_keys, duplicate_index, unused_index
-- ============================================================

-- 1. ADD missing indexes on foreign key columns
--    Fix: conversations_created_by_fkey unindexed
CREATE INDEX IF NOT EXISTS idx_conversations_created_by
  ON public.conversations (created_by);

--    Fix: messages_sender_id_fkey unindexed
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON public.messages (sender_id);

--    Fix: messages_conversation_id (already has FK, ensure indexed)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages (conversation_id);

-- 2. DROP duplicate index on conversation_participants
--    idx_conversation_participants_user_id and idx_participants_user are identical
--    Keep idx_conversation_participants_user_id (naming convention), drop the other
DROP INDEX IF EXISTS public.idx_participants_user;

-- 3. Add composite index for messages (conversation_id + created_at)
--    Optimizes message retrieval in conversation order
DROP INDEX IF EXISTS public.idx_messages_conversation_created_at;
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
  ON public.messages (conversation_id, created_at);

-- 4. Add product search index using trigram (pg_trgm)
--    Enables fast ILIKE/search queries on product name
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);

-- 5. Add index on products(is_active) for filtered queries
CREATE INDEX IF NOT EXISTS idx_products_active
  ON public.products (is_active)
  WHERE is_active = true;

-- 6. Add index on orders(order_code) for lookup by code
CREATE INDEX IF NOT EXISTS idx_orders_order_code
  ON public.orders (order_code);

-- 7. Add composite index on orders(status, created_at) for admin dashboard
CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON public.orders (status, created_at);
