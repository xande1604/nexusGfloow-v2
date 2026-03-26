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
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find employee by email
    const { data: employee, error: employeeError } = await supabase
      .from('nexus_employees')
      .select('id, nome, email, codigocargo')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (employeeError || !employee) {
      console.log('Employee not found:', employeeError);
      return new Response(
        JSON.stringify({ error: 'Colaborador não encontrado com este email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'register') {
      // Check if already registered
      const { data: existingCred } = await supabase
        .from('employee_credentials')
        .select('id')
        .eq('employee_id', employee.id)
        .single();

      if (existingCred) {
        return new Response(
          JSON.stringify({ error: 'Colaborador já possui cadastro. Use o login.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash password using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Create credentials
      const { error: createError } = await supabase
        .from('employee_credentials')
        .insert({ employee_id: employee.id, password_hash: passwordHash });

      if (createError) {
        console.error('Error creating credentials:', createError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar cadastro' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Employee registered successfully:', employee.id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          employee: { id: employee.id, name: employee.nome, email: employee.email, roleCode: employee.codigocargo }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      // Get stored credentials
      const { data: cred, error: credError } = await supabase
        .from('employee_credentials')
        .select('password_hash')
        .eq('employee_id', employee.id)
        .single();

      if (credError || !cred) {
        return new Response(
          JSON.stringify({ error: 'Colaborador não possui cadastro. Registre-se primeiro.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash provided password
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (passwordHash !== cred.password_hash) {
        return new Response(
          JSON.stringify({ error: 'Senha incorreta' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get pending evaluations for this employee
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

      console.log('Employee login successful:', employee.id, 'Pending evaluations:', pendingEvaluations?.length);
      return new Response(
        JSON.stringify({ 
          success: true, 
          employee: { id: employee.id, name: employee.nome, email: employee.email, roleCode: employee.codigocargo },
          pendingEvaluations: pendingEvaluations || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Employee auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
