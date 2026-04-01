
ALTER TABLE public.cargos
  ADD COLUMN IF NOT EXISTS titulolongocargo text,
  ADD COLUMN IF NOT EXISTS entregas text,
  ADD COLUMN IF NOT EXISTS tags text[];
