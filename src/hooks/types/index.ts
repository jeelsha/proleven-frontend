// Modal Type
export type UserModalType = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  modalData?: unknown;
  openModalWithData?: (data: unknown) => void;
};

export type IGetScreenType = {
  userAgent: string;
  device: 'ios' | 'android' | '';
};
