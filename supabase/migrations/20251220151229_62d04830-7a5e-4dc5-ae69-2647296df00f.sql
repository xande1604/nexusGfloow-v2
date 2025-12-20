-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a table for employee training records
CREATE TABLE public.treinamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  nome_treinamento TEXT NOT NULL,
  instituicao TEXT,
  data_inicio DATE,
  data_conclusao DATE,
  carga_horaria INTEGER,
  certificado_url TEXT,
  status TEXT DEFAULT 'concluido' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
  observacoes TEXT,
  owner_admin_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.treinamentos ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view training records" 
ON public.treinamentos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create training records" 
ON public.treinamentos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update training records" 
ON public.treinamentos 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete training records" 
ON public.treinamentos 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_treinamentos_updated_at
BEFORE UPDATE ON public.treinamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_treinamentos_employee_id ON public.treinamentos(employee_id);
CREATE INDEX idx_treinamentos_status ON public.treinamentos(status);