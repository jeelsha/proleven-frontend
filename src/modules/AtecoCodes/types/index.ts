import { ModalProps } from 'types/common';

export type AddEditCodeProps = {
  modal: ModalProps;
  data: AtecoCode | null;
  setData: React.Dispatch<React.SetStateAction<AtecoCode | null>>;
  refetch: () => void;
};

export type AtecoCode = {
  id?: number;
  name: string;
  description?: string;
  ateco_letter?: string;
  risk?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  created_by?: number;
  slug?: string;
};
