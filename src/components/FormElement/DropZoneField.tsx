import { ChangeEvent, DragEvent, useRef } from 'react';
import { useDispatch } from 'react-redux';

// ** redux **
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** style **
import './style/dropzone.css';

// ** components **
import ErrorMessage from './ErrorMessage';

// ** type **
import { fileInputEnum, IInputFileField } from './types';

// ** const **
import { useTranslation } from 'react-i18next';
import { customRandomNumberGenerator } from 'utils';
import FileUploadVariants from './FileUploadVariants';

const DropZone = ({
  SubTitle,
  setValue,
  variant = fileInputEnum.FileInput,
  name,
  value,
  acceptTypes = '*/*',
  size,
  fileType,
  label,
  id,
  isCompulsory,
  parentClass,
  isMulti,
  Title,
  limit = 5,
  labelClass,
  fileInputIcon,
  isLoading = false,
  isSendMail = false,
  selectedFileIcon,
  isDisabled,
}: IInputFileField) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement> | DragEvent) => {
    const droppedFiles =
      'dataTransfer' in event
        ? event.dataTransfer?.files
        : (event.target as HTMLInputElement).files;
    if (droppedFiles) {
      if (isMulti) {
        if (droppedFiles.length <= limit) {
          const media = Array.from(droppedFiles);
          if (media.length + (value as Array<File>).length <= limit) {
            setValue(name, [...(value as Array<File>), ...media]);
          } else {
            const random = customRandomNumberGenerator();
            dispatch(
              setToast({
                variant: 'Error',
                message: `${t('ToastMessage.notUploadMoreFileText')} ${limit} ${t(
                  'ToastMessage.items'
                )}`,
                type: 'error',
                id: random,
              })
            );
          }
        } else {
          const random = customRandomNumberGenerator();
          dispatch(
            setToast({
              variant: 'Error',
              message: `${t('ToastMessage.notUploadMoreFileText')} ${limit} ${t(
                'ToastMessage.items'
              )}`,
              type: 'error',
              id: random,
            })
          );
        }
      } else {
        // For single file selection
        setValue(name, droppedFiles[0]);
      }
    }

    if (event.preventDefault) {
      event.preventDefault();
    }
  };

  return (
    <>
      <div
        className={`w-full ${parentClass ?? ''}`}
        id="drop-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e: DragEvent) => {
          if (!isDisabled) handleFileChange(e);
        }}
      >
        {isLoading ? (
          <div
            className={`lazy ${
              variant === fileInputEnum.FileInput ? 'h-[120px]' : ''
            }
              ${variant === fileInputEnum.FileInputXLS ? 'h-[220px]' : ''}
              ${variant === fileInputEnum.LinkFileInput ? 'h-[50px]' : ''}
            }`}
          />
        ) : (
          <div>
            {label && (
              <label
                className={`text-sm text-black leading-4 inline-block mb-1.5 ${
                  labelClass ?? ''
                }`}
                htmlFor={name}
              >
                {label}
                {isCompulsory && <span className="text-red-700">*</span>}
              </label>
            )}
            <input
              id={id}
              type="file"
              style={{ display: 'none' }}
              ref={inputRef}
              accept={acceptTypes}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (!isDisabled) handleFileChange(event);
              }}
              multiple={isMulti}
              disabled={isDisabled}
            />
            {FileUploadVariants(variant, {
              isMulti,
              limit,
              value: value as File | string,
              setValue,
              name,
              Ref: inputRef,
              size,
              fileType,
              fileInputIcon,
              SubTitle,
              Title,
              isSendMail,
              selectedFileIcon,
              isDisabled,
            })}
          </div>
        )}
      </div>
      <ErrorMessage name={name} />
    </>
  );
};

export default DropZone;
