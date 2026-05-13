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

    const { action, email, password } = await req.json();
    console.log(`Employee auth action: ${action}, email: ${email}`);

    if (!email || !password) {
      return json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find employee by email in nexus_employees
    const { data: employee, error: employeeError } = await supabase
      .from('nexus_employees')
      .select('id, nome, email, codigocargo, linked_user_id, owner_admin_id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (employeeError || !employee) {
      console.log('Employee not found for email:', normalizedEmail);
      return json({ error: 'Colaborador não encontrado com este email. Verifique com o RH.' }, 404);
    }

    // ──────────────────────────────────────────────────────────────
    // REGISTER — cria conta Supabase Auth + user_roles + linked_user_id
    // ──────────────────────────────────────────────────────────────
    if (action === 'register') {
      if (employee.linked_user_id) {
        return json({ error: 'Colaborador já possui cadastro. Use a opção de login.' }, 400);
      }

      // Create Supabase Auth user via admin API (auto-confirms email)
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error('Error creating auth user:', createError);
        if (
          createError.message.includes('already been registered') ||
          createError.message.includes('already registered') ||
          createError.message.includes('already exists')
        ) {
          return json({ error: 'Este email já possui cadastro no sistema. Faça o login.' }, 400);
        }
        return json({ error: 'Erro ao criar cadastro. Tente novamente.' }, 500);
      }

      const userId = authData.user.id;

      // Create user_roles with role = 'user'
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'user',
        created_by_admin_id: employee.owner_admin_id,
      });

      if (roleError) {
        console.error('Error creating user_roles (non-fatal):', roleError);
        // Non-fatal: user was created. Roles can be fixed manually.
      }

      // Link nexus_employees to the new Supabase Auth user
      const { error: linkError } = await supabase
        .from('nexus_employees')
        .update({ linked_user_id: userId })
        .eq('id', employee.id);

      if (linkError) {
        console.error('Error linking employee (non-fatal):', linkError);
      }

      console.log('Employee registered successfully — nexus_id:', employee.id, 'auth_user_id:', userId);
      return json({
        success: true,
        employee: { id: employee.id, name: employee.nome, email: employee.email, roleCode: employee.codigocargo },
      });
    }

    // ──────────────────────────────────────────────────────────────
    // LOGIN — apenas verifica se employee existe e tem conta
    //         A autenticação em si é feita pelo frontend via supabase.auth.signInWithPassword()
    //         Este endpoint retorna os dados do colaborador + avaliações pendentes
    // ──────────────────────────────────────────────────────────────
    if (action === 'login') {
      if (!employee.linked_user_id) {
        return json({ error: 'Colaborador não possui cadastro. Use "Primeiro Acesso" para se registrar.' }, 404);
      }

      const { data: pendingEvaluations } = await supabase
        .from('employee_evaluations')
        .select(`
          id,
          cycle_id,
          questions,
          status,
          evaluation_cycles!inner(title, description, status)
        `)
        .eq('employee_id', employee.id)
        .eq('status', 'pending')
        .eq('evaluation_cycles.status', 'active');

      return json({
        success: true,
        employee: { id: employee.id, name: employee.nome, email: employee.email, roleCode: employee.codigocargo },
        pendingEvaluations: pendingEvaluations || [],
      });
    }

    return json({ error: 'Ação inválida' }, 400);

  } catch (error) {
    console.error('Employee auth error:', error);
    return json({ error: 'Erro interno do servidor' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
