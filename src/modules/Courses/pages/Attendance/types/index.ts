import { CompanyData, LessonSessionTimeSheet } from 'modules/Courses/types';

export interface Lesson {
  place_address: string;
  duration: string;
  id: number;
  title: string;
  mode: string;
  date: string;
  slug: string;
  lesson_sessions: LessonSession[];
  conference_provider: string;
  client_meeting_link?: string;
  topics: Topic[];
  location?: string;
}

interface Topic {
  id: number;
  topic: string;
}

interface LessonSessionApproval {
  assigned_to_status: string;
  assignedToUser: {
    first_name: string;
    last_name: string;
    profile_image: string;
  };
}

export interface LessonSession {
  // conference_provider: string;
  session_conference_provider: string;
  id: number;
  start_time: string;
  end_time: string;
  lessonSessionApproval: LessonSessionApproval[];
  mode?: string;
  provider_meeting_link?: string | null;
  provider_meeting_event_id?: string | null;
  provider_start_meeting_link?: string | null;
  provider_meeting_id?: string | null;
  provider_meeting_additional_data?: string | null;
  provider_meeting_request_uid?: string | null;
  provider_event_uid?: string | null;
  provider_event_id?: string | null;
}

export enum LessonModeEnum {
  InPerson = 'in-person',
  VideoConference = 'video-conference',
  Hybrid = 'hybrid',
}

export interface CourseAttendance {
  id: number;
  start_signature: string;
  end_signature: string;

  mark_as_start_signed_at: string | null;
  mark_as_end_signed_at: string | null;
  course: {
    start_date: string;
    end_date: string;
  };
  lessonSession: LessonSessionTimeSheet;
  mark_as_start_signed?: boolean;
  mark_as_end_signed?: boolean;
}

export interface CourseParticipant {
  company_name?: string;
  id: number;
  course_id: number;
  slug: string;
  code: string;
  job_title: string;
  assigned_to_status: string;
  first_name: string;
  last_name: string;
  company: CompanyData;
  email: string;
  mobile_number: string;
  created_by: number;
  updated_by: number;
  manager_id: number;
  company_id: number;
  language: string;
  parent_table_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  courseAttendanceSheet: CourseAttendance[];
}
export interface LessonApprovalCourse {
  assignedToUser?: string;
  profile_image?: string;
}

export interface AttendanceSheetCourse {
  end_date: string;
  id: number;
  start_date: string;
}

export interface ICourseDetail {
  code_title: string;
  type?: string;
  is_external_certificate?: boolean;
  status?: string;
  certificate_pdf_link: string;
  funded_by: string;
  founded: boolean;
  code: string;
  maximum_participate_allowed: string;
  validity: number;
  id: number;
  title: string;
  slug: string;
  duration: number | string;
  marked_as: string;
  lessonApproval: LessonApprovalCourse[];
  start_date: string;
  exam: Exam[];
  end_date: string;
  has_exam: boolean;
  price: number;
  price_in: string;
  image: string;
  category_id: number;
  sub_category_id: number;
  card_id?: number;
  propose_stage_id?: number;
  progressive_number?: string;
  language: string;
  parent_table_id: number;
  createdByUser: {
    first_name: string;
    last_name: string;
  };
  courseCategory: {
    id: number;
    name: string;
    slug: string;
  };
  courseSubCategory: {
    id: number;
    name: string;
    slug: string;
  };
  codes: {
    code: string;
  };
  lessons: Lesson[];
  course_notes: {
    content: string;
  }[];
  certificate_title?: string;
  main_resources: {
    resource_id: number;
    quantity: number;
    title: string;
  }[];
  optional_resources: {
    resource_id: number;
    quantity: number;
    title: string;
  }[];
  course_funded_docs?: {
    attachment_url: string;
    attachment_type: string;
    is_funded_documents: boolean;
  }[];
  currentStage?: string;
  is_proposed_visible?: boolean;
  course_attachments?: {
    attachment_url: string;
    attachment_type: string;
    is_funded_documents: boolean;
    show_trainer: boolean;
    show_company_manager: boolean;
  }[];
  main_rooms_data?: {
    title: string;
    id: number;
    maximum_participate: number;
    course_id: number;
    course_bundle_id: number | null;
    room_id: number;
    assigned_to: number;
    is_optional: boolean;
    assigned_to_status: string;
  }[];
  optional_rooms_data?: {
    title: string;
    id: number;
    maximum_participate: number;
    course_id: number;
    course_bundle_id: number | null;
    room_id: number;
    assigned_to: number;
    is_optional: boolean;
    assigned_to_status: string;
  }[];
  surveyTemplate?: {
    title?: string;
  };
  certificateTemplate?: {
    title?: string;
  };
  academy?: {
    name?: string;
    address_map_link?: string;
    address?: string;
    location?: string;
  };
}
interface Exam {
  id: number;
  duration: number;
  course_id: number;
  created_by: number;
  language: string;
  parent_table_id: number;
  slug: string;
  qr_string: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  questions: ExamQuestion[];
  passing_marks?: string;
}

interface ExamQuestion {
  id: number;
  question: string;
  marks: number;
  type: string;
  exam_id: number;
  course_id: number;
  created_by: number;
  slug: string;
  language: string;
  parent_table_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  answers: ExamAnswer[];
}

interface ExamAnswer {
  id: number;
  slug: string;
  answer: string;
  is_correct: boolean;
  question_id: number;
  course_id: number;
  language: string;
  parent_table_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
