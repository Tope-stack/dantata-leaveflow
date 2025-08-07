
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Filter, Calendar, TrendingUp, Users, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Mock data for demonstration
  const leaveByType = [
    { name: 'Annual Leave', value: 156, color: '#3b82f6' },
    { name: 'Sick Leave', value: 89, color: '#ef4444' },
    { name: 'Personal Leave', value: 34, color: '#8b5cf6' },
    { name: 'Maternity', value: 12, color: '#ec4899' },
    { name: 'Emergency', value: 8, color: '#f59e0b' }
  ];

  const monthlyTrends = [
    { month: 'Jan', approved: 45, rejected: 3, pending: 2 },
    { month: 'Feb', approved: 52, rejected: 5, pending: 4 },
    { month: 'Mar', approved: 48, rejected: 2, pending: 3 },
    { month: 'Apr', approved: 61, rejected: 4, pending: 6 },
    { month: 'May', approved: 55, rejected: 3, pending: 5 },
    { month: 'Jun', approved: 67, rejected: 6, pending: 4 }
  ];

  const departmentStats = [
    { department: 'Engineering', total: 89, approved: 82, rejected: 4, pending: 3 },
    { department: 'Marketing', total: 45, approved: 41, rejected: 2, pending: 2 },
    { department: 'Finance', total: 34, approved: 31, rejected: 2, pending: 1 },
    { department: 'HR', total: 23, approved: 21, rejected: 1, pending: 1 },
    { department: 'Operations', total: 67, approved: 59, rejected: 5, pending: 3 }
  ];

  const utilizationData = [
    { employee: 'John Smith', allocated: 25, used: 18, remaining: 7, percentage: 72 },
    { employee: 'Sarah Johnson', allocated: 25, used: 22, remaining: 3, percentage: 88 },
    { employee: 'Mike Davis', allocated: 20, used: 15, remaining: 5, percentage: 75 },
    { employee: 'Emily Brown', allocated: 25, used: 12, remaining: 13, percentage: 48 },
    { employee: 'Alex Wilson', allocated: 22, used: 20, remaining: 2, percentage: 91 }
  ];

  const systemMetrics = {
    totalRequests: 299,
    approvalRate: 94.3,
    avgProcessingTime: 2.1,
    activeEmployees: 156
  };

  const handleExportReport = (reportType: string) => {
    toast({
      title: 'Exporting Report',
      description: `${reportType} report is being generated and will be downloaded shortly.`,
    });
  };

  const COLORS = ['#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-corporate-black">System Reports</h1>
          <p className="text-gray-600 mt-1">Analytics and insights for leave management</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemMetrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemMetrics.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-corporate-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemMetrics.avgProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">-0.3 days from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-black">{systemMetrics.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">+8 new this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Types Distribution */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Leave Types Distribution</CardTitle>
            <CardDescription>Breakdown of leave requests by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leaveByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-corporate-black">Monthly Trends</CardTitle>
            <CardDescription>Leave requests processed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Department Statistics</CardTitle>
          <CardDescription>Leave request statistics by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Leave Utilization Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-corporate-black">Leave Utilization</CardTitle>
              <CardDescription>Employee leave balance and usage statistics</CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => handleExportReport('Leave Utilization')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utilizationData.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-corporate-black">{employee.employee}</h4>
                  <p className="text-sm text-gray-600">
                    {employee.used} of {employee.allocated} days used • {employee.remaining} remaining
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-corporate-orange h-2 rounded-full" 
                      style={{ width: `${employee.percentage}%` }}
                    ></div>
                  </div>
                  <Badge 
                    className={
                      employee.percentage >= 80 ? 'bg-red-100 text-red-800' :
                      employee.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }
                  >
                    {employee.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-corporate-black">Quick Export Options</CardTitle>
          <CardDescription>Generate and download detailed reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => handleExportReport('Monthly Summary')}
            >
              <Calendar className="h-5 w-5" />
              <span>Monthly Summary</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => handleExportReport('Department Report')}
            >
              <Users className="h-5 w-5" />
              <span>Department Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => handleExportReport('Employee Utilization')}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Utilization Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => handleExportReport('Full System Report')}
            >
              <FileText className="h-5 w-5" />
              <span>Full Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemReportsPage;
