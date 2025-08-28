import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  id: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  hire_date: string;
  is_active: boolean;
  manager_id?: string;
}

export const useTeamMembers = () => {
  const { profile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!profile) return;

      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('is_active', true)
          .order('first_name');

        // Filter based on role
        if (profile.role === 'manager') {
          // Managers see their direct reports
          query = query.eq('manager_id', profile.id);
        }
        // Admins see all profiles (no filter needed)
        // Employees don't need team member data

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [profile]);

  return { teamMembers, loading };
};