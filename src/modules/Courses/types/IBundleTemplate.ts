import { FormikErrors } from 'formik';
import { CoursesFilter } from './TemplateBundle';
import { FilterObject } from 'utils';

interface Lesson {
  slug: string;
  title: string;
  mode: string;
  place_address: string;
  conference_provider: string | null;
  date: string;
  lesson_sessions: LessonSession[];
}

interface LessonSession {
  start_time: string;
  end_time: string;
  client_meeting_link: string | null;
  slug: string;
  assigned_to: number | null;
}

interface LessonApproval {
  assigned_to_status: string;
  assignedToUser: string;
  id: number;
  profile_image: string;
  is_full_course: boolean;
  is_optional: boolean;
  resources: string;
  room: string;
}

interface Trainer {
  assigned_to_status: string;
  assignedToUser: string;
  id: number;
  profile_image: string;
  is_full_course: boolean;
  is_optional: boolean;
  resources: string;
}

export interface BundleCourse {
  id: number;
  marked_as: string;
  funded_by: string;
  code_id: number;
  academy_id: number | null;
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
  notes: string;
  certificate_pdf_link: string;
  maximum_participation_attendance: number;
  course_template_id: number | null;
  survey_template_id: number | null;
  cloned_course_id: number;
  sub_category_id: number;
  created_by: number;
  assigned_to: number | string;
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
  category_id: number;
  card_id: number;
  project_id: number | null;
  language: string;
  course_bundle_id: number;
  parent_table_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lessons: Lesson[];
  lessonApproval: LessonApproval[];
  main_trainers: Trainer[];
  optional_trainers: Trainer[];
}
export interface CourseTamplateFilter {
  setFilterApply?: React.Dispatch<React.SetStateAction<CoursesFilter>>;
  courseFilter: CoursesFilter;
  filterApply?: FilterObject;
  setCourseFilter: React.Dispatch<React.SetStateAction<CoursesFilter>>;
  values?: CoursesFilter;
  setFieldValue?: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<CoursesFilter>>;
}
