-- Add 'publicado' column to vagas table to control portal visibility
ALTER TABLE public.vagas ADD COLUMN IF NOT EXISTS publicado boolean DEFAULT false;

-- Create index for faster filtering of published jobs
CREATE INDEX IF NOT EXISTS idx_vagas_publicado ON public.vagas (publicado) WHERE publicado = true;

-- Allow anonymous users to view published jobs
CREATE POLICY "Anyone can view published vagas" 
ON public.vagas 
FOR SELECT 
USING (publicado = true);

-- Allow anonymous users to insert candidatos
CREATE POLICY "Anyone can insert candidatos" 
ON public.candidatos 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous users to insert candidato_skills
CREATE POLICY "Anyone can insert candidato_skills" 
ON public.candidato_skills 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous users to insert candidaturas for published vagas
CREATE POLICY "Anyone can apply to published vagas" 
ON public.candidaturas 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.vagas WHERE id = vaga_id AND publicado = true)
);

-- Allow anonymous uploads to curriculos bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('curriculos', 'curriculos', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for anonymous uploads to curriculos bucket
CREATE POLICY "Anyone can upload curriculos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'curriculos');

-- Policy for authenticated users to read curriculos
CREATE POLICY "Authenticated users can read curriculos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'curriculos' AND auth.role() = 'authenticated');