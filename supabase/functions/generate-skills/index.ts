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
    const { roleTitle } = await req.json();

    if (!roleTitle) {
      return new Response(
        JSON.stringify({ error: 'roleTitle is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Você é um especialista em RH e gestão de talentos. Com base no cargo "${roleTitle}", gere uma lista de habilidades necessárias para esse cargo.

Retorne EXATAMENTE no formato JSON abaixo, sem nenhum texto adicional:
{
  "skills": [
    {
      "name": "Nome da habilidade",
      "category": "Technical" | "Soft Skill" | "Language" | "Leadership",
      "description": "Breve descrição da habilidade"
    }
  ]
}

Regras:
- Gere entre 8 e 15 habilidades relevantes
- Distribua entre as categorias: Technical (habilidades técnicas), Soft Skill (comportamentais), Language (idiomas se aplicável), Leadership (liderança se aplicável)
- Use nomes concisos e profissionais
- A descrição deve ter no máximo 100 caracteres
- Considere o mercado brasileiro`;

    console.log('Generating skills for role:', roleTitle);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em RH que sempre responde em JSON válido.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }

    const parsedSkills = JSON.parse(jsonContent);
    console.log('Generated skills:', parsedSkills.skills?.length || 0);

    return new Response(
      JSON.stringify(parsedSkills),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating skills:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate skills';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
