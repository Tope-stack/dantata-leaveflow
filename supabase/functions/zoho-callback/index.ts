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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const location = url.searchParams.get('location') || 'https://accounts.zoho.com';
    const accountsServer = url.searchParams.get('accounts-server') || 'https://accounts.zoho.com';

    if (!code || !state) {
      console.error('Missing code or state parameter');
      return new Response('Missing required parameters', { status: 400 });
    }

    // Decode state
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      console.error('Invalid state parameter');
      return new Response('Invalid state parameter', { status: 400 });
    }

    const ZOHO_CLIENT_ID = Deno.env.get('ZOHO_CLIENT_ID');
    const ZOHO_CLIENT_SECRET = Deno.env.get('ZOHO_CLIENT_SECRET');
    const ZOHO_REDIRECT_URI = Deno.env.get('ZOHO_REDIRECT_URI');

    if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REDIRECT_URI) {
      console.error('Missing Zoho credentials');
      return new Response('Server configuration error', { status: 500 });
    }

    // Exchange code for tokens
    const tokenUrl = `${accountsServer}/oauth/v2/token`;
    const tokenParams = new URLSearchParams({
      code,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      redirect_uri: ZOHO_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    console.log('Exchanging code for tokens at:', tokenUrl);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response('Token exchange failed', { status: 400 });
    }

    const tokens = await tokenResponse.json();
    console.log('Received tokens:', { ...tokens, access_token: '***', refresh_token: '***' });

    // Determine Zoho People base URL based on location
    let peopleBaseUrl = 'https://people.zoho.com';
    if (location.includes('zoho.eu')) {
      peopleBaseUrl = 'https://people.zoho.eu';
    } else if (location.includes('zoho.in')) {
      peopleBaseUrl = 'https://people.zoho.in';
    } else if (location.includes('zoho.com.au')) {
      peopleBaseUrl = 'https://people.zoho.com.au';
    }

    // Initialize Supabase with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate expires_at timestamp
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

    // Store the connection
    const { data: connection, error: connectionError } = await supabase
      .from('zoho_connections')
      .insert({
        org_id: stateData.org_id,
        accounts_base_url: accountsServer,
        people_base_url: peopleBaseUrl,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (connectionError) {
      console.error('Failed to store connection:', connectionError);
      return new Response('Failed to store connection', { status: 500 });
    }

    console.log('Successfully stored Zoho connection:', connection.id);

    // Redirect to success page
    const redirectUrl = new URL('/user-management?zoho=connected', 'https://niaiuneltiqshbwztgxj.supabase.co');
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString()
      }
    });

  } catch (error) {
    console.error('Error in zoho-callback:', error);
    return new Response('Internal server error', { status: 500 });
  }
});