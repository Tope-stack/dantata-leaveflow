
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Filter, 
  Download,
  Eye,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaveEvent {
  id: string;
  employee: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
  duration: number;
}

const TeamCalendarPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const leaveEvents: LeaveEvent[] = [
    {
      id: '1',
      employee: 'John Doe',
      department: 'Engineering',
      leaveType: 'Annual',
      startDate: '2024-02-15',
      endDate: '2024-02-19',
      status: 'approved',
      duration: 5
    },
    {
      id: '2',
      employee: 'Sarah Wilson',
      department: 'Marketing',
      leaveType: 'Sick',
      startDate: '2024-02-10',
      endDate: '2024-02-10',
      status: 'approved',
      duration: 1
    },
    {
      id: '3',
      employee: 'Mike Johnson',
      department: 'Engineering',
      leaveType: 'Personal',
      startDate: '2024-02-20',
      endDate: '2024-02-20',
      status: 'pending',
      duration: 1
    },
    {
      id: '4',
      employee: 'Emily Brown',
      department: 'HR',
      leaveType: 'Maternity',
      startDate: '2024-02-12',
      endDate: '2024-04-12',
      status: 'approved',
      duration: 60
    }
  ];

  const departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];

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

  const filteredEvents = leaveEvents.filter(event => {
    const matchesDepartment = filterDepartment === 'all' || event.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesSearch = event.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Team calendar data is being exported to CSV.",
    });
  };

  const handleViewDetails = (eventId: string) => {
    toast({
      title: "View Details",
      description: `Opening details for leave request ${eventId}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">Team Calendar</h1>
          <p className="text-gray-600 mt-1">
            View and manage team leave schedules across all departments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees or leave type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterDepartment('all');
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="border-gray-300"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Leave Events */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Leave Schedule ({filteredEvents.length} events)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-corporate-black">{event.employee}</h4>
                        <p className="text-sm text-gray-600">{event.department} • {event.leaveType} Leave</p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Start: {new Date(event.startDate).toLocaleDateString()}</p>
                      <p>End: {new Date(event.endDate).toLocaleDateString()}</p>
                      <p>Duration: {event.duration} day{event.duration !== 1 ? 's' : ''}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(event.id)}
                      className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No leave events found matching your criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Availability Summary */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Team Availability Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const deptEvents = filteredEvents.filter(e => e.department === dept);
              const onLeave = deptEvents.filter(e => e.status === 'approved').length;
              const total = 8; // Mock total employees per department
              const available = total - onLeave;
              
              return (
                <div key={dept} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-corporate-black mb-2">{dept}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Available: {available}</span>
                    <span className="text-orange-600">On Leave: {onLeave}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(available / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCalendarPage;
