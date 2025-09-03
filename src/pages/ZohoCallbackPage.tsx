import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ZohoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuth callback received, processing...');
        
        // Get all URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const location = searchParams.get('location');
        const accountsServer = searchParams.get('accounts-server');
        const error = searchParams.get('error');

        console.log('Callback params:', { 
          code: code ? 'present' : 'missing', 
          state: state ? 'present' : 'missing',
          location,
          accountsServer,
          error 
        });

        // Check for OAuth error
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(`OAuth error: ${error}`);
          
          toast({
            title: 'Authorization Failed',
            description: `OAuth error: ${error}`,
            variant: 'destructive',
          });
          
          setTimeout(() => navigate('/integrations'), 3000);
          return;
        }

        // Check for missing required parameters
        if (!code || !state) {
          console.error('Missing required parameters:', { code: !!code, state: !!state });
          setStatus('error');
          setMessage('Missing required OAuth parameters');
          
          toast({
            title: 'Authorization Failed',
            description: 'Missing required OAuth parameters (code or state)',
            variant: 'destructive',
          });
          
          setTimeout(() => navigate('/integrations'), 3000);
          return;
        }

        // Call the Zoho callback edge function
        console.log('Calling zoho-callback edge function...');
        
        const callbackUrl = new URL(`https://niaiuneltiqshbwztgxj.supabase.co/functions/v1/zoho-callback`);
        callbackUrl.searchParams.set('code', code);
        callbackUrl.searchParams.set('state', state);
        if (location) callbackUrl.searchParams.set('location', location);
        if (accountsServer) callbackUrl.searchParams.set('accounts-server', accountsServer);

        const response = await fetch(callbackUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYWl1bmVsdGlxc2hid3p0Z3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTY5MTcsImV4cCI6MjA3MTk3MjkxN30.Kx4R2z9X_UyFzTQ14rF1Nt6UqwkNyFrMDW4f9J9yxrE`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Callback function error:', errorText);
          throw new Error(`Callback failed: ${response.status} ${errorText}`);
        }

        console.log('OAuth callback successful');
        setStatus('success');
        setMessage('Authorization successful! Redirecting...');
        
        toast({
          title: 'Success',
          description: 'Zoho People connected successfully!',
        });

        // Redirect to integrations page with success parameter
        setTimeout(() => {
          navigate('/integrations?connected=1');
        }, 2000);

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authorization failed');
        
        toast({
          title: 'Authorization Failed',
          description: error.message || 'Failed to complete OAuth authorization',
          variant: 'destructive',
        });
        
        setTimeout(() => navigate('/integrations'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {getIcon()}
            <h1 className="text-xl font-semibold">
              {status === 'processing' && 'Processing Authorization'}
              {status === 'success' && 'Authorization Successful'}
              {status === 'error' && 'Authorization Failed'}
            </h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZohoCallbackPage;