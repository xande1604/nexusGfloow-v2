-- Add gestor_id column to employees table (references another employee as manager)
ALTER TABLE public.employees 
ADD COLUMN gestor_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_employees_gestor_id ON public.employees(gestor_id);