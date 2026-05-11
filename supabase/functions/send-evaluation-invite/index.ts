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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@gfloow.com.br';

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: InviteRequest = await req.json();
    const isStandalone = payload.reviewType === 'standalone';
    const contextTitle = payload.cycleTitle || 'Avaliação Avulsa';

    console.log('Sending evaluation invite via Resend:', {
      type: payload.type,
      reviewType: payload.reviewType || 'cycle',
      employeeName: payload.employeeName,
    });

    // Format deadline
    const deadline = payload.cycleEndDate
      ? new Date(payload.cycleEndDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : null;

    // Determine recipient and subject
    const recipientName = payload.type === 'self_assessment'
      ? payload.employeeName
      : (payload.managerName || 'Gestor');
    const recipientEmail = payload.type === 'self_assessment'
      ? payload.employeeEmail
      : (payload.managerEmail || payload.employeeEmail);

    let subject: string;
    let htmlBody: string;

    if (payload.type === 'self_assessment') {
      subject = isStandalone
        ? `Autoavaliação Pendente`
        : `Autoavaliação Pendente — ${contextTitle}`;

      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #4f46e5; border-radius: 8px 8px 0 0; padding: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Autoavaliação Pendente</h1>
          </div>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
            <p style="color: #111827; font-size: 16px;">Olá, <strong>${payload.employeeName}</strong>!</p>
            <p style="color: #374151;">Você tem uma autoavaliação pendente${isStandalone ? '' : ` no ciclo <strong>${contextTitle}</strong>`}.</p>
            <p style="color: #374151;">Acesse o portal e complete sua autoavaliação${deadline ? ` até <strong>${deadline}</strong>` : ''}.</p>
            <p style="color: #374151;">Sua participação é essencial para o processo de avaliação de desempenho.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #6b7280; font-size: 13px;">Atenciosamente,<br/>Equipe de RH</p>
          </div>
        </div>
      `;
    } else {
      subject = isStandalone
        ? `Avaliação de Colaborador Pendente`
        : `Avaliação de Colaborador Pendente — ${contextTitle}`;

      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #4f46e5; border-radius: 8px 8px 0 0; padding: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Avaliação de Colaborador Pendente</h1>
          </div>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
            <p style="color: #111827; font-size: 16px;">Olá, <strong>${payload.managerName || 'Gestor'}</strong>!</p>
            <p style="color: #374151;">O colaborador <strong>${payload.employeeName}</strong> já completou sua autoavaliação${isStandalone ? '' : ` no ciclo <strong>${contextTitle}</strong>`} e aguarda sua avaliação como gestor.</p>
            ${deadline ? `<p style="color: #374151;">Prazo para conclusão: <strong>${deadline}</strong></p>` : ''}
            <p style="color: #374151;">Acesse o sistema para realizar a avaliação do colaborador.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #6b7280; font-size: 13px;">Atenciosamente,<br/>Equipe de RH</p>
          </div>
        </div>
      `;
    }

    // Send via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendData = await resendResponse.json();
    console.log('Email sent via Resend:', resendData.id);

    // Log the invite to the database (apenas para avaliações de ciclo)
    if (!isStandalone && payload.evaluationId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('evaluation_invite_history').insert({
          evaluation_id: payload.evaluationId,
          type: payload.type,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          status: 'sent',
        });
      } catch (dbError) {
        console.error('Failed to log invite to database:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
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
