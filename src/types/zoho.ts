// Zoho People API Types

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

export interface ZohoEmployeeMap {
  id: string;
  app_user_id: string;
  zoho_emp_id?: string;
  email: string;
  erecno?: string;
  created_at: string;
  updated_at: string;
}

export interface ZohoLeaveRecord {
  recordId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  duration: number;
  status: 'Applied' | 'Approved' | 'Rejected' | 'Cancelled';
  reason?: string;
  appliedDate: string;
  approvedBy?: string;
  rejectedBy?: string;
}

export interface ZohoAttendanceEntry {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'Holiday';
}

export interface ZohoHoliday {
  id: string;
  name: string;
  date: string;
  type: 'National' | 'Regional' | 'Optional';
  description?: string;
}

export interface ZohoTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface ZohoLeaveApplication {
  employeeId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  duration: number;
  reason?: string;
  attachments?: string[];
}

export interface ZohoApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ZohoPaginatedResponse<T> {
  data: T[];
  hasNext: boolean;
  nextPage?: string;
  totalRecords?: number;
}

// OAuth flow types
export interface ZohoOAuthState {
  redirect_uri: string;
  org_id: string;
}

export interface ZohoAuthCallbackParams {
  code: string;
  state: string;
  location: string;
  'accounts-server': string;
}