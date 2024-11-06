import { Option } from 'components/FormElement/types';
import { FormikValues } from 'formik';
import { TFunction } from 'i18next';
import {
  CourseMarkAsEnum,
  CourseModeEnum,
  CourseStatus,
  CourseType,
} from 'modules/Courses/Constants';
import { Trainer as LessonTrainer } from 'modules/Courses/types/TrainersAndRooms';
import { TokenProvider } from 'types/common';
import { IAccess } from '../pages/CourseViewDetail/types';
import { DataItem } from './subCategoryType';

type Modal = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export type AddEditCategoryProps = {
  modal: Modal;
  data?: CourseCategory | null;
  setData?: React.Dispatch<React.SetStateAction<CourseCategory | null>>;
  refetch?: () => void;
  isView?: boolean;
};

export interface CourseCategory {
  course_category_image: string;
  [key: string]: string;
}

export type AddEditSubCategoryProps = {
  modal: Modal;
  data?: DataItem | null;
  setData?: React.Dispatch<React.SetStateAction<DataItem | null>>;
  refetch?: (reset?: boolean) => void;
  slug?: string;
  is_legislation_included: boolean;
};

export interface CourseSubCategory {
  [key: string]: string | { slug: string };
}

export interface CategoryCardProps {
  addModal?: Modal;
  deleteModal?: Modal;
  data?: CourseCategory | null;
  setSelectedData?: React.Dispatch<React.SetStateAction<CourseCategory | null>>;
  isView?: boolean;
}

export interface SubCategoryCardProps {
  data: DataItem;
  setData: React.Dispatch<React.SetStateAction<DataItem | null>>;
  addModal: Modal;
  deleteModal: Modal;
}

export interface Notes {
  id?: number;
  course_id?: number | null;
  parent_table_id?: number | null;
  slug?: string;
  content?: string;
  language?: string;
}

export interface Answer {
  id?: number;
  answer?: string;
  course_id?: number | null;
  question_id?: number | null;
  parent_table_id?: number | null;
  is_correct?: boolean;
  created_by?: number | null;
  language?: string;
  slug?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  survey_question_id?: number | null;
}

export interface Question {
  id?: number;
  question?: string;
  exam_id?: number | null;
  parent_table_id?: number | null;
  slug?: string | null;
  marks: number | null;
  course_id?: number | null;
  created_by?: number | null;
  answers?: Answer[];
  language?: string;
  correct_answer?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Exam {
  id?: number;
  slug?: string | null;
  parent_table_id?: number | null;
  duration?: number;
  course_id?: number | null;
  created_by?: number | null;
  language?: string;
  questions?: Question[];
  qr_string?: string;
  url?: string;
  passing_marks?: number | null;
}

export interface Topic {
  id?: number | null;
  course_id?: number | null;
  lesson_id?: number | null;
  topic: string | null;
  language?: string;
  parent_table_id?: number | null;
  slug?: string | null;
  is_external_certificate?: boolean;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
  deleted_at?: string | null;
}

export interface Session {
  id?: number;
  course_id?: number | null;
  lesson_id?: number | null;
  client_meeting_link?: string | null;
  provider_meeting_link?: string | null;
  provider_start_meeting_link?: string | null;
  provider_meeting_id?: string | null;
  provider_meeting_event_id?: string | null;
  provider_meeting_request_uid?: string | null;
  provider_event_uid?: string | null;
  provider_event_id?: string | null;
  provider_meeting_additional_data?: string | null;
  provider_event_additional_data?: string | null;
  conference_change_key?: string | null;
  calendar_change_key?: string | null;
  mode?: string;
  meeting_link?: string | null;
  start_meeting_link?: string | null;
  meeting_id?: string | null;
  additional_data?: string | null;
  start_time?: string;
  end_time?: string;
  created_by?: number | null;
  session_calendar_provider?: string | null;
  session_conference_provider?: string | null;
  assigned_to?: number | null;
  slug?: string;
  parent_table_id?: number | null;
  main_trainers?: Array<number>;
  optional_trainers?: Array<number>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  assigned_to_status?: string;
}

export interface Resource {
  id: number;
}

export interface Lesson {
  id?: number;
  session: Session[];
  conference_provider: string | null;
  conference_provider_id?: number | null;
  calendar_provider_id?: number | null;
  calendar_provider: string | null;
  title?: string;
  mode: string;
  client_meeting_link: string | null;
  language: string;
  parent_table_id?: number | null;
  slug?: string | null;
  date?: string | null;
  address_map_link: string | null;
  place_address?: string | null;
  assigned_to_status?: string | null;
  course_id?: number | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  topics?: Topic[];
  location?: string;
  latitude?: string;
  longitude?: string;
}
export interface ICourseResource {
  title?: string;
  quantity: number;
  resource_id: number;
}
export interface ICourseTrainer {
  is_lesson_trainer: boolean;
  assigned_to: number;
}
export interface Course {
  id?: number;
  title: string;
  course_notes: Notes[];
  type?: string;
  academy_id?: number | null;
  project_id?: number | null;
  survey_template_id?: number | null;
  code_id?: number | null;
  main_trainers: Array<ICourseTrainer> | null;
  optional_trainers: Array<ICourseTrainer> | null;
  main_rooms: Array<number> | null;
  optional_rooms: Array<number> | null;
  main_resources: ICourseResource[];
  optional_resources: ICourseResource[];
  // duration: number | null;
  code: string;
  marked_as?: string | null;
  is_template: boolean;
  start_date?: string;
  end_date?: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  funded_by: string;
  reject_reason?: string | null;
  price: number | null;
  price_in?: string | null;
  maximum_participation_attendance?: number;
  maximum_participate_allowed?: number;
  max_attendee_applicable?: boolean;
  image?: string | null;
  status?: string;
  course_template_id?: number | null;
  category_id: number | null;
  cloned_course_id?: number | null;
  sub_category_id: number | null;
  language?: string;
  parent_table_id?: number | null;
  assigned_to?: number | null;
  created_by?: number | null;
  created_at?: string;
  slug?: string | null;
  description?: string | null;
  validity?: number | null;
  assigned_rooms?: [];
  course_resources?: object[];
  course_participates?: object[];
  valid_optional_trainers?: object[];
  projects?: object[];
  isErrorInResource?: boolean;
  isErrorInTrainer?: boolean;
  isErrorInRoom?: boolean;
  certificate_template_id?: number | null;
  certificate_title?: string | null;
  certificate_pdf_link?: string;
  courseCategory?: {
    name: string;
    slug?: string;
  };
  courseSubCategory?: {
    name: string;
  };
  mode: CourseModeEnum | null;
  survey_url?: string | null;
  survey_qr?: string | null;
  is_external_certificate?: boolean;
  progressive_number?: number | null;
}
export interface TemplateCourse {
  certificate_pdf_link?: string;
  id?: number;
  title: string;
  course_notes: Notes[];
  type?: string;
  academy_id?: number | null;
  survey_template_id?: number | null;
  project_id?: number | null;
  code_id?: number | null;
  main_resources: ICourseResource[];
  optional_resources: ICourseResource[];
  duration: number | null;
  code: string;
  marked_as?: string | null;
  is_template: boolean;
  start_date?: string;
  end_date?: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  funded_by: string;
  reject_reason?: string | null;
  price: number | null;
  price_in?: string | null;
  maximum_participation_attendance?: number;
  image?: string | null;
  status?: string;
  course_template_id?: number | null;
  category_id: number | null;
  cloned_course_id?: number | null;
  sub_category_id: number | null;
  language?: string;
  parent_table_id?: number | null;
  assigned_to?: number | null;
  created_by?: number | null;
  created_at?: string;
  slug?: string | null;
  description?: string | null;
  validity?: number | null;
  course_resources?: object[];
  certificate_template_id?: number | null;
  certificate_title?: string | null;
  mode: CourseModeEnum | null;
  is_external_certificate?: boolean;
}

export interface CourseInitialValues {
  course_image?: string | null;
  image?: string;
  course: Course;
  lesson: Lesson[];
  exam?: Exam;
}
export interface TemplateCourseInitialValues {
  course_image?: string | null;
  image?: string;
  course: TemplateCourse;
  lesson: Lesson[];
  exam?: Exam;
}

export type InitFormType = {
  [key: string]: CourseInitialValues;
};
export type InitTemplateCourseType = {
  [key: string]: TemplateCourseInitialValues;
};

export type AddEditFormType = {
  formData: InitFormType;
  setInitialValues: React.Dispatch<React.SetStateAction<InitFormType>>;
  activeLanguage: number;
  setActiveLanguage: React.Dispatch<React.SetStateAction<number>>;
  formLanguage: string;
  setFormLanguage: React.Dispatch<React.SetStateAction<string>>;
  isUpdate?: boolean;
};

export interface LessonApproval {
  assigned_to_status?: string;
  trainer_assigned_to_status?: string;
  lesson_session_id?: number;
  assignedToUser?: string;
  id: number;
  is_full_course?: boolean;
  is_optional?: boolean;
  profile_image?: string;
}

export interface ConnectionsProps {
  token_provider?: string;
  token_provider_mail?: string;
  id: number;
}
export const IconMapping: Record<string, string> = {
  zoom: 'zoomIcon',
  icalendar: 'icalIcon',
  google_calendar: 'googleMeetIcon',
  microsoft_calendar: 'teamsIcon',
};
export type ConferenceValueType = {
  token_provider: string | undefined;
  id: number;
};

export interface TFunctionProps {
  t: TFunction<'translation', undefined>;
  lng?: string;
}

export type AddEditResourcesProps = {
  modal: Modal;
  data: Record<string, string> | null;
  setData: React.Dispatch<React.SetStateAction<Record<string, string> | null>>;
  refetch?: () => void;
};

export type SetFieldValue = <
  K extends keyof FormikValues,
  V extends FormikValues[K]
>(
  field: string,
  value: V,
  shouldValidate?: boolean
) => void;

export interface CourseSubComponentProps {
  values: CourseInitialValues;
  setFieldValue?: SetFieldValue;
  formLanguage?: string;
  fieldsToTranslate: Array<string>;
  currentLanguage: string;
  defaultLanguage: string;
  isMainLoading?: boolean;
  setIsMainLoading?: (isLoading: boolean) => void;
  mainFormData?: CourseInitialValues;
  setMainFormData?: React.Dispatch<React.SetStateAction<InitFormType>>;
  trainerList?: Option[];
  isUpdate?: boolean;
  setLessonDates?: React.Dispatch<React.SetStateAction<Array<string>>>;
  setLessonTime?: React.Dispatch<React.SetStateAction<Array<string>>>;
  lessonTrainers?: Array<LessonTrainer[]>;
  setLessonTrainers?: React.Dispatch<React.SetStateAction<Array<LessonTrainer[]>>>;
  setLocations?: React.Dispatch<React.SetStateAction<Array<string | undefined>>>;
  locations?: Array<string | undefined>;
}

export interface CourseResource {
  id: number;
  course_id: number;
  lesson_id: number;
  resource_id: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}
export interface LessonSession {
  id: number;
  lesson_id: number;
  session_conference_provider: TokenProvider;
  session_calendar_provider: TokenProvider;
  client_meeting_link: null;
  start_time: string;
  end_time: string;
  course_id: number;
  mode: string;
  provider_meeting_link: null;
  provider_meeting_event_id: null;
  provider_start_meeting_link: null;
  provider_meeting_id: null;
  provider_meeting_additional_data: null;
  provider_meeting_request_uid: string;
  provider_event_uid: string;
  provider_event_id: null;
  provider_event_additional_data: null;
  conference_change_key?: null;
  calendar_change_key?: null;
  created_by: number;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  slug?: string;
}

export interface LessonResponse {
  id: number;
  title: string;
  lesson_resources: CourseResource[];
  mode: CourseModeEnum;
  conference_provider: TokenProvider;
  calendar_provider: TokenProvider;
  client_meeting_link: string;
  language: string;
  parent_table_id?: number;
  slug: string;
  date: string;
  address_map_link: null;
  place_address: null;
  course_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  deleted_at: null;
  lesson_sessions: LessonSession[];
  topics: Topic[];
}
interface AssignedToUser {
  first_name: string;
  last_name: string;
  id: number;
}

interface LessonSessionApproval {
  assigned_to_status: string;
  is_full_course: boolean;
  course_id: number;
  lesson_session_id: number | null;
  is_optional: boolean;
  assigned_to: number;
  assignedToUser: AssignedToUser;
  lessons?: {
    location: string;
  };
}

export interface CourseResponse {
  access: IAccess[];
  companies?: {
    id: number;
    company_id: number;
    card_id: number;
    company: { id: number; name: string };
  }[];
  card_members: {
    id: number;
    user_id: number;
    card_id: number;
  }[];
  lessonSessions: {
    start_time: string;
    end_time: string;
  };
  id: number;
  marked_as: CourseMarkAsEnum;
  funded_by: string;
  validity: number;
  is_template: boolean;
  start_date: string;
  end_date: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  meeting_room_number: string;
  maximum_participate_allowed: number;
  price_in: string;
  maximum_participation_attendance: number;
  course_template_id: null | number;
  cloned_course_id: null | number;
  sub_category_id: number;
  created_by: number;
  assigned_to: number;
  title: string;
  code: string;
  code_title?: string;
  image: string;
  status: CourseStatus;
  slug: string;
  description: string;
  reject_reason: string;
  price: number;
  duration: number;
  type: CourseType;
  category_id: number;
  parent_table_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  projects?: IProject;
  lessons: LessonResponse[];
  courseCategory: {
    id: number;
    name: string;
    slug: string;
    parent_table_id: null;
    image: null | string;
    category_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  } | null;
  createdByUser: {
    first_name: string;
    last_name: string;
  };
  course_participates?: [];
  courseSubCategory: {
    id: number;
    name: string;
    slug: string;
    parent_table_id: null;
    image: null | string;
    category_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  };
  course_notes: Notes[];
  exam: Exam[];
  lessonApproval: LessonApproval[];
  lessonSessionApproval: LessonSessionApproval[];
  valid_optional_trainers?: OptionalTrainer[];
  main_trainers: Array<ICourseTrainer> | null;
  optional_trainers: Array<ICourseTrainer> | null;
  main_rooms: Array<number> | null;
  optional_rooms: Array<number> | null;
  main_resources: ICourseResource[];
  optional_resources: ICourseResource[];
  academy_id?: number | null;
  survey_url?: string | null;
  survey_qr?: string | null;
  progressive_number?: number | null;
  proposed_date?: string | null;
  academy: {
    name: string;
    address_map_link: string;
    address: string;
    location: string;
  };
  is_external_certificate?: boolean;
  [key: string]: CourseResponse[keyof CourseResponse];
}
interface AssignedRoom {
  created_at: string;
  created_by: number;
  deleted_at: string | null;
  maximum_participate: number;
  slug: string;
  title: string;
  updated_at: string;
  updated_by: number;
  id: number;
}

interface PublishCourseResource {
  created_at: string;
  created_by: number;
  deleted_at: null;
  id: number;
  quantity: number;
  slug: string;
  title: string;
  updated_at: string;
}

type OptionalTrainer = {
  assigned_to_status: boolean;
  room: AssignedRoom;
  assignedToUser: AssignedToUser;
  resources: PublishCourseResource[];
  course_id: number;
  is_full_course: boolean;
  is_optional: boolean;
  lesson_session_id: number;
};
export interface IAcademy {
  id: number;
  name: string;
  address: string;
  location: string;
  slug?: string;
  language?: string;
  address_map_link?: string | null;
  parent_table_id?: number;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type IAllLanguages = {
  id: number;
  name: string;
  short_name: string;
  slug?: string;
  is_default?: boolean;
};

export type IExamModal = {
  slug: string;
  exam: ExamData[];
};

export interface ExamData {
  qr_string: string;
  slug: string;
  url: string;
}

type Manager = {
  full_name: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  secret_2fa: string | null;
  two_factor_enabled: boolean | null;
  username: string;
  contact: string | null;
  profile_image: string | null;
  added_by: number | null;
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
  language: string;
  pass_logs: string;
  parent_table_id: number | null;
  chat_user_status: string;
  last_active_time: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CompanyData = {
  address1: string;
  company?: {
    id: number;
  };
  signed_participate_count: number;
  course_participate_count: number;
  address2: string;
  private_individual: PrivateIndividual;
  id: number;
  course_slug: string;
  company_name: string;
  name: string;
  logo: string;
  company_id: number;
  company_slug: string;
  company_logo: string;
  manager_name: string;
  manager_email: string;
  manager_username: string;
  manager: Manager;
  course?: {
    end_date: string;
  };
};
type PrivateIndividual = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string;
};
export type ApiResponse = {
  data: CompanyData[];
  count: number;
  currentPage: number;
  limit: number;
  lastPage: number;
};
type Trainer = {
  assigned_to_status: string;
  assignedToUser: string;
  id: number;
  is_full_course: boolean;
  is_optional: boolean;
  profile_image: string;
};

export type CompanyCourseResponse = {
  title: string;
  slug: string;
  start_date: string;
  end_date: string;
  code: string;
  image: string;
  category_name: string;
  sub_category_name: string;
  trainers: Trainer[];
};
export type Participant = {
  id: number;
  course_id: number;
  slug: string;
  code: string;
  job_title: string;
  assigned_to_status: string;
  first_name: string;
  courseAttendance: number;
  attendedHours: number;
  last_name: string;
  email: string;
  mobile_number: string;
  created_by: number;
  updated_by: number;
  manager_id: number;
  company_id: number;
  is_certificate_issued: boolean;
  language: string;
  parent_table_id: number;
  created_at: string;
  updated_at: string;
  is_recovered: boolean;
  deleted_at: string | null;
};

export type ParticipantData = {
  data: Participant[];
  count: number;
  currentPage: number;
  limit: number;
  lastPage: number;
};
export type LessonSessionTimeSheet = {
  id: number;
  start_time: string;
  end_time: string;
  slug: string;
  language: string;
  lesson: {
    id: number;
    title: string;
    date: string;
  };
  sessionAttendance: number;
  courseAttendanceLog: LessonBreak[];
};

export type LessonBreak = {
  id: number;
  course_participate_id: number;
  break_in: string; // Date string in ISO 8601 format
  break_out: string; // Date string in ISO 8601 format
  lesson_session_id: number;
  course_id: number;
  created_at: string; // Date string in ISO 8601 format
  updated_at: string; // Date string in ISO 8601 format
  deleted_at: string | null; // Date string in ISO 8601 format or null
};

export type LessonSessionData = {
  id: number;
  mark_as_start_signed_at: string | null;
  mark_as_end_signed_at: string | null;
  end_signature: string | null;
  start_signature: string | null;
  mark_as_end_signed: boolean | null;
  mark_as_start_signed: boolean | null;
  mark_as_absent: boolean;
  set_early_arrival: string | null;
  lessonSession: LessonSessionTimeSheet;
};

export type LessonSchedule = {
  [lessonTitle: string]: LessonSessionData[];
};

export type AttendanceCourse = {
  id: number;
  slug: string;
  title: string;
  code: string;
  start_date: string;
};
export interface ExpandableCourseTableRowType {
  item: CourseResponse;
  index: number;
  refetch?: () => void;
  status?: string;
  activeTab?: number;
  markAsSoldOutModal?: Modal;
  setSelectedCourse?: React.Dispatch<React.SetStateAction<CourseResponse | null>>;
  addModal?: Modal;
  limit?: number;
  count?: number;
  queryParams?: string;
}

export type LatLngType = {
  lat: number;
  lng: number;
};

interface IProject {
  title?: string;
  card: ICard;
}

interface ICard {
  id?: number;
  board_id?: number;
  title?: string;
}

export interface TrainerCourses {
  id: number;
  validity: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  duration: number;
  code: string;
  marked_as: string;
  start_date: Date;
  end_date: Date;
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
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  academy_id: number | null;
  showInvitation: boolean;
  academy: {
    name: string;
    address_map_link: string;
    address: string;
    location: string;
  };
  code_id: number;
  course_bundle_id: number | null;
  lessonSessionApproval: TrainerLessonSessionApproval[];
  createdByUser: {
    first_name: string;
    last_name: string;
  };
}

interface TrainerLessonSessionApproval {
  id: number;
  assigned_to_status: string;
  is_full_course: boolean;
  course_id: number;
  lesson_session_id: number;
  is_optional: boolean;
  assigned_to: number;
  course_bundle_id: number | null;
  lessons: TrainerLesson;
}

interface TrainerLesson {
  id: number;
  title: string;
  mode: string;
  address_map_link: string | null;
  client_meeting_link: string | null;
  date: Date;
  location: string;
  longitude: string;
  latitude: string;
}

export interface SuggestedTrainer {
  address: string;
  name: string;
  rate: number;
  username: string;
}
