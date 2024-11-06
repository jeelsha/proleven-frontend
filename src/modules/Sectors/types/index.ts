import { ModalProps } from 'types/common';

export type AddEditSectorProps = {
  modal: ModalProps;
  data: ISector | null;
  setData: React.Dispatch<React.SetStateAction<ISector | null>>;
  refetch: () => void;
};

export interface ISector {
  code?: string;
  created_at: string | Date;
  description: string;
  id: number;
  letter: string;
  slug: string;
}
