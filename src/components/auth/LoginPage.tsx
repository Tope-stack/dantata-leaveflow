
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Calendar, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const demoCredentials = [
    { email: 'employee@demo.com', password: 'demo123', role: 'employee' as UserRole },
    { email: 'manager@demo.com', password: 'demo123', role: 'manager' as UserRole },
    { email: 'admin@demo.com', password: 'demo123', role: 'admin' as UserRole },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-corporate-gray-light to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-corporate-orange rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-corporate-black">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            <div className="flex items-center justify-center gap-2 mt-2">
              <Building2 className="h-4 w-4" />
              <span>Dantata Town Developers Limited</span>
            </div>
            <span className="block mt-1">Leave Management System</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Login As</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-corporate-orange hover:bg-corporate-orange-dark text-white font-medium"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</p>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                    setRole(cred.role);
                  }}
                  className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-xs border"
                >
                  <span className="font-medium capitalize">{cred.role}:</span> {cred.email}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
