import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      roadmapId,
      employeeId,
      acquiredSkills, 
      completedTrainings, 
      additionalNotes,
      roadmapSteps,
      sourceRoleTitle,
      targetRoleTitle
    } = await req.json();

    console.log('Updating roadmap progress:', { roadmapId, employeeId, acquiredSkills, completedTrainings });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing roadmap progress
    const { data: existingRoadmap } = await supabase
      .from('career_roadmaps')
      .select('progress')
      .eq('id', roadmapId)
      .single();

    const existingProgress = existingRoadmap?.progress as any;
    console.log('Existing progress:', existingProgress ? 'found' : 'none');

    // Fetch employee's self-assessments and manager evaluations if employeeId provided
    let evaluationData = null;
    if (employeeId) {
      const { data: evaluations } = await supabase
        .from('employee_evaluations')
        .select('self_assessment_responses, manager_evaluation_responses, manager_feedback, questions')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (evaluations && evaluations.length > 0) {
        evaluationData = evaluations;
        console.log('Found evaluation data:', evaluations.length, 'records');
      }
    }

    // Build prompt for AI analysis
    const prompt = `Você é um especialista em desenvolvimento de carreira e gestão de talentos.

CONTEXTO DO ROADMAP:
- Cargo Atual: ${sourceRoleTitle}
- Cargo Alvo: ${targetRoleTitle}
- Etapas do Roadmap:
${roadmapSteps.map((step: any, i: number) => `  ${i + 1}. ${step.title} - ${step.description} (${step.estimatedDuration})\n     Habilidades necessárias: ${step.requiredSkills.join(', ')}`).join('\n')}

PROGRESSO INFORMADO PELO COLABORADOR:
- Habilidades Obtidas: ${acquiredSkills.length > 0 ? acquiredSkills.join(', ') : 'Nenhuma informada'}
- Treinamentos Realizados: ${completedTrainings.length > 0 ? completedTrainings.map((t: any) => `${t.name}${t.institution ? ` (${t.institution})` : ''}`).join(', ') : 'Nenhum informado'}
${additionalNotes ? `- Observações: ${additionalNotes}` : ''}

${evaluationData ? `DADOS DE AVALIAÇÕES ANTERIORES:
${evaluationData.map((ev: any, i: number) => `
Avaliação ${i + 1}:
- Autoavaliação: ${ev.self_assessment_responses ? JSON.stringify(ev.self_assessment_responses) : 'Não realizada'}
- Avaliação do Gestor: ${ev.manager_evaluation_responses ? JSON.stringify(ev.manager_evaluation_responses) : 'Não realizada'}
- Feedback do Gestor: ${ev.manager_feedback || 'Não informado'}
`).join('\n')}` : ''}

TAREFA:
Analise o progresso do colaborador e retorne um JSON com a seguinte estrutura:
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

Seja preciso na análise, cruzando as habilidades obtidas com as necessárias em cada etapa. Considere os feedbacks das avaliações para uma análise mais completa.`;

    console.log('Calling AI Gateway for analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('AI Response received, parsing...');

    // Parse JSON from response
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Falha ao processar resposta da IA');
    }

    // Merge existing update history with new entry
    const existingUpdateHistory = existingProgress?.updateHistory || [];
    const newUpdateEntry = {
      date: new Date().toISOString(),
      acquiredSkills,
      completedTrainings,
      additionalNotes
    };

    // Create history array for chart (track progress over time)
    const existingHistory = existingProgress?.history || [];
    const newHistoryEntry = {
      date: new Date().toISOString(),
      percentage: analysisResult.progressPercentage,
      achievementsCount: analysisResult.achievements.length
    };

    // Update the roadmap in database with progress data
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

    const { error: updateError } = await supabase
      .from('career_roadmaps')
      .update({ 
        progress: progressData 
      })
      .eq('id', roadmapId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Falha ao salvar progresso no banco');
    }

    console.log('Progress updated successfully');

    // Send notification to manager if employee has one
    if (employeeId) {
      try {
        // Get employee and manager info
        const { data: employee } = await supabase
          .from('employees')
          .select('nome, gestor_id, email')
          .eq('id', employeeId)
          .single();

        if (employee?.gestor_id) {
          const { data: manager } = await supabase
            .from('employees')
            .select('nome, email')
            .eq('id', employee.gestor_id)
            .single();

          if (manager?.email) {
            const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');
            
            if (N8N_WEBHOOK_URL) {
              console.log('Sending notification to manager:', manager.email);
              
              await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'roadmap_progress_update',
                  to: manager.email,
                  managerName: manager.nome,
                  employeeName: employee.nome,
                  sourceRole: sourceRoleTitle,
                  targetRole: targetRoleTitle,
                  progressPercentage: analysisResult.progressPercentage,
                  achievementsCount: analysisResult.achievements.length,
                  summary: analysisResult.summary,
                  updatedAt: new Date().toISOString()
                })
              });
              
              console.log('Manager notification sent successfully');
            } else {
              console.log('N8N_WEBHOOK_URL not configured, skipping notification');
            }
          }
        }
      } catch (notifyError) {
        // Don't fail the main operation if notification fails
        console.error('Error sending manager notification:', notifyError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      progress: progressData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in update-roadmap-progress:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
