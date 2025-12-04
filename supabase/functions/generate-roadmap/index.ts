import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceRole, targetRole, employeeName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating roadmap from "${sourceRole}" to "${targetRole}" for ${employeeName || 'employee'}`);

    const prompt = `Você é um especialista em desenvolvimento de carreira e RH. Crie um roadmap de carreira detalhado para um profissional que atualmente ocupa o cargo de "${sourceRole}" e deseja alcançar o cargo de "${targetRole}"${employeeName ? ` (nome: ${employeeName})` : ''}.

Gere de 3 a 5 etapas progressivas de desenvolvimento, onde cada etapa representa um cargo ou nível intermediário na trajetória de carreira.

Para cada etapa, forneça:
1. Título do cargo/nível intermediário
2. Descrição detalhada das responsabilidades e o que o profissional deve desenvolver (2-3 parágrafos)
3. Lista de 4-6 habilidades requeridas
4. Duração estimada para alcançar esta etapa (em meses)

IMPORTANTE: Responda APENAS em formato JSON válido, sem markdown ou explicações adicionais:
{
  "steps": [
    {
      "title": "Cargo Intermediário 1",
      "description": "Descrição detalhada da etapa...",
      "requiredSkills": ["Habilidade 1", "Habilidade 2", "Habilidade 3", "Habilidade 4"],
      "estimatedDuration": "6-12 meses"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Você é um assistente especializado em desenvolvimento de carreira e gestão de talentos no Brasil. Sempre responda em português do Brasil e em JSON válido." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro no gateway de IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response:", content);

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse the JSON response, handling potential markdown code blocks
    let parsed;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanedContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Erro ao processar resposta da IA");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
