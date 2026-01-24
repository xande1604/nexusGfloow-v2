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
    const { keyCode } = await req.json();
    
    console.log('Checking access key:', keyCode);

    if (!keyCode) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Chave de acesso é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find access key
    const { data: accessKey, error: keyError } = await supabaseAdmin
      .from('access_keys')
      .select('id, key_code, is_used, expires_at, created_at')
      .eq('key_code', keyCode.trim().toUpperCase())
      .single();

    if (keyError || !accessKey) {
      console.log('Key not found:', keyError?.message);
      return new Response(
        JSON.stringify({ valid: false, error: 'Chave não encontrada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already used
    if (accessKey.is_used) {
      console.log('Key already used');
      return new Response(
        JSON.stringify({ valid: false, error: 'Chave já foi utilizada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (accessKey.expires_at && new Date(accessKey.expires_at) < new Date()) {
      console.log('Key expired');
      return new Response(
        JSON.stringify({ valid: false, error: 'Chave expirada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Key is valid');

    return new Response(
      JSON.stringify({ 
        valid: true,
        message: 'Chave válida e disponível para uso',
        expiresAt: accessKey.expires_at,
        createdAt: accessKey.created_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
