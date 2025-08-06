
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
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
              <Route path="/apply-leave" element={<div className="p-6"><h1 className="text-2xl font-bold">Apply for Leave</h1><p className="text-gray-600 mt-2">Leave application form will be implemented here.</p></div>} />
              <Route path="/leave-history" element={<div className="p-6"><h1 className="text-2xl font-bold">Leave History</h1><p className="text-gray-600 mt-2">Leave history table will be implemented here.</p></div>} />
              <Route path="/leave-balance" element={<div className="p-6"><h1 className="text-2xl font-bold">Leave Balance</h1><p className="text-gray-600 mt-2">Detailed leave balance view will be implemented here.</p></div>} />
              <Route path="/approvals" element={<div className="p-6"><h1 className="text-2xl font-bold">Pending Approvals</h1><p className="text-gray-600 mt-2">Manager approval interface will be implemented here.</p></div>} />
              <Route path="/team-calendar" element={<div className="p-6"><h1 className="text-2xl font-bold">Team Calendar</h1><p className="text-gray-600 mt-2">Team calendar view will be implemented here.</p></div>} />
              <Route path="/team-reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Team Reports</h1><p className="text-gray-600 mt-2">Team reports dashboard will be implemented here.</p></div>} />
              <Route path="/user-management" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p className="text-gray-600 mt-2">User management interface will be implemented here.</p></div>} />
              <Route path="/leave-policies" element={<div className="p-6"><h1 className="text-2xl font-bold">Leave Policies</h1><p className="text-gray-600 mt-2">Leave policy configuration will be implemented here.</p></div>} />
              <Route path="/system-reports" element={<div className="p-6"><h1 className="text-2xl font-bold">System Reports</h1><p className="text-gray-600 mt-2">System reports dashboard will be implemented here.</p></div>} />
              <Route path="/audit-logs" element={<div className="p-6"><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-gray-600 mt-2">Audit logs viewer will be implemented here.</p></div>} />
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
