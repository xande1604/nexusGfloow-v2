import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingData {
  nome_treinamento: string;
  instituicao?: string;
  carga_horaria?: number;
  observacoes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { training, existingSkills } = await req.json() as { 
      training: TrainingData;
      existingSkills?: string[];
    };

    console.log('Suggesting skills for training:', training.nome_treinamento);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em desenvolvimento de competências e gestão de pessoas.
Sua tarefa é analisar um treinamento realizado e sugerir as habilidades (skills) que o colaborador provavelmente desenvolveu ou aprimorou.

Retorne as habilidades de forma estruturada, categorizando-as em:
- Technical (habilidades técnicas específicas)
- Soft Skill (habilidades comportamentais)
- Leadership (habilidades de liderança, se aplicável)
- Language (idiomas, se aplicável)

Seja específico e relevante ao conteúdo do treinamento.`;

    const userPrompt = `Analise o seguinte treinamento e sugira as habilidades desenvolvidas:

Nome do Treinamento: ${training.nome_treinamento}
${training.instituicao ? `Instituição: ${training.instituicao}` : ''}
${training.carga_horaria ? `Carga Horária: ${training.carga_horaria} horas` : ''}
${training.observacoes ? `Observações: ${training.observacoes}` : ''}

${existingSkills?.length ? `Skills já cadastradas no sistema (use como referência para manter consistência): ${existingSkills.slice(0, 50).join(', ')}` : ''}

Sugira entre 3 e 8 habilidades que o colaborador provavelmente desenvolveu com este treinamento.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_skills",
              description: "Return suggested skills acquired from the training",
              parameters: {
                type: "object",
                properties: {
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { 
                          type: "string",
                          description: "Nome da habilidade em português"
                        },
                        category: { 
                          type: "string", 
                          enum: ["Technical", "Soft Skill", "Leadership", "Language"],
                          description: "Categoria da habilidade"
                        },
                        description: { 
                          type: "string",
                          description: "Breve descrição de como o treinamento desenvolveu esta habilidade"
                        },
                        relevance: {
                          type: "string",
                          enum: ["high", "medium", "low"],
                          description: "Relevância da habilidade para o treinamento"
                        }
                      },
                      required: ["name", "category", "description", "relevance"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "Resumo do desenvolvimento do colaborador com este treinamento"
                  }
                },
                required: ["skills", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_skills" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos na sua workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Suggested skills:', result.skills?.length || 0);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error suggesting skills:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao sugerir habilidades" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
