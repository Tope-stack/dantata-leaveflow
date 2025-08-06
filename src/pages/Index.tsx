
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { DashboardRouter } from '@/components/dashboard/DashboardRouter';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <DashboardRouter />;
};

export default Index;
