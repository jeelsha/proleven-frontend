import { FormikErrors } from 'formik';
import { Attachment } from 'modules/EmailTemplate/types';

export type sendMailProps = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  data?: ISendMail | null;
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
  setData?: React.Dispatch<React.SetStateAction<ISendMail | null>>;
  refetch?: () => void;
};
export type roomProps = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  data: Record<string, string> | null;
  setData: React.Dispatch<React.SetStateAction<Record<string, string> | null>>;
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
  refetch?: () => void;
};

export type blurProps = {
  e: React.FocusEvent<HTMLInputElement, Element>;
  fieldName: string;
  setFieldValue: (
    field: string,
    value: string, // changed from 'any' to 'string' so need to check thoroughly
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<ISendMail>>;
};
export type ViewModalProps = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  data?: ISendMail;
  setData?: React.Dispatch<React.SetStateAction<ISendMail | null>>;
};

export type ISendMail = {
  id?: number;
  title?: string | null;
  subject?: string;
  description?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  slug?: string;
  created_by?: number;
  attachments?: Attachment[];
  status?: string;
};

export type initialSendMail = {
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  description: string;
  attachments: (string | undefined)[];
};
