
-- Update demo user profiles with correct roles and information
-- First, let's get the actual user IDs from auth.users and update profiles accordingly

-- Update the employee profile
UPDATE public.profiles 
SET 
  employee_id = 'EMP001',
  first_name = 'John',
  last_name = 'Employee',
  department = 'Human Resources',
  position = 'HR Specialist',
  role = 'employee',
  hire_date = '2023-01-15',
  is_active = true
WHERE email = 'employee@demo.com';

-- Update the manager profile  
UPDATE public.profiles 
SET 
  employee_id = 'MGR001',
  first_name = 'Jane',
  last_name = 'Manager',
  department = 'Human Resources',
  position = 'HR Manager',
  role = 'manager',
  hire_date = '2022-06-01',
  is_active = true
WHERE email = 'manager@demo.com';

-- Update the admin profile
UPDATE public.profiles 
SET 
  employee_id = 'ADM001',
  first_name = 'Admin',
  last_name = 'User',
  department = 'IT',
  position = 'System Administrator',
  role = 'admin',
  hire_date = '2021-03-15',
  is_active = true
WHERE email = 'admin@demo.com';

-- Set up manager relationship (employee reports to manager)
UPDATE public.profiles 
SET manager_id = (SELECT id FROM public.profiles WHERE email = 'manager@demo.com')
WHERE email = 'employee@demo.com';

-- Create initial leave balances for all demo users
-- First, ensure we have active leave policies
INSERT INTO public.leave_policies (name, leave_type, days_per_year, is_active, requires_approval, requires_documentation)
VALUES 
  ('Annual Leave', 'annual', 25, true, true, false),
  ('Sick Leave', 'sick', 10, true, false, true),
  ('Personal Leave', 'personal', 5, true, true, false)
ON CONFLICT (leave_type) DO UPDATE SET
  name = EXCLUDED.name,
  days_per_year = EXCLUDED.days_per_year,
  is_active = EXCLUDED.is_active,
  requires_approval = EXCLUDED.requires_approval,
  requires_documentation = EXCLUDED.requires_documentation;

-- Create leave balances for employee
INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'annual'::leave_type,
  25,
  5,
  20,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'employee@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'sick'::leave_type,
  10,
  2,
  8,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'employee@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'personal'::leave_type,
  5,
  0,
  5,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'employee@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

-- Create leave balances for manager
INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'annual'::leave_type,
  30,
  8,
  22,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'manager@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'sick'::leave_type,
  12,
  3,
  9,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'manager@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'personal'::leave_type,
  7,
  1,
  6,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'manager@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

-- Create leave balances for admin
INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'annual'::leave_type,
  30,
  10,
  20,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'admin@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'sick'::leave_type,
  15,
  1,
  14,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'admin@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;

INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
SELECT 
  p.user_id,
  'personal'::leave_type,
  8,
  0,
  8,
  EXTRACT(year FROM CURRENT_DATE)::integer
FROM public.profiles p 
WHERE p.email = 'admin@demo.com'
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;
