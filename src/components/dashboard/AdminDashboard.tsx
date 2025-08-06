
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
  UserPlus,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const systemStats = {
    totalEmployees: 150,
    activeRequests: 23,
    approvedThisMonth: 89,
    systemAlerts: 2,
  };

  const recentActivity = [
    { id: 1, type: 'Leave Request', user: 'John Doe', action: 'submitted', time: '2 minutes ago' },
    { id: 2, type: 'Policy Update', user: 'HR Admin', action: 'modified sick leave policy', time: '1 hour ago' },
    { id: 3, type: 'User Registration', user: 'New Employee', action: 'joined the system', time: '3 hours ago' },
    { id: 4, type: 'Leave Approval', user: 'Jane Smith', action: 'approved by manager', time: '5 hours ago' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Annual leave policy update required by end of month', priority: 'high' },
    { id: 2, type: 'info', message: 'Database maintenance scheduled for this weekend', priority: 'medium' },
  ];

  const departmentStats = [
    { name: 'Engineering', employees: 45, onLeave: 3, utilization: 93 },
    { name: 'Sales', employees: 32, onLeave: 2, utilization: 94 },
    { name: 'Marketing', employees: 18, onLeave: 1, utilization: 94 },
    { name: 'HR', employees: 12, onLeave: 0, utilization: 100 },
    { name: 'Finance', employees: 15, onLeave: 1, utilization: 93 },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    return (
      <Badge className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

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
          <Button className="bg-corporate-orange hover:bg-corporate-orange-dark text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
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
            <div className="text-2xl font-bold text-corporate-black">{systemStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Calendar className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemStats.activeRequests}</div>
            <p className="text-xs text-muted-foreground">
              Pending processing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemStats.approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Leave requests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemStats.systemAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              System Alerts
            </CardTitle>
            <CardDescription>Important system notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm text-corporate-black">{alert.message}</p>
                  </div>
                  {getPriorityBadge(alert.priority)}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Recent Activity</CardTitle>
            <CardDescription>Latest system activities and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="h-4 w-4 text-corporate-orange mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-corporate-black">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-600">{activity.type} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Department Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Department Statistics</CardTitle>
          <CardDescription>Overview of leave utilization across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-corporate-black">{dept.name}</h4>
                  <p className="text-sm text-gray-600">
                    {dept.employees} employees • {dept.onLeave} on leave
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-corporate-black">{dept.utilization}%</p>
                  <p className="text-xs text-gray-600">Utilization</p>
                </div>
              </div>
            ))}
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
