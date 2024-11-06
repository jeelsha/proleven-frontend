export interface ApiResponse {
  data: Data[];
  count: number;
  currentPage: number;
  limit: number;
  lastPage: number;
}

interface Course {
  start_date: string;
  end_date: string;
}

interface LessonSession {
  start_time: string;
  end_time: string;
}

interface CourseAttendanceSheet {
  id: number;
  mark_as_start_signed_at: string | null;
  mark_as_end_signed_at: string | null;
  end_signature: string | null;
  start_signature: string | null;
  mark_as_end_signed: boolean | null;
  mark_as_start_signed: boolean | null;
  mark_as_absent: string;
  set_early_arrival: string | null;
  course: Course;
  lessonSession: LessonSession;
}

interface CourseAttendanceLog {
  id: number;
  course_participate_id: number;
  break_in: string | null;
  break_out: string | null;
  lesson_session_id: number;
  course_id: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  slug: string;
}

interface AccountingEmail {
  email: string;
  is_primary: boolean;
}

interface Company {
  id: number;
  uuid: string;
  user_id: number | null;
  name: string;
  legal_name: string | null;
  registration_number: string;
  slug: string;
  website: string | null;
  industry: string | null;
  description: string | null;
  size: string | null;
  logo: string;
  accounting_emails: AccountingEmail[];
  sales_rep_id: number | null;
  ateco_code: string;
  sdi_code: string;
  payment_term_id: number | null;
  vat_number: string;
  is_invoice: boolean;
  address1: string;
  address2: string | null;
  city: string;
  country: string;
  state: string | null;
  zip: string;
  invoice_date: string | null;
  parent_table_id: number | null;
  address_province: string | null;
  vat_type: string | number | null;
  language: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type Data = {
  id: number;
  course_id: number;
  slug: string;
  code: string;
  job_title: string;
  assigned_to_status: string;
  first_name: string;
  attempts: number;
  last_name: string;
  email: string | null;
  mobile_number: string | null;
  recovered_from_course_id: number | null;
  recovered_participate_id: number | null;
  enrollment_number: string;
  created_by: number;
  updated_by: number;
  manager_id: number;
  company_id: number;
  is_certificate_issued: boolean;
  language: string;
  parent_table_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  company: Company;
  courseAttendanceSheet: CourseAttendanceSheet[];
  courseAttendanceLog: CourseAttendanceLog[];
};
