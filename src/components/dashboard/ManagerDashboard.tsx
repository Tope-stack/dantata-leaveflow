
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { LeaveApprovalCard } from './LeaveApprovalCard';
import { useNavigate } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { requests, loading: requestsLoading, approveRequest, rejectRequest } = useLeaveRequests();
  const { teamMembers, loading: teamLoading } = useTeamMembers();
  const navigate = useNavigate();

  if (!profile || profile.role !== 'manager') {
    return null;
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedThisMonth = requests.filter(req => 
    req.status === 'approved' && 
    new Date(req.created_at).getMonth() === new Date().getMonth()
  );
  const currentlyOnLeave = requests.filter(req => {
    const now = new Date();
    const startDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);
    return req.status === 'approved' && startDate <= now && endDate >= now;
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (requestsLoading || teamLoading) {
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
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team's leave requests and view upcoming schedules.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white"
            onClick={() => navigate('/team-reports')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Team Report
          </Button>
          <Button 
            className="bg-corporate-orange hover:bg-corporate-orange-dark text-white"
            onClick={() => navigate('/team-calendar')}
          >
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
            <div className="text-2xl font-bold text-corporate-black">{teamMembers.length}</div>
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
            <div className="text-2xl font-bold text-corporate-black">{currentlyOnLeave.length}</div>
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
            <div className="text-2xl font-bold text-corporate-black">{pendingRequests.length}</div>
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
            <div className="text-2xl font-bold text-corporate-black">{approvedThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              Leave requests approved
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

        {/* Team Members */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Team Members</CardTitle>
            <CardDescription>Your direct reports and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No team members assigned</p>
                </div>
              ) : (
                teamMembers.map((member) => {
                  const memberOnLeave = currentlyOnLeave.find(req => req.user_id === member.user_id);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${memberOnLeave ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <div>
                          <p className="font-medium text-sm text-corporate-black">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {member.position} • {member.employee_id}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={memberOnLeave ? 'border-orange-200 text-orange-700 bg-orange-50' : 'border-green-200 text-green-700 bg-green-50'}
                      >
                        {memberOnLeave ? 'On Leave' : 'Available'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave History */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Recent Leave History</CardTitle>
          <CardDescription>Latest leave requests from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-corporate-orange" />
                  <div>
                    <p className="font-medium text-sm text-corporate-black">
                      {request.profiles.first_name} {request.profiles.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {request.leave_type} • {formatDate(request.start_date)} - {formatDate(request.end_date)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No leave requests yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
