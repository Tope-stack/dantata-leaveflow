import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Verify user is admin
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response('Admin access required', { status: 403, headers: corsHeaders })
    }

    const clientId = Deno.env.get('ZOHO_CLIENT_ID')
    const redirectUri = Deno.env.get('ZOHO_REDIRECT_URI')
    
    if (!clientId || !redirectUri) {
      console.error('Missing environment variables:', { clientId: !!clientId, redirectUri: !!redirectUri })
      return new Response('Server configuration error', { status: 500, headers: corsHeaders })
    }

    const scopes = [
      'ZOHOPEOPLE.leave.READ',
      'ZOHOPEOPLE.attendance.READ', 
      'ZOHOPEOPLE.forms.CREATE',
      'ZOHOPEOPLE.leave.ALL'
    ].join(',')

    const state = crypto.randomUUID()
    
    // Default to .com for global Zoho accounts
    const accountsBaseUrl = 'https://accounts.zoho.com'
    
    const authUrl = new URL(`${accountsBaseUrl}/oauth/v2/auth`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')

    console.log('Redirecting to Zoho OAuth:', authUrl.toString())

    return new Response(JSON.stringify({ redirectUrl: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in zoho-authorize:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})