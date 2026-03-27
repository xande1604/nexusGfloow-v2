
-- Atualizar get_owner_admin_id para resolver recursivamente até o admin raiz
CREATE OR REPLACE FUNCTION public.get_owner_admin_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH RECURSIVE chain AS (
    -- Ponto de partida: o próprio usuário
    SELECT user_id, created_by_admin_id, role
    FROM public.user_roles
    WHERE user_id = _user_id
    
    UNION ALL
    
    -- Subir na cadeia até encontrar o admin raiz (created_by_admin_id IS NULL)
    SELECT ur.user_id, ur.created_by_admin_id, ur.role
    FROM public.user_roles ur
    INNER JOIN chain c ON ur.user_id = c.created_by_admin_id
    WHERE c.created_by_admin_id IS NOT NULL
  )
  SELECT user_id FROM chain WHERE created_by_admin_id IS NULL LIMIT 1;
$function$;
