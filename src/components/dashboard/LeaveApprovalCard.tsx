import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { LeaveRequest } from '@/hooks/useLeaveRequests';
import { toast } from 'sonner';

interface LeaveApprovalCardProps {
  requests: LeaveRequest[];
  onApprove: (requestId: string, comments?: string) => Promise<boolean>;
  onReject: (requestId: string, comments?: string) => Promise<boolean>;
}

export const LeaveApprovalCard: React.FC<LeaveApprovalCardProps> = ({
  requests,
  onApprove,
  onReject
}) => {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [loading, setLoading] = useState(false);

  const pendingRequests = requests.filter(req => req.status === 'pending');

  const handleAction = async () => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      const success = actionType === 'approve' 
        ? await onApprove(selectedRequest.id, comments)
        : await onReject(selectedRequest.id, comments);

      if (success) {
        toast.success(`Leave request ${actionType}d successfully`);
        setSelectedRequest(null);
        setComments('');
      } else {
        toast.error(`Failed to ${actionType} leave request`);
      }
    } catch (error) {
      toast.error(`Error ${actionType}ing leave request`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Pending Approvals ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pending approvals</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">
                      {request.profiles.first_name} {request.profiles.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.profiles.employee_id} • {request.profiles.department}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
                    {request.leave_type}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p>
                    {formatDate(request.start_date)} - {formatDate(request.end_date)} 
                    <span className="ml-2">({request.total_days} days)</span>
                  </p>
                  {request.reason && (
                    <p className="mt-1">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted {formatDate(request.created_at)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('approve');
                          setComments('');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Leave Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium">
                            {selectedRequest?.profiles.first_name} {selectedRequest?.profiles.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedRequest?.leave_type} leave from {selectedRequest && formatDate(selectedRequest.start_date)} to {selectedRequest && formatDate(selectedRequest.end_date)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Comments (optional)
                          </label>
                          <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add any comments for the approval..."
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAction}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {loading ? 'Approving...' : 'Approve Request'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('reject');
                          setComments('');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium">
                            {selectedRequest?.profiles.first_name} {selectedRequest?.profiles.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedRequest?.leave_type} leave from {selectedRequest && formatDate(selectedRequest.start_date)} to {selectedRequest && formatDate(selectedRequest.end_date)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Reason for rejection <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            className="w-full"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAction}
                            disabled={loading || !comments.trim()}
                            variant="destructive"
                          >
                            {loading ? 'Rejecting...' : 'Reject Request'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};