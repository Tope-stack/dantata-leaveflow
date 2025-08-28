
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeDashboard } from './EmployeeDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardRouter: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  switch (profile.role) {
    case 'employee':
      return <EmployeeDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <EmployeeDashboard />;
  }
};
