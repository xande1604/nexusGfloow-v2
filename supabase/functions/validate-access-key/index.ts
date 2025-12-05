import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyCode, userId } = await req.json();
    
    console.log('Validating access key for user:', userId);

    if (!keyCode || !userId) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Chave de acesso e usuário são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find valid access key
    const { data: accessKey, error: keyError } = await supabaseAdmin
      .from('access_keys')
      .select('*')
      .eq('key_code', keyCode.trim().toUpperCase())
      .eq('is_used', false)
      .single();

    if (keyError || !accessKey) {
      console.error('Invalid or used key:', keyError?.message);
      return new Response(
        JSON.stringify({ error: 'Chave de acesso inválida ou já utilizada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if key is expired
    if (accessKey.expires_at && new Date(accessKey.expires_at) < new Date()) {
      console.error('Key expired');
      return new Response(
        JSON.stringify({ error: 'Chave de acesso expirada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Valid key found, created by admin:', accessKey.created_by_admin_id);

    // Start transaction-like operations
    // 1. Mark key as used
    const { error: updateKeyError } = await supabaseAdmin
      .from('access_keys')
      .update({
        is_used: true,
        used_by_user_id: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', accessKey.id);

    if (updateKeyError) {
      console.error('Error updating key:', updateKeyError.message);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar chave de acesso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create user role as admin with reference to creator
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
        created_by_admin_id: accessKey.created_by_admin_id,
      });

    if (roleError) {
      console.error('Error creating role:', roleError.message);
      // Rollback: mark key as unused
      await supabaseAdmin
        .from('access_keys')
        .update({ is_used: false, used_by_user_id: null, used_at: null })
        .eq('id', accessKey.id);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao atribuir permissões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully validated key and assigned admin role');

    return new Response(
      JSON.stringify({ 
        success: true, 
        role: 'admin',
        message: 'Chave validada! Você agora é administrador.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
