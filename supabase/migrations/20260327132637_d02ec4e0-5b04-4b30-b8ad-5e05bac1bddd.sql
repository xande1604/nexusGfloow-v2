-- Limpar todos os colaboradores nexus para reimportação com vínculos corretos
-- Primeiro limpar dados vinculados (cascade deveria cuidar, mas garantir)
DELETE FROM public.nexus_employees WHERE true;