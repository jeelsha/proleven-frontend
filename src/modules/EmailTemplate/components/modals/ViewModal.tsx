// **components**
import LinkFileDisplay from 'components/FormElement/LinkFileDisplay';
import { Modal } from 'components/Modal/Modal';

// **hooks**
import { useTranslation } from 'react-i18next';

// **types**
import { Attachment, ViewModalProps } from 'modules/EmailTemplate/types';
import { replaceTemplateTagsWithBraces } from 'utils';
import '../../../../components/ReactQuillEditor/style/style.css';

export const ViewModal = ({ modal, data }: ViewModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      closeOnEscape
      closeOnOutsideClick
      width="max-w-[622px]"
      modal={modal}
      headerTitle={t('SendMail.viewTemplate')}
    >
      <>
        <div className="bg-authBG/40 p-5 rounded-xl">
          <p className="text-base font-semibold text-dark mb-3">{data?.title}</p>
          <p className="text-sm font-medium text-dark mb-3 border-b border-solid border-black/10 pb-3">
            <span>{t('EmailTemplate.emailTempTableSubject')}:</span>
            <span>{data?.subject}</span>
          </p>
          {data?.description && (
            <div
              className=" text-sm leading-normal font-normal content-wrapper"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: replaceTemplateTagsWithBraces(data?.description),
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-y-2 mt-2">
          {data?.attachment?.map((item: Attachment) => {
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
