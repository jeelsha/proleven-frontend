import { Option } from 'components/FormElement/types';
import { ManagerCompany } from 'modules/Profile/types';
import { SetFieldValue } from 'types/common';

export interface TrainerInfo {
  location?: string;
  latitude?: string;
  longitude?: string;
  hourly_rate?: string;
  travel_reimbursement_fee?: string;
  reimbursement_threshold?: number;
  rate_by_admin?: string;
  sub_categories?: number[] | string[];
  codice_fiscale?: string;
  vat_number?: string;
}

export interface InitialValues {
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  profile_image: string;
  role?: number;
  profile: boolean;
  trainer?: TrainerInfo;
  trainer_attachment?: string | File | (string | File)[] | null;
  manager?: { job_title: string };
  company_data?: ManagerCompany[];
}

export type AdminViewProfileProps = {
  values: InitialValues;
  setFieldValue: SetFieldValue;
  isLoading: boolean;
};

export type CompanyManagerViewProfileProps = {
  values: InitialValues;
  setFieldValue: SetFieldValue;
  isLoading: boolean;
  company_data: InitialValues['company_data'];
};

export type TrainerViewProfileProps = {
  values: InitialValues;
  setFieldValue: SetFieldValue;
  isLoading: boolean;
  categories: Option[];
  setLatLng?: React.Dispatch<
    React.SetStateAction<{
      lat: number;
      lng: number;
    }>
  >;
};
