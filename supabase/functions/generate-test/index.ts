import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

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
      cargoId, 
      costCenterId, 
      questionCount = 10,
      multipleChoiceRatio = 0.7, // 70% multiple choice, 30% essay
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch cargo data if provided
    let cargoData = null;
    if (cargoId) {
      const { data } = await supabase
        .from('cargos')
        .select('*')
        .eq('id', cargoId)
        .single();
      cargoData = data;
    }

    // Fetch cost center data if provided
    let costCenterData = null;
    if (costCenterId) {
      const { data } = await supabase
        .from('centrodecustos')
        .select('*')
        .eq('id', costCenterId)
        .single();
      costCenterData = data;
    }

    // Fetch company settings
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    // Fetch knowledge base items related to cargo or cost center
    let knowledgeBaseQuery = supabase
      .from('knowledge_base')
      .select('title, description, content, tags');
    
    if (cargoId) {
      knowledgeBaseQuery = knowledgeBaseQuery.eq('cargo_id', cargoId);
    } else if (costCenterId) {
      knowledgeBaseQuery = knowledgeBaseQuery.eq('cost_center_id', costCenterId);
    }

    const { data: knowledgeBase } = await knowledgeBaseQuery.limit(10);

    // Build context for AI
    const context = {
      cargo: cargoData ? {
        titulo: cargoData.tituloreduzido,
        conhecimentosTecnicos: cargoData.technical_knowledge,
        hardSkills: cargoData.hard_skills,
        softSkills: cargoData.soft_skills,
      } : null,
      centroDeCusto: costCenterData ? {
        nome: costCenterData.nomecentrodecustos,
      } : null,
      empresa: companySettings ? {
        missao: companySettings.mission,
        visao: companySettings.vision,
        valores: companySettings.values,
      } : null,
      baseConhecimento: knowledgeBase?.map(k => ({
        titulo: k.title,
        descricao: k.description,
        conteudo: k.content?.substring(0, 2000), // Limit content size
        tags: k.tags,
      })) || [],
    };

    const multipleChoiceCount = Math.round(questionCount * multipleChoiceRatio);
    const essayCount = questionCount - multipleChoiceCount;

    const systemPrompt = `Você é um especialista em criação de avaliações e certificações corporativas.
Sua tarefa é criar questões de prova que avaliem competências técnicas, culturais e comportamentais.

Contexto da empresa:
- Missão: ${context.empresa?.missao || 'Não informada'}
- Visão: ${context.empresa?.visao || 'Não informada'}
- Valores: ${context.empresa?.valores?.join(', ') || 'Não informados'}

${context.cargo ? `
Cargo avaliado: ${context.cargo.titulo}
- Conhecimentos Técnicos: ${context.cargo.conhecimentosTecnicos || 'Não especificados'}
- Hard Skills: ${context.cargo.hardSkills || 'Não especificadas'}
- Soft Skills: ${context.cargo.softSkills || 'Não especificadas'}
` : ''}

${context.centroDeCusto ? `Centro de Custo: ${context.centroDeCusto.nome}` : ''}

${context.baseConhecimento.length > 0 ? `
Base de Conhecimento disponível:
${context.baseConhecimento.map(k => `- ${k.titulo}: ${k.descricao || ''}`).join('\n')}
` : ''}

Regras:
1. Crie ${multipleChoiceCount} questões de múltipla escolha com 4 alternativas cada
2. Crie ${essayCount} questões dissertativas
3. As questões devem avaliar conhecimento técnico, alinhamento cultural e competências comportamentais
4. Cada questão deve ter uma pontuação (10 pontos por padrão)
5. Categorize as questões como: "Técnica", "Cultural", "Soft Skill" ou "Conhecimento Geral"
6. Para múltipla escolha, indique claramente a alternativa correta
7. Para dissertativas, forneça critérios de avaliação`;

    const userPrompt = `Gere um teste completo com as seguintes características:
- ${multipleChoiceCount} questões de múltipla escolha
- ${essayCount} questões dissertativas
- Baseado no contexto do cargo, empresa e base de conhecimento fornecidos

Responda APENAS com JSON válido no formato:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "questionText": "Texto da pergunta",
      "options": [
        {"id": "a", "text": "Alternativa A"},
        {"id": "b", "text": "Alternativa B"},
        {"id": "c", "text": "Alternativa C"},
        {"id": "d", "text": "Alternativa D"}
      ],
      "correctAnswer": "a",
      "points": 10,
      "category": "Técnica"
    },
    {
      "id": "q2",
      "type": "essay",
      "questionText": "Texto da pergunta dissertativa",
      "points": 10,
      "category": "Soft Skill"
    }
  ],
  "suggestedTitle": "Título sugerido para o teste",
  "suggestedDescription": "Descrição do teste"
}`;

    console.log("Calling Lovable AI to generate test questions...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione mais créditos." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsedContent;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Erro ao processar resposta da IA");
    }

    console.log("Test generated successfully with", parsedContent.questions?.length, "questions");

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in generate-test function:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
