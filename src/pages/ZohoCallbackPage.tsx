// import React, { useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Loader2, CheckCircle, XCircle } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';

// const ZohoCallbackPage = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const success = searchParams.get('success');
//   const error = searchParams.get('error');

//   useEffect(() => {
//     // Auto redirect after 3 seconds
//     const timer = setTimeout(() => {
//       navigate('/integrations');
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [navigate]);

//   if (success) {
//     return (
//       <div className="container mx-auto py-12 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//             <CardTitle className="text-green-900">Connection Successful</CardTitle>
//             <CardDescription>
//               Zoho People has been successfully connected to your account.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <p className="text-sm text-muted-foreground">
//               You can now sync leave records, attendance data, and holidays.
//             </p>
//             <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
//               <Loader2 className="h-4 w-4 animate-spin" />
//               Redirecting to integrations page...
//             </div>
//             <Button onClick={() => navigate('/integrations')} className="w-full">
//               Continue to Integrations
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto py-12 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//               <XCircle className="h-6 w-6 text-red-600" />
//             </div>
//             <CardTitle className="text-red-900">Connection Failed</CardTitle>
//             <CardDescription>
//               There was an error connecting to Zoho People.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center space-y-4">
//             <p className="text-sm text-muted-foreground">
//               Error: {error}
//             </p>
//             <Button onClick={() => navigate('/integrations')} className="w-full">
//               Try Again
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Default loading state
//   return (
//     <div className="container mx-auto py-12 flex items-center justify-center">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
//             <Loader2 className="h-6 w-6 animate-spin" />
//           </div>
//           <CardTitle>Processing Connection</CardTitle>
//           <CardDescription>
//             Please wait while we complete the Zoho People integration...
//           </CardDescription>
//         </CardHeader>
//       </Card>
//     </div>
//   );
// };

// export default ZohoCallbackPage;
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ZohoCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get OAuth parameters from URL
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  useEffect(() => {
    const handleCallback = async () => {
      // If there's already a success/error parameter, use it
      if (success) {
        setStatus('success');
        return;
      }
      
      if (error) {
        setStatus('error');
        setErrorMessage(error);
        return;
      }

      // If we have an authorization code, process it
      if (code) {
        try {
          // Call your Supabase Edge Function to handle the OAuth callback
          const { data, error } = await supabase.functions.invoke('zoho-callback', {
            body: { 
              code,
              state,
              // Include current URL for redirect validation
              redirect_uri: window.location.origin + '/zoho/callback'
            }
          });

          if (error) {
            console.error('Zoho callback error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to process authorization');
          } else {
            setStatus('success');
          }
        } catch (err) {
          console.error('Callback processing error:', err);
          setStatus('error');
          setErrorMessage('An unexpected error occurred');
        }
      } else {
        // No code parameter means this might be a direct access
        setStatus('error');
        setErrorMessage('Missing authorization code');
      }
    };

    handleCallback();
  }, [code, state, error, success]);

  useEffect(() => {
    // Auto redirect after 3 seconds on success
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/integrations');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  if (status === 'success') {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Connection Successful</CardTitle>
            <CardDescription>
              Zoho People has been successfully connected to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now sync leave records, attendance data, and holidays.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to integrations page...
            </div>
            <Button onClick={() => navigate('/integrations')} className="w-full">
              Continue to Integrations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Connection Failed</CardTitle>
            <CardDescription>
              There was an error connecting to Zoho People.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Error: {errorMessage}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              <p>Current URL: {window.location.href}</p>
            </div>
            <Button onClick={() => navigate('/integrations')} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="container mx-auto py-12 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <CardTitle>Processing Connection</CardTitle>
          <CardDescription>
            Please wait while we complete the Zoho People integration...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ZohoCallbackPage;