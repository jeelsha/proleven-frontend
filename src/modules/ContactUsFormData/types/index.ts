import { ModalProps } from 'types/common';

export interface IContactUs {
  full_name: string;
  contact_name: string;
  contact_agency: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  contact_message: string;
}

export interface ViewContactUsProps {
  modal: ModalProps;
  data?: IContactUs | null;
  setData?: React.Dispatch<React.SetStateAction<IContactUs | null>>;
}
