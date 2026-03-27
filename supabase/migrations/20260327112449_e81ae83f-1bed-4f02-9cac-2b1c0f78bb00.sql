
-- Adicionar flag is_active em cargos e centrodecustos
ALTER TABLE public.cargos ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.centrodecustos ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
