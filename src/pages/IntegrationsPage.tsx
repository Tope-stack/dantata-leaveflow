import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import EmployeeMappingTable from '@/components/integrations/EmployeeMappingTable';

interface ZohoConnection {
  id: string;
  accounts_base_url: string;
  people_base_url: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

const IntegrationsPage = () => {
  const { profile } = useAuth();
  const [connection, setConnection] = useState<ZohoConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchConnection();
  }, []);

  const fetchConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('zoho_connections')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (error) {
      console.error('Error fetching connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (profile?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can connect Zoho People',
        variant: 'destructive'
      });
      return;
    }

    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('zoho-authorize');
      
      if (error) throw error;
      
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Error connecting to Zoho:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to Zoho People',
        variant: 'destructive'
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (syncType: string) => {
    setSyncing(syncType);
    try {
      let endpoint = '';
      let params = new URLSearchParams();
      
      // Set date range for past 30 days
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      switch (syncType) {
        case 'leaves':
          endpoint = 'zoho-leaves';
          params.set('fromDate', formatDate(fromDate));
          params.set('toDate', formatDate(toDate));
          break;
        case 'attendance':
          endpoint = 'zoho-attendance';
          params.set('date', formatDate(toDate));
          break;
        case 'holidays':
          endpoint = 'zoho-holidays';
          params.set('from', formatDate(fromDate));
          params.set('to', formatDate(toDate));
          break;
      }

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: Object.fromEntries(params)
      });

      if (error) throw error;

      toast({
        title: 'Sync Successful',
        description: `${syncType} data has been synchronized`,
      });
      
      console.log(`${syncType} sync result:`, data);
    } catch (error) {
      console.error(`Error syncing ${syncType}:`, error);
      toast({
        title: 'Sync Failed',
        description: error.message || `Failed to sync ${syncType}`,
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const isExpired = connection && new Date() >= new Date(connection.expires_at);
  const isConnected = connection && !isExpired;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect external services to sync leave data and streamline workflows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Zoho People</CardTitle>
              {isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : connection ? (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Expired
                </Badge>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Sync leave records, attendance data, and holidays from Zoho People.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Connected:</span>{' '}
                {format(new Date(connection.created_at), 'MMM d, yyyy HH:mm')}
              </div>
              <div>
                <span className="font-medium">Expires:</span>{' '}
                <span className={isExpired ? 'text-destructive font-medium' : ''}>
                  {format(new Date(connection.expires_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <div>
                <span className="font-medium">Accounts URL:</span>{' '}
                <a 
                  href={connection.accounts_base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {connection.accounts_base_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <span className="font-medium">People URL:</span>{' '}
                <a 
                  href={connection.people_base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {connection.people_base_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleConnect}
              disabled={connecting}
              variant={isConnected ? "outline" : "default"}
            >
              {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isConnected ? 'Reconnect' : 'Connect'} Zoho People
            </Button>

            {isConnected && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSync('leaves')}
                  disabled={!!syncing}
                >
                  {syncing === 'leaves' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {syncing !== 'leaves' && <RefreshCw className="w-4 h-4 mr-2" />}
                  Sync Leaves
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSync('attendance')}
                  disabled={!!syncing}
                >
                  {syncing === 'attendance' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {syncing !== 'attendance' && <RefreshCw className="w-4 h-4 mr-2" />}
                  Sync Attendance
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSync('holidays')}
                  disabled={!!syncing}
                >
                  {syncing === 'holidays' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {syncing !== 'holidays' && <RefreshCw className="w-4 h-4 mr-2" />}
                  Sync Holidays
                </Button>
              </>
            )}
          </div>

          {profile?.role !== 'admin' && (
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              <strong>Note:</strong> Only administrators can manage Zoho People integration.
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeMappingTable isConnected={isConnected} />
    </div>
  );
};

export default IntegrationsPage;