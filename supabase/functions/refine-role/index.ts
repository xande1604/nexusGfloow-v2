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
    const { roleTitle, currentDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Você é um especialista em RH e descrição de cargos. Com base no título do cargo "${roleTitle}"${currentDescription ? ` e a descrição atual "${currentDescription}"` : ''}, gere:

1. Uma descrição detalhada do cargo (2-3 parágrafos)
2. Conhecimentos técnicos necessários (lista de 3-5 itens separados por vírgula)
3. Hard Skills (habilidades técnicas, lista de 3-5 itens separados por vírgula)
4. Soft Skills (habilidades comportamentais, lista de 3-5 itens separados por vírgula)
5. Principais entregas esperadas (lista de 3-5 itens separados por vírgula)

Responda APENAS em formato JSON válido, sem markdown:
{
  "description": "descrição completa aqui",
  "technicalKnowledge": "item1, item2, item3",
  "hardSkills": "item1, item2, item3",
  "softSkills": "item1, item2, item3",
  "deliverables": "item1, item2, item3"
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
          { role: "system", content: "Você é um assistente especializado em RH brasileiro. Responda sempre em português do Brasil e em JSON válido." },
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
