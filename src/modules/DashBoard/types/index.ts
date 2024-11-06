import { ColorVariant } from 'components/DashboardCard';
import { IconTypes } from 'components/Icon/types';

export interface CourseDetails {
  image: string;
  title: string;
  courseCategory: {
    name: string;
  };
  start_date?: string | number | Date;
  end_date?: string | number | Date;
  price?: number;
  mode?: string;
  lessons?: {
    location?: string;
  }[];
  academy?: {
    title?: string;
    location?: string;
  };
  id?: string | number;
  slug: string;
  status: string;
}

export interface TilesProps {
  title: string;
  counts?: string;
  colorVariant: ColorVariant;
  iconName: IconTypes;
  rating?: JSX.Element;
  url?: string;
  cardTitle?: string;
}

export interface Courses {
  courseName?: string;
  numberOfLessons?: string;
  level?: string;
  iconName?: IconTypes;
  colorCombo?: string;
  type?: string;
}
export interface DashboardCourse {
  id: number;
  title: string;
  course_category: string;
  total_lessons: number;
  image: string;
  slug: string;
  template_title: string;
  status?: string;
}

export interface IDashboard {
  training_specialist: number;
  trainer: number;
  courses: number;
  users: number;
  popular_courses: DashboardCourse[];
  total_participants_top_five: number;
}

export type ICompanyManagerDashboard = {
  total_course: number;
  total_attendees: number;
  active_courses: number;
};

export type IPrivateIndividualDashboard = {
  total_academy_course: number;
  total_trainer: number;
  total_enrolled_course: number;
  total_user: number;
};

export type IBarChatProps = {
  startDate: Date;
  endDate: Date;
  selectedVal?: string | number;
  customPicker?: boolean;
};

export type ITrainerFeesData = {
  courses: {
    title: string;
    image: string;
    courseCategory: { name: string };
    slug: string;
    status: string;
    type: string;
    id: string;
    card?: { card_members?: TrainingSpecialist[] };
  };
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
};

interface AssignedToUser {
  first_name: string;
  last_name: string;
  profit?: number;
}

export type IDashboardCustomCardData = {
  title: string;
  count: string;
  category: string;
  image?: string;
  training_specialist?: string;
  trainer_name?: string;
  training_specialist_name?: string[];
  type?: string;
  slug: string;
  companies?: Company[];
  quotes?: Quote[];
  pipeline_date?: string;
  quote_number?: string[];
  revenue?: string;
  status: string;
  course_type: string;
  course_id: string;
};

export type ICertificates = {
  course: string;
  course_slug: string;
  company: Company[];
  course_category: string;
  days: string;
  image: string;
  quotes: Quote[];
  pipeline_date?: string;
  quote_number?: string[];
  revenue?: string;
  status?: string;
  training_specialist?: string;
};

interface Company {
  id: number;
  slug: string;
  name: string;
}

interface Quote {
  id: number;
  slug: string;
  quote_number: string;
}

interface TrainingSpecialist {
  member: {
    full_name: string;
    first_name: string;
    last_name: string;
    role: {
      name: string;
    };
  };
}
