import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Save, Trash2, Plus } from 'lucide-react';

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
}

interface ZohoMapping {
  id: string;
  app_user_id: string;
  zoho_emp_id?: string;
  email: string;
  erecno?: string;
}

interface ExtendedProfile extends Profile {
  zoho_mapping?: ZohoMapping;
}

export const ZohoEmployeeMapping: React.FC = () => {
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchProfilesAndMappings();
  }, []);

  const fetchProfilesAndMappings = async () => {
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, employee_id')
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Fetch existing mappings
      const { data: mappingsData, error: mappingsError } = await supabase
        .from('zoho_employee_map')
        .select('*');

      if (mappingsError) throw mappingsError;

      // Combine profiles with their mappings
      const extendedProfiles = profilesData.map(profile => ({
        ...profile,
        zoho_mapping: mappingsData.find(m => m.app_user_id === profile.user_id)
      }));

      setProfiles(extendedProfiles);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee mappings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMapping = async (userId: string, mappingData: Partial<ZohoMapping>) => {
    setSaving(userId);
    try {
      const existingMapping = profiles.find(p => p.user_id === userId)?.zoho_mapping;

      if (existingMapping) {
        // Update existing mapping
        const { error } = await supabase
          .from('zoho_employee_map')
          .update(mappingData)
          .eq('id', existingMapping.id);

        if (error) throw error;
      } else {
        // Create new mapping
        const { error } = await supabase
          .from('zoho_employee_map')
          .insert({
            app_user_id: userId,
            email: mappingData.email!,
            zoho_emp_id: mappingData.zoho_emp_id,
            erecno: mappingData.erecno
          });

        if (error) throw error;
      }

      await fetchProfilesAndMappings();
      
      toast({
        title: 'Success',
        description: 'Employee mapping updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating mapping:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update mapping',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('zoho_employee_map')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      await fetchProfilesAndMappings();
      
      toast({
        title: 'Success',
        description: 'Mapping deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting mapping:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete mapping',
        variant: 'destructive',
      });
    }
  };

  const handleSaveMapping = (userId: string, formData: FormData) => {
    const zohoEmpId = formData.get('zohoEmpId') as string;
    const email = formData.get('email') as string;
    const erecno = formData.get('erecno') as string;

    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    updateMapping(userId, {
      zoho_emp_id: zohoEmpId?.trim() || undefined,
      email: email.trim(),
      erecno: erecno?.trim() || undefined
    });
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

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Admin access required to manage employee mappings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zoho Employee Mapping</CardTitle>
        <p className="text-sm text-muted-foreground">
          Map your application users to their corresponding Zoho People employee records.
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>App Email</TableHead>
                <TableHead>Zoho Employee ID</TableHead>
                <TableHead>Zoho Email</TableHead>
                <TableHead>Zoho ERECNO</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {profile.employee_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {profile.email}
                  </TableCell>
                  <TableCell>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveMapping(profile.user_id, new FormData(e.currentTarget));
                      }}
                      className="space-y-2"
                    >
                      <Input
                        name="zohoEmpId"
                        placeholder="Zoho Employee ID"
                        defaultValue={profile.zoho_mapping?.zoho_emp_id || ''}
                        className="w-full"
                      />
                      <Input
                        name="email"
                        placeholder="Zoho Email"
                        type="email"
                        defaultValue={profile.zoho_mapping?.email || profile.email}
                        className="w-full"
                        required
                      />
                      <Input
                        name="erecno"
                        placeholder="ERECNO (optional)"
                        defaultValue={profile.zoho_mapping?.erecno || ''}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={saving === profile.user_id}
                        >
                          {saving === profile.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        {profile.zoho_mapping && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMapping(profile.zoho_mapping!.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </form>
                  </TableCell>
                  <TableCell>
                    {profile.zoho_mapping?.email || '-'}
                  </TableCell>
                  <TableCell>
                    {profile.zoho_mapping?.erecno || '-'}
                  </TableCell>
                  <TableCell>
                    {profile.zoho_mapping ? (
                      <span className="text-green-600 text-sm">Mapped</span>
                    ) : (
                      <span className="text-orange-600 text-sm">Not mapped</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};