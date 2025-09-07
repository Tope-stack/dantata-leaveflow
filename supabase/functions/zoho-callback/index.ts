// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }

// serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response(null, { headers: corsHeaders })
//   }

//   try {
//     const url = new URL(req.url)
//     const code = url.searchParams.get('code')
//     const error = url.searchParams.get('error')
    
//     if (error) {
//       console.error('OAuth error:', error)
//       return new Response(`OAuth error: ${error}`, { status: 400, headers: corsHeaders })
//     }

//     if (!code) {
//       return new Response('Missing authorization code', { status: 400, headers: corsHeaders })
//     }

//     const clientId = Deno.env.get('ZOHO_CLIENT_ID')
//     const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET')
//     const redirectUri = Deno.env.get('ZOHO_REDIRECT_URI')

//     if (!clientId || !clientSecret || !redirectUri) {
//       return new Response('Server configuration error', { status: 500, headers: corsHeaders })
//     }

//     // Exchange code for tokens
//     const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         grant_type: 'authorization_code',
//         client_id: clientId,
//         client_secret: clientSecret,
//         redirect_uri: redirectUri,
//         code: code,
//       }),
//     })

//     const tokenData = await tokenResponse.json()
    
//     if (!tokenResponse.ok) {
//       console.error('Token exchange failed:', tokenData)
//       return new Response('Token exchange failed', { status: 400, headers: corsHeaders })
//     }

//     console.log('Token exchange successful:', { 
//       hasAccessToken: !!tokenData.access_token,
//       hasRefreshToken: !!tokenData.refresh_token,
//       expiresIn: tokenData.expires_in 
//     })

//     // Detect accounts base URL from the Location header or API server info
//     let accountsBaseUrl = 'https://accounts.zoho.com'
//     const locationHeader = tokenResponse.headers.get('location')
//     if (locationHeader) {
//       try {
//         const locationUrl = new URL(locationHeader)
//         accountsBaseUrl = `${locationUrl.protocol}//${locationUrl.hostname}`
//       } catch (e) {
//         console.log('Could not parse location header, using default')
//       }
//     }

//     // Get organization info to determine People base URL
//     let peopleBaseUrl = 'https://people.zoho.com'
//     if (tokenData.api_domain) {
//       peopleBaseUrl = tokenData.api_domain.replace('www.zohoapis', 'people.zoho')
//     }

//     const supabaseClient = createClient(
//       Deno.env.get('SUPABASE_URL') ?? '',
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
//     )

//     const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))
//     const orgId = crypto.randomUUID()

//     // Store connection securely
//     const { error: insertError } = await supabaseClient
//       .from('zoho_connections')
//       .upsert({
//         org_id: orgId,
//         accounts_base_url: accountsBaseUrl,
//         people_base_url: peopleBaseUrl,
//         access_token: tokenData.access_token,
//         refresh_token: tokenData.refresh_token,
//         expires_at: expiresAt.toISOString(),
//       })

//     if (insertError) {
//       console.error('Error storing connection:', insertError)
//       return new Response('Error storing connection', { status: 500, headers: corsHeaders })
//     }

//     // Redirect to success page
//     const redirectUrl = 'https://niaiuneltiqshbwztgxj.lovableproject.com/zoho-callback?success=true'
    
//     return new Response(null, {
//       status: 302,
//       headers: {
//         ...corsHeaders,
//         'Location': redirectUrl
//       }
//     })

//   } catch (error) {
//     console.error('Error in zoho-callback:', error)
//     return new Response(`Server error: ${error.message}`, { 
//       status: 500, 
//       headers: corsHeaders 
//     })
//   }
// })
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let code: string | null = null;
    let state: string | null = null;
    let redirectUri: string | null = null;

    if (req.headers.get("content-type")?.includes("application/json")) {
      // Case 1: Called via supabase.functions.invoke (JSON body)
      const body = await req.json();
      code = body.code ?? null;
      state = body.state ?? null;
      redirectUri = body.redirect_uri ?? null;
    } else {
      // Case 2: Direct redirect from Zoho with query params
      const url = new URL(req.url);
      code = url.searchParams.get("code");
      state = url.searchParams.get("state");
      redirectUri = url.searchParams.get("redirect_uri");
    }

    if (!code) {
      return new Response("Missing authorization code", { status: 400, headers: corsHeaders });
    }

    const clientId = Deno.env.get("ZOHO_CLIENT_ID");
    const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
    const envRedirectUri = Deno.env.get("ZOHO_REDIRECT_URI");

    if (!clientId || !clientSecret || !envRedirectUri) {
      return new Response("Server configuration error", { status: 500, headers: corsHeaders });
    }

    // Use provided redirectUri if passed, otherwise fallback to env
    const finalRedirectUri = redirectUri || envRedirectUri;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: finalRedirectUri,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenData);
      return new Response("Token exchange failed", { status: 400, headers: corsHeaders });
    }

    console.log("Token exchange successful:", {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });

    // Detect Zoho accounts/people base URL
    let accountsBaseUrl = "https://accounts.zoho.com";
    if (tokenData.api_domain) {
      accountsBaseUrl = tokenData.api_domain;
    }

    let peopleBaseUrl = "https://people.zoho.com";
    if (tokenData.api_domain) {
      peopleBaseUrl = tokenData.api_domain.replace("www.zohoapis", "people.zoho");
    }

    // Save to Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const orgId = crypto.randomUUID();

    const { error: insertError } = await supabaseClient.from("zoho_connections").upsert({
      org_id: orgId,
      accounts_base_url: accountsBaseUrl,
      people_base_url: peopleBaseUrl,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Error storing connection:", insertError);
      return new Response("Error storing connection", { status: 500, headers: corsHeaders });
    }

    // Redirect for browser flow, or return JSON for API flow
    if (req.headers.get("accept")?.includes("text/html")) {
      const redirectUrl = `${new URL(req.url).origin}/zoho/callback?success=true`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectUrl },
      });
    }

    return new Response(JSON.stringify({ success: true, orgId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in zoho-callback:", error);
    return new Response(`Server error: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
