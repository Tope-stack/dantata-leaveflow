import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, UserCheck, UserX } from 'lucide-react';
import { UserProfile } from '@/contexts/AuthContext';
import { ZohoEmployeeMapping } from '@/types/zoho';

interface EmployeeMappingTableProps {
  isConnected: boolean;
}

const EmployeeMappingTable: React.FC<EmployeeMappingTableProps> = ({ isConnected }) => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [mappings, setMappings] = useState<Record<string, ZohoEmployeeMapping>>({});
  const [editingMappings, setEditingMappings] = useState<Record<string, { zoho_emp_id: string; erecno: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchEmployeesAndMappings();
    }
  }, [isConnected]);

  const fetchEmployeesAndMappings = async () => {
    try {
      setLoading(true);

      // Fetch all employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('first_name');

      if (employeesError) throw employeesError;

      // Fetch existing mappings
      const { data: mappingsData, error: mappingsError } = await supabase
        .from('zoho_employee_map')
        .select('*');

      if (mappingsError) throw mappingsError;

      setEmployees(employeesData || []);
      
      // Convert mappings array to record for easy lookup
      const mappingsRecord: Record<string, ZohoEmployeeMapping> = {};
      mappingsData?.forEach(mapping => {
        mappingsRecord[mapping.app_user_id] = mapping;
      });
      setMappings(mappingsRecord);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (userId: string, field: 'zoho_emp_id' | 'erecno', value: string) => {
    setEditingMappings(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const saveMapping = async (userId: string, email: string) => {
    const editingData = editingMappings[userId];
    if (!editingData || (!editingData.zoho_emp_id && !editingData.erecno)) {
      toast({
        title: 'Validation Error',
        description: 'Please provide either Zoho Employee ID or eRecno',
        variant: 'destructive'
      });
      return;
    }

    setSaving(userId);
    try {
      const mappingData = {
        app_user_id: userId,
        email: email,
        zoho_emp_id: editingData.zoho_emp_id || null,
        erecno: editingData.erecno || null
      };

      const { data, error } = await supabase
        .from('zoho_employee_map')
        .upsert(mappingData, { 
          onConflict: 'app_user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setMappings(prev => ({
        ...prev,
        [userId]: data
      }));

      // Clear editing state
      setEditingMappings(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      toast({
        title: 'Success',
        description: 'Employee mapping saved successfully'
      });

    } catch (error) {
      console.error('Error saving mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to save employee mapping',
        variant: 'destructive'
      });
    } finally {
      setSaving(null);
    }
  };

  const removeMapping = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('zoho_employee_map')
        .delete()
        .eq('app_user_id', userId);

      if (error) throw error;

      // Update local state
      setMappings(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      toast({
        title: 'Success',
        description: 'Employee mapping removed successfully'
      });

    } catch (error) {
      console.error('Error removing mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove employee mapping',
        variant: 'destructive'
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Mapping</CardTitle>
          <CardDescription>
            Please connect to Zoho People first to manage employee mappings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Mapping</CardTitle>
          <CardDescription>Loading employee data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Mapping</CardTitle>
        <CardDescription>
          Map your application users to Zoho People employees. Provide either Employee ID or eRecno for synchronization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Zoho Employee ID</TableHead>
              <TableHead>eRecno</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const mapping = mappings[employee.user_id];
              const isEditing = editingMappings[employee.user_id];
              const isMapped = !!(mapping?.zoho_emp_id || mapping?.erecno);

              return (
                <TableRow key={employee.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.employee_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={isEditing.zoho_emp_id || ''}
                        onChange={(e) => handleMappingChange(employee.user_id, 'zoho_emp_id', e.target.value)}
                        placeholder="Enter Zoho Employee ID"
                        className="w-40"
                      />
                    ) : (
                      <span className="text-sm">
                        {mapping?.zoho_emp_id || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={isEditing.erecno || ''}
                        onChange={(e) => handleMappingChange(employee.user_id, 'erecno', e.target.value)}
                        placeholder="Enter eRecno"
                        className="w-32"
                      />
                    ) : (
                      <span className="text-sm">
                        {mapping?.erecno || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isMapped ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Mapped
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <UserX className="w-3 h-3 mr-1" />
                        Not Mapped
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => saveMapping(employee.user_id, employee.email)}
                            disabled={saving === employee.user_id}
                          >
                            {saving === employee.user_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMappings(prev => {
                                const updated = { ...prev };
                                delete updated[employee.user_id];
                                return updated;
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMappings(prev => ({
                                ...prev,
                                [employee.user_id]: {
                                  zoho_emp_id: mapping?.zoho_emp_id || '',
                                  erecno: mapping?.erecno || ''
                                }
                              }));
                            }}
                          >
                            {isMapped ? 'Edit' : 'Map'}
                          </Button>
                          {isMapped && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeMapping(employee.user_id)}
                            >
                              Remove
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmployeeMappingTable;