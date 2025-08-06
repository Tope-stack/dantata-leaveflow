
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Info,
  CalendarDays,
  Heart,
  User,
  Baby,
  AlertTriangle,
  Download
} from 'lucide-react';

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  pending: number;
  available: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  carryOver?: number;
}

interface LeaveTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  days: number;
  balance: number;
  status: 'approved' | 'pending' | 'rejected';
}

const LeaveBalancePage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const leaveBalances: LeaveBalance[] = [
    {
      type: 'Annual Leave',
      total: 21,
      used: 8,
      pending: 5,
      available: 8,
      carryOver: 3,
      icon: <Calendar className="h-6 w-6" />,
      color: 'blue',
      description: 'Your yearly vacation entitlement'
    },
    {
      type: 'Sick Leave',
      total: 10,
      used: 2,
      pending: 0,
      available: 8,
      icon: <Heart className="h-6 w-6" />,
      color: 'red',
      description: 'Medical leave for illness'
    },
    {
      type: 'Personal Leave',
      total: 5,
      used: 1,
      pending: 1,
      available: 3,
      icon: <User className="h-6 w-6" />,
      color: 'green',
      description: 'Personal matters and appointments'
    },
    {
      type: 'Emergency Leave',
      total: 3,
      used: 0,
      pending: 0,
      available: 3,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'orange',
      description: 'Unexpected urgent situations'
    },
    {
      type: 'Maternity/Paternity',
      total: 90,
      used: 0,
      pending: 0,
      available: 90,
      icon: <Baby className="h-6 w-6" />,
      color: 'purple',
      description: 'Parental leave entitlement'
    },
  ];

  const leaveTransactions: LeaveTransaction[] = [
    {
      id: '1',
      date: '2024-03-01',
      type: 'Annual Leave',
      description: 'Family vacation (Mar 10-14)',
      days: -5,
      balance: 16,
      status: 'approved'
    },
    {
      id: '2',
      date: '2024-02-15',
      type: 'Sick Leave',
      description: 'Flu symptoms (Feb 15-16)',
      days: -2,
      balance: 8,
      status: 'approved'
    },
    {
      id: '3',
      date: '2024-01-01',
      type: 'Annual Leave',
      description: 'New year allocation',
      days: 21,
      balance: 21,
      status: 'approved'
    },
    {
      id: '4',
      date: '2024-04-10',
      type: 'Personal Leave',
      description: 'Personal appointment (Apr 20)',
      days: -1,
      balance: 15,
      status: 'pending'
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const totalAvailable = leaveBalances.reduce((sum, balance) => sum + balance.available, 0);
  const totalUsed = leaveBalances.reduce((sum, balance) => sum + balance.used, 0);
  const totalPending = leaveBalances.reduce((sum, balance) => sum + balance.pending, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-corporate-black mb-2 flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-corporate-orange" />
              Leave Balance
            </h1>
            <p className="text-gray-600">
              Monitor your leave entitlements, usage, and available balance across all leave types.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Available</p>
                  <p className="text-2xl font-bold text-blue-800">{totalAvailable}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Days Used</p>
                  <p className="text-2xl font-bold text-green-800">{totalUsed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{totalPending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-corporate-orange/10 to-corporate-orange/20 border-corporate-orange/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-corporate-orange font-medium">Usage Rate</p>
                  <p className="text-2xl font-bold text-corporate-orange">
                    {Math.round((totalUsed / (totalUsed + totalAvailable)) * 100)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-corporate-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="balance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balance">Leave Balances</TabsTrigger>
            <TabsTrigger value="history">Balance History</TabsTrigger>
          </TabsList>

          <TabsContent value="balance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {leaveBalances.map((balance, index) => {
                const usagePercentage = (balance.used / balance.total) * 100;
                const pendingPercentage = (balance.pending / balance.total) * 100;
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 text-corporate-black">
                          <div className={`text-${balance.color}-500`}>
                            {balance.icon}
                          </div>
                          {balance.type}
                        </CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-corporate-black">
                            {balance.available}
                          </div>
                          <div className="text-sm text-gray-500">available</div>
                        </div>
                      </div>
                      <CardDescription>{balance.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usage Progress</span>
                          <span className="text-gray-600">
                            {balance.used}/{balance.total} days
                          </span>
                        </div>
                        <Progress 
                          value={usagePercentage} 
                          className="h-2"
                        />
                        {balance.pending > 0 && (
                          <div className="text-sm text-yellow-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {balance.pending} days pending approval
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {balance.available}
                          </div>
                          <div className="text-xs text-gray-500">Available</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-600">
                            {balance.used}
                          </div>
                          <div className="text-xs text-gray-500">Used</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-600">
                            {balance.pending}
                          </div>
                          <div className="text-xs text-gray-500">Pending</div>
                        </div>
                      </div>
                      
                      {balance.carryOver && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <Info className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-700">
                              {balance.carryOver} days carried over from last year
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-corporate-black">
                  Balance Transaction History
                </CardTitle>
                <CardDescription>
                  Track all changes to your leave balances over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-corporate-black">
                            {transaction.type}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-semibold ${
                              transaction.days > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.days > 0 ? '+' : ''}{transaction.days}
                            </span>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {transaction.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>Balance: {transaction.balance} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {leaveTransactions.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No balance transactions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaveBalancePage;
