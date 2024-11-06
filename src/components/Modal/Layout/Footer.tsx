import Button from 'components/Button/Button';
import { ModalProps } from '../ModalPropTypes';

export const Footer = ({ ...props }: ModalProps) => {
  if (props.customFooter) {
    return props.customFooter;
  }

  return (
    <div className="modal-footer py-3 border-t px-5">
      <div className="flex items-center justify-end gap-x-4">
        {props.footerButtonTitle && (
          <Button
            variants="whiteBordered"
            className="min-w-[140px]"
            disabled={props.isButtonDisable ?? false}
            onClickHandler={() => {
              if (props.cancelClick) {
                props.cancelClick();
              } else {
                props.modal.closeModal();
                props.setDataClear?.(null);
              }
            }}
          >
            {props.footerButtonTitle}
          </Button>
        )}

        <Button
          onClickHandler={() => props?.footerSubmit?.()}
          type="submit"
          variants="primary"
          className={`min-w-[140px] ${props?.isSubmitLoading ? 'disabled:opacity-50 pointer-events-none' : ''
            }`}
          isLoading={props?.isSubmitLoading ?? props.isButtonLoader ?? false}
          disabled={props?.isSubmitLoading ?? props.isButtonLoader ?? false}
        >
          {props?.footerSubmitButtonTitle ?? props.headerTitle}
        </Button>
      </div>
    </div>
  );
};
