import Button from 'components/Button/Button';
import { ButtonProps } from 'components/Button/type';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';

type PopUpProps = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  variants?:
    | 'primary'
    | 'secondary'
    | 'primaryBordered'
    | 'secondaryBordered'
    | 'whiteBordered';
  confirmButtonVariant?: ButtonProps['variants'];
  bodyText: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonFunction?: () => void;
  cancelButtonFunction?: () => void;
  deleteTitle?: string;
};

const PopupBody = ({ ...rest }) => {
  return (
    <>
      <div className="text-center">
        <div className="w-20 h-20 bg-green2/20 mx-auto rounded-full flex items-center justify-center text-green2">
          <Image iconClassName="w-ful h-full" iconName="checkRoundIcon2" />
        </div>
        <p className="text-sm leading-5 text-grayText mt-2">{rest.bodyText}</p>
        <div className="flex items-center justify-end gap-x-4 mt-8">
          <Button
            className="w-full justify-center"
            onClickHandler={rest.confirmButtonFunction}
            variants="green"
          >
            {rest.confirmButtonText}
          </Button>
        </div>
      </div>
      <p className="hidden">{rest.bodyText}</p>
    </>
  );
};

export const SuccessPopup = ({ modal, ...rest }: PopUpProps) => {
  return (
    <Modal modal={modal} closeOnOutsideClick width="!max-w-[400px]">
      <PopupBody {...rest} />
    </Modal>
  );
};
