-- Adicionar campo de email na tabela employees para autoavaliação
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email text;

-- Criar índice para busca por email
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);