
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import ApplyLeavePage from "./pages/ApplyLeavePage";
import LeaveHistoryPage from "./pages/LeaveHistoryPage";
import LeaveBalancePage from "./pages/LeaveBalancePage";
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
import UserManagementPage from "./pages/UserManagementPage";
import LeavePoliciesPage from "./pages/LeavePoliciesPage";
import SystemReportsPage from "./pages/SystemReportsPage";
import TeamCalendarPage from "./pages/TeamCalendarPage";
import TeamReportsPage from "./pages/TeamReportsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ZohoCallbackPage from "./pages/ZohoCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/apply-leave" element={<ApplyLeavePage />} />
              <Route path="/leave-history" element={<LeaveHistoryPage />} />
              <Route path="/leave-balance" element={<LeaveBalancePage />} />
              <Route path="/approvals" element={<PendingApprovalsPage />} />
              <Route path="/team-calendar" element={<TeamCalendarPage />} />
              <Route path="/team-reports" element={<TeamReportsPage />} />
              <Route path="/user-management" element={<UserManagementPage />} />
              <Route path="/leave-policies" element={<LeavePoliciesPage />} />
              <Route path="/system-reports" element={<SystemReportsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/oauthredirect" element={<ZohoCallbackPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
