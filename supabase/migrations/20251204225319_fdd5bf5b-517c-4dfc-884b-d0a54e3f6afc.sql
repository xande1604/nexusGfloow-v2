-- Add salary fields to cargos table
ALTER TABLE public.cargos 
ADD COLUMN IF NOT EXISTS salary_min numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS salary_max numeric DEFAULT 0;