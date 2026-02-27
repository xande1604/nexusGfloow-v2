import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Allowed entities and their table mappings
const ENTITY_MAP: Record<string, { table: string; required: string[]; allowedFields: string[] }> = {
  colaboradores: {
    table: 'employees',
    required: ['chave_empresa'],
    allowedFields: ['nome', 'chave_empresa', 'matricula', 'codigocargo', 'codempresa', 'codfilial', 'codcentrodecustos', 'dataadmissao', 'dataafastamento', 'datanascimento', 'sexo', 'estadocivil', 'escolaridade', 'tipocontrato', 'tipodecolaborador', 'codsituacao', 'valorsalario', 'email', 'cpf', 'pcd', 'racacor', 'periodopagamento', 'idlancamento']
  },
  cargos: {
    table: 'cargos',
    required: ['codigocargo', 'tituloreduzido'],
    allowedFields: ['codigocargo', 'tituloreduzido', 'cbo2002', 'hard_skills', 'soft_skills', 'technical_knowledge', 'salary_min', 'salary_max', 'faz_parte_cota_aprendiz', 'idlancamento']
  },
  centros_de_custo: {
    table: 'centrodecustos',
    required: ['codcentrodecustos', 'nomecentrodecustos', 'codempresa'],
    allowedFields: ['codcentrodecustos', 'nomecentrodecustos', 'codempresa', 'idlancamento']
  },
  empresas: {
    table: 'empresas',
    required: ['codempresa', 'nomeempresa'],
    allowedFields: ['codempresa', 'nomeempresa', 'cnae', 'grau_risco', 'percentual_encargos', 'idlancamento']
  },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  // Path: /data-api/{entity} or /data-api/{entity}/{id}
  const pathParts = url.pathname.replace(/^\/functions\/v1\/data-api\/?/, '').split('/').filter(Boolean)
  const entityName = pathParts[0]
  const recordId = pathParts[1]

  // Auth
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return json({ error: 'Authorization token required' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Validate token
  const { data: tokenData, error: tokenError } = await supabase
    .from('data_webhook_tokens')
    .select('id, is_active, owner_admin_id, permissions')
    .eq('token', token)
    .single()

  if (tokenError || !tokenData || !tokenData.is_active) {
    return json({ error: 'Invalid or inactive token' }, 401)
  }

  // Update last_used_at
  await supabase.from('data_webhook_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenData.id)

  const ownerAdminId = tokenData.owner_admin_id

  // Validate entity
  if (!entityName || !ENTITY_MAP[entityName]) {
    return json({
      error: 'Invalid entity',
      available_entities: Object.keys(ENTITY_MAP)
    }, 400)
  }

  const entity = ENTITY_MAP[entityName]
  const method = req.method

  try {
    // LIST - GET /data-api/{entity}
    if (method === 'GET' && !recordId) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000)
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from(entity.table)
        .select('*', { count: 'exact' })
        .eq('owner_admin_id', ownerAdminId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error
      return json({ data, total: count, page, limit })
    }

    // GET ONE - GET /data-api/{entity}/{id}
    if (method === 'GET' && recordId) {
      const { data, error } = await supabase
        .from(entity.table)
        .select('*')
        .eq('id', recordId)
        .eq('owner_admin_id', ownerAdminId)
        .single()

      if (error || !data) return json({ error: 'Record not found' }, 404)
      return json({ data })
    }

    // CREATE - POST /data-api/{entity}
    if (method === 'POST' && !recordId) {
      const body = await req.json()

      // Support batch (array) or single record
      const records = Array.isArray(body) ? body : [body]

      // Validate required fields
      for (const record of records) {
        for (const field of entity.required) {
          if (!record[field]) {
            return json({ error: `Missing required field: ${field}`, required: entity.required }, 400)
          }
        }
      }

      // Filter only allowed fields + add owner
      const sanitized = records.map(record => {
        const filtered: Record<string, unknown> = { owner_admin_id: ownerAdminId }
        for (const field of entity.allowedFields) {
          if (record[field] !== undefined) filtered[field] = record[field]
        }
        return filtered
      })

      const { data, error } = await supabase.from(entity.table).insert(sanitized).select()
      if (error) throw error
      return json({ data, inserted: sanitized.length }, 201)
    }

    // UPDATE - PUT /data-api/{entity}/{id}
    if (method === 'PUT' && recordId) {
      const body = await req.json()
      const filtered: Record<string, unknown> = {}
      for (const field of entity.allowedFields) {
        if (body[field] !== undefined) filtered[field] = body[field]
      }

      const { data, error } = await supabase
        .from(entity.table)
        .update(filtered)
        .eq('id', recordId)
        .eq('owner_admin_id', ownerAdminId)
        .select()
        .single()

      if (error) throw error
      return json({ data })
    }

    // DELETE - DELETE /data-api/{entity}/{id}
    if (method === 'DELETE' && recordId) {
      const { error } = await supabase
        .from(entity.table)
        .delete()
        .eq('id', recordId)
        .eq('owner_admin_id', ownerAdminId)

      if (error) throw error
      return json({ success: true, deleted_id: recordId })
    }

    // UPSERT (bulk sync) - PATCH /data-api/{entity}
    if (method === 'PATCH' && !recordId) {
      const body = await req.json()
      const records = Array.isArray(body) ? body : [body]

      const sanitized = records.map(record => {
        const filtered: Record<string, unknown> = { owner_admin_id: ownerAdminId }
        for (const field of entity.allowedFields) {
          if (record[field] !== undefined) filtered[field] = record[field]
        }
        if (record.id) filtered.id = record.id
        return filtered
      })

      const { data, error } = await supabase.from(entity.table).upsert(sanitized, { onConflict: 'id' }).select()
      if (error) throw error
      return json({ data, upserted: sanitized.length })
    }

    return json({ error: 'Method not allowed' }, 405)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('data-api error:', msg)
    return json({ error: 'Internal server error', details: msg }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
