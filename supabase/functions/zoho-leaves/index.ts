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

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    const tokens = await response.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

    // Update stored tokens
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
    console.log('Token expired, refreshing...');
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

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Zoho connection (admin only for now)
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

    // Check if token is expired
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
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const userIdParam = url.searchParams.get('userId');
    const emailParam = url.searchParams.get('email');

    // Build Zoho API URL
    const zohoApiUrl = new URL(`${tokens.people_base_url}/api/v2/leavetracker/leaves/records`);
    
    if (fromDate) zohoApiUrl.searchParams.set('fromDate', fromDate);
    if (toDate) zohoApiUrl.searchParams.set('toDate', toDate);
    if (userIdParam) zohoApiUrl.searchParams.set('userId', userIdParam);
    if (emailParam) zohoApiUrl.searchParams.set('email', emailParam);

    console.log('Calling Zoho API:', zohoApiUrl.toString());

    const result = await makeZohoApiCall(zohoApiUrl.toString(), tokens, supabase, connection);

    return new Response(
      JSON.stringify(result), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in zoho-leaves:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});