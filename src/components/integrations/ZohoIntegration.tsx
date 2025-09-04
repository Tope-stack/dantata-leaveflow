import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface ZohoConnection {
  id: string;
  org_id: string;
  accounts_base_url: string;
  people_base_url: string;
  expires_at: string;
  created_at: string;
}

export const ZohoIntegration: React.FC = () => {
  const [connection, setConnection] = useState<ZohoConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    fetchConnection();
    
    // Check for success parameter from OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === '1') {
      toast({
        title: 'Success',
        description: 'Zoho People connected successfully!',
      });
      // Clean up URL
      window.history.replaceState({}, '', '/integrations');
    }
  }, []);

  const fetchConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('zoho_connections')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching connection:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch Zoho connection status',
          variant: 'destructive',
        });
      } else if (data) {
        setConnection(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!session) {
      toast({
        title: 'Error',
        description: 'Please log in to connect Zoho People',
        variant: 'destructive',
      });
      return;
    }

    setConnecting(true);
    try {
      console.log('Calling zoho-authorize function...');
      console.log('Session token:', session.access_token ? 'Present' : 'Missing');
      
      const { data, error } = await supabase.functions.invoke('zoho-authorize', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data?.authUrl) {
        console.log('Redirecting to auth URL:', data.authUrl);
        // Redirect to authorization URL in same window
        window.location.href = data.authUrl;
      } else {
        console.error('No auth URL received:', data);
        throw new Error('No authorization URL received from server');
      }
    } catch (error: any) {
      console.error('Error connecting to Zoho:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to Zoho People',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (syncType: 'leaves' | 'attendance' | 'holidays') => {
    if (!session) return;

    setSyncing(true);
    try {
      let endpoint = '';
      let params = {};

      switch (syncType) {
        case 'leaves':
          endpoint = 'zoho-leaves';
          // Sync last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          params = {
            fromDate: thirtyDaysAgo.toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0]
          };
          break;
        case 'attendance':
          endpoint = 'zoho-attendance';
          params = {
            date: new Date().toISOString().split('T')[0]
          };
          break;
        case 'holidays':
          endpoint = 'zoho-holidays';
          const currentYear = new Date().getFullYear();
          params = {
            from: `${currentYear}-01-01`,
            to: `${currentYear}-12-31`
          };
          break;
      }

      const queryString = new URLSearchParams(params).toString();
      const { data, error } = await supabase.functions.invoke(endpoint, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sync Complete',
        description: `${syncType} synced successfully from Zoho People`,
      });

      console.log(`${syncType} sync result:`, data);
    } catch (error: any) {
      console.error(`Error syncing ${syncType}:`, error);
      toast({
        title: 'Sync Failed',
        description: error.message || `Failed to sync ${syncType}`,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const isTokenExpired = () => {
    if (!connection) return false;
    return new Date() >= new Date(connection.expires_at);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Zoho People Integration
          {connection && (
            <Badge variant={isTokenExpired() ? 'destructive' : 'default'}>
              {isTokenExpired() ? 'Token Expired' : 'Connected'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connection ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your Zoho People account to sync leave records, attendance, and holidays.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="w-full"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect Zoho People
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Connected to {connection.people_base_url}</span>
            </div>
            
            {isTokenExpired() && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  Access token expired. Please reconnect to continue syncing.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync('leaves')}
                disabled={syncing || isTokenExpired()}
              >
                {syncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync Leaves
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync('attendance')}
                disabled={syncing || isTokenExpired()}
              >
                {syncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync Attendance
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync('holidays')}
                disabled={syncing || isTokenExpired()}
              >
                {syncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync Holidays
              </Button>
            </div>

            {isTokenExpired() && (
              <Button 
                onClick={handleConnect} 
                disabled={connecting}
                variant="outline"
                className="w-full"
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  'Reconnect Zoho People'
                )}
              </Button>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Connected: {new Date(connection.created_at).toLocaleDateString()}</p>
              <p>Token expires: {new Date(connection.expires_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};