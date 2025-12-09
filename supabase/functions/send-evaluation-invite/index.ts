import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  type: 'self_assessment' | 'manager_evaluation';
  employeeName: string;
  employeeEmail: string;
  managerName?: string;
  managerEmail?: string;
  cycleTitle: string;
  cycleId: string;
  evaluationId: string;
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
    
    console.log('Sending evaluation invite to n8n webhook:', {
      type: payload.type,
      employeeName: payload.employeeName,
      cycleTitle: payload.cycleTitle
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
      subject = `Autoavaliação Pendente - Ciclo ${payload.cycleTitle}`;
      personalizedMessage = `Olá ${payload.employeeName},

Você tem uma autoavaliação pendente no ciclo de avaliação "${payload.cycleTitle}".

Por favor, acesse o portal de autoavaliação e complete sua avaliação até ${deadline}.

Sua participação é essencial para o processo de avaliação de desempenho.

Atenciosamente,
Equipe de RH`;
    } else {
      subject = `Avaliação de Colaborador Pendente - Ciclo ${payload.cycleTitle}`;
      personalizedMessage = `Olá ${payload.managerName || 'Gestor'},

O colaborador ${payload.employeeName} (${payload.employeeEmail}) já completou sua autoavaliação no ciclo "${payload.cycleTitle}" e aguarda sua avaliação como gestor.

Prazo para conclusão: ${deadline}

Por favor, acesse o sistema para realizar a avaliação do colaborador.

Atenciosamente,
Equipe de RH`;
    }

    // Build complete payload for n8n
    const webhookPayload = {
      // Action metadata
      action: payload.type === 'self_assessment' 
        ? 'resend_self_assessment_invite' 
        : 'resend_manager_evaluation_invite',
      type: payload.type,
      timestamp: new Date().toISOString(),
      
      // Cycle info
      cycleId: payload.cycleId,
      cycleTitle: payload.cycleTitle,
      evaluationId: payload.evaluationId,
      deadline: deadline,
      cycleEndDate: payload.cycleEndDate,
      
      // Employee (person being evaluated)
      employeeName: payload.employeeName,
      employeeEmail: payload.employeeEmail,
      
      // Manager/Evaluator info
      managerName: payload.managerName || null,
      managerEmail: payload.managerEmail || null,
      
      // Email content
      subject: subject,
      message: personalizedMessage,
      
      // Recipient (who should receive this notification)
      recipientName: payload.type === 'self_assessment' 
        ? payload.employeeName 
        : (payload.managerName || 'Gestor'),
      recipientEmail: payload.type === 'self_assessment' 
        ? payload.employeeEmail 
        : (payload.managerEmail || payload.employeeEmail),
    };

    // Send as POST with JSON body (more reliable for complex data)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

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
        recipientEmail: webhookPayload.recipientEmail,
      });
      
      if (payload.managerName) params.set('managerName', payload.managerName);
      if (payload.managerEmail) params.set('managerEmail', payload.managerEmail);
      
      const getResponse = await fetch(`${webhookUrl}?${params.toString()}`, { method: 'GET' });
      
      if (!getResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to send to webhook', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
