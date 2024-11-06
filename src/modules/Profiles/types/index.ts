import { ModalProps } from 'types/common';

export interface IProfile {
  id: number;
  job_title: string;
  description: string;
  company_id?: number | null;
  slug: string;
  language: string;
  parent_table_id?: number;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type AddEditProfileProps = {
  modal: ModalProps;
  data: IProfile | null;
  setData: React.Dispatch<React.SetStateAction<IProfile | null>>;
  refetch: () => void;
};
