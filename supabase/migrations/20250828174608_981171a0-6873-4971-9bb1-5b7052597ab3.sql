-- Create demo users and their profiles
-- Note: Since we can't directly insert into auth.users, we'll create a function to handle demo user setup

-- First, let's create the profiles for our demo users (assuming they'll be created via auth)
-- We'll use specific UUIDs for the demo users to ensure consistency

-- Demo Employee Profile
INSERT INTO public.profiles (
  id, 
  user_id,
  employee_id,
  first_name,
  last_name,
  email,
  department,
  position,
  role,
  hire_date,
  is_active
) VALUES (
  'e1234567-e89b-12d3-a456-426614174001',
  'e1234567-e89b-12d3-a456-426614174001',
  'EMP001',
  'John',
  'Employee',
  'employee@demo.com',
  'Human Resources',
  'HR Specialist',
  'employee',
  '2023-01-15',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  role = EXCLUDED.role,
  hire_date = EXCLUDED.hire_date,
  is_active = EXCLUDED.is_active;

-- Demo Manager Profile  
INSERT INTO public.profiles (
  id,
  user_id,
  employee_id,
  first_name,
  last_name,
  email,
  department,
  position,
  role,
  hire_date,
  is_active
) VALUES (
  'm1234567-e89b-12d3-a456-426614174002',
  'm1234567-e89b-12d3-a456-426614174002',
  'MGR001',
  'Jane',
  'Manager',
  'manager@demo.com',
  'Human Resources',
  'HR Manager',
  'manager',
  '2022-06-01',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  role = EXCLUDED.role,
  hire_date = EXCLUDED.hire_date,
  is_active = EXCLUDED.is_active;

-- Demo Admin Profile
INSERT INTO public.profiles (
  id,
  user_id,
  employee_id,
  first_name,
  last_name,
  email,
  department,
  position,
  role,
  hire_date,
  is_active
) VALUES (
  'a1234567-e89b-12d3-a456-426614174003',
  'a1234567-e89b-12d3-a456-426614174003',
  'ADM001',
  'Admin',
  'User',
  'admin@demo.com',
  'IT',
  'System Administrator',
  'admin',
  '2021-03-15',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  role = EXCLUDED.role,
  hire_date = EXCLUDED.hire_date,
  is_active = EXCLUDED.is_active;

-- Set manager relationship (employee reports to manager)
UPDATE public.profiles 
SET manager_id = 'm1234567-e89b-12d3-a456-426614174002'
WHERE user_id = 'e1234567-e89b-12d3-a456-426614174001';

-- Create initial leave balances for demo users
INSERT INTO public.leave_balances (user_id, leave_type, total_days, used_days, available_days, year)
VALUES 
  -- Employee balances
  ('e1234567-e89b-12d3-a456-426614174001', 'annual', 25, 5, 20, EXTRACT(year FROM CURRENT_DATE)::integer),
  ('e1234567-e89b-12d3-a456-426614174001', 'sick', 10, 2, 8, EXTRACT(year FROM CURRENT_DATE)::integer),
  ('e1234567-e89b-12d3-a456-426614174001', 'personal', 5, 0, 5, EXTRACT(year FROM CURRENT_DATE)::integer),
  -- Manager balances
  ('m1234567-e89b-12d3-a456-426614174002', 'annual', 30, 8, 22, EXTRACT(year FROM CURRENT_DATE)::integer),
  ('m1234567-e89b-12d3-a456-426614174002', 'sick', 12, 3, 9, EXTRACT(year FROM CURRENT_DATE)::integer),
  ('m1234567-e89b-12d3-a456-426614174002', 'personal', 7, 1, 6, EXTRACT(year FROM CURRENT_DATE)::integer),
  -- Admin balances
  ('a1234567-e89b-12d3-a456-426614174003', 'annual', 30, 10, 20, EXTRACT(year FROM CURRENT_DATE)::integer),
  ('a1234567-e89b-12d3-a456-426614174003', 'sick', 15, 1, 14, EXTRACT(year FROM CURRENT_DATE)::integer),
  ('a1234567-e89b-12d3-a456-426614174003', 'personal', 8, 0, 8, EXTRACT(year FROM CURRENT_DATE)::integer)
ON CONFLICT (user_id, leave_type, year) DO UPDATE SET
  total_days = EXCLUDED.total_days,
  used_days = EXCLUDED.used_days,
  available_days = EXCLUDED.available_days;