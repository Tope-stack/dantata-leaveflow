import React from 'react';
import { ZohoIntegration } from '@/components/integrations/ZohoIntegration';
import { ZohoEmployeeMapping } from '@/components/integrations/ZohoEmployeeMapping';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const IntegrationsPage: React.FC = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                Admin access is required to view integrations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect and manage third-party integrations for your leave management system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ZohoIntegration />
        <ZohoEmployeeMapping />
      </div>
    </div>
  );
};

export default IntegrationsPage;