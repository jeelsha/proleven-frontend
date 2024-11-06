import { ICounterData } from 'components/CounterModal/types';
import { Option } from 'components/FormElement/types';
import { CourseMarkAsEnum } from 'modules/Courses/Constants';
import { IAccess } from 'modules/Courses/pages/CourseViewDetail/types';
import {
  ICourseResource,
  ICourseTrainer,
  InitTemplateCourseType,
  SetFieldValue,
  TemplateCourseInitialValues,
} from 'modules/Courses/types';

interface Category {
  id: number;
  name: string;
}
export interface CourseTemplate {
  id: number;
  image: string;
  code: string;
  title: string;
  category_id: number;
  sub_category_id: number;
  slug: string;
  courseCategory: Category;
  courseSubCategory: Category;
}
export interface CourseBundle {
  id: number;
  course_template_id: number;
  slug: string;
  course_bundle_id: number;
  language: string;
  courseTemplate: CourseTemplate;
}

export interface Bundle {
  id: number;
  title: string;
  description: string;
  slug: string;
  course_bundle: CourseBundle[];
  created_by: number;
  access?: IAccess[];
}

export interface TemplateSubComponentProps {
  values: TemplateCourseInitialValues;
  setFieldValue?: SetFieldValue;
  formLanguage?: string;
  fieldsToTranslate: Array<string>;
  currentLanguage: string;
  defaultLanguage: string;
  isMainLoading?: boolean;
  setIsMainLoading?: (isLoading: boolean) => void;
  mainFormData?: TemplateCourseInitialValues;
  setMainFormData?: React.Dispatch<React.SetStateAction<InitTemplateCourseType>>;
  trainerList?: Option[];
  isUpdate?: boolean;
}

// **** Get CourseBundle Response
export interface SavedCourseBundle {
  id: number;
  title: string;
  slug: string;
  description: string;
  created_by: number;
  updated_by: number;
  start_date: string;
  end_date: string;
  academy_id: number;
  course_resources: CourseResource[];
  assigned_rooms: AssignedRoom[];
  lesson_session_approval: [];
  courses: CourseData[];
  optional_rooms: number[];
  main_rooms: number[];
  main_resources: ICounterData[];
  optional_resources: ICounterData[];
  main_trainers: Array<ICourseTrainer>;
  optional_trainers: Array<ICourseTrainer>;
  total_participate: number;
}
interface CourseResource {
  id: number;
  course_id: number;
  is_full_course: boolean;
  assigned_to_status: string;
  course_bundle_id: number;
  quantity: number;
  is_optional: boolean;
  assigned_to: number;
  lesson_id: number | null;
  resource_id: number;
  created_by: number;
  updated_by: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
interface AssignedRoom {
  id: number;
  course_id: number | null;
  course_bundle_id: number;
  room_id: number | null;
  assigned_to: number;
  is_optional: boolean;
  assigned_to_status: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CourseData {
  marked_as: CourseMarkAsEnum;
  id: number;
  code: string;
  title: string;
  type: string;
  course_template_id: number | null;
  slug: string;
  course_bundle_id: number;
  created_by: number;
  updated_by: number | null;
  language: string;
  image: string;
  lessons: Lesson[];
  total_participates: number;
  start_date: Date;
  end_date: Date;
  academy_id?: number;
}
interface Lesson {
  title: string;
  mode: string;
  place_address: string;
  location: string;
  conference_provider: string;
  lesson_sessions: LessonSession[];
  date: string;
  slug: string;
}
interface LessonSession {
  start_time: string;
  end_time: string;
  client_meeting_link: string | null;
  slug: string;
  assigned_to?: number;
}

// **** Add Edit CourseBundle Payload
export interface CourseBundleInterface {
  courses: CoursesSchema[];
  bundle: BundleSchema;
  other: OtherData;
}

export interface CourseBundleInterfaceData {
  courses: Course;
  bundle: BundleSchema;
  other: OtherData;
}
export interface CoursesSchema {
  course: Course;
  lesson: LessonSchema[];
}
interface Course {
  slug: string;
  start_date: string;
  end_date: string;
  academy?: AcademySchema;
}
interface LessonSchema {
  date: string;
  session: Session[];
  slug: string;
  location?: string;
}
interface AcademySchema {
  location: string;
}
interface Session {
  assigned_to?: number;
  slug: string;
  start_time?: string;
  end_time?: string;
}
export interface BundleSchema {
  id?: number;
  title?: string;
  slug?: string;
  start_date: string | null;
  end_date: string | null;
  academy_id: number | null;
}
interface OtherData {
  main_trainers: Array<ICourseTrainer>;
  optional_trainers: Array<ICourseTrainer>;
  main_resources: ICourseResource[];
  optional_resources: ICourseResource[];
  main_rooms: number[];
  optional_rooms: number[];
  isErrorInResource?: boolean;
  isErrorInRoom?: boolean;
  isErrorInTrainer?: boolean;
}

export interface CoursesFilter {
  courseCode: string[];
  category: string[];
  subCategory: string[];
}

export interface SurveyOptions {
  isMatch: boolean;
  label: string;
  value: number | string;
}
export interface ExpandableTableRowType {
  item: CourseData;
  index: number;
  status?: string;
  refetch?: () => Promise<void>;
  bundleSlug?: string | null;
  activeTab?: number;
  bundleId?: number;
  state?: { [key: string]: unknown };
}
