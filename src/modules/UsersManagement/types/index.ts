import { FormikErrors } from 'formik';
import { TFunction } from 'i18next';
import { ManagerCompany } from 'modules/Profile/types';
import { Dispatch, SetStateAction } from 'react';
import { FilterStatus, ModalProps, RoleFields, StatusFields } from 'types/common';
import { FilterObject } from 'utils';

export interface Role {
  id: number;
  name: string;
}
export interface Trainer {
  hourly_rate: string;
  travel_reimbursement_fee?: string;
  rate_by_admin: string;
  location: string;
  longitude?: string | number;
  latitude?: string | number;
  trainerAttachment?: { attachment_url: string }[];
  trainerSubCategory?: TrainerSubCategory[];
  reimbursement_threshold: string;
  codice_fiscale?: string;
  vat_number?: string;
  sub_categories?: number[];
}

interface TrainerSubCategory {
  id: number;
  trainer_id: number;
  sub_category_id: number;
  parent_table_id: number | null;
  language: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sub_category: SubCategory;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  language: string;
  survey_template_id: number;
  parent_table_id: number | null;
  image: string | null;
  category_id: number;
  category: Category;
  legislation_term: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  reimbursement_threshold: number;
}
interface Category {
  name: string;
  slug: string;
}
export interface User {
  is_head: boolean;
  id: number;
  full_name: string;
  email: string;
  first_name: string;
  last_name: string;
  role_name?: string;
  username?: string;
  contact: string;
  profile_image?: string;
  active: string;
  verified: boolean;
  role: Role;
  role_id: number;
  trainer?: Trainer;
  trainer_attachment?: string | File | (string | File)[] | null;
}

export interface IGetUsers {
  count: number;
  currentPage: number;
  data: User[];
  lastPage: number;
  limit: number;
}

export interface SelectType {
  value: number;
  label: string;
}

export type AddEditUserProps = {
  modal: Modal;
  data: User | null;
  setData: React.Dispatch<React.SetStateAction<User | null>>;
  role?: RoleFields;
  refetch: () => void;
};
export type formDataProps = {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
  role?: string;
  active?: string;
  trainer?: {};
  trainer_attachment?: [];
  manager?: {};
  company_data?: ManagerCompany[];
};

export type Modal = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export type RoleFilterProps = {
  roleFilter: RoleFields[];
  setRoleFilter: React.Dispatch<React.SetStateAction<RoleFields[]>>;
  setActiveRoles: React.Dispatch<React.SetStateAction<string>>;
};
export type StatusFilterProps = {
  title?: string;
  statusFilter: StatusFields[];
  setStatusFilter: React.Dispatch<React.SetStateAction<StatusFields[]>>;
  //   setActiveRoles: React.Dispatch<React.SetStateAction<string>>;
};
export type FilterCategory = {
  name: string;
  id: number;
  label: string;
  value: string;
}[];
export interface TrainerFilterTypes {
  category: string[];
  subCategory: string[];
}
export interface TrainerTemplateFilter {
  setFilterApply?: React.Dispatch<React.SetStateAction<TrainerFilterTypes>>;
  courseFilter: TrainerFilterTypes;
  filterApply?: FilterObject;
  setCourseFilter: React.Dispatch<React.SetStateAction<TrainerFilterTypes>>;
  values?: TrainerFilterTypes;
  setFieldValue?: (
    field: string,
    value: (number | string)[],
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<TrainerFilterTypes>>;
}

export type CourseFilterProps = {
  componentType: string;
  courseFilter: FilterStatus;
  filterApply?: FilterStatus;
  setCourseFilter: React.Dispatch<React.SetStateAction<FilterStatus>>;
  setFilterModal?: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterApply: React.Dispatch<React.SetStateAction<FilterStatus>>;
  courseStatus?: string;
  memberId?: number;
};

export interface DescriptionDisplayProps {
  descriptionNotes: {
    slug: string;
    id: number;
    createUser: { full_name?: string; profile_image?: string };
    notes: string;
    created_at: string;
    created_by: string;
  }[];
  CurrentUser?: User | null;
  className?: string;
  moreButtonClass?: string;
  t: TFunction<'translation', undefined>;
  storeLang: string;
  deleteModal: ModalProps;
  setNoteSlug: Dispatch<SetStateAction<string | undefined>>;
}

export interface DescriptionDetailsProps {
  user: User | null;
  t: TFunction<'translation', undefined>;
}
