-- Enable RLS on job_roles
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;

-- Policies for job_roles (authenticated users)
CREATE POLICY "Authenticated users can select job_roles"
ON public.job_roles FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert job_roles"
ON public.job_roles FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update job_roles"
ON public.job_roles FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete job_roles"
ON public.job_roles FOR DELETE
USING (auth.role() = 'authenticated');

-- Add missing policies for skills (UPDATE and DELETE)
CREATE POLICY "Authenticated users can update skills"
ON public.skills FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete skills"
ON public.skills FOR DELETE
USING (auth.role() = 'authenticated');