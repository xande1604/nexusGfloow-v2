-- Criar tabela para armazenar habilidades adquiridas por colaborador
CREATE TABLE public.employee_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_type TEXT DEFAULT 'training', -- 'training', 'evaluation', 'manual'
  source_id UUID, -- ID do treinamento, avaliação, etc
  source_name TEXT, -- Nome do treinamento ou fonte
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_admin_id UUID,
  UNIQUE(employee_id, skill_name)
);

-- Enable Row Level Security
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view employee skills" 
ON public.employee_skills 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert employee skills" 
ON public.employee_skills 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update employee skills" 
ON public.employee_skills 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete employee skills" 
ON public.employee_skills 
FOR DELETE 
USING (true);

-- Criar índice para melhor performance
CREATE INDEX idx_employee_skills_employee_id ON public.employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill_name ON public.employee_skills(skill_name);