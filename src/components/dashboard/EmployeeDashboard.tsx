
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  TrendingUp,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const EmployeeDashboard: React.FC = () => {
  const { profile } = useAuth();

  // Mock data for demonstration
  const leaveBalance = {
    annual: { used: 8, total: 21 },
    sick: { used: 2, total: 10 },
    personal: { used: 1, total: 5 },
  };

  const recentLeaves = [
    { id: 1, type: 'Annual', dates: 'Jan 15-19, 2024', days: 5, status: 'approved' },
    { id: 2, type: 'Sick', dates: 'Dec 22, 2023', days: 1, status: 'approved' },
    { id: 3, type: 'Personal', dates: 'Nov 30, 2023', days: 1, status: 'pending' },
  ];

  const upcomingLeaves = [
    { id: 1, type: 'Annual', dates: 'Mar 10-14, 2024', days: 5, status: 'approved' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

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
            Welcome back, {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your leave status and recent activity.
          </p>
        </div>
        <Button className="bg-corporate-orange hover:bg-corporate-orange-dark text-white">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leave Days</CardTitle>
            <Calendar className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">36</div>
            <p className="text-xs text-muted-foreground">
              Annual allocation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used This Year</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">11</div>
            <p className="text-xs text-muted-foreground">
              31% of allocation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">1</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Days</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">25</div>
            <p className="text-xs text-muted-foreground">
              Available to use
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Leave Balance</CardTitle>
            <CardDescription>Your current leave entitlements and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Annual Leave</span>
                <span className="text-gray-600">{leaveBalance.annual.used}/{leaveBalance.annual.total} days</span>
              </div>
              <Progress 
                value={(leaveBalance.annual.used / leaveBalance.annual.total) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Sick Leave</span>
                <span className="text-gray-600">{leaveBalance.sick.used}/{leaveBalance.sick.total} days</span>
              </div>
              <Progress 
                value={(leaveBalance.sick.used / leaveBalance.sick.total) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Personal Leave</span>
                <span className="text-gray-600">{leaveBalance.personal.used}/{leaveBalance.personal.total} days</span>
              </div>
              <Progress 
                value={(leaveBalance.personal.used / leaveBalance.personal.total) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Recent Leave Requests</CardTitle>
            <CardDescription>Your latest leave applications and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(leave.status)}
                    <div>
                      <p className="font-medium text-sm text-corporate-black">{leave.type} Leave</p>
                      <p className="text-xs text-gray-600">{leave.dates} ({leave.days} days)</p>
                    </div>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Leave */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Upcoming Leave</CardTitle>
          <CardDescription>Your approved future leave dates</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingLeaves.length > 0 ? (
            <div className="space-y-3">
              {upcomingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm text-corporate-black">{leave.type} Leave</p>
                      <p className="text-xs text-gray-600">{leave.dates} ({leave.days} days)</p>
                    </div>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming leave scheduled</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
