-- Fix security issues by setting proper search_path for functions

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, employee_id, first_name, last_name, email, department, position, hire_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP' || RIGHT(NEW.id::text, 6)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'position', 'Employee'),
    COALESCE((NEW.raw_user_meta_data->>'hire_date')::date, CURRENT_DATE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update create_default_leave_balances function
CREATE OR REPLACE FUNCTION public.create_default_leave_balances(user_uuid UUID)
RETURNS VOID 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  policy RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  FOR policy IN SELECT * FROM public.leave_policies WHERE is_active = true LOOP
    INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
    VALUES (user_uuid, policy.leave_type, policy.days_per_year, 0, policy.days_per_year, current_year)
    ON CONFLICT (user_id, leave_type, year) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update update_leave_balance function
CREATE OR REPLACE FUNCTION public.update_leave_balance()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- If status changed to approved, reduce available days
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.leave_balances 
    SET used_days = used_days + NEW.total_days,
        available_days = available_days - NEW.total_days
    WHERE user_id = NEW.user_id 
    AND leave_type = NEW.leave_type 
    AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  -- If status changed from approved to rejected/cancelled, restore available days
  IF OLD.status = 'approved' AND NEW.status IN ('rejected', 'cancelled') THEN
    UPDATE public.leave_balances 
    SET used_days = used_days - NEW.total_days,
        available_days = available_days + NEW.total_days
    WHERE user_id = NEW.user_id 
    AND leave_type = NEW.leave_type 
    AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create security definer functions to avoid RLS recursion issues
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.is_manager_of_user(manager_uuid UUID, employee_uuid UUID)
RETURNS BOOLEAN 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = employee_uuid 
    AND manager_id = (SELECT id FROM public.profiles WHERE user_id = manager_uuid)
  );
$$ LANGUAGE SQL STABLE;

-- Update RLS policies to use security definer functions (avoiding recursion)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage leave policies" ON public.leave_policies;
CREATE POLICY "Admins can manage leave policies" ON public.leave_policies
  FOR ALL USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Managers can view their team balances" ON public.leave_balances;
CREATE POLICY "Managers can view their team balances" ON public.leave_balances
  FOR SELECT USING (
    public.get_current_user_role() IN ('manager', 'admin') OR
    public.is_manager_of_user(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "Managers can view team requests" ON public.leave_requests;
CREATE POLICY "Managers can view team requests" ON public.leave_requests
  FOR SELECT USING (
    public.get_current_user_role() IN ('manager', 'admin') OR
    public.is_manager_of_user(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "Managers can update team requests status" ON public.leave_requests;
CREATE POLICY "Managers can update team requests status" ON public.leave_requests
  FOR UPDATE USING (
    public.get_current_user_role() IN ('manager', 'admin') OR
    public.is_manager_of_user(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "Managers and admins can view all approvals" ON public.leave_approvals;
CREATE POLICY "Managers and admins can view all approvals" ON public.leave_approvals
  FOR SELECT USING (public.get_current_user_role() IN ('manager', 'admin'));

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Managers can view team documents" ON storage.objects;
CREATE POLICY "Managers can view team documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'leave-documents' AND (
      public.get_current_user_role() IN ('manager', 'admin') OR
      public.is_manager_of_user(auth.uid(), (storage.foldername(name))[1]::uuid)
    )
  );