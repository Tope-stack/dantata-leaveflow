import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  reason?: string;
  comments?: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
    position: string;
  };
}

export const useLeaveRequests = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          profiles!inner (
            first_name,
            last_name,
            employee_id,
            department,
            position,
            manager_id
          )
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (profile.role === 'manager') {
        // Managers see requests from their direct reports
        query = query.eq('profiles.manager_id', profile.id);
      } else if (profile.role === 'employee') {
        // Employees see only their own requests
        query = query.eq('user_id', profile.user_id);
      }
      // Admins see all requests (no additional filter needed)

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leave requests:', error);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const approveRequest = async (requestId: string, comments?: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase.functions.invoke('leave-approval', {
        body: {
          leave_request_id: requestId,
          approver_id: profile.user_id,
          status: 'approved',
          comments
        }
      });

      if (error) {
        console.error('Error approving request:', error);
        return false;
      }

      await fetchRequests(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const rejectRequest = async (requestId: string, comments?: string) => {
    if (!profile) return false;

    try {
      const { error } = await supabase.functions.invoke('leave-approval', {
        body: {
          leave_request_id: requestId,
          approver_id: profile.user_id,
          status: 'rejected',
          comments
        }
      });

      if (error) {
        console.error('Error rejecting request:', error);
        return false;
      }

      await fetchRequests(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  return {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests
  };
};