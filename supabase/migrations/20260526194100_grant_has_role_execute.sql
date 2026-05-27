-- Grant authenticated users permission to execute the role-check helper used by RLS policies.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_role TO authenticated;

-- If the function doesn't exist, here's a typical implementation
CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
$$;
