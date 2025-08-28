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

interface LeaveCalculationRequest {
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, leave_type, start_date, end_date }: LeaveCalculationRequest = await req.json();

    // Calculate working days (excluding weekends)
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    let workingDays = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    // Fetch user's leave balance
    const { data: balance, error: balanceError } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('user_id', user_id)
      .eq('leave_type', leave_type)
      .eq('year', new Date().getFullYear())
      .single();

    if (balanceError) {
      throw new Error('Unable to fetch leave balance');
    }

    // Fetch leave policy
    const { data: policy, error: policyError } = await supabase
      .from('leave_policies')
      .select('*')
      .eq('leave_type', leave_type)
      .eq('is_active', true)
      .single();

    if (policyError) {
      throw new Error('Unable to fetch leave policy');
    }

    // Check for overlapping leave requests
    const { data: overlapping, error: overlapError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user_id)
      .in('status', ['pending', 'approved'])
      .or(`start_date.lte.${end_date},end_date.gte.${start_date}`);

    if (overlapError) {
      throw new Error('Unable to check for overlapping requests');
    }

    // Validation checks
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Check if enough balance available
    if (balance.available_days < workingDays) {
      validation.isValid = false;
      validation.errors.push(`Insufficient leave balance. Available: ${balance.available_days} days, Requested: ${workingDays} days`);
    }

    // Check maximum consecutive days policy
    if (policy.max_consecutive_days && workingDays > policy.max_consecutive_days) {
      validation.isValid = false;
      validation.errors.push(`Request exceeds maximum consecutive days limit of ${policy.max_consecutive_days} days`);
    }

    // Check for overlapping requests
    if (overlapping && overlapping.length > 0) {
      validation.isValid = false;
      validation.errors.push('You have overlapping leave requests for the selected dates');
    }

    // Check if dates are in the future (except sick leave which can be backdated)
    if (leave_type !== 'sick' && startDate < new Date()) {
      validation.warnings.push('Leave start date is in the past');
    }

    // Check if requesting leave on weekends only
    if (workingDays === 0) {
      validation.warnings.push('Selected dates contain only weekends');
    }

    const result = {
      working_days: workingDays,
      available_balance: balance.available_days,
      remaining_balance: balance.available_days - workingDays,
      requires_approval: policy.requires_approval,
      requires_documentation: policy.requires_documentation,
      validation
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in leave-calculations function:", error);
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