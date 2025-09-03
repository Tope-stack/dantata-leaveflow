import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const ZohoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Debug: Log all URL parameters
      console.log('Callback URL:', window.location.href);
      console.log('All search params:', Object.fromEntries(searchParams));
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const location = searchParams.get('location') || 'https://accounts.zoho.com';
      const accountsServer = searchParams.get('accounts-server') || 'https://accounts.zoho.com';

      console.log('Extracted parameters:', { code: code ? 'present' : 'missing', state: state ? 'present' : 'missing', location, accountsServer });

      if (!code || !state) {
        console.error('Missing code or state parameter:', { code: !!code, state: !!state });
        navigate('/integrations?error=missing_params');
        return;
      }

      try {
        // Call the zoho-callback edge function
        const { data, error } = await supabase.functions.invoke('zoho-callback', {
          body: {
            code,
            state,
            location,
            'accounts-server': accountsServer
          }
        });

        if (error) {
          console.error('Callback error:', error);
          navigate('/integrations?error=callback_failed');
          return;
        }

        // Success - redirect to integrations page
        navigate('/integrations?zoho=connected');
      } catch (error) {
        console.error('Unexpected error:', error);
        navigate('/integrations?error=unexpected');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Connecting to Zoho People</h2>
            <p className="text-muted-foreground">
              Please wait while we complete the connection...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZohoCallbackPage;