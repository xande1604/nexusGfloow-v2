import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      roleTitle, 
      roleDescription, 
      hardSkills, 
      softSkills, 
      technicalKnowledge,
      companyValues,
      companyMission
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating review questions for role:', roleTitle);

    const prompt = `Você é um especialista em gestão de pessoas e avaliações de desempenho.

Gere 10 perguntas para uma autoavaliação de desempenho considerando:

**Cargo:** ${roleTitle || 'Não especificado'}
**Descrição do Cargo:** ${roleDescription || 'Não especificada'}
**Hard Skills:** ${hardSkills || 'Não especificadas'}
**Soft Skills:** ${softSkills || 'Não especificadas'}
**Conhecimentos Técnicos:** ${technicalKnowledge || 'Não especificados'}
**Valores da Empresa:** ${companyValues?.join(', ') || 'Não especificados'}
**Missão da Empresa:** ${companyMission || 'Não especificada'}

Distribua as perguntas nas seguintes categorias:
- Technical (2-3 perguntas sobre competências técnicas do cargo)
- Cultural (2-3 perguntas sobre alinhamento com valores da empresa)
- Soft Skill (2-3 perguntas sobre habilidades comportamentais)
- Goal (2 perguntas sobre objetivos e desenvolvimento)

Cada pergunta deve:
1. Ser específica para o cargo e contexto da empresa
2. Pedir exemplos concretos quando possível
3. Ser formulada de forma aberta para reflexão

Retorne APENAS um JSON válido no formato:
{
  "questions": [
    {
      "id": "1",
      "question": "pergunta aqui",
      "category": "Technical|Cultural|Soft Skill|Goal",
      "type": "text"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content);

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
