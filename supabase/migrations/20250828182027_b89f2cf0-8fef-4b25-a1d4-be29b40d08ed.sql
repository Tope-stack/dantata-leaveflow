-- Fix the demo user roles that weren't updated correctly
-- Update manager role
UPDATE public.profiles 
SET 
  role = 'manager',
  first_name = 'Jane',
  last_name = 'Manager',
  employee_id = 'MGR001',
  department = 'Human Resources',
  position = 'HR Manager'
WHERE email = 'manager@demo.com';

-- Update admin role  
UPDATE public.profiles 
SET 
  role = 'admin',
  first_name = 'Admin', 
  last_name = 'User',
  employee_id = 'ADM001',
  department = 'IT',
  position = 'System Administrator'
WHERE email = 'admin@demo.com';

-- Update employee profile for consistency
UPDATE public.profiles 
SET 
  first_name = 'John',
  last_name = 'Employee', 
  employee_id = 'EMP001',
  department = 'Human Resources',
  position = 'HR Specialist'
WHERE email = 'employee@demo.com';

-- Set up manager relationship (employee reports to manager)
UPDATE public.profiles 
SET manager_id = (SELECT id FROM public.profiles WHERE email = 'manager@demo.com')
WHERE email = 'employee@demo.com';