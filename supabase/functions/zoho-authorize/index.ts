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
    const ZOHO_CLIENT_ID = Deno.env.get('ZOHO_CLIENT_ID');
    const ZOHO_REDIRECT_URI = Deno.env.get('ZOHO_REDIRECT_URI');

    if (!ZOHO_CLIENT_ID || !ZOHO_REDIRECT_URI) {
      console.error('Missing Zoho credentials');
      return new Response(
        JSON.stringify({ error: 'Zoho credentials not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Required scopes for Zoho People API
    const scopes = [
      'ZOHOPEOPLE.leave.READ',
      'ZOHOPEOPLE.attendance.READ', 
      'ZOHOPEOPLE.forms.CREATE',
      'ZOHOPEOPLE.leave.ALL'
    ].join(',');

    // Generate state parameter (org_id for now, could be more complex)
    const state = btoa(JSON.stringify({
      redirect_uri: ZOHO_REDIRECT_URI,
      org_id: user.id // Using user ID as org identifier
    }));

    // Build Zoho OAuth authorization URL
    const authUrl = new URL('https://accounts.zoho.com/oauth/v2/auth');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', ZOHO_CLIENT_ID);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', ZOHO_REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');

    console.log('Generated authorization URL:', authUrl.toString());

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        state: state
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in zoho-authorize:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});