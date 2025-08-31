
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Edit2, Trash2, Shield, Building, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserManagementDialog } from '@/components/admin/UserManagementDialog';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  status: 'active' | 'inactive';
  joinDate: string;
  managerId?: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
}

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const { teamMembers, loading } = useTeamMembers();
  
  // Get managers for the UserManagementDialog
  const managers = teamMembers.filter(member => member.role === 'manager');
  
  // Mock data for demonstration - in a real app, this would come from teamMembers
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      role: 'employee',
      status: 'active',
      joinDate: '2023-01-15',
      managerId: '2',
      annualLeaveBalance: 18,
      sickLeaveBalance: 12
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      department: 'Engineering',
      role: 'manager',
      status: 'active',
      joinDate: '2022-06-10',
      annualLeaveBalance: 25,
      sickLeaveBalance: 15
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      phone: '+1 (555) 345-6789',
      department: 'Finance',
      role: 'employee',
      status: 'active',
      joinDate: '2023-03-20',
      managerId: '4',
      annualLeaveBalance: 15,
      sickLeaveBalance: 10
    },
    {
      id: '4',
      name: 'Emily Brown',
      email: 'emily.brown@company.com',
      phone: '+1 (555) 456-7890',
      department: 'HR',
      role: 'hr',
      status: 'active',
      joinDate: '2021-08-01',
      annualLeaveBalance: 22,
      sickLeaveBalance: 18
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [formData, setFormData] = useState<Partial<Employee>>({});

  const departments = ['Engineering', 'Finance', 'HR', 'Marketing', 'Sales', 'Operations'];
  const roles = ['employee', 'manager', 'hr', 'admin'];

  const handleOpenDialog = (type: 'add' | 'edit' | 'delete', employee?: Employee) => {
    setDialogType(type);
    setSelectedEmployee(employee || null);
    setFormData(employee || {
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'employee',
      status: 'active',
      annualLeaveBalance: 20,
      sickLeaveBalance: 12
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (dialogType === 'add') {
      const newEmployee: Employee = {
        ...formData as Employee,
        id: Math.random().toString(36).substr(2, 9),
        joinDate: new Date().toISOString().split('T')[0]
      };
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: 'Employee Added',
        description: `${newEmployee.name} has been added successfully.`,
      });
    } else if (dialogType === 'edit' && selectedEmployee) {
      setEmployees(prev => 
        prev.map(emp => emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp)
      );
      toast({
        title: 'Employee Updated',
        description: `${selectedEmployee.name} has been updated successfully.`,
      });
    } else if (dialogType === 'delete' && selectedEmployee) {
      setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
      toast({
        title: 'Employee Removed',
        description: `${selectedEmployee.name} has been removed from the system.`,
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
      hr: 'bg-purple-100 text-purple-800 border-purple-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <Badge className={variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
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
          managers={managers}
          onUserCreated={() => {
            // Refresh team members data - using toast instead of reload
            toast({
              title: 'Employee Added',
              description: 'The new employee has been successfully added to the system.',
            });
          }}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Leave Balance</TableHead>
                <TableHead>Join Date</TableHead>
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
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-corporate-black">{employee.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{getRoleBadge(employee.role)}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Annual: {employee.annualLeaveBalance} days</p>
                      <p className="text-gray-600">Sick: {employee.sickLeaveBalance} days</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit/Delete */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'add' ? 'Add New Employee' : 
               dialogType === 'edit' ? 'Edit Employee' : 'Delete Employee'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'delete' 
                ? 'Are you sure you want to remove this employee? This action cannot be undone.'
                : 'Fill in the employee information below.'}
            </DialogDescription>
          </DialogHeader>

          {dialogType !== 'delete' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="annualLeave">Annual Leave Days</Label>
                  <Input
                    id="annualLeave"
                    type="number"
                    value={formData.annualLeaveBalance || ''}
                    onChange={(e) => setFormData({...formData, annualLeaveBalance: parseInt(e.target.value)})}
                    placeholder="20"
                  />
                </div>

                <div>
                  <Label htmlFor="sickLeave">Sick Leave Days</Label>
                  <Input
                    id="sickLeave"
                    type="number"
                    value={formData.sickLeaveBalance || ''}
                    onChange={(e) => setFormData({...formData, sickLeaveBalance: parseInt(e.target.value)})}
                    placeholder="12"
                  />
                </div>
              </div>
            </div>
          ) : selectedEmployee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {selectedEmployee.name}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Department:</strong> {selectedEmployee.department}</p>
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
              {dialogType === 'add' ? 'Add Employee' : 
               dialogType === 'edit' ? 'Update Employee' : 'Delete Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
