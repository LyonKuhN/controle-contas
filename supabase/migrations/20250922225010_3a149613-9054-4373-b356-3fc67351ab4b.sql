-- Atualiza a função que identifica usuários admin para incluir mais um e-mail admin
create or replace function public.is_admin_user(user_email text)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $function$
  select
    lower(user_email) = 'empresa@admin.local'
    or lower(user_email) like '%@admin.local'
    or lower(user_email) = 'hlyon1311@gmail.com'
    or lower(user_email) = 'jcestacionamentovideira@gmail.com';
$function$;