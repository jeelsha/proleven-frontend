import Button from 'components/Button/Button';
import ErrorMessage from 'components/FormElement/ErrorMessage';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { useModal } from 'hooks/useModal';
import { CourseParticipant } from 'modules/Courses/pages/Attendance/types';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SignaturePad from 'react-signature-canvas';
import { SetFieldValue } from 'types/common';

type SignModalProps = {
  setSignatureEnd?: React.Dispatch<SetStateAction<File | null>>;
  setSignatureBegin?: React.Dispatch<SetStateAction<File | null>>;
  signImage?: string;
  title?: string;
  isEdit?: boolean;
  error?: string;
  name?: string;
  setFieldValue?: SetFieldValue;
  OnSubmit?: (
    data: CourseParticipant,
    signature: File | null,
    type: 'begin' | 'end'
  ) => void;
  data?: CourseParticipant;
  type?: 'begin' | 'end';
};

const SignatureCanvas = ({
  setSignatureBegin,
  setSignatureEnd,
  signImage,
  title,
  isEdit = true,
  error,
  name,
  OnSubmit,
  setFieldValue,
  data,
  type,
}: SignModalProps) => {
  const modal = useModal();
  const { t } = useTranslation();
  const sigPad = useRef<SignaturePad | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [orientationChangeTimeout, setOrientationChangeTimeout] = useState<
    number | null
  >(null);

  // Save signature when drawing ends
  const handleEnd = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
      setSavedSignature(signatureData); // Store the signature in the state
    }
  };

  // Restore the signature from the state
  const restoreSignature = () => {
    if (savedSignature && sigPad.current) {
      sigPad.current.clear(); // Clear the pad before restoring
      sigPad.current.fromDataURL(savedSignature); // Restore saved signature
    }
  };

  // Debounced handler for orientation changes
  const handleOrientationChange = () => {
    if (orientationChangeTimeout) {
      clearTimeout(orientationChangeTimeout);
    }
    const timeoutId = window.setTimeout(() => {
      if (savedSignature) {
        restoreSignature(); // Restore the signature after orientation change
      }
    }, 300); // Adjust delay as needed
    setOrientationChangeTimeout(timeoutId);
  };

  useEffect(() => {
    const addEventListeners = () => {
      if (window.screen.orientation) {
        window.screen.orientation.addEventListener(
          'change',
          handleOrientationChange
        );
      } else {
        window.addEventListener('resize', handleOrientationChange);
      }
    };

    const removeEventListeners = () => {
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener(
          'change',
          handleOrientationChange
        );
      } else {
        window.removeEventListener('resize', handleOrientationChange);
      }
    };

    addEventListeners();
    return removeEventListeners;
  }, [savedSignature]);

  const clear = () => {
    sigPad.current?.clear();
    setSavedSignature(null); // Clear the saved signature as well
  };

  const trim = () => {
    if (sigPad.current) {
      const trimmedData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
      const isEmpty = sigPad.current.isEmpty();
      if (!isEmpty) {
        dataURLtoFile(trimmedData, 'image');
        modal.closeModal();
      }
    }
  };

  const dataURLtoFile = (dataUrl: string | null, filename: string) => {
    if (dataUrl) {
      const arr = dataUrl.split(',');
      const mimeMatch = /:(.*?);/.exec(arr[0]);
      if (mimeMatch) {
        const mime = mimeMatch[1];
        const bstr = atob(arr[arr.length - 1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const filepath = new File([u8arr], filename, { type: mime });
        const blob = new Blob([filepath], { type: filepath.type });
        const url = URL.createObjectURL(blob);
        setSignatureImage?.(url);
        setSignatureBegin?.(filepath);
        setSignatureEnd?.(filepath);
        if (data) OnSubmit?.(data, filepath, type === 'begin' ? 'begin' : 'end');

        return filepath;
      }
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <div className="flex">
          <p className="text-sm text-dark opacity-50 mb-2">{title}</p>
          {name && <span className="text-red-700">*</span>}
        </div>
        {error && <ErrorMessage name={name as string} />}
        <div className="h-[200px] flex items-center justify-center bg-siteBG border border-solid border-authBG rounded-lg">
          <Image
            imgClassName="w-full h-full object-contain"
            src={signImage ?? signatureImage ?? undefined}
            serverPath={!signatureImage || !!signImage}
          />

          {!signatureImage && !signImage && isEdit && (
            <Button
              onClickHandler={() => modal.openModal()}
              className="text-sm uppercase text-navText/50"
            >
              {isEdit ? t('AttendanceSheet.open') : 'Pending'}
            </Button>
          )}
        </div>
        {!signImage && isEdit && !type && (
          <Button
            className="inline-block text-danger cursor-pointer text-sm mt-2"
            onClickHandler={() => {
              setSignatureImage('');
              if (setFieldValue && name) {
                setFieldValue(name, '');
              }
            }}
          >
            {t('AttendanceSheet.clear')}
          </Button>
        )}
      </div>
      {modal.isOpen && (
        <Modal
          headerTitle={t('AttendanceSheet.Sign')}
          modal={modal}
          width="!max-w-[400px]"
        >
          <>
            <SignaturePad
              canvasProps={{
                className:
                  'w-full h-[250px] border border-solid border-gray-200 rounded-md',
              }}
              ref={sigPad}
              onEnd={handleEnd}
            />
            <div className="flex justify-end mt-3 gap-2">
              <Button
                className="flex-[1_0_0%]"
                variants="grayLight"
                onClickHandler={() => clear()}
              >
                {t('AttendanceSheet.clear')}
              </Button>
              <Button
                className="flex-[1_0_0%]"
                variants="primary"
                onClickHandler={() => trim()}
              >
                {t('Button.submit')}
              </Button>
            </div>
          </>
        </Modal>
      )}
    </>
  );
};

export default SignatureCanvas;
