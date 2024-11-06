export interface IAcademy {
  id: number;
  name: string;
  address: string;
  slug?: string;
  language?: string;
  location?: string;
  address_map_link?: string | null;
  parent_table_id?: number;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
export type Modal = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export type AddEditAcademyProps = {
  modal: Modal;
  data?: IAcademy | null;
  setData?: React.Dispatch<React.SetStateAction<IAcademy | null>>;
  refetch?: () => void;
  isView?: boolean;
};
