-- Create table for invite history
CREATE TABLE public.evaluation_invite_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.employee_evaluations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('self_assessment', 'manager_evaluation')),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by_admin_id UUID DEFAULT auth.uid(),
  status TEXT NOT NULL DEFAULT 'sent',
  owner_admin_id UUID DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.evaluation_invite_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Admins podem gerenciar histórico de convites"
ON public.evaluation_invite_history
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX idx_invite_history_evaluation_id ON public.evaluation_invite_history(evaluation_id);
CREATE INDEX idx_invite_history_sent_at ON public.evaluation_invite_history(sent_at DESC);