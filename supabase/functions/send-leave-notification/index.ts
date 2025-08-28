import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeaveNotificationRequest {
  leave_request_id: string;
  type: 'submitted' | 'approved' | 'rejected' | 'cancelled';
  comments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leave_request_id, type, comments }: LeaveNotificationRequest = await req.json();

    // Fetch leave request details with user profile
    const { data: leaveRequest, error: leaveError } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!leave_requests_user_id_fkey (
          first_name,
          last_name,
          email,
          manager_id,
          profiles!profiles_manager_id_fkey (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', leave_request_id)
      .single();

    if (leaveError || !leaveRequest) {
      throw new Error('Leave request not found');
    }

    let emailHtml = '';
    let emailSubject = '';
    let recipientEmail = '';

    const employeeName = `${leaveRequest.profiles.first_name} ${leaveRequest.profiles.last_name}`;
    const managerName = leaveRequest.profiles.profiles ? 
      `${leaveRequest.profiles.profiles.first_name} ${leaveRequest.profiles.profiles.last_name}` : '';

    switch (type) {
      case 'submitted':
        // Notify manager about new leave request
        if (leaveRequest.profiles.profiles?.email) {
          recipientEmail = leaveRequest.profiles.profiles.email;
          emailSubject = `New Leave Request from ${employeeName}`;
          emailHtml = `
            <h2>New Leave Request Submitted</h2>
            <p>Dear ${managerName},</p>
            <p>${employeeName} has submitted a new leave request for your approval.</p>
            <h3>Leave Details:</h3>
            <ul>
              <li><strong>Type:</strong> ${leaveRequest.leave_type}</li>
              <li><strong>Start Date:</strong> ${new Date(leaveRequest.start_date).toDateString()}</li>
              <li><strong>End Date:</strong> ${new Date(leaveRequest.end_date).toDateString()}</li>
              <li><strong>Duration:</strong> ${leaveRequest.total_days} days</li>
              <li><strong>Reason:</strong> ${leaveRequest.reason || 'Not specified'}</li>
            </ul>
            <p>Please review and approve/reject this request in the system.</p>
          `;
        }
        break;

      case 'approved':
        // Notify employee about approval
        recipientEmail = leaveRequest.profiles.email;
        emailSubject = 'Leave Request Approved';
        emailHtml = `
          <h2>Leave Request Approved</h2>
          <p>Dear ${employeeName},</p>
          <p>Your leave request has been approved by ${managerName}.</p>
          <h3>Approved Leave Details:</h3>
          <ul>
            <li><strong>Type:</strong> ${leaveRequest.leave_type}</li>
            <li><strong>Start Date:</strong> ${new Date(leaveRequest.start_date).toDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(leaveRequest.end_date).toDateString()}</li>
            <li><strong>Duration:</strong> ${leaveRequest.total_days} days</li>
          </ul>
          ${comments ? `<p><strong>Manager Comments:</strong> ${comments}</p>` : ''}
          <p>Enjoy your time off!</p>
        `;
        break;

      case 'rejected':
        // Notify employee about rejection
        recipientEmail = leaveRequest.profiles.email;
        emailSubject = 'Leave Request Rejected';
        emailHtml = `
          <h2>Leave Request Rejected</h2>
          <p>Dear ${employeeName},</p>
          <p>Unfortunately, your leave request has been rejected by ${managerName}.</p>
          <h3>Rejected Leave Details:</h3>
          <ul>
            <li><strong>Type:</strong> ${leaveRequest.leave_type}</li>
            <li><strong>Start Date:</strong> ${new Date(leaveRequest.start_date).toDateString()}</li>
            <li><strong>End Date:</strong> ${new Date(leaveRequest.end_date).toDateString()}</li>
            <li><strong>Duration:</strong> ${leaveRequest.total_days} days</li>
          </ul>
          ${comments ? `<p><strong>Rejection Reason:</strong> ${comments}</p>` : ''}
          <p>Please contact your manager for more details or consider submitting a revised request.</p>
        `;
        break;

      case 'cancelled':
        // Notify manager about cancellation
        if (leaveRequest.profiles.profiles?.email) {
          recipientEmail = leaveRequest.profiles.profiles.email;
          emailSubject = `Leave Request Cancelled by ${employeeName}`;
          emailHtml = `
            <h2>Leave Request Cancelled</h2>
            <p>Dear ${managerName},</p>
            <p>${employeeName} has cancelled their leave request.</p>
            <h3>Cancelled Leave Details:</h3>
            <ul>
              <li><strong>Type:</strong> ${leaveRequest.leave_type}</li>
              <li><strong>Start Date:</strong> ${new Date(leaveRequest.start_date).toDateString()}</li>
              <li><strong>End Date:</strong> ${new Date(leaveRequest.end_date).toDateString()}</li>
              <li><strong>Duration:</strong> ${leaveRequest.total_days} days</li>
            </ul>
          `;
        }
        break;
    }

    if (recipientEmail && emailSubject && emailHtml) {
      const emailResponse = await resend.emails.send({
        from: "Dantata LMS <noreply@dantatatowndevelopers.com>",
        to: [recipientEmail],
        subject: emailSubject,
        html: emailHtml,
      });

      console.log("Email sent successfully:", emailResponse);

      // Log the notification in audit logs
      await supabase.from('audit_logs').insert({
        action: `email_notification_${type}`,
        table_name: 'leave_requests',
        record_id: leave_request_id,
        new_values: { recipient: recipientEmail, type }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-leave-notification function:", error);
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