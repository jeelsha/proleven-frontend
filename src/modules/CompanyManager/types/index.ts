import { Option } from 'components/FormElement/types';
import { FormikErrors } from 'formik';
import { UserModalType } from 'hooks/types';
import { TFunction } from 'i18next';
import { Course, CourseResponse } from 'modules/Courses/types';
import { IProfile } from 'modules/Profiles/types';
import React, { Dispatch, SetStateAction } from 'react';
import { ModalProps } from 'types/common';
import { AddAttendeeEnum } from '../constants';

export interface Filters {
  categories: number[];
  subcategories: number[];
  courses: number[];
}

export interface DropdownProps {
  options: Option[];
  filters: Filters;
  loading?: boolean;
  setFilters: Dispatch<
    SetStateAction<{
      categories: number[];
      subcategories: number[];
      courses: number[];
    }>
  >;
  filterKey: string;
  setSearch: (search: string) => void;
  search: string;
}

export interface CourseFilter {
  title?: string;
  content?: React.ReactNode;
}

export interface CourseDetailsProps {
  image: string;
  title: string;
  courseCategory: {
    name: string;
  };
  start_date?: string | number | Date;
  end_date?: string | number | Date;
  price?: number;
  id?: string | number;
  slug?: string;
  type?: string;
  mode?: string;
  academy?: {
    location?: string;
  };
  lessons: { location?: string }[];
  course_type?: string;
  status?: string;
  card?: {
    stage?: {
      id: number;
      name: string;
      stage_title: string | null;
      board_id: number;
      order: number;
      slug: string;
      language: string;
      parent_table_id: number;
    };
  };
}
export interface OtherCourseFilters {
  startDate: string;
  endDate: string;
}
export interface DateFilterProps {
  filters: OtherCourseFilters;
  setFilters: Dispatch<SetStateAction<OtherCourseFilters>>;
}

export interface AvailableFilterProps {
  availability: string;
  setAvailability: Dispatch<SetStateAction<string>>;
}

export interface QueryFilterProps {
  courseCategory: string;
  courseSubCategory: string;
  startDate: string;
  endDate: string;
  marked_as: string;
  courseTemplate: string;
}

export interface CourseListProps {
  coursesResponse: CourseDetailsProps[];
  courseLoading: boolean;
  startRecord: number;
  endRecord: number;
  isDataAvailable: boolean;
  limit: number;
  currentPage: number;
  setLimit: Dispatch<SetStateAction<number>>;
  totalPages: number;
  dataCount: number;
  navigateUrl: string;
  navigateTrackCourse?: string;
  otherText?: string;
  activeTab?: number;
}

// Course Detail Types

export interface CourseDetailProps {
  id: string;
  title: string;
  slug: string;
  duration: number;
  start_date: string;
  end_date: string;
  price: number;
  image: string;
  validity: number;
  marked_as: string;
  courseCategory: { name: string; id: number };
  courseSubCategory: { name: string; id: number };
  createdByUser?: { first_name: string; last_name: string };
  maximum_participate_allowed: number;
  lessons: CourseLessonProps[];
  course_notes?: { content: string }[];
  founded?: boolean;
  funded_by?: string;
  is_company_enrolled?: boolean;
  purchase_date?: string;
  is_private_individual_id_enrolled?: boolean;
  course_funded_docs: {
    attachment_url: string;
    attachment_type: string;
    is_funded_documents: boolean;
  }[];
  project_funded_docs: {
    attachment_url: string;
    attachment_type: string;
    is_funded_documents: boolean;
  }[];
  course_attachments?: {
    attachment_url: string;
    attachment_type: string;
    is_funded_documents: boolean;
    show_trainer: boolean;
    show_company_manager: boolean;
  }[];
  type?: string;
  course_type?: string;
  status?: string;
  stage?: {
    id: number;
    name: string;
    stage_title: string;
    board_id: number;
    order: number;
    slug: string;
    language: string;
    parent_table_id: number;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface CourseLessonProps {
  title: string;
  mode: string;
  conference_provider: string;
  client_meeting_link?: string;
  lesson_sessions: CourseLessonSession[];
  date: string;
}

export interface CourseLessonSession {
  start_time: string;
  end_time: string;
  mode: string;
  session_conference_provider: string;
  provider_meeting_link: string;
  lessonSessionApproval: LessonSessionApproval[];
}

interface AssignedToUser {
  first_name: string;
  last_name: string;
}

interface LessonSessionApproval {
  id: number;
  assigned_to: number;
  lesson_session_id: number;
  course_id: number;
  course_bundle_id: number | null;
  assigned_to_status: string;
  trainer_assigned_to_status: string;
  lesson_id: number;
  reject_note: string | null;
  is_full_course: boolean;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  assignedToUser: AssignedToUser;
}

export interface TitleProps {
  lessonTitle: string;
  lessonData: CourseLessonProps;
  lessonNumber: number;
}

export interface CourseSessionProps {
  sessionData: CourseLessonSession[];
  meetingLink?: string;
  isCompanyEnrolled?: boolean;
}

export interface CourseNotesProps {
  courseNotes?: { content: string }[];
}

export interface CourseHeaderProps {
  courseHeaderData?: CourseDetailProps;
  state?: { [key: string]: unknown };
}

export interface AttendeeDetailsProps {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  data: FetchAttendeeDetails | null;
  setData?: React.Dispatch<React.SetStateAction<FetchAttendeeDetails | null>>;
  refetch: () => void;
  courseId?: string;
  company_id?: string | null;
  isFromSideBar?: boolean;
  publishCourseSlug?: string;
}

export interface AttendeeInitialProps {
  first_name: string;
  last_name: string;
  job_title: string;
  email: string;
  mobile_number: string;
  manager_id?: string;
  company_id?: string | number;
  course_id?: string;
  code: string;
  is_unknown?: boolean;
  company_name?: string;
}

export interface FetchAttendeeDetails {
  id: string;
  course_id: string;
  company_id: string;
  company: {
    name: string;
    ateco_code: string;
    slug: string;
  };
  slug: string;
  code: string;
  job_title: string;
  assigned_to_status: string;
  signature_status?: string;
  attendance_status: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  mobile_number: string;
  manager_id?: string;
  course?: {
    id?: number;
    title?: string;
    code?: string;
    slug: string;
    type?: string;
    start_date?: string;
    end_date?: string;
    is_external_certificate?: boolean;
  };
  courseParticipateExam: [{ status: string; status_without_attendance: string }];
  expiry_date: string;
  recoverCourse?: CourseResponse;
  recovered_from_course_id?: number;
  courseAttendance?: number;
  is_recovered?: boolean;
  external_certificate_pdf_link?: string;
  profileCourseParticipate?: IProfile;
  is_external_certificate?: boolean;
}

export type ICheckedAttendee = Pick<
  FetchAttendeeDetails,
  'first_name' | 'last_name' | 'email' | 'job_title' | 'code' | 'mobile_number'
> &
  Partial<Pick<FetchAttendeeDetails, 'id'>>;

export interface AttendeeProps {
  courseId?: string;
  activeTab?: number;
  courseMarkAs?: string;
  isFromSideBar?: boolean;
  unknownCompany?: boolean;
  start_date?: string;
  end_date?: string;
  fromCompanyManager?: boolean;
}

export interface CourseAccordionProps {
  CourseFilters: { title: React.ReactNode; content: React.ReactNode }[];
}

export interface CourseTrackProps {
  course: CourseDetailProps;
  currentStage: number;
  stages: CourseStagesTrackProps[];
}

export interface RejectModalProps {
  rejectReason: string;
}

export interface CourseStagesTrackProps {
  id: number;
  name: string;
  stage_title?: string;
  card_stage_logs: {
    created_at: string;
  }[];
  order: number;
}
export interface CourseSubCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  category_id: number;
  courses: Course[];
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
  courseSubCategories: CourseSubCategory[];
}
export interface TemplateBundleType {
  course_slugs: Array<string>;
  description?: string;
  category_id: Array<number>;
  sub_category_id: Array<number>;
}

export interface AcceptModalType {
  modal: ModalProps;
  handleAccept: () => void;
  handleCancel: () => void;
}

export interface AcceptDeniedModalType {
  modal: ModalProps;
  headerTitle?: string;
  description?: string;
  showButtons?: boolean;
}

export interface CourseDetailCardProps {
  CourseDetails:
    | {
        title: JSX.Element;
        content: JSX.Element;
      }[]
    | undefined;
  courseDetail: CourseDetailProps | undefined;
}

// client course listing
export interface CompanyCourseList {
  start_date: string;
  course_id: null | number;
  end_date: string;
  title: string;
  marked_as: string;
  course?: {
    start_date: string;
    end_date: string;
  };
}

export interface CompanyCourseListProps {
  data?: {
    data: CompanyCourseList[];
    count: number;
    lastPage: number;
  };
}

export type CourseFundedDocsProps = {
  attachment_url: string;
  show_trainer?: boolean;
  show_company_manager?: boolean;
  is_funded_documents?: boolean;
};

export type SelectionModalProps = {
  modal: UserModalType;
  attendeeModal?: UserModalType;
  existingAttendeeModal?: UserModalType;
  selectedOption: string;
  setSelectedOption: Dispatch<SetStateAction<AddAttendeeEnum>>;
};

export type ExistingAttendeeProps = {
  modal: UserModalType;
  courseId?: string;
  reFetchParticipate?: () => void;
};

export type IHandleCheckBoxAttendee = {
  checkData: React.ChangeEvent<HTMLInputElement>;
  values: {
    attendeeId: string[];
  };
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<{
    attendeeId: string[];
  }>>;
  item: FetchAttendeeDetails;
};

export type ExistingAttendeeInitialValue = {
  attendeeId: string[];
};

export interface TrackCourseAttendee {
  modal: ModalProps;
  t: TFunction<'translation', undefined>;
  AttendeeAdd: () => void;
}

interface Company {
  id: number;
  uuid: string;
  userId: null;
  name: string;
  legalName: null;
  registrationNumber: string;
  slug: string;
  website: null;
  industry: null;
  description: string;
  size: null;
  logo: null;
  accountingEmails: { email: string; isPrimary: boolean }[];
  salesRepId: number;
  atecoCode: null;
  sdiCode: string;
  paymentTermId: number;
  vatNumber: string;
  isInvoice: boolean;
  address1: string;
  address2: null;
  city: null;
  country: string;
  state: string;
  zip: string;
  invoiceDate: null;
  parentTableId: null;
  addressProvince: string;
  vatType: number;
  vatPrimaryId: number;
  vatTypeId: number;
  language: string;
  createdBy: number;
  updatedBy: number;
  atecoId: null;
  codiceFiscale: string;
  fax: null;
  telephone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

interface ProfileCourseParticipate {
  id: number;
  jobTitle: string;
  description: null;
  companyId: number;
  slug: string;
  language: string;
  parentTableId: number;
  createdBy: number;
  updatedBy: number;
  deletedBy: null;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
}

export interface AttendeeListCourse {
  id: number;
  marked_as: string;
  mode: string;
  funded_by: string;
  code_id: number;
  academy_id: null;
  validity: number;
  is_template: boolean;
  is_external_certificate: boolean;
  start_date: string;
  end_date: string;
  has_exam: boolean;
  need_digital_attendance_sheet: boolean;
  founded: boolean;
  meeting_room_number: string;
  certificate_title: null;
  maximum_participate_allowed: number;
  price_in: string;
  old_db_course_id: null;
  notes: string;
  certificate_pdf_link: null;
  maximum_participation_attendance: number;
  max_attendee_applicable: boolean;
  course_template_id: number;
  certificate_template_id: null;
  survey_template_id: number;
  cloned_course_id: null;
  sub_category_id: null;
  created_by: number;
  updated_by: null;
  assigned_to: null;
  title: string;
  code: string;
  image: string;
  status: string;
  slug: string;
  description: string;
  reject_reason: string;
  price: number;
  duration: number;
  type: string;
  is_external: boolean;
  category_id: number;
  card_id: number;
  project_id: null;
  language: string;
  course_bundle_id: null;
  parent_table_id: number;
  validity_mail_sent_at: null;
  survey_qr: string;
  survey_url: string;
  progressive_number: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  courseCategory: {
    id: number;
    name: string;
    slug: string;
    language: string;
    parent_table_id: number;
    is_legislation_included: boolean;
    legislation_term: null;
    image: string;
    created_by: null;
    updated_by: null;
    created_at: string;
    updated_at: string;
    deleted_at: null;
  };
}

interface CourseAttendanceSheet {
  id: number;
  mark_as_start_signed_at: null;
  mark_as_end_signed_at: null;
  end_signature: null;
  start_signature: null;
  mark_as_end_signed: null;
  mark_as_start_signed: null;
  mark_as_absent: string;
  set_early_arrival: null;
  set_early_leave: null;
  lessonSession: {
    id: number;
    start_time: string;
    end_time: string;
    slug: string;
    language: string;
    course_id: number;
    lesson: {
      id: number;
      title: string;
      date: string;
    };
    courseAttendanceLog: [];
    course: {
      id: number;
      start_date: string;
      end_date: string;
    };
  };
}

export interface IAttendees {
  id: string;
  course_id: number;
  slug: string;
  code: string;
  external_certificate_pdf_link: null;
  job_title: string;
  assigned_to_status: string;
  first_name: string;
  attempts: number;
  last_name: string;
  email: string;
  mobile_number: string;
  recovered_from_course_id: null;
  recovered_participate_id: null;
  enrollment_number: string;
  created_by: string;
  updated_by: number;
  manager_id: number;
  company_id: number;
  is_certificate_issued: boolean;
  profile_id: number;
  progressive_number: string;
  language: string;
  parent_table_id: number;
  is_unknown: boolean;
  company_name: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  full_name: string;
  course_participate_count: number;
  signed_participate_count: number;
  company: Company;
  profileCourseParticipate: ProfileCourseParticipate;
  course: Course;
  courseAttendanceSheet: CourseAttendanceSheet[];
  is_recovered: null;
}
