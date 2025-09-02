-- Create Zoho integration tables
CREATE TABLE public.zoho_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  accounts_base_url TEXT NOT NULL DEFAULT 'https://accounts.zoho.com',
  people_base_url TEXT NOT NULL DEFAULT 'https://people.zoho.com',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zoho_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for zoho_connections
CREATE POLICY "Admins can manage zoho connections" 
ON public.zoho_connections 
FOR ALL 
USING (get_current_user_role() = 'admin'::user_role);

-- Create Zoho employee mapping table
CREATE TABLE public.zoho_employee_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  zoho_emp_id TEXT,
  email TEXT NOT NULL,
  erecno TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(app_user_id)
);

-- Enable RLS
ALTER TABLE public.zoho_employee_map ENABLE ROW LEVEL SECURITY;

-- Create policies for zoho_employee_map
CREATE POLICY "Admins can manage employee mappings" 
ON public.zoho_employee_map 
FOR ALL 
USING (get_current_user_role() = 'admin'::user_role);

CREATE POLICY "Users can view their own mapping" 
ON public.zoho_employee_map 
FOR SELECT 
USING (app_user_id = auth.uid());

-- Create update triggers
CREATE TRIGGER update_zoho_connections_updated_at
BEFORE UPDATE ON public.zoho_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zoho_employee_map_updated_at
BEFORE UPDATE ON public.zoho_employee_map
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();