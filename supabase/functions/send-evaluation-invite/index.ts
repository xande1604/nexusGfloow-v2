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

    // Build query parameters for GET request
    const params = new URLSearchParams({
      type: payload.type,
      action: payload.type === 'self_assessment' 
        ? 'resend_self_assessment_invite' 
        : 'resend_manager_evaluation_invite',
      employeeName: payload.employeeName,
      employeeEmail: payload.employeeEmail,
      cycleTitle: payload.cycleTitle,
      cycleId: payload.cycleId,
      evaluationId: payload.evaluationId,
      timestamp: new Date().toISOString(),
      ...(payload.managerName && { managerName: payload.managerName }),
      ...(payload.managerEmail && { managerEmail: payload.managerEmail }),
    });

    const urlWithParams = `${webhookUrl}?${params.toString()}`;
    
    const response = await fetch(urlWithParams, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send to webhook', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.text();
    console.log('n8n webhook response:', result);

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
