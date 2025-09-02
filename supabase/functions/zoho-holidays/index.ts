import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ZohoTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  accounts_base_url: string;
  people_base_url: string;
}

async function refreshZohoToken(connection: any, supabase: any): Promise<ZohoTokens | null> {
  try {
    const ZOHO_CLIENT_ID = Deno.env.get('ZOHO_CLIENT_ID');
    const ZOHO_CLIENT_SECRET = Deno.env.get('ZOHO_CLIENT_SECRET');

    const refreshUrl = `${connection.accounts_base_url}/oauth/v2/token`;
    const refreshParams = new URLSearchParams({
      refresh_token: connection.refresh_token,
      client_id: ZOHO_CLIENT_ID!,
      client_secret: ZOHO_CLIENT_SECRET!,
      grant_type: 'refresh_token'
    });

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: refreshParams.toString()
    });

    if (!response.ok) return null;

    const tokens = await response.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

    await supabase
      .from('zoho_connections')
      .update({
        access_token: tokens.access_token,
        expires_at: expiresAt.toISOString()
      })
      .eq('id', connection.id);

    return {
      access_token: tokens.access_token,
      refresh_token: connection.refresh_token,
      expires_at: expiresAt.toISOString(),
      accounts_base_url: connection.accounts_base_url,
      people_base_url: connection.people_base_url
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

async function makeZohoApiCall(url: string, tokens: ZohoTokens, supabase: any, connection: any, retryCount = 0): Promise<any> {
  const headers = {
    'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, { headers });
  
  if (response.status === 401 && retryCount === 0) {
    const newTokens = await refreshZohoToken(connection, supabase);
    if (newTokens) {
      return makeZohoApiCall(url, newTokens, supabase, connection, 1);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zoho API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: connection } = await supabase
      .from('zoho_connections')
      .select('*')
      .single();

    if (!connection) {
      return new Response(
        JSON.stringify({ error: 'Zoho not connected' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check token expiry and refresh if needed
    const now = new Date();
    const expiresAt = new Date(connection.expires_at);
    let tokens: ZohoTokens = {
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
      expires_at: connection.expires_at,
      accounts_base_url: connection.accounts_base_url,
      people_base_url: connection.people_base_url
    };

    if (now >= expiresAt) {
      const refreshedTokens = await refreshZohoToken(connection, supabase);
      if (!refreshedTokens) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh token' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      tokens = refreshedTokens;
    }

    // Parse query parameters
    const url = new URL(req.url);
    const location = url.searchParams.get('location') || '';
    const shift = url.searchParams.get('shift') || '';
    const employee = url.searchParams.get('employee') || '';
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // Format dates for Zoho API (dd-MMM-yyyy)
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/\s/g, '-');
    };

    // Build Zoho holidays API URL
    const zohoApiUrl = new URL(`${tokens.people_base_url}/people/api/leave/v2/holidays/get`);
    
    if (location) zohoApiUrl.searchParams.set('location', location);
    if (shift) zohoApiUrl.searchParams.set('shift', shift);
    if (employee) zohoApiUrl.searchParams.set('employee', employee);
    if (from) zohoApiUrl.searchParams.set('from', formatDate(from));
    if (to) zohoApiUrl.searchParams.set('to', formatDate(to));

    console.log('Calling Zoho Holidays API:', zohoApiUrl.toString());

    const result = await makeZohoApiCall(zohoApiUrl.toString(), tokens, supabase, connection);

    return new Response(
      JSON.stringify(result), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in zoho-holidays:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});