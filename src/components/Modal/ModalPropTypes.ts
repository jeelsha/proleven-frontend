export interface ModalProps {
  modal: {
    isOpen: boolean;
    closeModal: () => void;
  };
  showHeader?: boolean;
  footerSubmit?: () => void;
  showFooter?: boolean;
  headerTitle?: string;
  headerSubText?: string;
  subHeaderComponent?: React.ReactElement;
  footerButtonTitle?: string;
  footerSubmitButtonTitle?: string;
  children: React.ReactElement;
  headerExtra?: React.ReactElement;
  customHeader?: React.ReactElement;
  customFooter?: React.ReactElement;
  maskClassName?: string;
  modalClassName?: string;
  modalBodyClassName?: string;
  modalBodyInnerClassName?: string;
  closeOnOutsideClick?: boolean;
  showCloseIcon?: boolean;
  hideCloseIcon?: boolean;
  closeOnEscape?: boolean;
  width?: string;
  setDataClear?: React.Dispatch<React.SetStateAction<any>> | null;
  isSubmitLoading?: boolean;
  cancelClick?: () => void;
  isTitleEditable?: boolean;
  handleUpdate?: () => Promise<void>;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  value?: string;
  isButtonDisable?: boolean;
  isButtonLoader?: boolean;
}
