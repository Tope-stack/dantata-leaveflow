// Script to create demo users
// Run this once to set up demo accounts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://niaiuneltiqshbwztgxj.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  {
    email: 'employee@demo.com',
    password: 'demo123',
    user_metadata: {
      first_name: 'John',
      last_name: 'Employee',
      employee_id: 'EMP001',
      department: 'Human Resources',
      position: 'HR Specialist',
      role: 'employee',
      hire_date: '2023-01-15'
    }
  },
  {
    email: 'manager@demo.com',
    password: 'demo123',
    user_metadata: {
      first_name: 'Jane',
      last_name: 'Manager', 
      employee_id: 'MGR001',
      department: 'Human Resources',
      position: 'HR Manager',
      role: 'manager',
      hire_date: '2022-06-01'
    }
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
    user_metadata: {
      first_name: 'Admin',
      last_name: 'User',
      employee_id: 'ADM001', 
      department: 'IT',
      position: 'System Administrator',
      role: 'admin',
      hire_date: '2021-03-15'
    }
  }
]

async function createDemoUsers() {
  console.log('Creating demo users...')
  
  for (const userData of demoUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: userData.user_metadata,
      email_confirm: true
    })
    
    if (error) {
      console.error(`Error creating user ${userData.email}:`, error)
    } else {
      console.log(`✅ Created user: ${userData.email}`)
    }
  }
  
  console.log('Demo user creation complete!')
}

createDemoUsers()