-- Criar profile para usuário atual se não existir
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Buscar usuário atual e criar profile se necessário
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE p.user_id IS NULL
    LOOP
        INSERT INTO public.profiles (user_id, display_name)
        VALUES (
            user_record.id,
            COALESCE(
                user_record.raw_user_meta_data ->> 'full_name',
                split_part(user_record.email, '@', 1)
            )
        );
        
        RAISE LOG 'Created profile for user: %', user_record.email;
    END LOOP;
END $$;