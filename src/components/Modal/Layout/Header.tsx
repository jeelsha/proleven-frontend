import Button from 'components/Button/Button';
import Image from 'components/Image';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalProps } from '../ModalPropTypes';

export const Header = ({ ...props }: ModalProps) => {
  const { t } = useTranslation();
  if (props.customHeader) {
    return props.customHeader;
  }

  const [isEditing, setIsEditing] = useState<boolean | null>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleIsEditing = () => {
    setIsEditing(null);
    props?.setValue?.(props.headerTitle ?? '');
  };

  const handleIsEditing = (e: MouseEvent) => {
    const targetNode = e.target as HTMLElement;
    if (
      targetNode?.nodeName === 'INPUT' ||
      targetNode?.nodeName === 'BUTTON' ||
      targetNode?.nodeName === 'svg'
    )
      return;

    setIsEditing(null);
    props?.setValue?.(props.headerTitle ?? '');
  };

  useEffect(() => {
    if (inputRef) inputRef.current?.select();
    if (isEditing) document.addEventListener('mousedown', handleIsEditing);
    return () => document.removeEventListener('mousedown', handleIsEditing);
  }, [isEditing]);

  return (
    <div className="modal-header py-4 px-4 border-b border-solid border-gray-200">
      <div className="flex items-start justify-between gap-1">
        <div className="">
          {!isEditing ? (
            <div className="flex flex-row gap-2">
              <h4 className="text-xl font-semibold tracking-wide">
                {props.headerTitle}
              </h4>

              {props?.isTitleEditable ? (
                <div className="mt-1.5 mx-3">
                  <Button
                    className="action-button primary-btn !bg-transparent w-4 h-4 !p-0 "
                    onClickHandler={() => {
                      props?.setValue?.(props.headerTitle ?? '');
                      setIsEditing(!isEditing);
                    }}
                    tooltipText={t('Tooltip.Edit')}
                  >
                    <Image
                      iconClassName="w-5 h-5 !text-primary"
                      iconName="editpen2"
                    />
                  </Button>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            <div className="flex">
              <input
                ref={inputRef}
                className="text-xl font-semibold text-dark truncate"
                type="text"
                value={props.value}
                onChange={(e) => props?.setValue?.(e.currentTarget.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    await props?.handleUpdate?.();
                    setIsEditing(null);
                  }
                  if (e.key === 'Escape') toggleIsEditing();
                }}
                // onBlur={toggleIsEditing}
                autoComplete="off"
              />
              <div className="mt-1.5 mx-3">
                <Button
                  className="w-4 h-4 !p-0 "
                  onClickHandler={async () => {
                    await props?.handleUpdate?.();
                    setIsEditing(null);
                  }}
                >
                  <Image
                    iconName="checkIcon"
                    iconClassName="w-4 h-4 !text-primary"
                  />
                </Button>
              </div>
            </div>
          )}
          {props.headerSubText && (
            <span className="inline-block text-xs text-grayText mt-1">
              {props.headerSubText}
            </span>
          )}
          {props.subHeaderComponent ? props.subHeaderComponent : ''}
        </div>
        {props.headerExtra ? props.headerExtra : ''}

        {props.hideCloseIcon ? (
          ''
        ) : (
          <Button
            className="w-4 h-4 mt-[4px] cursor-pointer active:scale-90 select-none shrink-0"
            onClickHandler={() => {
              props.modal.closeModal();
              props.setDataClear?.(null);
            }}
          >
            <Image iconName="crossIcon" iconClassName="w-full h-full" />
          </Button>
        )}
      </div>
    </div>
  );
};
