
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const pendingApprovals = [
    { id: 1, employee: 'John Doe', type: 'Annual', dates: 'Feb 15-19, 2024', days: 5, submitted: '2 days ago' },
    { id: 2, employee: 'Sarah Wilson', type: 'Sick', dates: 'Feb 10, 2024', days: 1, submitted: '1 day ago' },
    { id: 3, employee: 'Mike Johnson', type: 'Personal', dates: 'Feb 20, 2024', days: 1, submitted: '3 hours ago' },
  ];

  const teamStats = {
    totalMembers: 12,
    onLeave: 2,
    pendingApprovals: 3,
    approvedThisMonth: 8,
  };

  const teamCalendar = [
    { employee: 'Alice Brown', type: 'Annual', dates: 'Feb 12-16', status: 'approved' },
    { employee: 'David Lee', type: 'Sick', dates: 'Feb 14', status: 'approved' },
    { employee: 'John Doe', type: 'Annual', dates: 'Feb 15-19', status: 'pending' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team's leave requests and view upcoming schedules.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Team Report
          </Button>
          <Button className="bg-corporate-orange hover:bg-corporate-orange-dark text-white">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Under your supervision
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently on Leave</CardTitle>
            <Calendar className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamStats.onLeave}</div>
            <p className="text-xs text-muted-foreground">
              Team members away
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require your attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamStats.approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Leave requests approved
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Leave requests awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-corporate-black">{request.employee}</h4>
                      <p className="text-sm text-gray-600">{request.type} Leave</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Dates: {request.dates} ({request.days} days)</p>
                    <p>Submitted: {request.submitted}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Calendar */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Team Calendar</CardTitle>
            <CardDescription>Upcoming leave schedules for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamCalendar.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-corporate-orange" />
                    <div>
                      <p className="font-medium text-sm text-corporate-black">{entry.employee}</p>
                      <p className="text-xs text-gray-600">{entry.type} - {entry.dates}</p>
                    </div>
                  </div>
                  {getStatusBadge(entry.status)}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Team Overview */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Team Overview</CardTitle>
          <CardDescription>Current status of your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Available</span>
              </div>
              <p className="text-2xl font-bold text-green-700">10</p>
              <p className="text-sm text-green-600">Team members</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">On Leave</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">2</p>
              <p className="text-sm text-orange-600">Team members</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Team Utilization</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">83%</p>
              <p className="text-sm text-blue-600">Availability rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
