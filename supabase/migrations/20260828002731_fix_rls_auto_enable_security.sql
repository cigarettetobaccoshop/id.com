
-- Fix security warnings: Revoke public access to rls_auto_enable() SECURITY DEFINER function
-- Advisor: anon_security_definer_function_executable (WARN)
-- Advisor: authenticated_security_definer_function_executable (WARN)

-- 1. Revoke EXECUTE from anon role (public/unauthenticated users)
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;

-- 2. Revoke EXECUTE from authenticated role (signed-in users)
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- 3. Grant EXECUTE only to service_role (server-side admin only)
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;

-- 4. Switch function to SECURITY INVOKER for defense-in-depth
--    This ensures the function runs with the caller's privileges, not the owner's
ALTER FUNCTION public.rls_auto_enable() SECURITY INVOKER;
