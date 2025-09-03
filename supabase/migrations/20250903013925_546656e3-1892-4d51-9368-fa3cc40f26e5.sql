-- Add admin flag to profiles table (already done)
-- Create a function to identify admin users by email pattern
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_email = 'empresa@admin.local' OR user_email LIKE '%@admin.local';
$$;

-- Create a function to handle admin authentication bypass
CREATE OR REPLACE FUNCTION public.get_admin_subscription_data(user_email text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN public.is_admin_user(user_email) THEN 
      jsonb_build_object(
        'subscribed', true,
        'subscription_tier', 'Enterprise',
        'subscription_end', '2099-12-31T23:59:59Z'
      )
    ELSE 
      jsonb_build_object('subscribed', false)
  END;
$$;

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Admin access bypass" ON public.despesas;
CREATE POLICY "Admin access bypass" ON public.despesas
FOR ALL USING (
  (auth.uid() = user_id) OR 
  (public.is_admin_user(auth.email()))
);

DROP POLICY IF EXISTS "Admin access bypass" ON public.receitas;
CREATE POLICY "Admin access bypass" ON public.receitas
FOR ALL USING (
  (auth.uid() = user_id) OR 
  (public.is_admin_user(auth.email()))
);

DROP POLICY IF EXISTS "Admin access bypass" ON public.categorias;
CREATE POLICY "Admin access bypass" ON public.categorias
FOR ALL USING (
  ((auth.uid() = user_id) OR (user_id IS NULL)) OR 
  (public.is_admin_user(auth.email()))
);