
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface LeaveRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'rejected' | 'pending' | 'cancelled';
  appliedDate: string;
  reason: string;
  approvedBy?: string;
  comments?: string;
}

const mockLeaveHistory: LeaveRecord[] = [
  {
    id: '1',
    type: 'Annual Leave',
    startDate: '2024-03-10',
    endDate: '2024-03-14',
    days: 5,
    status: 'approved',
    appliedDate: '2024-02-20',
    reason: 'Family vacation',
    approvedBy: 'Jane Smith',
    comments: 'Approved for family time'
  },
  {
    id: '2',
    type: 'Sick Leave',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    days: 2,
    status: 'approved',
    appliedDate: '2024-01-14',
    reason: 'Flu symptoms',
    approvedBy: 'Jane Smith'
  },
  {
    id: '3',
    type: 'Personal Leave',
    startDate: '2024-04-20',
    endDate: '2024-04-20',
    days: 1,
    status: 'pending',
    appliedDate: '2024-04-10',
    reason: 'Personal appointment'
  },
  {
    id: '4',
    type: 'Annual Leave',
    startDate: '2023-12-22',
    endDate: '2023-12-29',
    days: 6,
    status: 'rejected',
    appliedDate: '2023-12-01',
    reason: 'Christmas holidays',
    approvedBy: 'Jane Smith',
    comments: 'Too many team members on leave during this period'
  },
  {
    id: '5',
    type: 'Emergency Leave',
    startDate: '2023-11-05',
    endDate: '2023-11-05',
    days: 1,
    status: 'approved',
    appliedDate: '2023-11-05',
    reason: 'Family emergency',
    approvedBy: 'Jane Smith'
  },
];

const LeaveHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800 hover:bg-green-100',
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
      cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  const filteredLeaveHistory = mockLeaveHistory.filter((leave) => {
    const matchesSearch = leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = typeFilter === 'all' || leave.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalDays = filteredLeaveHistory.reduce((sum, leave) => 
    leave.status === 'approved' ? sum + leave.days : sum, 0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-corporate-black mb-2 flex items-center gap-3">
            <History className="h-8 w-8 text-corporate-orange" />
            Leave History
          </h1>
          <p className="text-gray-600">
            View and manage your complete leave application history and status updates.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-corporate-black">{filteredLeaveHistory.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-corporate-orange" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Days</p>
                  <p className="text-2xl font-bold text-green-600">{totalDays}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredLeaveHistory.filter(l => l.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredLeaveHistory.filter(l => l.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-corporate-black">
              Leave Applications
            </CardTitle>
            <CardDescription>
              Complete history of your leave applications with status and details
            </CardDescription>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by leave type or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="emergency">Emergency Leave</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaveHistory.length > 0 ? (
                    filteredLeaveHistory.map((leave) => (
                      <TableRow key={leave.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{leave.type}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(leave.startDate)}</div>
                            {leave.startDate !== leave.endDate && (
                              <div className="text-gray-500">to {formatDate(leave.endDate)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{leave.days} day{leave.days !== 1 ? 's' : ''}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(leave.appliedDate)}
                        </TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {leave.approvedBy || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-xs">
                          <div className="text-sm text-gray-600 truncate" title={leave.reason}>
                            {leave.reason}
                          </div>
                          {leave.comments && (
                            <div className="text-xs text-gray-500 mt-1 truncate" title={leave.comments}>
                              Comment: {leave.comments}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <History className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-500">No leave applications found</p>
                          <p className="text-sm text-gray-400">
                            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                              ? 'Try adjusting your filters' 
                              : 'You haven\'t applied for any leave yet'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveHistoryPage;
