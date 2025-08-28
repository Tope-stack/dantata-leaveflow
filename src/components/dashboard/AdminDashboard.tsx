
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Shield, 
  TrendingUp,
  AlertCircle,
  FileText,
  BarChart3,
  Database,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { LeaveApprovalCard } from './LeaveApprovalCard';
import { UserManagementDialog } from '@/components/admin/UserManagementDialog';

export const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { requests, loading: requestsLoading, approveRequest, rejectRequest, refetch: refetchRequests } = useLeaveRequests();
  const { teamMembers, loading: teamLoading } = useTeamMembers();
  const { logs, loading: logsLoading } = useAuditLogs();

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  // Get all profiles for admin (teamMembers hook returns all when user is admin)
  const allProfiles = teamMembers;
  const managers = allProfiles.filter(p => p.role === 'manager');

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedThisMonth = requests.filter(req => 
    req.status === 'approved' && 
    new Date(req.created_at).getMonth() === new Date().getMonth()
  );

  // Department statistics
  const departmentStats = allProfiles.reduce((acc, profile) => {
    const dept = profile.department;
    if (!acc[dept]) {
      acc[dept] = { name: dept, employees: 0, active: 0 };
    }
    acc[dept].employees++;
    if (profile.is_active) acc[dept].active++;
    return acc;
  }, {} as Record<string, { name: string; employees: number; active: number }>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  if (requestsLoading || teamLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-corporate-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">
            System Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage the entire leave management system.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{allProfiles.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Calendar className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{approvedThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              Leave requests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Activities</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              Recent audit logs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Approvals */}
        <LeaveApprovalCard 
          requests={requests}
          onApprove={approveRequest}
          onReject={rejectRequest}
        />

        {/* Recent Audit Logs */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Recent Audit Logs
            </CardTitle>
            <CardDescription>Latest system activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                  {getActionIcon(log.action)}
                  <div className="flex-1">
                    <p className="text-sm text-corporate-black">
                      <span className="font-medium">{log.action.toUpperCase()}</span> on {log.table_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(log.created_at)}
                      {log.user_id && ` • User: ${log.user_id.substring(0, 8)}...`}
                    </p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No audit logs available</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Audit Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Department Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Department Overview</CardTitle>
          <CardDescription>Employee distribution and activity across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(departmentStats).map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-corporate-black">{dept.name}</h4>
                  <p className="text-sm text-gray-600">
                    {dept.employees} total employees • {dept.active} active
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-corporate-black">
                    {dept.employees > 0 ? Math.round((dept.active / dept.employees) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Active rate</p>
                </div>
              </div>
            ))}
            {Object.keys(departmentStats).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No departments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All System Users */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">System Users</CardTitle>
          <CardDescription>All registered users and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allProfiles.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium text-sm text-corporate-black">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user.employee_id} • {user.department} • {user.position}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant="outline" 
                    className={
                      user.role === 'admin' ? 'border-red-200 text-red-700 bg-red-50' :
                      user.role === 'manager' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      'border-green-200 text-green-700 bg-green-50'
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={user.is_active ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-200 text-red-700 bg-red-50'}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
            {allProfiles.length > 10 && (
              <p className="text-center text-sm text-gray-500 pt-2">
                Showing 10 of {allProfiles.length} users
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
              <Users className="h-5 w-5" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
              <Settings className="h-5 w-5" />
              <span>Leave Policies</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
              <BarChart3 className="h-5 w-5" />
              <span>Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
              <Shield className="h-5 w-5" />
              <span>Audit Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
