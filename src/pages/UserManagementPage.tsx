
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Edit2, Trash2, Shield, Building, Mail, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { UserManagementDialog } from '@/components/admin/UserManagementDialog';

interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  role: 'employee' | 'manager' | 'admin';
  is_active: boolean;
  hire_date: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { teamMembers: managers } = useTeamMembers();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'edit' | 'delete'>('edit');
  const [formData, setFormData] = useState<Partial<Employee>>({});

  const departments = ['Engineering', 'Finance', 'Human Resources', 'Marketing', 'Sales', 'Operations', 'IT', 'Legal'];
  const roles = ['employee', 'manager', 'admin'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch employees',
          variant: 'destructive',
        });
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type: 'edit' | 'delete', employee: Employee) => {
    setDialogType(type);
    setSelectedEmployee(employee);
    setFormData(employee);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) return;

    try {
      if (dialogType === 'edit') {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            department: formData.department,
            position: formData.position,
            role: formData.role,
            is_active: formData.is_active,
            manager_id: formData.manager_id
          })
          .eq('id', selectedEmployee.id);

        if (error) throw error;

        toast({
          title: 'Employee Updated',
          description: `${selectedEmployee.first_name} ${selectedEmployee.last_name} has been updated successfully.`,
        });
        fetchEmployees();
      } else if (dialogType === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', selectedEmployee.id);

        if (error) throw error;

        toast({
          title: 'Employee Deactivated',
          description: `${selectedEmployee.first_name} ${selectedEmployee.last_name} has been deactivated.`,
          variant: 'destructive',
        });
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
    }
    
    setDialogOpen(false);
    setFormData({});
    setSelectedEmployee(null);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <Badge className={variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.is_active).length,
    managers: employees.filter(emp => emp.role === 'manager').length,
    departments: new Set(employees.map(emp => emp.department)).size
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">User Management</h1>
          <p className="text-gray-600 mt-1">Manage employee accounts and permissions</p>
        </div>
        <UserManagementDialog 
          managers={managers || []}
          onUserCreated={fetchEmployees}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Users className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">Management roles</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Employee Directory</CardTitle>
          <CardDescription>Manage employee accounts, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-corporate-orange rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-corporate-black">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{getRoleBadge(employee.role)}</TableCell>
                    <TableCell>{getStatusBadge(employee.is_active)}</TableCell>
                    <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenDialog('edit', employee)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleOpenDialog('delete', employee)}
                          disabled={!employee.is_active}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit/Delete */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'edit' ? 'Edit Employee' : 'Deactivate Employee'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'delete' 
                ? 'Are you sure you want to deactivate this employee? They will no longer be able to access the system.'
                : 'Update the employee information below.'}
            </DialogDescription>
          </DialogHeader>

          {dialogType !== 'delete' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData({...formData, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value as Employee['role']})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : selectedEmployee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Department:</strong> {selectedEmployee.department}</p>
              <p><strong>Position:</strong> {selectedEmployee.position}</p>
              <p><strong>Role:</strong> {selectedEmployee.role}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className={dialogType === 'delete' 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-corporate-orange hover:bg-corporate-orange-dark text-white'
              }
            >
              {dialogType === 'edit' ? 'Update Employee' : 'Deactivate Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
