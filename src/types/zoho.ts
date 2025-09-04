// Zoho People API Types

export interface ZohoLeaveRecord {
  Recordid: string;
  Employeeid: string;
  Employee_ID: string;
  Employee_email: string;
  Leavetype: string;
  From: string;
  To: string;
  Numberofdays: number;
  Reason: string;
  Appliedon: string;
  Status: 'Applied' | 'Approved' | 'Rejected' | 'Cancelled';
  Comments?: string;
}

export interface ZohoAttendanceEntry {
  date: string;
  employeeId: string;
  employeeName: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  breakTime?: string;
  overtime?: string;
}

export interface ZohoHoliday {
  name: string;
  fromDate: string;
  toDate: string;
  type: 'National' | 'Regional' | 'Optional' | 'Floating';
  location: string;
  description?: string;
  isRecurring: boolean;
}

export interface ZohoFormInsertResponse {
  status: 'success' | 'error';
  message: string;
  recordId?: string;
  data?: {
    [key: string]: any;
  };
}

export interface ZohoConnection {
  id: string;
  org_id: string;
  accounts_base_url: string;
  people_base_url: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ZohoEmployeeMapping {
  id: string;
  app_user_id: string;
  zoho_emp_id?: string;
  email: string;
  erecno?: string;
  created_at: string;
  updated_at: string;
}

export interface ZohoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  api_domain?: string;
}

export interface ZohoErrorResponse {
  error: string;
  error_description: string;
}