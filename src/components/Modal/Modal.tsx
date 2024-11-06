import { useEffect } from 'react';
import { Footer } from './Layout/Footer';
import { Header } from './Layout/Header';
import { ModalProps } from './ModalPropTypes';

export const Modal = ({ ...props }: ModalProps) => {
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (props.closeOnOutsideClick) {
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (props?.closeOnEscape !== false && props?.modal.isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          props.modal.closeModal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Cleanup function to remove the event listener when the component unmounts
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  return (
    <>
      {props.modal.isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-100dvh pt-4 px-4 flex items-center justify-center z-3"
          // onClick={handleMaskClick}
        >
          {/* add onClick for close modal while click on outside of the modal */}
          <div className="fixed top-0 left-0 w-full h-100dvh bg-black opacity-50" />
          {/* add onClick for close modal while click on outside of the modal */}
          <div
            className={`modal-wrapper relative z-10 w-full  ${
              props.width ? props.width : ' max-w-[800px]'
            } mx-auto`}
            onClick={handleModalClick}
          >
            <div className="modal-inner bg-white rounded-xl">
              {props.headerSubText || props.headerTitle ? <Header {...props} /> : ''}
              <div
                className={`modal-body py-5 px-4 ${props.modalBodyClassName ?? ''}`}
              >
                <div
                  className={`max-h-[calc(100dvh_-_200px)] overflow-y-auto overflow-x-hidden p-1  ${
                    props.modalBodyInnerClassName ?? ''
                  }`}
                >
                  {props.children}
                </div>
              </div>
              {props.showFooter && <Footer {...props} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
