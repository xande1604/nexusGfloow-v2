import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get requesting admin's user id
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { data: { user: adminUser }, error: authError } = await createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (authError || !adminUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Check that admin has role = admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role, created_by_admin_id')
      .eq('user_id', adminUser.id)
      .maybeSingle();

    if (!adminRole || adminRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: only admins can approve members' }), { status: 403, headers: corsHeaders });
    }

    const { user_id, role, action } = await req.json();

    if (!user_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing user_id or action' }), { status: 400, headers: corsHeaders });
    }

    if (action === 'approve') {
      if (!role || !['admin', 'gestor', 'analista', 'visualizador'].includes(role)) {
        return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400, headers: corsHeaders });
      }

      // Verify the pending profile is requesting approval to this admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('pending_admin_id')
        .eq('id', user_id)
        .maybeSingle();

      if (!profile || profile.pending_admin_id !== adminUser.id) {
        return new Response(JSON.stringify({ error: 'User did not request to join your environment' }), { status: 403, headers: corsHeaders });
      }

      // Create user_role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id,
          role,
          created_by_admin_id: adminUser.id,
        });

      if (roleError) throw roleError;

      // Clear pending fields
      await supabase
        .from('profiles')
        .update({ pending_admin_id: null, pending_role: null, requested_at: null })
        .eq('id', user_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

    } else if (action === 'reject') {
      // Just clear pending fields
      await supabase
        .from('profiles')
        .update({ pending_admin_id: null, pending_role: null, requested_at: null })
        .eq('id', user_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
