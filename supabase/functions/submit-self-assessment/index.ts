import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { evaluationId, employeeId, responses } = await req.json();
    console.log(`Submitting self-assessment for evaluation: ${evaluationId}, employee: ${employeeId}`);

    if (!evaluationId || !employeeId || !responses) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify evaluation belongs to employee and is pending
    const { data: evaluation, error: evalError } = await supabase
      .from('employee_evaluations')
      .select('id, status, employee_id')
      .eq('id', evaluationId)
      .eq('employee_id', employeeId)
      .single();

    if (evalError || !evaluation) {
      console.error('Evaluation not found:', evalError);
      return new Response(
        JSON.stringify({ error: 'Avaliação não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (evaluation.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Esta avaliação já foi respondida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update evaluation with self-assessment responses
    const { error: updateError } = await supabase
      .from('employee_evaluations')
      .update({
        self_assessment_responses: responses,
        self_assessment_completed_at: new Date().toISOString(),
        status: 'self_assessment_done',
        updated_at: new Date().toISOString()
      })
      .eq('id', evaluationId);

    if (updateError) {
      console.error('Error updating evaluation:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar avaliação' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Self-assessment submitted successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Autoavaliação enviada com sucesso!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Submit self-assessment error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
