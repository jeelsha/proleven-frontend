import { TFunction } from 'i18next';

export interface RevenueData {
  month: string;
  trainer_expense: string;
  revenue: string;
  expense: string;
}

export interface TransactionData {
  month: string;
  paid: string;
  unpaid: string;
  net_revenue: number;
}

export interface CourseData {
  academyCoursesPercentage: string;
  academyRevenue: string;
  privateCourseRevenue: string;
  privateCoursesPercentage: string;
  bundleCoursesPercentage: string;
}

export interface ReportsProps {
  t: TFunction<'translation', undefined>;
  filterData?: FilterDataProps;
  className?: string;
}

export interface FilterDataProps {
  startDate: string;
  endDate: string;
}

export interface OverviewData {
  assigned: number;
  total: number;
}

export interface ResponseData {
  [key: string]: {
    data: OverviewData;
  };
}

export interface RevenueFilterProps {
  code_id: string[];
  category_id: string[];
}

export interface RevenueModalProps {
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
}

export interface SellRepsData {
  full_name: string;
  id: number;
}

export interface TrainingSpecialistProps {
  type: string;
}

export enum CourseTypeEnum {
  private = 'Private',
  academy = 'Academy',
}

export interface ProductFilterType {
  id: string;
  code?: string;
  courses?: FilterCourseType[];
  name?: string;
}

export interface FilterCourseType {
  id: number;
}
