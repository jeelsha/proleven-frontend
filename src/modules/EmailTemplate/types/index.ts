import { CourseModeEnum } from 'modules/Courses/Constants';
import { Course } from 'modules/Courses/types';

export type emailProps = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  data?: IEmailTemplateList | null;
  refetch?: () => void;
  setData?: React.Dispatch<React.SetStateAction<IEmailTemplateList | null>>;
};
export type EmailNotes = {
  [key: string]: string;
};

export interface IEmailTemplateList {
  id?: number;
  title?: string;
  subject?: string;
  description?: string;
  attachment?: Attachment[];
  slug?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  note?: EmailNotes[];
}
export interface Attachment {
  id?: number;
  filename?: string;
  filepath?: string;
  email_template_id?: number;
  sent_email_id?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
export interface EmailTemplate {
  count: number;
  currentPage: number;
  data: IEmailTemplateList[];
  lastPage: number;
  limit: number;
}
export interface ViewModalProps {
  data: IEmailTemplateList | null;
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
}

interface CreatedByUser {
  first_name: string;
  last_name: string;
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

interface Codes {
  code: string;
}

interface CourseNote {
  content: string;
}

export interface ICourseAccept {
  id: number;
  validity: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  duration: number;
  code: string;
  marked_as: string;
  start_date: string;
  end_date: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  funded_by: string;
  reject_reason: string;
  meeting_room_number: string;
  maximum_participate_allowed: number;
  price: number;
  price_in: string;
  certificate_pdf_link: string | null;
  maximum_participation_attendance: number;
  image: string;
  status: string;
  course_template_id: number;
  category_id: number;
  cloned_course_id: number | null;
  sub_category_id: number;
  language: string;
  parent_table_id: number;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  academy_id: number | null;
  code_id: number;
  course_bundle_id: number | null;
  lessonSessionApproval: LessonSessionApproval[];
  createdByUser: CreatedByUser;
  courseCategory: CourseCategory;
  courseSubCategory: CourseSubCategory;
  codes: Codes;
  course_notes: CourseNote[];
  lessonApproval: LessonApproval[];
  sessions: Session[];
}

interface AssignedToUser {
  first_name: string;
  last_name: string;
  id: number;
}

export interface LessonSessionApproval {
  id: number;
  assigned_to_status: string;
  trainer_assigned_to_status?: string;
  is_full_course: boolean;
  course_id: number;
  lesson_session_id: number;
  is_optional: boolean;
  assigned_to: number;
  assignedToUser: AssignedToUser;
  lessonSessions: LessonSession;
  lessons: Lesson;
  trainerHourlyCharge: number;
  travelFees: number | null;
  hours: number;
  hourlyRate: number;
  totalDays: number;
  totalDistance: number;
  totalTravelFees: number;
  mode: string;
  totalNetFees: number;
  is_lumpsum_select: boolean;
  amount: number;
  reimbursement_amount: number;
  trainerRequest: {
    id: number;
    note: string;
  };
  courses?: Course;
}
interface LessonSession {
  slug: string;
  start_time: string;
  end_time: string;
  mode: CourseModeEnum;
}

interface Lesson {
  id: number;
  title: string;
  mode: string;
  address_map_link: string | null;
  client_meeting_link: string;
  date: string;
}
interface LessonApproval {
  assigned_to_status: string;
  assignedToUser: string;
  id: number;
  lesson_session_id: number | null;
  is_full_course: boolean;
  is_optional: boolean;
}

interface Session {
  id: number;
  start_time: string;
  end_time: string;
  slug: string;
  lessonSessionApproval: LessonSessionApproval[];
  assigned_to: number;
  lessonTitle: string;
  lessonSlug: string;
  lessonId: number;
  lessonDate: string;
  assigned_to_status?: string;
  trainer_assigned_to_status?: string;
}
