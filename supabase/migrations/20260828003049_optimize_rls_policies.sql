
-- ============================================================
-- MIGRATION: RLS Policy Optimization
-- Fixes: auth_rls_initplan (7 WARN), multiple_permissive_policies (2 WARN)
-- Pattern: Replace auth.uid() → (select auth.uid()) for initplan optimization
-- ============================================================

-- === 1. CONVERSATIONS TABLE ===

-- Drop old policies
DROP POLICY IF EXISTS conversations_select_participants ON public.conversations;
DROP POLICY IF EXISTS conversations_insert_creator ON public.conversations;

-- Recreate with (select auth.uid()) pattern
CREATE POLICY conversations_select_participants
  ON public.conversations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT cp.conversation_id
      FROM public.conversation_participants cp
      WHERE cp.user_id = (select auth.uid())
    )
  );

CREATE POLICY conversations_insert_creator
  ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

-- === 2. CONVERSATION_PARTICIPANTS TABLE ===

-- Drop ALL existing policies (including duplicate)
DROP POLICY IF EXISTS participants_select_own_conversations ON public.conversation_participants;
DROP POLICY IF EXISTS participants_select_self_or_conversation_members ON public.conversation_participants;
DROP POLICY IF EXISTS participants_insert_self ON public.conversation_participants;
DROP POLICY IF EXISTS participants_delete_self ON public.conversation_participants;

-- Recreate consolidated policies (no duplicates, optimized)
CREATE POLICY participants_select_own
  ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY participants_insert_self
  ON public.conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY participants_delete_self
  ON public.conversation_participants
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- === 3. MESSAGES TABLE ===

-- Drop ALL existing policies (including duplicate)
DROP POLICY IF EXISTS messages_select_participants ON public.messages;
DROP POLICY IF EXISTS messages_insert_sender_participant ON public.messages;
DROP POLICY IF EXISTS messages_insert_participants ON public.messages;
DROP POLICY IF EXISTS messages_delete_sender ON public.messages;

-- Recreate consolidated policies (no duplicates, optimized)
CREATE POLICY messages_select_participants
  ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT cp.conversation_id
      FROM public.conversation_participants cp
      WHERE cp.user_id = (select auth.uid())
    )
  );

CREATE POLICY messages_insert_sender
  ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND conversation_id IN (
      SELECT cp.conversation_id
      FROM public.conversation_participants cp
      WHERE cp.user_id = (select auth.uid())
    )
  );

CREATE POLICY messages_delete_sender
  ON public.messages
  FOR DELETE TO authenticated
  USING (sender_id = (select auth.uid()));
