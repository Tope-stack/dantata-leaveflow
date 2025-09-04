import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ZohoAttendanceEntry {
  date: string
  employeeId: string
  checkIn: string
  checkOut: string
  totalHours: string
  status: string
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

async function makeZohoRequest(url: string, accessToken: string, supabase: any, connection: any) {
  let token = accessToken

  const makeRequest = async (authToken: string) => {
    return await fetch(url, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${authToken}`,
        'Content-Type': 'application/json',
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

    const url = new URL(req.url)
    const date = url.searchParams.get('date') || new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    })
    const userId = url.searchParams.get('userId') || user.id

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
      .eq('app_user_id', userId)
      .single()

    if (!mapping) {
      return new Response(JSON.stringify({ error: 'Employee not mapped to Zoho' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Build Zoho attendance API URL
    const zohoUrl = new URL(`${connection.people_base_url}/people/api/attendance/getAttendanceEntries`)
    zohoUrl.searchParams.set('date', date)
    
    if (mapping.zoho_emp_id) {
      zohoUrl.searchParams.set('empId', mapping.zoho_emp_id)
    } else if (mapping.email) {
      zohoUrl.searchParams.set('emailId', mapping.email)
    } else if (mapping.erecno) {
      zohoUrl.searchParams.set('erecno', mapping.erecno)
    }

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const response = await makeZohoRequest(zohoUrl.toString(), connection.access_token, serviceSupabase, connection)
    
    if (!response.ok) {
      console.error('Zoho attendance API error:', response.status, await response.text())
      return new Response(JSON.stringify({ error: 'Zoho API error' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in zoho-attendance:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})