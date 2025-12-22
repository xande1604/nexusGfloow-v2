import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SkillData {
  name: string;
  category: string;
  description?: string;
  relevance?: string;
}

interface TrainingData {
  id: string;
  name: string;
  date?: string;
  institution?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      employeeId,
      skills,
      training,
      updateRoadmap = true 
    } = await req.json() as {
      employeeId: string;
      skills: SkillData[];
      training: TrainingData;
      updateRoadmap?: boolean;
    };

    console.log('Saving training skills:', { employeeId, skillsCount: skills.length, training: training.name });

    if (!employeeId || !skills || skills.length === 0) {
      throw new Error('employeeId e skills são obrigatórios');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Save skills to employee_skills table
    const skillsToInsert = skills.map(skill => ({
      employee_id: employeeId,
      skill_name: skill.name,
      skill_category: skill.category || null,
      source_type: 'training',
      source_id: training.id,
      source_name: training.name,
      acquired_at: training.date ? new Date(training.date).toISOString() : new Date().toISOString(),
    }));

    const { data: savedSkills, error: skillsError } = await supabase
      .from('employee_skills')
      .upsert(skillsToInsert, { 
        onConflict: 'employee_id,skill_name',
        ignoreDuplicates: false 
      })
      .select();

    if (skillsError) {
      console.error('Error saving skills:', skillsError);
      throw new Error(`Erro ao salvar habilidades: ${skillsError.message}`);
    }

    console.log('Skills saved successfully:', savedSkills?.length || skillsToInsert.length);

    // 2. Find roadmaps for this employee and update them
    let roadmapsUpdated = 0;
    if (updateRoadmap) {
      const { data: employeeRoadmaps, error: roadmapsError } = await supabase
        .from('career_roadmaps')
        .select('id, source_role_title, target_role_title, steps, progress')
        .eq('employee_id', employeeId);

      if (roadmapsError) {
        console.error('Error fetching roadmaps:', roadmapsError);
      } else if (employeeRoadmaps && employeeRoadmaps.length > 0) {
        console.log('Found roadmaps for employee:', employeeRoadmaps.length);

        // Get all acquired skills for this employee
        const { data: allEmployeeSkills } = await supabase
          .from('employee_skills')
          .select('skill_name')
          .eq('employee_id', employeeId);

        const acquiredSkillNames = allEmployeeSkills?.map(s => s.skill_name) || [];
        console.log('Total acquired skills for employee:', acquiredSkillNames.length);

        // Get all trainings for this employee
        const { data: employeeTrainings } = await supabase
          .from('treinamentos')
          .select('nome_treinamento, instituicao, data_conclusao')
          .eq('employee_id', employeeId)
          .eq('status', 'concluido');

        const completedTrainings = employeeTrainings?.map(t => ({
          name: t.nome_treinamento,
          date: t.data_conclusao || new Date().toISOString(),
          institution: t.instituicao || undefined
        })) || [];

        // Update each roadmap
        for (const roadmap of employeeRoadmaps) {
          try {
            const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
            if (!LOVABLE_API_KEY) {
              console.log('LOVABLE_API_KEY not configured, skipping AI analysis');
              continue;
            }

            const roadmapSteps = roadmap.steps as any[];
            
            // Build prompt for AI analysis
            const prompt = `Você é um especialista em desenvolvimento de carreira e gestão de talentos.

CONTEXTO DO ROADMAP:
- Cargo Atual: ${roadmap.source_role_title}
- Cargo Alvo: ${roadmap.target_role_title}
- Etapas do Roadmap:
${roadmapSteps.map((step: any, i: number) => `  ${i + 1}. ${step.title} - ${step.description} (${step.estimatedDuration})\n     Habilidades necessárias: ${step.requiredSkills?.join(', ') || 'N/A'}`).join('\n')}

HABILIDADES ADQUIRIDAS PELO COLABORADOR:
${acquiredSkillNames.join(', ') || 'Nenhuma'}

TREINAMENTOS CONCLUÍDOS:
${completedTrainings.map(t => `- ${t.name}${t.institution ? ` (${t.institution})` : ''}`).join('\n') || 'Nenhum'}

NOVO TREINAMENTO REGISTRADO:
- ${training.name}${training.institution ? ` (${training.institution})` : ''}
- Novas habilidades adquiridas: ${skills.map(s => s.name).join(', ')}

TAREFA:
Analise o progresso atualizado do colaborador e retorne um JSON com a seguinte estrutura:
{
  "currentStepIndex": <número da etapa atual (0-indexed) baseado nas competências adquiridas>,
  "progressPercentage": <porcentagem de progresso geral de 0 a 100>,
  "completedSteps": [<índices das etapas concluídas>],
  "achievements": [
    {
      "title": "<título da conquista>",
      "description": "<descrição breve>",
      "type": "skill" | "training" | "milestone"
    }
  ],
  "gaps": [
    {
      "skill": "<habilidade faltante>",
      "priority": "high" | "medium" | "low",
      "recommendation": "<recomendação de como desenvolver>"
    }
  ],
  "nextActions": [
    "<ação recomendada 1>",
    "<ação recomendada 2>",
    "<ação recomendada 3>"
  ],
  "summary": "<resumo executivo do progresso em 2-3 frases>"
}

Seja preciso na análise, cruzando as habilidades obtidas com as necessárias em cada etapa.`;

            console.log('Calling AI Gateway for roadmap analysis...');

            const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
              }),
            });

            if (!response.ok) {
              console.error('AI Gateway error:', await response.text());
              continue;
            }

            const aiResponse = await response.json();
            const content = aiResponse.choices[0]?.message?.content;

            if (!content) {
              console.error('Empty AI response');
              continue;
            }

            // Parse JSON from response
            let analysisResult;
            try {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
              } else {
                console.error('JSON not found in response');
                continue;
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
              continue;
            }

            // Get existing progress data
            const existingProgress = roadmap.progress as any || {};
            const existingUpdateHistory = existingProgress?.updateHistory || [];
            const existingHistory = existingProgress?.history || [];

            // Create new entries
            const newUpdateEntry = {
              date: new Date().toISOString(),
              acquiredSkills: skills.map(s => s.name),
              completedTrainings: [{ 
                name: training.name, 
                date: training.date || new Date().toISOString(),
                institution: training.institution 
              }],
              additionalNotes: `Atualizado automaticamente após registro de treinamento: ${training.name}`
            };

            const newHistoryEntry = {
              date: new Date().toISOString(),
              percentage: analysisResult.progressPercentage,
              achievementsCount: analysisResult.achievements.length
            };

            // Update progress data
            const progressData = {
              currentStepIndex: analysisResult.currentStepIndex,
              progressPercentage: analysisResult.progressPercentage,
              completedSteps: analysisResult.completedSteps,
              achievements: analysisResult.achievements,
              gaps: analysisResult.gaps,
              nextActions: analysisResult.nextActions,
              summary: analysisResult.summary,
              lastUpdated: new Date().toISOString(),
              updateHistory: [...existingUpdateHistory, newUpdateEntry],
              history: [...existingHistory, newHistoryEntry]
            };

            // Save to database
            const { error: updateError } = await supabase
              .from('career_roadmaps')
              .update({ progress: progressData })
              .eq('id', roadmap.id);

            if (updateError) {
              console.error('Error updating roadmap:', updateError);
            } else {
              roadmapsUpdated++;
              console.log('Roadmap updated:', roadmap.id);
            }
          } catch (roadmapError) {
            console.error('Error processing roadmap:', roadmapError);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      skillsSaved: skillsToInsert.length,
      roadmapsUpdated,
      message: `${skillsToInsert.length} habilidade(s) salva(s)${roadmapsUpdated > 0 ? `, ${roadmapsUpdated} roadmap(s) atualizado(s)` : ''}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in save-training-skills:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
