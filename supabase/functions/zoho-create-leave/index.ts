import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function refreshZohoToken(supabase: any, connection: any) {
  const refreshResponse = await fetch(`${connection.accounts_base_url}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: Deno.env.get('ZOHO_CLIENT_ID')!,
      client_secret: Deno.env.get('ZOHO_CLIENT_SECRET')!,
      refresh_token: connection.refresh_token,
    }),
  })

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh token')
  }

  const tokenData = await refreshResponse.json()
  const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

  await supabase
    .from('zoho_connections')
    .update({
      access_token: tokenData.access_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id)

  return tokenData.access_token
}

async function makeZohoRequest(url: string, options: RequestInit, accessToken: string, supabase: any, connection: any) {
  let token = accessToken

  const makeRequest = async (authToken: string) => {
    return await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Zoho-oauthtoken ${authToken}`,
      },
    })
  }

  let response = await makeRequest(token)

  // If unauthorized, try to refresh token once
  if (response.status === 401) {
    console.log('Token expired, refreshing...')
    token = await refreshZohoToken(supabase, connection)
    response = await makeRequest(token)
  }

  return response
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { leaveType, fromDate, toDate, reason, formLinkName = 'leaveapplication' } = body

    if (!leaveType || !fromDate || !toDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get Zoho connection
    const { data: connection } = await supabaseClient
      .from('zoho_connections')
      .select('*')
      .single()

    if (!connection) {
      return new Response(JSON.stringify({ error: 'Zoho not connected' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get employee mapping
    const { data: mapping } = await supabaseClient
      .from('zoho_employee_map')
      .select('*')
      .eq('app_user_id', user.id)
      .single()

    if (!mapping) {
      return new Response(JSON.stringify({ error: 'Employee not mapped to Zoho' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Prepare form data for Zoho People
    const formData = new URLSearchParams({
      inputData: JSON.stringify({
        Employeeid: mapping.zoho_emp_id || mapping.email,
        Leavetype: leaveType,
        From: fromDate,
        To: toDate,
        Reason: reason || '',
      })
    })

    const zohoUrl = `${connection.people_base_url}/api/forms/json/${formLinkName}/insertRecord`
    
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const response = await makeZohoRequest(
      zohoUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      },
      connection.access_token,
      serviceSupabase,
      connection
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zoho form submission error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'Failed to create leave request' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in zoho-create-leave:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})