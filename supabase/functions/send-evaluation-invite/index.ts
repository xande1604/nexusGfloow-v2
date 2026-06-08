import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMPLOYEE_URL = 'https://nexus.gfloow.com.br/autoavaliacao';
const MANAGER_URL = 'https://nexus.gfloow.com.br';

interface InviteRequest {
  type: 'self_assessment' | 'manager_evaluation' | 'hr_completion';
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
  // hr_completion extras
  empAvg?: string | null;
  mgrAvg?: string | null;
  managerFeedback?: string;
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: InviteRequest = await req.json();
    const isStandalone = payload.reviewType === 'standalone';
    const contextTitle = payload.cycleTitle || 'Avaliação Avulsa';

    // Check if employee already has an account
    const { data: empData } = await supabase
      .from('nexus_employees')
      .select('linked_user_id')
      .eq('email', payload.employeeEmail)
      .maybeSingle();

    const hasAccount = !!empData?.linked_user_id;

    console.log('Sending evaluation invite via Resend:', {
      type: payload.type,
      reviewType: payload.reviewType || 'cycle',
      employeeName: payload.employeeName,
      hasAccount,
    });

    // Format deadline
    const deadline = payload.cycleEndDate
      ? new Date(payload.cycleEndDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : null;

    // Determine recipient
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

      const cycleInfo = isStandalone
        ? ''
        : `<p style="color:#374151;">Ciclo: <strong>${contextTitle}</strong>${deadline ? ` · Prazo: <strong>${deadline}</strong>` : ''}</p>`;

      const accessBlock = hasAccount
        ? `
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
            <p style="color:#1e40af;margin:0 0 12px;font-size:15px;">Você já possui cadastro. Clique no botão abaixo para acessar:</p>
            <a href="${EMPLOYEE_URL}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:15px;">
              Acessar Autoavaliação
            </a>
            <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">Ou acesse diretamente: <a href="${EMPLOYEE_URL}" style="color:#4f46e5;">${EMPLOYEE_URL}</a></p>
          </div>`
        : `
          <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#92400e;font-weight:bold;margin:0 0 8px;">⚠️ Primeiro acesso — cadastro necessário</p>
            <p style="color:#78350f;margin:0 0 12px;font-size:14px;">Você ainda não possui cadastro na plataforma. Para realizar sua autoavaliação, siga os passos abaixo:</p>
            <ol style="color:#78350f;font-size:14px;margin:0 0 12px;padding-left:20px;">
              <li>Acesse <a href="${EMPLOYEE_URL}" style="color:#4f46e5;font-weight:bold;">${EMPLOYEE_URL}</a></li>
              <li>Clique em <strong>"Criar conta"</strong></li>
              <li>Use este e-mail (<strong>${payload.employeeEmail}</strong>) para se cadastrar</li>
              <li>Após criar a conta, sua avaliação pendente aparecerá automaticamente</li>
            </ol>
            <div style="text-align:center;">
              <a href="${EMPLOYEE_URL}" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:15px;">
                Criar Conta e Avaliar
              </a>
            </div>
          </div>`;

      htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#4f46e5;border-radius:8px 8px 0 0;padding:28px 24px;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">📋 Autoavaliação Pendente</h1>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
            <p style="color:#111827;font-size:16px;margin-top:0;">Olá, <strong>${payload.employeeName}</strong>!</p>
            <p style="color:#374151;">Você tem uma autoavaliação pendente${isStandalone ? '' : ` no ciclo <strong>${contextTitle}</strong>`}. Sua participação é essencial para o processo de desenvolvimento.</p>
            ${cycleInfo}
            ${accessBlock}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#6b7280;font-size:13px;margin:0;">Atenciosamente,<br/><strong>Equipe de RH — Gfloow</strong></p>
          </div>
        </div>`;

    } else if (payload.type === 'hr_completion') {
      subject = `✅ Avaliação Concluída — ${payload.employeeName}`;

      const scoreBlock = (payload.empAvg || payload.mgrAvg) ? `
        <div style="display:flex;gap:20px;margin:16px 0;">
          ${payload.empAvg ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 20px;text-align:center;">
            <p style="color:#92400e;font-size:11px;margin:0 0 4px;">Colaborador</p>
            <p style="color:#b45309;font-size:24px;font-weight:bold;margin:0;">⭐ ${payload.empAvg}/5</p>
          </div>` : ''}
          ${payload.mgrAvg ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 20px;text-align:center;">
            <p style="color:#1e40af;font-size:11px;margin:0 0 4px;">Gestor</p>
            <p style="color:#1d4ed8;font-size:24px;font-weight:bold;margin:0;">⭐ ${payload.mgrAvg}/5</p>
          </div>` : ''}
        </div>` : '';

      const feedbackBlock = payload.managerFeedback ? `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#6b7280;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Feedback do Gestor</p>
          <p style="color:#374151;font-size:14px;margin:0;">${payload.managerFeedback}</p>
        </div>` : '';

      htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#059669;border-radius:8px 8px 0 0;padding:28px 24px;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">✅ Avaliação Concluída</h1>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
            <p style="color:#111827;font-size:16px;margin-top:0;">O processo de avaliação de <strong>${payload.employeeName}</strong> foi concluído.</p>
            ${scoreBlock}
            ${feedbackBlock}
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
              <p style="color:#1e40af;margin:0 0 10px;font-size:14px;">Acesse o portal para ver o relatório completo e exportar o PDF.</p>
              <a href="${MANAGER_URL}/app?view=PERFORMANCE" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 28px;border-radius:8px;font-weight:bold;font-size:14px;">
                Ver Relatório
              </a>
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <p style="color:#6b7280;font-size:13px;margin:0;">Atenciosamente,<br/><strong>Sistema Nexus — Gfloow</strong></p>
          </div>
        </div>`;

    } else {
      subject = isStandalone
        ? `Avaliação de Colaborador Pendente`
        : `Avaliação de Colaborador Pendente — ${contextTitle}`;

      const managerPortalUrl = `${MANAGER_URL}/app?view=PERFORMANCE`;
      htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#4f46e5;border-radius:8px 8px 0 0;padding:28px 24px;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">⭐ Avaliação de Colaborador Pendente</h1>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
            <p style="color:#111827;font-size:16px;margin-top:0;">Olá, <strong>${payload.managerName || 'Gestor'}</strong>!</p>
            <p style="color:#374151;">O colaborador <strong>${payload.employeeName}</strong> já completou sua autoavaliação${isStandalone ? '' : ` no ciclo <strong>${contextTitle}</strong>`} e aguarda sua avaliação como gestor.</p>
            ${deadline ? `<p style="color:#374151;">Prazo para conclusão: <strong>${deadline}</strong></p>` : ''}
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
              <p style="color:#1e40af;margin:0 0 12px;font-size:14px;">Acesse o portal Nexus, vá em <strong>Desempenho → Avaliações Avulsas</strong> e abra a avaliação de <strong>${payload.employeeName}</strong>.</p>
              <a href="${managerPortalUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:15px;">
                Acessar Portal Nexus
              </a>
              <p style="color:#6b7280;font-size:12px;margin:12px 0 0;"><a href="${managerPortalUrl}" style="color:#4f46e5;">${MANAGER_URL}</a></p>
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#6b7280;font-size:13px;margin:0;">Atenciosamente,<br/><strong>Equipe de RH — Gfloow</strong></p>
          </div>
        </div>`;
    }

    // Send via Resend
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
    console.log('Email sent via Resend:', resendData.id, '| hasAccount:', hasAccount);

    // Log invite history (apenas para avaliações de ciclo)
    if (!isStandalone && payload.evaluationId) {
      try {
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
      JSON.stringify({ success: true, emailId: resendData.id, hasAccount }),
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
