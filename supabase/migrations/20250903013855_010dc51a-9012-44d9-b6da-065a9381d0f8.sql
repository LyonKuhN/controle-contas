-- Add admin flag to profiles table
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create admin user for "empresa"
DO $$
DECLARE
    empresa_user_id UUID;
BEGIN
    -- Check if empresa user already exists
    SELECT id INTO empresa_user_id FROM auth.users WHERE email = 'empresa@admin.local';
    
    -- If not exists, we'll need to insert manually (this is a special admin user)
    IF empresa_user_id IS NULL THEN
        -- Insert a placeholder user ID (in production, you'd create this through auth.users)
        empresa_user_id := '00000000-0000-0000-0000-000000000001'::UUID;
        
        -- Insert profile for empresa user
        INSERT INTO public.profiles (user_id, display_name, is_admin) 
        VALUES (empresa_user_id, 'Empresa', true)
        ON CONFLICT (user_id) DO UPDATE SET 
            display_name = 'Empresa',
            is_admin = true;
            
        -- Insert subscriber record with permanent subscription
        INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end) 
        VALUES (empresa_user_id, 'empresa@admin.local', true, 'Enterprise', '2099-12-31 23:59:59+00'::timestamptz)
        ON CONFLICT (email) DO UPDATE SET 
            subscribed = true,
            subscription_tier = 'Enterprise',
            subscription_end = '2099-12-31 23:59:59+00'::timestamptz;
    END IF;
END $$;