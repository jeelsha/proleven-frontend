import { FormikValues } from 'formik';

// survey props
export interface SurveyQuestionProps {
  question: string;
  question_type: string;
  survey_target: string;
  is_required: boolean;
  option?: { answer: string; slug?: string }[];
  rating?: number;
  answer?: string;
  range?: number;
  label?: { key: string; value: string }[];
  surveyAnswer?: { answer: string; slug?: string }[];
  slug?: string;
}
export interface SurveyInitialProps {
  id?: string;
  title: string;
  note?: string;
  question?: SurveyQuestionProps[];
  surveyTemplateQuestion?: SurveyQuestionProps[];
}

export interface SurveyTypeSelectionProps {
  questionData: SurveyQuestionProps;
  index: number;
  values: FormikValues;
  slugValue: string | undefined;
}

// attendee exam result
export interface AttendeeExamList {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  status_without_attendance: string;
  is_submit: boolean;
  slug: string;
  course_participate_id: number;
  course: Course;
  exam_participate: {
    slug: string;
    id: string;
  };
  course_participate: {
    slug: string;
    code: string;
    attempts: number;
    company: {
      address1: string;
      address2: string;
      city: string;
      country: string;
      id: number;
      logo: string;
      name: string;
      state: null;
    };
  };
}

interface LessonSession {
  id: number;
  assigned_to: number;
  lesson_session_id: number | null;
  course_id: number;
  course_bundle_id: number | null;
  assigned_to_status: string;
  trainer_assigned_to_status: string;
  lesson_id: number | null;
  reject_note: string | null;
  is_full_course: boolean;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  assignedToUser: {
    first_name: string;
    last_name: string;
    id: number;
  };
  start_time: string;
}

interface Lesson {
  id: number;
  title: string;
  mode: string;
  conference_provider: string | null;
  calendar_provider: string | null;
  client_meeting_link: string;
  language: string;
  parent_table_id: number;
  slug: string;
  date: string;
  address_map_link: string | null;
  place_address: string;
  course_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lesson_sessions: LessonSession[];
}

interface CourseCategory {
  id: number;
  name: string;
  slug: string;
}

interface CourseSubCategory {
  id: number;
  name: string;
  slug: string;
}

interface LessonSessionApproval {
  id: number;
  assigned_to: number;
  lesson_session_id: number | null;
  course_id: number;
  course_bundle_id: number | null;
  assigned_to_status: string;
  trainer_assigned_to_status: string;
  lesson_id: number | null;
  reject_note: string | null;
  is_full_course: boolean;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  assignedToUser: {
    first_name: string;
    last_name: string;
    id: number;
  };
}

interface Course {
  id: number;
  title: string;
  image: string;
  description: string;
  start_date: string;
  end_date: string;
  courseSubCategory: CourseSubCategory;
  courseCategory: CourseCategory;
  lessons: Lesson[];
  lessonSessionApproval: LessonSessionApproval[];
}

export interface AttendeeList {
  data?: {
    data: { data: AttendeeExamList[] }[];
    count: number;
    lastPage: number;
  };
}
export interface AttendeeListWithData {
  data: AttendeeExamList[];
}

export type AttendeeHeaderCompany = {
  id: number;
  uuid: string;
  user_id: number | null;
  name: string | null;
  legal_name: string | null;
  registration_number: string;
  slug: string;
  website: string | null;
  industry: string | null;
  description: string | null;
  size: string | null;
  logo: string;
  accounting_emails: { email: string; is_primary: boolean }[];
  ateco_code: string;
  sdi_code: string;
  payment_term: string | null;
  vat_number: string;
  is_invoice: boolean;
  address1: string;
  address2: string | null;
  city: string;
  country: string;
  state: string | null;
  zip: string;
  parent_table_id: number | null;
  language: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AttendeeHeaderPrivateIndividual = {
  full_name: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  secret_2fa: string;
  two_factor_enabled: boolean;
  username: string;
  contact: string | number | null;
  profile_image: string | null;
  date_format: string;
  timezone: string | null;
  birth_date: string | null;
  gender: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  zip: number | null;
  active: string;
  verified: boolean;
  role_id: number;
  is_head: boolean;
  language: string;
  pass_logs: string[];
  parent_table_id: number | null;
  chat_user_status: string;
  last_active_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FilterOptionsType = {
  mismatchRecord: TabDetailProps;
};

export interface TabDetailProps {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  email: string;
  mobile_number: string;
  code?: string;
  job_title?: string;
  assigned_to_status?: string;
  course?: {
    slug?: string;
  };
}

export interface AttendeeResult {
  question: string;
  options: string[];
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
  marks: number;
  total_marks?: number;
  outOfMarks?: number;
  exam_participate: {
    attempts?: string;
    status?: string;
    status_without_attendance: string;
  };
}
export interface AttendeeResultViewProps {
  response?: {
    course?: {
      title?: string;
    };
    data?: {
      data?: AttendeeResult[];
      total_marks?: number;
      outOfMarks?: number;
    }[];
    total_marks: number;
  };
}

export interface ExamResultProps {
  total_marks?: number;
  data?: AttendeeResult[];
}

export interface AttendeeExamListViewProps {
  examSlug?: string;
  courseSlug?: string;
  participateSlug?: string;
}

export interface SurveyModalProps {
  slug?: string;
}

export interface SurveyData {
  survey_qr: string;
  slug: string;
  survey_url: string;
}

export interface AttendeeExamListWithData {
  data: AttendeeResult[];
}

export enum EnumQRCode {
  Exam = 'exam',
  Survey = 'survey',
}
