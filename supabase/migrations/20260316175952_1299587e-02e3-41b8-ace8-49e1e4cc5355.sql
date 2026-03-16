
-- Remove legacy "Users can ..." policies on centrodecustos that conflict with tenant-scoped ones
DROP POLICY IF EXISTS "Users can insert centrodecustos" ON public.centrodecustos;
DROP POLICY IF EXISTS "Users can update centrodecustos" ON public.centrodecustos;
DROP POLICY IF EXISTS "Users can delete centrodecustos" ON public.centrodecustos;
