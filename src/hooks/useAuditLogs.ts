import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id?: string | null;
  user_id?: string | null;
  old_values?: any;
  new_values?: any;
  ip_address?: unknown;
  user_agent?: string | null;
  created_at: string;
}

export const useAuditLogs = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!profile || profile.role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching audit logs:', error);
          return;
        }

        setLogs((data as AuditLog[]) || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [profile]);

  return { logs, loading };
};