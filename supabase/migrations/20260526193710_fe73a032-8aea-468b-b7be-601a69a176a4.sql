
-- Enforce at most one admin in the system
CREATE UNIQUE INDEX IF NOT EXISTS one_admin_only
  ON public.user_roles ((role))
  WHERE role = 'admin';

-- One-time admin claim: any signed-in user can claim admin,
-- but only while none exists. Subsequent attempts raise.
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Admin already claimed';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin');

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- Allow the UI to detect whether an admin already exists
CREATE OR REPLACE FUNCTION public.admin_claimed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

REVOKE EXECUTE ON FUNCTION public.admin_claimed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_claimed() TO anon, authenticated;
