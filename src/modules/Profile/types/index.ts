import { IconTypes } from 'components/Icon/types';
import { ModalProps } from 'types/common';

export interface ConnectedUsersProps {
  role_name: string;
  token_provider: string;
  token_provider_mail: string;
  id: string;
}
export interface ConnectedDataProps {
  icon: IconTypes;
  label: string;
  provider: string;
}

export interface ChangePasswordProps {
  modal: ModalProps;
}

export interface ManagerCompany {
  company: {
    id: string;
    name: string;
    description?: string;
    address1?: string;
    address2?: string;
    ateco_code?: string;
    sdi_code?: string;
    is_invoice?: boolean;
    vat_number?: string;
    registration_number?: string;
    codice_fiscale:string;
    logo?: string;
    country?: string;
    city?: string;
    zip?: string;
  };
}
export interface ProfileCompanyDetailsValues {
  companyDetails?: ManagerCompany[];
  company_manager?: ManagerCompany[];
}

export interface UserDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
  manager?: { job_title: string };
  username?: string;
  profile_image?: string;
  role_id?: number;
}
