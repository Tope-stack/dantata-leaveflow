
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Edit2, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeavePolicy {
  id: string;
  name: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency';
  allowance: number;
  carryOver: number;
  maxCarryOver: number;
  description: string;
  isActive: boolean;
  requiresApproval: boolean;
  advanceBookingDays: number;
  maxConsecutiveDays: number;
  applicableRoles: string[];
  createdDate: string;
}

const LeavePoliciesPage: React.FC = () => {
  const { toast } = useToast();
  
  // Mock data for demonstration
  const [policies, setPolicies] = useState<LeavePolicy[]>([
    {
      id: '1',
      name: 'Annual Leave',
      type: 'annual',
      allowance: 25,
      carryOver: 5,
      maxCarryOver: 10,
      description: 'Yearly vacation days for all full-time employees',
      isActive: true,
      requiresApproval: true,
      advanceBookingDays: 14,
      maxConsecutiveDays: 10,
      applicableRoles: ['employee', 'manager'],
      createdDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Sick Leave',
      type: 'sick',
      allowance: 12,
      carryOver: 0,
      maxCarryOver: 0,
      description: 'Medical leave for illness or medical appointments',
      isActive: true,
      requiresApproval: false,
      advanceBookingDays: 0,
      maxConsecutiveDays: 7,
      applicableRoles: ['employee', 'manager'],
      createdDate: '2024-01-01'
    },
    {
      id: '3',
      name: 'Personal Leave',
      type: 'personal',
      allowance: 3,
      carryOver: 0,
      maxCarryOver: 0,
      description: 'Personal days for family events or personal matters',
      isActive: true,
      requiresApproval: true,
      advanceBookingDays: 7,
      maxConsecutiveDays: 3,
      applicableRoles: ['employee', 'manager'],
      createdDate: '2024-01-01'
    },
    {
      id: '4',
      name: 'Maternity Leave',
      type: 'maternity',
      allowance: 90,
      carryOver: 0,
      maxCarryOver: 0,
      description: 'Maternity leave for new mothers',
      isActive: true,
      requiresApproval: true,
      advanceBookingDays: 30,
      maxConsecutiveDays: 90,
      applicableRoles: ['employee', 'manager'],
      createdDate: '2024-01-01'
    }
  ]);

  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'view'>('view');
  const [formData, setFormData] = useState<Partial<LeavePolicy>>({});

  const leaveTypes = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'];
  const roles = ['employee', 'manager', 'hr', 'admin'];

  const handleOpenDialog = (type: 'add' | 'edit' | 'view', policy?: LeavePolicy) => {
    setDialogType(type);
    setSelectedPolicy(policy || null);
    setFormData(policy || {
      name: '',
      type: 'annual',
      allowance: 0,
      carryOver: 0,
      maxCarryOver: 0,
      description: '',
      isActive: true,
      requiresApproval: true,
      advanceBookingDays: 0,
      maxConsecutiveDays: 0,
      applicableRoles: ['employee']
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (dialogType === 'add') {
      const newPolicy: LeavePolicy = {
        ...formData as LeavePolicy,
        id: Math.random().toString(36).substr(2, 9),
        createdDate: new Date().toISOString().split('T')[0]
      };
      setPolicies(prev => [...prev, newPolicy]);
      toast({
        title: 'Policy Created',
        description: `${newPolicy.name} policy has been created successfully.`,
      });
    } else if (dialogType === 'edit' && selectedPolicy) {
      setPolicies(prev => 
        prev.map(policy => policy.id === selectedPolicy.id ? { ...policy, ...formData } : policy)
      );
      toast({
        title: 'Policy Updated',
        description: `${selectedPolicy.name} policy has been updated successfully.`,
      });
    }
    
    setDialogOpen(false);
    setFormData({});
    setSelectedPolicy(null);
  };

  const togglePolicyStatus = (policyId: string) => {
    setPolicies(prev => 
      prev.map(policy => 
        policy.id === policyId 
          ? { ...policy, isActive: !policy.isActive }
          : policy
      )
    );
    
    const policy = policies.find(p => p.id === policyId);
    if (policy) {
      toast({
        title: `Policy ${!policy.isActive ? 'Activated' : 'Deactivated'}`,
        description: `${policy.name} has been ${!policy.isActive ? 'activated' : 'deactivated'}.`,
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      annual: 'bg-blue-100 text-blue-800 border-blue-200',
      sick: 'bg-red-100 text-red-800 border-red-200',
      personal: 'bg-purple-100 text-purple-800 border-purple-200',
      maternity: 'bg-pink-100 text-pink-800 border-pink-200',
      paternity: 'bg-green-100 text-green-800 border-green-200',
      emergency: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    
    return (
      <Badge className={variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const stats = {
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.isActive).length,
    totalAllowance: policies.filter(p => p.isActive).reduce((sum, p) => sum + p.allowance, 0),
    approvalRequired: policies.filter(p => p.requiresApproval).length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">Leave Policies</h1>
          <p className="text-gray-600 mt-1">Configure and manage company leave policies</p>
        </div>
        <Button 
          className="bg-corporate-orange hover:bg-corporate-orange-dark text-white"
          onClick={() => handleOpenDialog('add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.totalPolicies}</div>
            <p className="text-xs text-muted-foreground">Configured policies</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.activePolicies}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allowance</CardTitle>
            <Clock className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.totalAllowance}</div>
            <p className="text-xs text-muted-foreground">Days per year</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Require Approval</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{stats.approvalRequired}</div>
            <p className="text-xs text-muted-foreground">Need manager approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Leave Policies</CardTitle>
          <CardDescription>Manage company leave policies and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Allowance</TableHead>
                <TableHead>Carry Over</TableHead>
                <TableHead>Advance Booking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-corporate-black">{policy.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{policy.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(policy.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{policy.allowance} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {policy.carryOver > 0 ? (
                      <div className="text-sm">
                        <p>{policy.carryOver} days</p>
                        <p className="text-gray-600">Max: {policy.maxCarryOver}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {policy.advanceBookingDays > 0 ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{policy.advanceBookingDays} days</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not required</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={policy.isActive} 
                        onCheckedChange={() => togglePolicyStatus(policy.id)}
                      />
                      <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenDialog('view', policy)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenDialog('edit', policy)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Policy Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'add' ? 'Add New Policy' : 
               dialogType === 'edit' ? 'Edit Policy' : 'Policy Details'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'view' 
                ? 'View policy details and configuration'
                : 'Configure leave policy settings and rules'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {dialogType === 'view' && selectedPolicy ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Policy Name</label>
                    <p className="mt-1">{selectedPolicy.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <div className="mt-1">{getTypeBadge(selectedPolicy.type)}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="mt-1 bg-gray-50 p-3 rounded-lg">{selectedPolicy.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Annual Allowance</label>
                    <p className="mt-1">{selectedPolicy.allowance} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Carry Over</label>
                    <p className="mt-1">{selectedPolicy.carryOver} days (Max: {selectedPolicy.maxCarryOver})</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Advance Booking</label>
                    <p className="mt-1">{selectedPolicy.advanceBookingDays} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Consecutive</label>
                    <p className="mt-1">{selectedPolicy.maxConsecutiveDays} days</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Applicable Roles</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedPolicy.applicableRoles.map(role => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Requires Approval:</span>
                    <Badge className={selectedPolicy.requiresApproval ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {selectedPolicy.requiresApproval ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={selectedPolicy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedPolicy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Policy Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Annual Leave"
                      disabled={dialogType === 'view'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Leave Type</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.type || 'annual'}
                      onChange={(e) => setFormData({...formData, type: e.target.value as LeavePolicy['type']})}
                      disabled={dialogType === 'view'}
                    >
                      {leaveTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe this leave policy..."
                    disabled={dialogType === 'view'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="allowance">Annual Allowance (days)</Label>
                    <Input
                      id="allowance"
                      type="number"
                      value={formData.allowance || ''}
                      onChange={(e) => setFormData({...formData, allowance: parseInt(e.target.value)})}
                      placeholder="25"
                      disabled={dialogType === 'view'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carryOver">Carry Over (days)</Label>
                    <Input
                      id="carryOver"
                      type="number"
                      value={formData.carryOver || ''}
                      onChange={(e) => setFormData({...formData, carryOver: parseInt(e.target.value)})}
                      placeholder="5"
                      disabled={dialogType === 'view'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCarryOver">Max Carry Over</Label>
                    <Input
                      id="maxCarryOver"
                      type="number"
                      value={formData.maxCarryOver || ''}
                      onChange={(e) => setFormData({...formData, maxCarryOver: parseInt(e.target.value)})}
                      placeholder="10"
                      disabled={dialogType === 'view'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
                    <Input
                      id="advanceBooking"
                      type="number"
                      value={formData.advanceBookingDays || ''}
                      onChange={(e) => setFormData({...formData, advanceBookingDays: parseInt(e.target.value)})}
                      placeholder="14"
                      disabled={dialogType === 'view'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxConsecutive">Max Consecutive Days</Label>
                    <Input
                      id="maxConsecutive"
                      type="number"
                      value={formData.maxConsecutiveDays || ''}
                      onChange={(e) => setFormData({...formData, maxConsecutiveDays: parseInt(e.target.value)})}
                      placeholder="10"
                      disabled={dialogType === 'view'}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requiresApproval">Requires Manager Approval</Label>
                      <p className="text-sm text-gray-600">Whether this leave type needs approval</p>
                    </div>
                    <Switch
                      id="requiresApproval"
                      checked={formData.requiresApproval || false}
                      onCheckedChange={(checked) => setFormData({...formData, requiresApproval: checked})}
                      disabled={dialogType === 'view'}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive">Active Policy</Label>
                      <p className="text-sm text-gray-600">Whether this policy is currently active</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive || false}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                      disabled={dialogType === 'view'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {dialogType !== 'view' && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-corporate-orange hover:bg-corporate-orange-dark text-white"
              >
                {dialogType === 'add' ? 'Create Policy' : 'Update Policy'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavePoliciesPage;
