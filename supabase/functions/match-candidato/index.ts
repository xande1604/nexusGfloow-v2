import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CandidatoSkill {
  skill_name: string;
  skill_category?: string;
  nivel?: string;
  anos_experiencia?: number;
}

interface VagaSkill {
  skill_name: string;
  skill_category?: string;
  nivel_minimo?: string;
  obrigatoria: boolean;
}

interface CandidatoData {
  nome: string;
  resumo_profissional?: string;
  pretensao_salarial?: number;
  skills: CandidatoSkill[];
  experiencias: { empresa: string; cargo: string; descricao?: string }[];
  formacoes: { instituicao: string; curso: string; nivel?: string }[];
}

interface VagaData {
  titulo: string;
  descricao?: string;
  requisitos?: string;
  salario_min?: number;
  salario_max?: number;
  skills: VagaSkill[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidato, vaga } = await req.json() as { candidato: CandidatoData; vaga: VagaData };
    
    if (!candidato || !vaga) {
      throw new Error('Candidato e vaga são obrigatórios');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Calculate basic skill match
    const vagaSkillNames = vaga.skills.map(s => s.skill_name.toLowerCase());
    const candidatoSkillNames = candidato.skills.map(s => s.skill_name.toLowerCase());
    
    const matchingSkills = vagaSkillNames.filter(vs => 
      candidatoSkillNames.some(cs => cs.includes(vs) || vs.includes(cs))
    );
    
    const skillMatchPercent = vagaSkillNames.length > 0 
      ? (matchingSkills.length / vagaSkillNames.length) * 100 
      : 50;

    // Calculate salary compatibility
    let salaryScore = 70; // Default if no salary info
    if (candidato.pretensao_salarial && vaga.salario_max) {
      if (candidato.pretensao_salarial <= vaga.salario_max) {
        salaryScore = 100;
      } else if (candidato.pretensao_salarial <= vaga.salario_max * 1.1) {
        salaryScore = 80;
      } else if (candidato.pretensao_salarial <= vaga.salario_max * 1.2) {
        salaryScore = 60;
      } else {
        salaryScore = 40;
      }
    }

    // Experience score based on number of experiences
    const experienceScore = Math.min(100, (candidato.experiencias?.length || 0) * 25);

    // Education score
    const educationScore = candidato.formacoes?.length > 0 ? 80 : 50;

    // Create AI prompt for detailed analysis
    const prompt = `Analise a compatibilidade entre este candidato e vaga. Retorne APENAS um JSON válido.

CANDIDATO:
Nome: ${candidato.nome}
Resumo: ${candidato.resumo_profissional || 'Não informado'}
Pretensão salarial: ${candidato.pretensao_salarial ? `R$ ${candidato.pretensao_salarial}` : 'Não informada'}
Skills: ${candidato.skills.map(s => `${s.skill_name} (${s.nivel || 'N/A'})`).join(', ') || 'Nenhuma'}
Experiências: ${candidato.experiencias?.map(e => `${e.cargo} na ${e.empresa}`).join('; ') || 'Nenhuma'}
Formações: ${candidato.formacoes?.map(f => `${f.curso} - ${f.instituicao}`).join('; ') || 'Nenhuma'}

VAGA:
Título: ${vaga.titulo}
Descrição: ${vaga.descricao || 'Não informada'}
Requisitos: ${vaga.requisitos || 'Não informados'}
Faixa salarial: ${vaga.salario_min && vaga.salario_max ? `R$ ${vaga.salario_min} - R$ ${vaga.salario_max}` : 'Não informada'}
Skills requeridas: ${vaga.skills.map(s => `${s.skill_name} (${s.obrigatoria ? 'obrigatória' : 'desejável'})`).join(', ') || 'Nenhuma'}

Retorne exatamente este formato JSON:
{
  "resumo": "Análise resumida em 2-3 frases",
  "pontos_fortes": ["ponto 1", "ponto 2", "ponto 3"],
  "gaps": ["gap 1", "gap 2"],
  "recomendacao": "aprovar|reprovar|reavaliar",
  "justificativa": "Justificativa da recomendação em 1-2 frases"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em recrutamento e seleção. Analise candidatos de forma objetiva e retorne apenas JSON válido.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      // Return basic analysis without AI
      const basicScore = Math.round((skillMatchPercent * 0.4) + (experienceScore * 0.25) + (educationScore * 0.15) + (salaryScore * 0.2));
      
      return new Response(JSON.stringify({
        match_score: basicScore,
        score_skills: Math.round(skillMatchPercent),
        score_experiencia: experienceScore,
        score_formacao: educationScore,
        score_salario: salaryScore,
        skills_match: vagaSkillNames.map(vs => ({
          skill: vs,
          match: candidatoSkillNames.some(cs => cs.includes(vs) || vs.includes(cs))
        })),
        pontos_fortes: candidato.skills.slice(0, 3).map(s => s.skill_name),
        gaps: vagaSkillNames.filter(vs => !candidatoSkillNames.some(cs => cs.includes(vs) || vs.includes(cs))),
        resumo_ia: `Análise básica: ${basicScore}% de compatibilidade baseado em skills, experiência e formação.`,
        recomendacao: basicScore >= 70 ? 'aprovar' : basicScore >= 50 ? 'reavaliar' : 'reprovar',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    let aiAnalysis = { resumo: '', pontos_fortes: [], gaps: [], recomendacao: 'reavaliar', justificativa: '' };
    
    try {
      const content = aiData.choices?.[0]?.message?.content || '';
      // Clean markdown if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Calculate final score
    const finalScore = Math.round(
      (skillMatchPercent * 0.4) + 
      (experienceScore * 0.25) + 
      (educationScore * 0.15) + 
      (salaryScore * 0.2)
    );

    const result = {
      match_score: finalScore,
      score_skills: Math.round(skillMatchPercent),
      score_experiencia: experienceScore,
      score_formacao: educationScore,
      score_salario: salaryScore,
      skills_match: vagaSkillNames.map(vs => ({
        skill: vs,
        candidato_nivel: candidato.skills.find(cs => cs.skill_name.toLowerCase().includes(vs))?.nivel,
        vaga_nivel: vaga.skills.find(s => s.skill_name.toLowerCase() === vs)?.nivel_minimo,
        match: candidatoSkillNames.some(cs => cs.includes(vs) || vs.includes(cs))
      })),
      pontos_fortes: aiAnalysis.pontos_fortes || [],
      gaps: aiAnalysis.gaps || [],
      resumo_ia: aiAnalysis.resumo || `${finalScore}% de compatibilidade com a vaga.`,
      recomendacao: aiAnalysis.recomendacao || (finalScore >= 70 ? 'aprovar' : finalScore >= 50 ? 'reavaliar' : 'reprovar'),
      justificativa: aiAnalysis.justificativa || '',
    };

    console.log('Match result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in match-candidato:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
