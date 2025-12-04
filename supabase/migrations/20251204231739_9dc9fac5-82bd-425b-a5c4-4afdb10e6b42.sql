-- Create table for question templates
CREATE TABLE public.review_question_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Technical', 'Cultural', 'Soft Skill', 'Goal')),
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('rating', 'text')),
  owner_admin_id UUID DEFAULT auth.uid(),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_question_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all templates"
ON public.review_question_templates
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own templates"
ON public.review_question_templates
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own templates"
ON public.review_question_templates
FOR UPDATE
USING (owner_admin_id = auth.uid() OR is_default = false);

CREATE POLICY "Users can delete their own templates"
ON public.review_question_templates
FOR DELETE
USING (owner_admin_id = auth.uid() AND is_default = false);

-- Insert default templates
INSERT INTO public.review_question_templates (question, category, type, is_default) VALUES
-- Technical
('Descreva um desafio técnico recente em sua função e como você o abordou, utilizando suas habilidades para encontrar uma solução eficaz.', 'Technical', 'text', true),
('Quais foram as ferramentas ou metodologias que você aprendeu ou aprofundou recentemente e como isso impactou positivamente a qualidade ou eficiência do seu trabalho?', 'Technical', 'text', true),
('Como você avalia sua capacidade de resolver problemas técnicos complexos?', 'Technical', 'rating', true),

-- Cultural
('De que forma você tem contribuído para a inovação em sua área de atuação, seja com novas ideias ou otimização de processos?', 'Cultural', 'text', true),
('Pode compartilhar um exemplo de como você aplica os princípios éticos da empresa em suas decisões e interações diárias?', 'Cultural', 'text', true),
('Em seu dia a dia, como você manifesta os valores da empresa e qual o impacto dessas atitudes no ambiente de trabalho?', 'Cultural', 'text', true),

-- Soft Skill
('Como você colabora com seus colegas e outras equipes para garantir o sucesso dos projetos, superando eventuais obstáculos de comunicação ou alinhamento?', 'Soft Skill', 'text', true),
('Descreva uma situação em que você precisou demonstrar resiliência diante de um imprevisto ou desafio significativo. Como você lidou com a situação?', 'Soft Skill', 'text', true),
('Como você busca e utiliza o feedback recebido para seu aprimoramento contínuo e quais habilidades você prioriza desenvolver a partir dele?', 'Soft Skill', 'text', true),
('Como você avalia sua capacidade de comunicação com a equipe?', 'Soft Skill', 'rating', true),

-- Goal
('Quais são seus principais objetivos de desenvolvimento profissional para os próximos 12 meses e quais passos você está planejando para alcançá-los?', 'Goal', 'text', true),
('Como seus objetivos individuais se alinham com as metas da equipe e da organização, e como você planeja maximizar sua contribuição para esses objetivos?', 'Goal', 'text', true);