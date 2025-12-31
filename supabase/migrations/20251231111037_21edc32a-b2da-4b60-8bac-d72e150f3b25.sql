-- Atualizar RLS para permitir que MASTER ADMIN (created_by_admin_id IS NULL) veja dados com owner_admin_id = NULL
-- Isso inclui os dados existentes e os dados de demonstração

-- Atualizar política para employees
DROP POLICY IF EXISTS "Admins podem ver seus próprios dados" ON public.employees;

CREATE POLICY "Admins podem ver seus próprios dados"
ON public.employees
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    -- Pode ver seus próprios dados
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- MASTER ADMIN (created_by_admin_id IS NULL) pode ver dados com owner_admin_id = NULL (dados existentes/legados)
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
    -- OU qualquer admin sem dados próprios pode ver dados DEMO
    OR (
      owner_admin_id IS NULL
      AND chave_empresa LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar política para empresas
DROP POLICY IF EXISTS "Admins podem ver suas empresas" ON public.empresas;

CREATE POLICY "Admins podem ver suas empresas"
ON public.empresas
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- MASTER ADMIN pode ver dados com owner_admin_id = NULL
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
    -- OU qualquer admin sem dados próprios pode ver dados DEMO
    OR (
      owner_admin_id IS NULL
      AND codempresa LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar política para cargos
DROP POLICY IF EXISTS "Admins podem ver seus cargos" ON public.cargos;

CREATE POLICY "Admins podem ver seus cargos"
ON public.cargos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- MASTER ADMIN pode ver dados com owner_admin_id = NULL
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
    -- OU qualquer admin sem dados próprios pode ver dados DEMO
    OR (
      owner_admin_id IS NULL
      AND codigocargo LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar política para centros de custo
DROP POLICY IF EXISTS "Admins podem ver seus centros de custo" ON public.centrodecustos;

CREATE POLICY "Admins podem ver seus centros de custo"
ON public.centrodecustos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- MASTER ADMIN pode ver dados com owner_admin_id = NULL
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
    -- OU qualquer admin sem dados próprios pode ver dados DEMO
    OR (
      owner_admin_id IS NULL
      AND codcentrodecustos LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar políticas de UPDATE e DELETE para master admin poder editar dados legados
DROP POLICY IF EXISTS "Admins podem atualizar colaboradores" ON public.employees;

CREATE POLICY "Admins podem atualizar colaboradores"
ON public.employees
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- MASTER ADMIN pode editar dados com owner_admin_id = NULL
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

DROP POLICY IF EXISTS "Admins podem deletar colaboradores" ON public.employees;

CREATE POLICY "Admins podem deletar colaboradores"
ON public.employees
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- MASTER ADMIN pode deletar dados com owner_admin_id = NULL
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

-- Atualizar UPDATE/DELETE para empresas
DROP POLICY IF EXISTS "Admins podem atualizar suas empresas" ON public.empresas;

CREATE POLICY "Admins podem atualizar suas empresas"
ON public.empresas
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

DROP POLICY IF EXISTS "Admins podem deletar suas empresas" ON public.empresas;

CREATE POLICY "Admins podem deletar suas empresas"
ON public.empresas
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

-- Atualizar UPDATE/DELETE para cargos
DROP POLICY IF EXISTS "Admins podem atualizar seus cargos" ON public.cargos;

CREATE POLICY "Admins podem atualizar seus cargos"
ON public.cargos
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

DROP POLICY IF EXISTS "Admins podem deletar seus cargos" ON public.cargos;

CREATE POLICY "Admins podem deletar seus cargos"
ON public.cargos
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

-- Atualizar UPDATE/DELETE para centros de custo
DROP POLICY IF EXISTS "Admins podem atualizar seus centros de custo" ON public.centrodecustos;

CREATE POLICY "Admins podem atualizar seus centros de custo"
ON public.centrodecustos
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);

DROP POLICY IF EXISTS "Admins podem deletar seus centros de custo" ON public.centrodecustos;

CREATE POLICY "Admins podem deletar seus centros de custo"
ON public.centrodecustos
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = auth.uid()) IS NULL
    )
  )
);