import { IconTypes } from 'components/Icon/types';
import { FormikValues } from 'formik';

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  option?: object;
  role?: string;
}

export type RoleFields = {
  id?: number;
  key: string;
  title: string;
  isChecked: boolean;
};

export type StatusFields = {
  id?: number;
  key: string;
  title: string;
  isChecked: boolean;
};

export enum TokenProvider {
  ZOOM = 'zoom',
  GOOGLE_AUTH = 'google_auth',
  GOOGLE_CALENDAR = 'google_calendar',
  MICROSOFT_CALENDAR = 'microsoft_calendar',
  icalendar = 'icalendar',
}

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
}

export type FilterStatus = {
  courseType?: string[];
  fundedBy?: string[];
  courseCode?: string[];
  courseStatus?: string[];
  courseCategory?: string[];
  courseSubCategory?: string[];
  companies?: string[];
  trainingSpecialist?: string[];
  filterDate?: {
    startDate: string | Date;
    endDate: string | Date;
  };
  payment_mode?: string;
};

export type SetFieldValue = <
  K extends keyof FormikValues,
  V extends FormikValues[K]
>(
  field: string,
  value: V,
  shouldValidate?: boolean
) => void;

export type Role =
  | 'Admin'
  | 'TrainingSpecialist'
  | 'Trainer'
  | 'Company'
  | 'CompanyManager'
  | 'SalesRep'
  | 'Accounting'
  | 'PrivateIndividual';

export interface TabProps {
  uniqueKey: string;
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
}
