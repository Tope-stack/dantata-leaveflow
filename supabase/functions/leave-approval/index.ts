import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  leave_request_id: string;
  approver_id: string;
  status: 'approved' | 'rejected';
  comments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leave_request_id, approver_id, status, comments }: ApprovalRequest = await req.json();

    // Verify approver has permission
    const { data: approverProfile, error: approverError } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('user_id', approver_id)
      .single();

    if (approverError || !approverProfile) {
      throw new Error('Approver not found');
    }

    // Fetch leave request details
    const { data: leaveRequest, error: leaveError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!leave_requests_user_id_fkey (manager_id, role)
      `)
      .eq('id', leave_request_id)
      .single();

    if (leaveError || !leaveRequest) {
      throw new Error('Leave request not found');
    }

    // Check if current status allows approval/rejection
    if (leaveRequest.status !== 'pending') {
      throw new Error('Leave request is no longer pending approval');
    }

    // Verify approver has authority (is manager of employee or admin)
    const canApprove = approverProfile.role === 'admin' || 
      (approverProfile.role === 'manager' && 
       leaveRequest.profiles.manager_id === approverProfile.id);

    if (!canApprove) {
      throw new Error('Insufficient permissions to approve this request');
    }

    // Update leave request status
    const { error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status: status,
        comments: comments,
        updated_at: new Date().toISOString()
      })
      .eq('id', leave_request_id);

    if (updateError) {
      throw new Error('Failed to update leave request');
    }

    // Create approval record
    const { error: approvalError } = await supabase
      .from('leave_approvals')
      .insert({
        leave_request_id: leave_request_id,
        approver_id: approver_id,
        status: status,
        comments: comments,
        approved_at: new Date().toISOString()
      });

    if (approvalError) {
      console.error('Failed to create approval record:', approvalError);
    }

    // Log the action in audit logs
    await supabase.from('audit_logs').insert({
      user_id: approver_id,
      action: `leave_request_${status}`,
      table_name: 'leave_requests',
      record_id: leave_request_id,
      new_values: { status, comments, approver_id }
    });

    // Send email notification
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-leave-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          leave_request_id,
          type: status,
          comments
        })
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the approval if email fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Leave request ${status} successfully`,
      leave_request_id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in leave-approval function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);