import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  type: 'self_assessment' | 'manager_evaluation';
  reviewType?: 'cycle' | 'standalone';
  employeeName: string;
  employeeEmail: string;
  managerName?: string;
  managerEmail?: string;
  cycleTitle?: string;
  cycleId?: string;
  evaluationId?: string;
  performanceReviewId?: string;
  cycleEndDate?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: InviteRequest = await req.json();

    const isStandalone = payload.reviewType === 'standalone';
    const contextTitle = payload.cycleTitle || 'Avaliação Avulsa';

    console.log('Sending evaluation invite to n8n webhook:', {
      type: payload.type,
      reviewType: payload.reviewType || 'cycle',
      employeeName: payload.employeeName,
      cycleTitle: contextTitle
    });

    // Format deadline
    const deadline = payload.cycleEndDate 
      ? new Date(payload.cycleEndDate).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : 'Sem prazo definido';

    // Build personalized message based on type
    let personalizedMessage: string;
    let subject: string;
    
    if (payload.type === 'self_assessment') {
      subject = isStandalone
        ? `Autoavaliação Pendente - Avaliação Avulsa`
        : `Autoavaliação Pendente - Ciclo ${contextTitle}`;
      personalizedMessage = isStandalone
        ? `Olá ${payload.employeeName},

Você tem uma autoavaliação pendente.

Por favor, acesse o portal de autoavaliação e complete sua avaliação.

Sua participação é essencial para o processo de avaliação de desempenho.

Atenciosamente,
Equipe de RH`
        : `Olá ${payload.employeeName},

Você tem uma autoavaliação pendente no ciclo de avaliação "${contextTitle}".

Por favor, acesse o portal de autoavaliação e complete sua avaliação até ${deadline}.

Sua participação é essencial para o processo de avaliação de desempenho.

Atenciosamente,
Equipe de RH`;
    } else {
      subject = isStandalone
        ? `Avaliação de Colaborador Pendente - Avaliação Avulsa`
        : `Avaliação de Colaborador Pendente - Ciclo ${contextTitle}`;
      personalizedMessage = `Olá ${payload.managerName || 'Gestor'},

O colaborador ${payload.employeeName} (${payload.employeeEmail}) já completou sua autoavaliação${isStandalone ? '' : ` no ciclo "${contextTitle}"`} e aguarda sua avaliação como gestor.

${isStandalone ? '' : `Prazo para conclusão: ${deadline}\n\n`}Por favor, acesse o sistema para realizar a avaliação do colaborador.

Atenciosamente,
Equipe de RH`;
    }

    // Determine recipient
    const recipientName = payload.type === 'self_assessment' 
      ? payload.employeeName 
      : (payload.managerName || 'Gestor');
    const recipientEmail = payload.type === 'self_assessment' 
      ? payload.employeeEmail 
      : (payload.managerEmail || payload.employeeEmail);

    // Build complete payload for n8n
    const webhookPayload = {
      action: payload.type === 'self_assessment' 
        ? 'resend_self_assessment_invite' 
        : 'resend_manager_evaluation_invite',
      type: payload.type,
      timestamp: new Date().toISOString(),
      cycleId: payload.cycleId,
      cycleTitle: payload.cycleTitle,
      evaluationId: payload.evaluationId,
      deadline: deadline,
      cycleEndDate: payload.cycleEndDate,
      employeeName: payload.employeeName,
      employeeEmail: payload.employeeEmail,
      managerName: payload.managerName || null,
      managerEmail: payload.managerEmail || null,
      subject: subject,
      message: personalizedMessage,
      recipientName: recipientName,
      recipientEmail: recipientEmail,
    };

    // Send as POST with JSON body (more reliable for complex data)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    let webhookSuccess = response.ok;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      
      // If POST fails, try GET as fallback
      console.log('Trying GET fallback...');
      const params = new URLSearchParams({
        type: payload.type,
        action: webhookPayload.action,
        employeeName: payload.employeeName,
        employeeEmail: payload.employeeEmail,
        cycleTitle: payload.cycleTitle,
        cycleId: payload.cycleId,
        evaluationId: payload.evaluationId,
        deadline: deadline,
        subject: subject,
        recipientEmail: recipientEmail,
      });
      
      if (payload.managerName) params.set('managerName', payload.managerName);
      if (payload.managerEmail) params.set('managerEmail', payload.managerEmail);
      
      const getResponse = await fetch(`${webhookUrl}?${params.toString()}`, { method: 'GET' });
      webhookSuccess = getResponse.ok;
      
      if (!getResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to send to webhook', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log the invite to the database (apenas para avaliações de ciclo)
    if (webhookSuccess && !isStandalone && payload.evaluationId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('evaluation_invite_history').insert({
          evaluation_id: payload.evaluationId,
          type: payload.type,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          status: 'sent'
        });
        console.log('Invite logged to database');
      } catch (dbError) {
        console.error('Failed to log invite to database:', dbError);
        // Don't fail the request if logging fails
      }
    }

    console.log('Webhook notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Invite sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-evaluation-invite function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});