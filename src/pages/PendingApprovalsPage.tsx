
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Eye, Calendar, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  urgency: 'low' | 'medium' | 'high';
}

const PendingApprovalsPage: React.FC = () => {
  const { toast } = useToast();
  
  // Mock data for demonstration
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      department: 'Engineering',
      leaveType: 'Annual Leave',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      days: 5,
      reason: 'Family vacation to celebrate wedding anniversary',
      status: 'pending',
      appliedDate: '2024-01-20',
      urgency: 'medium'
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP002',
      department: 'Marketing',
      leaveType: 'Sick Leave',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      days: 3,
      reason: 'Medical appointment and recovery',
      status: 'pending',
      appliedDate: '2024-02-08',
      urgency: 'high'
    },
    {
      id: '3',
      employeeName: 'Mike Davis',
      employeeId: 'EMP003',
      department: 'Finance',
      leaveType: 'Personal Leave',
      startDate: '2024-02-25',
      endDate: '2024-02-25',
      days: 1,
      reason: 'Attending graduation ceremony',
      status: 'pending',
      appliedDate: '2024-01-25',
      urgency: 'low'
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const handleAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
    
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: newStatus as 'pending' | 'approved' | 'rejected' }
          : req
      )
    );

    toast({
      title: `Leave Request ${actionType === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `${selectedRequest.employeeName}'s leave request has been ${actionType === 'approve' ? 'approved' : 'rejected'}.`,
      variant: actionType === 'approve' ? 'default' : 'destructive',
    });

    setDialogOpen(false);
    setActionComments('');
    setSelectedRequest(null);
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    
    return (
      <Badge className={variants[urgency as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">Review and manage employee leave requests</p>
        </div>
        <div className="text-sm text-gray-600">
          {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">
              {pendingRequests.filter(req => req.urgency === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent requests</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">
              {pendingRequests.filter(req => new Date(req.appliedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Leave Requests</CardTitle>
          <CardDescription>Review and approve employee leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-corporate-black">All caught up!</h3>
              <p className="text-gray-600">No pending leave requests to review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-corporate-black">{request.employeeName}</p>
                          <p className="text-sm text-gray-600">{request.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.leaveType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.days} day{request.days !== 1 ? 's' : ''}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                    <TableCell>{new Date(request.appliedDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Leave Request Details</DialogTitle>
                              <DialogDescription>Review the complete leave request information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Employee</label>
                                  <p>{request.employeeName} ({request.employeeId})</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Department</label>
                                  <p>{request.department}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Leave Type</label>
                                  <p>{request.leaveType}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Duration</label>
                                  <p>{request.days} days</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Reason</label>
                                <p className="bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleAction(request, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleAction(request, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
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

      {/* Action Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this leave request?' 
                : 'Are you sure you want to reject this leave request?'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Employee:</strong> {selectedRequest.employeeName}</p>
                <p><strong>Leave Type:</strong> {selectedRequest.leaveType}</p>
                <p><strong>Duration:</strong> {selectedRequest.days} days ({new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()})</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Comments (Optional)
                </label>
                <Textarea
                  placeholder={`Add comments for this ${actionType}...`}
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              className={actionType === 'approve' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
              }
            >
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingApprovalsPage;
