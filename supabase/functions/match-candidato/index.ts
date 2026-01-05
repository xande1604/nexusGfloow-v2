import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.4.168/legacy/build/pdf.mjs";

// pdfjs pode tentar acessar workerSrc mesmo com disableWorker=true em alguns runtimes.
// NÃO podemos reatribuir GlobalWorkerOptions (export do módulo é read-only). Apenas setamos workerSrc se existir.
try {
  const gwo = (pdfjsLib as any).GlobalWorkerOptions;
  if (gwo && typeof gwo === "object") {
    gwo.workerSrc = "https://esm.sh/pdfjs-dist@4.4.168/legacy/build/pdf.worker.mjs";
  }
} catch (e) {
  console.warn("Could not set pdfjs workerSrc:", e);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Usamos SERVICE_ROLE_KEY para conseguir baixar currículos em buckets privados.
// Importante: só permitimos baixar arquivos do Storage do próprio projeto (evita SSRF).
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

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
  curriculo_url?: string;
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

function parseSupabaseStorageUrl(
  urlStr: string,
  supabaseUrl: string,
): { bucket: string; path: string } | null {
  try {
    const u = new URL(urlStr);
    const base = new URL(supabaseUrl);

    if (u.origin !== base.origin) return null;

    const parts = u.pathname.split('/').filter(Boolean);
    // Ex.: /storage/v1/object/public/<bucket>/<path>
    const objectIdx = parts.indexOf('object');
    if (objectIdx === -1) return null;

    const access = parts[objectIdx + 1];
    if (access !== 'public' && access !== 'sign') return null;

    const bucket = parts[objectIdx + 2];
    const path = parts.slice(objectIdx + 3).join('/');

    if (!bucket || !path) return null;

    return { bucket, path: decodeURIComponent(path) };
  } catch {
    return null;
  }
}

async function getPdfBytes(pdfUrl: string): Promise<Uint8Array | null> {
  // Preferência: baixar via Storage (funciona para buckets privados também)
  if (supabaseAdmin) {
    const parsed = parseSupabaseStorageUrl(pdfUrl, SUPABASE_URL);
    if (parsed) {
      console.log('Downloading PDF via Supabase Storage:', parsed.bucket, parsed.path);
      try {
        const { data, error } = await supabaseAdmin.storage
          .from(parsed.bucket)
          .download(parsed.path);

        if (error) {
          console.error('Storage download error:', JSON.stringify(error));
          return null;
        }
        
        if (!data) {
          console.error('Storage download returned no data');
          return null;
        }

        const bytes = new Uint8Array(await data.arrayBuffer());
        console.log('PDF downloaded successfully, size:', bytes.length, 'bytes');
        return bytes;
      } catch (downloadError) {
        console.error('Storage download exception:', downloadError);
        return null;
      }
    }
  }

  // Fallback: HTTP fetch (apenas para URLs que não sejam do nosso Storage)
  console.log('Fetching PDF via HTTP:', pdfUrl);
  try {
    const resp = await fetch(pdfUrl);
    if (!resp.ok) {
      console.error('Failed to fetch PDF:', resp.status, resp.statusText);
      return null;
    }
    const bytes = new Uint8Array(await resp.arrayBuffer());
    console.log('PDF fetched via HTTP, size:', bytes.length, 'bytes');
    return bytes;
  } catch (fetchError) {
    console.error('HTTP fetch exception:', fetchError);
    return null;
  }
}

// Extract text from a PDF (text layer) using pdfjs-dist.
// Note: For scanned PDFs (image-only), this may return an empty string.
async function extractPdfText(pdfUrl: string): Promise<string> {
  try {
    console.log('Starting PDF extraction for:', pdfUrl);
    
    const pdfBytes = await getPdfBytes(pdfUrl);
    if (!pdfBytes) {
      console.error('getPdfBytes returned null');
      return '';
    }
    
    console.log('PDF bytes received, attempting to parse with pdfjs...');

    const loadingTask = (pdfjsLib as any).getDocument({
      data: pdfBytes,
      disableWorker: true,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    console.log('PDF loaded, numPages:', pdf.numPages);

    const maxPages = Math.min(pdf.numPages || 0, 10);
    let text = '';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = (content.items || [])
          .map((it: any) => (typeof it?.str === 'string' ? it.str : ''))
          .filter(Boolean)
          .join(' ');
        console.log(`Page ${pageNum} text length:`, pageText.length);
        if (pageText.trim()) text += pageText + '\n';
      } catch (pageError) {
        console.error(`Error extracting page ${pageNum}:`, pageError);
      }
    }

    text = text.replace(/\s+/g, ' ').trim();

    console.log('Total extracted PDF text length:', text.length);
    console.log('PDF text preview (first 1000 chars):', text.substring(0, 1000));

    // Ignore garbage / image-only PDFs
    if (text.length < 80) {
      console.warn('PDF text too short, likely image-only PDF');
      return '';
    }

    return text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
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

    // Extract PDF content if available
    let curriculoContent = '';
    if (candidato.curriculo_url) {
      console.log('Candidate has CV URL, extracting content...');
      curriculoContent = await extractPdfText(candidato.curriculo_url);
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

    // Create AI prompt for detailed analysis including CV content
    const curriculoSection = curriculoContent 
      ? `\n\nCONTEÚDO DO CURRÍCULO (PDF):\n${curriculoContent.substring(0, 12000)}`
      : '\n\nCurrículo: Não disponível';

    const prompt = `Analise a compatibilidade entre este candidato e vaga. IMPORTANTE: Considere TODO o conteúdo do currículo PDF se disponível para extrair skills, experiências e formação.

CANDIDATO:
Nome: ${candidato.nome}
Resumo: ${candidato.resumo_profissional || 'Não informado'}
Pretensão salarial: ${candidato.pretensao_salarial ? `R$ ${candidato.pretensao_salarial}` : 'Não informada'}
Skills cadastradas: ${candidato.skills.map(s => `${s.skill_name} (${s.nivel || 'N/A'})`).join(', ') || 'Nenhuma'}
Experiências cadastradas: ${candidato.experiencias?.map(e => `${e.cargo} na ${e.empresa}`).join('; ') || 'Nenhuma'}
Formações cadastradas: ${candidato.formacoes?.map(f => `${f.curso} - ${f.instituicao}`).join('; ') || 'Nenhuma'}
${curriculoSection}

VAGA:
Título: ${vaga.titulo}
Descrição: ${vaga.descricao || 'Não informada'}
Requisitos: ${vaga.requisitos || 'Não informados'}
Faixa salarial: ${vaga.salario_min && vaga.salario_max ? `R$ ${vaga.salario_min} - R$ ${vaga.salario_max}` : 'Não informada'}
Skills requeridas: ${vaga.skills.map(s => `${s.skill_name} (${s.obrigatoria ? 'obrigatória' : 'desejável'})`).join(', ') || 'Nenhuma'}

INSTRUÇÕES:
1. Analise o currículo PDF para identificar skills, experiências e formações que o candidato possui
2. Compare com os requisitos da vaga
3. Considere sinônimos e habilidades relacionadas
4. Dê scores de 0 a 100 para cada categoria

Retorne APENAS este formato JSON:
{
  "score_skills": 75,
  "score_experiencia": 80,
  "score_formacao": 70,
  "skills_encontradas_cv": ["skill1", "skill2"],
  "experiencias_encontradas_cv": ["Cargo em Empresa"],
  "formacoes_encontradas_cv": ["Curso em Instituição"],
  "resumo": "Análise resumida em 2-3 frases sobre a compatibilidade",
  "pontos_fortes": ["ponto 1", "ponto 2", "ponto 3"],
  "gaps": ["gap 1", "gap 2"],
  "recomendacao": "aprovar|reprovar|reavaliar",
  "justificativa": "Justificativa da recomendação"
}`;

    console.log('Sending prompt to AI with CV content:', curriculoContent.length > 0);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em recrutamento e seleção. Analise candidatos de forma objetiva, extraindo informações do currículo PDF quando disponível. Retorne apenas JSON válido.' },
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
        curriculo_analisado: curriculoContent.length > 0,
        curriculo_preview: curriculoContent.length > 0 ? curriculoContent.substring(0, 500) + '...' : 'Currículo não disponível ou não foi possível extrair texto.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    let aiAnalysis: any = { 
      resumo: '', 
      pontos_fortes: [], 
      gaps: [], 
      recomendacao: 'reavaliar', 
      justificativa: '',
      score_skills: skillMatchPercent,
      score_experiencia: experienceScore,
      score_formacao: educationScore,
    };
    
    try {
      const content = aiData.choices?.[0]?.message?.content || '';
      console.log('AI raw response:', content.substring(0, 500));
      // Clean markdown if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = { ...aiAnalysis, ...JSON.parse(jsonStr) };
      console.log('Parsed AI analysis:', aiAnalysis);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Use AI scores if available, otherwise use calculated ones
    const finalSkillScore = typeof aiAnalysis.score_skills === 'number' ? aiAnalysis.score_skills : Math.round(skillMatchPercent);
    const finalExpScore = typeof aiAnalysis.score_experiencia === 'number' ? aiAnalysis.score_experiencia : experienceScore;
    const finalEduScore = typeof aiAnalysis.score_formacao === 'number' ? aiAnalysis.score_formacao : educationScore;

    // Calculate final score using AI scores
    const finalScore = Math.round(
      (finalSkillScore * 0.4) + 
      (finalExpScore * 0.25) + 
      (finalEduScore * 0.15) + 
      (salaryScore * 0.2)
    );

    const result = {
      match_score: finalScore,
      score_skills: finalSkillScore,
      score_experiencia: finalExpScore,
      score_formacao: finalEduScore,
      score_salario: salaryScore,
      skills_match: vagaSkillNames.map(vs => ({
        skill: vs,
        candidato_nivel: candidato.skills.find(cs => cs.skill_name.toLowerCase().includes(vs))?.nivel,
        vaga_nivel: vaga.skills.find(s => s.skill_name.toLowerCase() === vs)?.nivel_minimo,
        match: candidatoSkillNames.some(cs => cs.includes(vs) || vs.includes(cs)) ||
               (aiAnalysis.skills_encontradas_cv || []).some((s: string) => s.toLowerCase().includes(vs))
      })),
      skills_encontradas_cv: aiAnalysis.skills_encontradas_cv || [],
      experiencias_encontradas_cv: aiAnalysis.experiencias_encontradas_cv || [],
      formacoes_encontradas_cv: aiAnalysis.formacoes_encontradas_cv || [],
      pontos_fortes: aiAnalysis.pontos_fortes || [],
      gaps: aiAnalysis.gaps || [],
      resumo_ia: aiAnalysis.resumo || `${finalScore}% de compatibilidade com a vaga.`,
      recomendacao: aiAnalysis.recomendacao || (finalScore >= 70 ? 'aprovar' : finalScore >= 50 ? 'reavaliar' : 'reprovar'),
      justificativa: aiAnalysis.justificativa || '',
      curriculo_analisado: curriculoContent.length > 0,
      curriculo_preview: curriculoContent.length > 0 ? curriculoContent.substring(0, 500) + '...' : 'Currículo não disponível ou não foi possível extrair texto.',
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
