
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Calendar,
  Clock,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeamReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock data
  const leaveByTypeData = [
    { name: 'Annual', value: 45, color: '#3B82F6' },
    { name: 'Sick', value: 23, color: '#EF4444' },
    { name: 'Personal', value: 15, color: '#10B981' },
    { name: 'Maternity', value: 8, color: '#F59E0B' },
    { name: 'Emergency', value: 9, color: '#8B5CF6' }
  ];

  const departmentLeaveData = [
    { department: 'Engineering', approved: 25, pending: 3, rejected: 2 },
    { department: 'Marketing', approved: 18, pending: 2, rejected: 1 },
    { department: 'HR', approved: 12, pending: 1, rejected: 0 },
    { department: 'Finance', approved: 15, pending: 2, rejected: 1 },
    { department: 'Operations', approved: 20, pending: 4, rejected: 2 }
  ];

  const monthlyTrendData = [
    { month: 'Jan', leaves: 45 },
    { month: 'Feb', leaves: 52 },
    { month: 'Mar', leaves: 38 },
    { month: 'Apr', leaves: 61 },
    { month: 'May', leaves: 55 },
    { month: 'Jun', leaves: 67 }
  ];

  const teamMetrics = {
    totalRequests: 189,
    approvedRequests: 156,
    pendingRequests: 23,
    rejectedRequests: 10,
    averageProcessingTime: 2.3,
    teamUtilization: 87.5
  };

  const departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];

  const handleExport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `${reportType} report is being generated and will be downloaded shortly.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">Team Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and insights for team leave management.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => handleExport('Full Team Report')}
            className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamMetrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">
              {Math.round((teamMetrics.approvedRequests / teamMetrics.totalRequests) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {teamMetrics.approvedRequests} of {teamMetrics.totalRequests} approved
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamMetrics.averageProcessingTime}</div>
            <p className="text-xs text-muted-foreground">
              days to process
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{teamMetrics.teamUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              Average availability
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave by Type Distribution */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-corporate-black">Leave Distribution by Type</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('Leave Type Report')}
              className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveByTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leaveByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {leaveByTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-corporate-black">Leave Requests Trend</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('Trend Report')}
              className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="leaves" 
                  stroke="#FF6B35" 
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-corporate-black">Department Leave Statistics</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('Department Report')}
            className="border-corporate-orange text-corporate-orange hover:bg-corporate-orange hover:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={departmentLeaveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="approved" fill="#10B981" name="Approved" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-right py-3 px-4">Total Requests</th>
                  <th className="text-right py-3 px-4">Approved</th>
                  <th className="text-right py-3 px-4">Pending</th>
                  <th className="text-right py-3 px-4">Rejected</th>
                  <th className="text-right py-3 px-4">Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {departmentLeaveData.map((dept) => {
                  const total = dept.approved + dept.pending + dept.rejected;
                  const approvalRate = Math.round((dept.approved / total) * 100);
                  
                  return (
                    <tr key={dept.department} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{dept.department}</td>
                      <td className="text-right py-3 px-4">{total}</td>
                      <td className="text-right py-3 px-4">{dept.approved}</td>
                      <td className="text-right py-3 px-4">{dept.pending}</td>
                      <td className="text-right py-3 px-4">{dept.rejected}</td>
                      <td className="text-right py-3 px-4">
                        <Badge className={approvalRate >= 90 ? 'bg-green-100 text-green-800' : approvalRate >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {approvalRate}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamReportsPage;
