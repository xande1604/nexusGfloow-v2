-- Remove duplicate/old permissive policies from employees
DROP POLICY IF EXISTS "Admins podem atualizar seus dados" ON public.employees;
DROP POLICY IF EXISTS "Admins podem deletar seus dados" ON public.employees;
DROP POLICY IF EXISTS "Admins podem inserir dados" ON public.employees;

-- Fix centrodecustos table
DROP POLICY IF EXISTS "Admins podem ver seus centros de custo" ON public.centrodecustos;

CREATE POLICY "Admins podem ver seus centros de custo"
ON public.centrodecustos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix filiais table
DROP POLICY IF EXISTS "Admins podem ver suas filiais" ON public.filiais;

CREATE POLICY "Admins podem ver suas filiais"
ON public.filiais
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix escolaridade table
DROP POLICY IF EXISTS "Admins podem ver suas escolaridades" ON public.escolaridade;

CREATE POLICY "Admins podem ver suas escolaridades"
ON public.escolaridade
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix estadocivil table
DROP POLICY IF EXISTS "Admins podem ver seus estados civis" ON public.estadocivil;

CREATE POLICY "Admins podem ver seus estados civis"
ON public.estadocivil
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix eventos_folha table
DROP POLICY IF EXISTS "Admins podem ver seus eventos" ON public.eventos_folha;

CREATE POLICY "Admins podem ver seus eventos"
ON public.eventos_folha
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix ficha_financeira table
DROP POLICY IF EXISTS "Admins podem ver sua ficha financeira" ON public.ficha_financeira;

CREATE POLICY "Admins podem ver sua ficha financeira"
ON public.ficha_financeira
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix headcount_forecast table
DROP POLICY IF EXISTS "Admins podem ver suas previsões" ON public.headcount_forecast;

CREATE POLICY "Admins podem ver suas previsões"
ON public.headcount_forecast
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);