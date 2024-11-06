interface Lesson {
  id: number;
  mode: string;
}

interface LessonSession {
  id: number;
  lesson_id: number;
  conference_provider_id: string | null;
  calendar_provider_id: string | null;
  client_meeting_link: string | null;
  language: string;
  parent_table_id: number;
  slug: string;
  start_time: string;
  end_time: string;
  course_id: number;
  provider_meeting_link: string | null;
  provider_meeting_event_id: string | null;
  provider_start_meeting_link: string | null;
  provider_meeting_id: string | null;
  provider_meeting_additional_data: string | null;
  provider_meeting_request_uid: string;
  provider_event_uid: string;
  provider_event_id: string | null;
  provider_event_additional_data: string | null;
  conference_change_key: string | null;
  calendar_change_key: string | null;
  created_by: number;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lesson: Lesson;
}

interface Course {
  id: number;
  marked_as: string;
  mode: string;
  funded_by: string;
  code_id: number;
  academy_id: number;
  validity: number;
  is_template: boolean;
  is_external_certificate: boolean;
  start_date: string;
  end_date: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  meeting_room_number: string | null;
  certificate_title: string | null;
  maximum_participate_allowed: number;
  price_in: string;
  old_db_course_id: string | null;
  notes: string;
  certificate_pdf_link: string;
  maximum_participation_attendance: number;
  max_attendee_applicable: boolean;
  course_template_id: string | null;
  certificate_template_id: string | null;
  survey_template_id: string | null;
  cloned_course_id: number;
  sub_category_id: number;
  created_by: number;
  assigned_to: string | null;
  title: string;
  code: string;
  image: string;
  status: string;
  slug: string;
  description: string | null;
  reject_reason: string;
  price: string | null;
  duration: number;
  type: string;
  category_id: number;
  card_id: number;
  project_id: string | null;
  language: string;
  course_bundle_id: number;
  parent_table_id: number;
  validity_mail_sent_at: string | null;
  survey_qr: string;
  survey_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface CourseBundle {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  slug: string;
}

interface Trainer {
  id: number;
  user_id: number;
  hourly_rate: number;
  travel_reimbursement_fee: number;
  capacity: number;
  reimbursement_threshold: number | null;
  location: string;
  longitude: number | null;
  latitude: number | null;
  parent_table_id: number | null;
  language: string;
  rate_by_admin: string | null;
  codice_fiscale: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface AssignedToUser {
  full_name: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  secret_2fa: string;
  two_factor_enabled: boolean;
  username: string;
  contact: string;
  profile_image: string | null;
  added_by: number;
  date_format: string;
  timezone: string | null;
  birth_date: string | null;
  gender: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  zip: string | null;
  active: string;
  last_login_time: string | null;
  verified: boolean;
  role_id: number;
  is_head: boolean;
  language: string;
  pass_logs: string | null;
  parent_table_id: string | null;
  chat_user_status: string;
  last_active_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: number;
  trainer: Trainer;
}

export interface FilteredSlot {
  id: number;
  price: number;
  reimbursement_fee: number;
  threshold: number;
  cost_calculations: string | null;
  assigned_to: number;
  lesson_session_id: number;
  course_id: number;
  course_bundle_id: number;
  assigned_to_status: string;
  trainer_assigned_to_status: string;
  lesson_id: number;
  reject_note: string | null;
  request_id: number;
  is_full_course: boolean;
  available: boolean;
  is_optional: boolean;
  is_lesson_trainer: boolean;
  without_approval: boolean;
  is_lesson_selected: boolean;
  last_reminder_sent_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  courses: Course;
  course_bundle: CourseBundle;
  assignedToUser: AssignedToUser;
  lessonSessions: LessonSession;
  start_time: string;
  end_time: string;
}

interface FilteredSlots {
  [date: string]: FilteredSlot[];
}

export interface IAssignedBundleTrainer {
  totalHours: number;
  filteredSlots: FilteredSlots;
}
