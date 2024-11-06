import Button from 'components/Button/Button';
import { ButtonProps } from 'components/Button/type';
import InfoIcon from 'components/Icon/assets/InfoIcon';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { Link } from 'react-router-dom';

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
    | 'reTest'
    | 'whiteBordered';
  confirmButtonVariant?: ButtonProps['variants'];
  bodyText?: string;
  linkText?: string;
  navigateTo?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonFunction?: () => Promise<void> | void;
  cancelButtonFunction?: () => void;
  deleteTitle?: string;
  showCloseIcon?: boolean;
  isLoading?: boolean;
  popUpType?:
    | 'success'
    | 'reject'
    | 'warning'
    | 'primary'
    | 'primaryWarning'
    | 'reTest';
  optionalComponent?: () => JSX.Element;
};

const PopupBody = ({ popUpType, ...rest }: Omit<PopUpProps, 'modal'>) => {
  let renderIcon;
  switch (popUpType) {
    case 'success':
      renderIcon = (
        <div className="mb-5 w-20 h-20 bg-green2/20 mx-auto rounded-full flex items-center justify-center text-green2">
          <Image iconClassName="w-ful h-full" iconName="checkRoundIcon2" />
        </div>
      );
      break;
    case 'warning':
      renderIcon = (
        <div className="bg-[#FFB80033]  mb-5 w-20 h-20 rounded-full p-6 mx-auto  flex justify-center items-center">
          <Button className="inline-flex gap-1 items-center justify-center w-[24px] h-[24px] rounded-full border border-solid text-orange2 bg-orange2/20 border-orange2/30">
            <Image iconName="exclamationMarkIcon" iconClassName="w-full h-full" />
          </Button>
        </div>
      );
      break;
    case 'primary':
      renderIcon = (
        <div className="w-20 h-20 bg-primary/20 mx-auto rounded-full flex items-center justify-center text-primary">
          <Image iconClassName="w-ful h-full" iconName="fileIcon" />
        </div>
      );
      break;
    case 'reTest':
      renderIcon = (
        <div className="w-20 h-20  bg-green2 mx-auto rounded-full mb-4 flex items-center justify-center text-white">
          <Image iconClassName="w-ful h-full" iconName="refreshIcon" />
        </div>
      );
      break;
    case 'primaryWarning':
      renderIcon = (
        <div className="w-20 h-20 bg-primary/20 mx-auto rounded-full flex items-center justify-center text-primary">
          <Image iconClassName="w-ful h-full" iconName="exclamationWarning" />
        </div>
      );
      break;
    default:
      renderIcon = (
        <div className="mb-5 w-20 h-20 rounded-full p-6 mx-auto bg-danger/10 text-danger flex justify-center items-center">
          <InfoIcon className="w-full h-full" />
        </div>
      );
  }

  function getButtonVariant(popUpType: string) {
    if (popUpType === 'reject') {
      return 'danger';
    }
    if (popUpType === 'warning') {
      return 'orange';
    }
    if (popUpType === 'primary') {
      return 'primary';
    }
    return 'green';
  }

  return (
    <>
      <div className="text-center">
        <div className="flex justify-end">
          {rest.showCloseIcon && (
            <Button
              className="w-4 h-4 cursor-pointer active:scale-90 select-none"
              onClickHandler={rest.cancelButtonFunction}
            >
              <Image iconName="crossIcon" iconClassName="w-full h-full" />
            </Button>
          )}
        </div>
        {renderIcon}
        <p className="text-lg font-semibold leading-7 text-center">
          {rest.deleteTitle}
        </p>
        {rest.bodyText && (
          <>
            <span
              className="text-sm leading-5 text-grayText mt-2"
              dangerouslySetInnerHTML={{ __html: rest.bodyText }}
            />
            {rest.linkText && (
              <Link
                className="cursor-pointer "
                to={rest.navigateTo ?? ''}
                target="_blank"
              >
                &nbsp;
                <span className="text-primary/80 text-sm hover:underline">
                  {rest.linkText}
                </span>
              </Link>
            )}
          </>
        )}

        {rest?.optionalComponent !== undefined ? rest?.optionalComponent() : ''}
        <div className="flex items-center justify-end gap-x-4 mt-8">
          {rest.cancelButtonText && (
            <Button
              className="w-full justify-center"
              onClickHandler={rest.cancelButtonFunction}
              variants="whiteBordered"
            >
              {rest.cancelButtonText}
            </Button>
          )}
          {rest.confirmButtonText && (
            <Button
              className="w-full justify-center"
              onClickHandler={rest.confirmButtonFunction}
              variants={getButtonVariant(popUpType as string)}
              isLoading={rest.isLoading}
            >
              {rest.confirmButtonText}
            </Button>
          )}
        </div>
      </div>
      <p className="hidden">{rest.bodyText}</p>
    </>
  );
};

export const ConfirmationPopup = ({
  modal,
  popUpType = 'reject',
  ...rest
}: PopUpProps) => {
  return (
    <Modal modal={modal} closeOnOutsideClick width="!max-w-[400px]">
      <PopupBody popUpType={popUpType} {...rest} />
    </Modal>
  );
};
