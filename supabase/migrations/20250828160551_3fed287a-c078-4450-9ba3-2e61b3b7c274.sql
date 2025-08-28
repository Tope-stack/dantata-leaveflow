-- Create enum types for better data consistency
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  manager_id UUID REFERENCES public.profiles(id),
  role user_role NOT NULL DEFAULT 'employee',
  hire_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave policies table
CREATE TABLE public.leave_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leave_type leave_type NOT NULL,
  days_per_year INTEGER NOT NULL,
  max_consecutive_days INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  requires_documentation BOOLEAN NOT NULL DEFAULT false,
  carryover_days INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave balances table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  available_days INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, leave_type, year)
);

-- Leave requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  comments TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave approvals table
CREATE TABLE public.leave_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status approval_status NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Leave policies policies
CREATE POLICY "Everyone can view active leave policies" ON public.leave_policies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage leave policies" ON public.leave_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Leave balances policies
CREATE POLICY "Users can view their own balances" ON public.leave_balances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view their team balances" ON public.leave_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND (
        role = 'manager' AND id = (
          SELECT manager_id FROM public.profiles WHERE user_id = leave_balances.user_id
        )
        OR role = 'admin'
      )
    )
  );

CREATE POLICY "System can update balances" ON public.leave_balances
  FOR ALL USING (true);

-- Leave requests policies
CREATE POLICY "Users can view their own requests" ON public.leave_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own requests" ON public.leave_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pending requests" ON public.leave_requests
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Managers can view team requests" ON public.leave_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.user_id = auth.uid() 
      AND p2.user_id = leave_requests.user_id
      AND (
        (p1.role = 'manager' AND p1.id = p2.manager_id)
        OR p1.role = 'admin'
      )
    )
  );

CREATE POLICY "Managers can update team requests status" ON public.leave_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.user_id = auth.uid() 
      AND p2.user_id = leave_requests.user_id
      AND (
        (p1.role = 'manager' AND p1.id = p2.manager_id)
        OR p1.role = 'admin'
      )
    )
  );

-- Leave approvals policies
CREATE POLICY "Users can view approvals for their requests" ON public.leave_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leave_requests 
      WHERE id = leave_request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can manage their approvals" ON public.leave_approvals
  FOR ALL USING (approver_id = auth.uid());

CREATE POLICY "Managers and admins can view all approvals" ON public.leave_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for leave documents
INSERT INTO storage.buckets (id, name, public) VALUES ('leave-documents', 'leave-documents', false);

-- Storage policies for leave documents
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'leave-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'leave-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Managers can view team documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'leave-documents' AND
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.user_id = auth.uid() 
      AND p2.user_id::text = (storage.foldername(name))[1]
      AND (
        (p1.role = 'manager' AND p1.id = p2.manager_id)
        OR p1.role = 'admin'
      )
    )
  );

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_policies_updated_at BEFORE UPDATE ON public.leave_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_approvals_updated_at BEFORE UPDATE ON public.leave_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create default leave balances
CREATE OR REPLACE FUNCTION public.create_default_leave_balances(user_uuid UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update leave balances when request is approved/rejected
CREATE OR REPLACE FUNCTION public.update_leave_balance()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update leave balances
CREATE TRIGGER update_leave_balance_on_status_change
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_leave_balance();

-- Insert default leave policies
INSERT INTO public.leave_policies (name, leave_type, days_per_year, max_consecutive_days, requires_approval, requires_documentation, carryover_days) VALUES
('Annual Leave', 'annual', 25, 15, true, false, 5),
('Sick Leave', 'sick', 10, 5, false, true, 0),
('Maternity Leave', 'maternity', 90, 90, true, true, 0),
('Paternity Leave', 'paternity', 14, 14, true, true, 0),
('Emergency Leave', 'emergency', 5, 3, true, false, 0),
('Unpaid Leave', 'unpaid', 30, 30, true, true, 0);

-- Enable realtime for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_balances;