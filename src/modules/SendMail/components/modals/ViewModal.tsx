// **components**
import LinkFileDisplay from 'components/FormElement/LinkFileDisplay';
import { Modal } from 'components/Modal/Modal';

// **types**
import { Attachment } from 'modules/EmailTemplate/types';
import { ViewModalProps } from 'modules/SendMail/types';

// **utils**
import { useTranslation } from 'react-i18next';
import { customRandomNumberGenerator } from 'utils';

export const ViewModal = ({ modal, data, setData }: ViewModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      closeOnOutsideClick
      closeOnEscape
      modal={modal}
      setDataClear={setData}
      headerTitle={t('SendMail.viewMail')}
    >
      <>
        <div className="flex flex-col gap-4">
          {data?.from && (
            <div className="flex flex-wrap">
              <span className="text-sm leading-4 text-dark w-14 pe-2 text-right block">
                {t('SendMail.from')}:
              </span>
              <div className="inline-flex flex-wrap gap-2 ps-1 max-w-[calc(100%_-_80px)]">
                <span className="bg-primary/10 text-primary text-xs leading-4 p-1 rounded-md">
                  {data.from}
                </span>
              </div>
            </div>
          )}

          {data?.to && (
            <div className="flex flex-wrap">
              <span className="text-sm leading-4 text-dark w-14 pe-2 text-right block">
                {t('SendMail.to')}:
              </span>
              <div className="inline-flex flex-wrap gap-2 ps-1 max-w-[calc(100%_-_80px)]">
                {data.to.split(',').map((email: string) => {
                  const random = customRandomNumberGenerator();
                  return (
                    <span
                      key={random}
                      className="bg-primary/10 text-primary text-xs leading-4 p-1 rounded-md"
                    >
                      {email}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {data?.cc && (
            <div className="flex flex-wrap">
              <span className="text-sm leading-4 text-dark w-14 pe-2 text-right block">
                {t('SendMail.cc')}:
              </span>
              <div className="inline-flex flex-wrap gap-2 ps-1 max-w-[calc(100%_-_80px)]">
                {data.cc.split(',').map((email: string) => {
                  const random = customRandomNumberGenerator();
                  return (
                    <span
                      key={random}
                      className="bg-primary/10 text-primary text-xs leading-4 p-1 rounded-md"
                    >
                      {email}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {data?.bcc && (
            <div className="flex flex-wrap">
              <span className="text-sm leading-4 text-dark w-14 pe-2 text-right block">
                {t('SendMail.bcc')}:
              </span>
              <div className="inline-flex flex-wrap gap-2 ps-1 max-w-[calc(100%_-_80px)]">
                {data.bcc.split(',').map((email: string) => (
                  <span
                    key={customRandomNumberGenerator()}
                    className="bg-primary/10 text-primary text-xs leading-4 p-1 rounded-md"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-authBG/40 p-5 rounded-xl mt-3">
          <div className="text-base font-semibold text-dark mb-3 border-b border-solid border-black/10 pb-3">
            {t('EmailTemplate.emailTempTableSubject')}:&nbsp;{data?.subject}
          </div>
          {data?.description && (
            <div
              className="text-sm leading-6 text-dark/70"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: data?.description }}
            />
          )}
        </div>
        <div className="flex flex-col gap-y-2 mt-2">
          {data?.attachments?.map((item: Attachment) => {
            return (
              <LinkFileDisplay
                key={item.id}
                filepath={item?.filepath}
                id={item?.id}
                filename={item?.filename}
              />
            );
          })}
        </div>
      </>
    </Modal>
  );
};
