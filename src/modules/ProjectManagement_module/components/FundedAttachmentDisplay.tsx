import { t } from 'i18next';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';

// ** utils **
import { setCardData } from '../utils';

// ** hooks **
import { useAxiosDelete } from 'hooks/useAxios';

// ** types **
import { AttachmentActivityDisplayProps, Cards } from '../types';

// ** style **
import '../style/index.css';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** redux-slice **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { useModal } from 'hooks/useModal';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getPresignedImageUrl } from 'services/aws.service';

const FundedAttachmentDisplay = ({
  initialBoardData,
  setInitialBoardData,
  setInitialBoard,
  isMove,
  isViewable,
  parentClass,
}: AttachmentActivityDisplayProps) => {
  const [deleteApi] = useAxiosDelete();

  const deleteModal = useModal();

  const [preloadedUrls, setPreloadedUrls] = useState<Record<string, string>>({});
  const [sliceBy, setSliceBy] = useState({
    attachmentSlice: 3,
  });
  const user = useSelector(getCurrentUser);

  const preloadUrls = async () => {
    const urls: Record<string, string> = {};
    const promises = (initialBoardData?.funded_documents ?? []).map(async (item) => {
      const url = await getPresignedImageUrl(
        item.attachment_url,
        undefined,
        undefined,
        true
      );
      urls[item.attachment_url] = url;
    });
    await Promise.all(promises);
    setPreloadedUrls(urls);
  };

  useEffect(() => {
    if (isMove?.current)
      setCardData({
        setInitialBoard,
        initialBoardData,
        updatedData: initialBoardData.funded_documents,
        keyToInsert: 'funded_documents',
        isArray: false,
      });
    preloadUrls();
  }, [initialBoardData.funded_documents]);

  const deleteAttachment = async (attachment_id: number) => {
    if (isMove) isMove.current = true;
    const updatedAttachment = initialBoardData?.funded_documents?.filter(
      (doc) => doc.id !== attachment_id
    );
    await deleteApi(`/cards/attachment/${initialBoardData?.id}/${attachment_id}`);

    if (updatedAttachment) {
      setInitialBoardData?.((prev) => {
        return {
          ...prev,
          funded_documents: updatedAttachment,
        };
      });
    }
    setCardData({
      setInitialBoard,
      initialBoardData,
      updatedData: updatedAttachment as Cards['funded_documents'],
      keyToInsert: 'funded_documents',
      isArray: false,
    });
  };

  return (
    <>
      {!initialBoardData?.funded_documents?.length ? (
        ''
      ) : (
        <div className={`mt-7 ${parentClass ?? ''} `}>
          {!_.isEmpty(initialBoardData?.funded_documents) && (
            <p className="block w-full text-sm leading-4 text-grayText mb-2.5">
              {t('ProjectManagement.CustomCardModal.Button.fundedAttachment')}
            </p>
          )}
          <div className="flex flex-col gap-y-5">
            {!_.isEmpty(initialBoardData?.funded_documents) &&
              initialBoardData?.funded_documents
                ?.slice(0, sliceBy.attachmentSlice)
                ?.map((attachment) => {
                  const fileName = attachment?.attachment_url.split('/');
                  const extension = fileName[fileName.length - 1].split('.');
                  const url = preloadedUrls[attachment?.attachment_url];
                  return (
                    <div
                      key={attachment?.id}
                      className="flex flex-wrap items-center"
                    >
                      <div className="h-auto min-h-[80px] w-32 flex items-center rounded-l-lg justify-center bg-gray-200 border border-solid border-gray-200 font-semibold text-xl text-gray-600">
                        {extension[extension.length - 1]}
                      </div>
                      <div className="w-[calc(100%_-_128px)] ps-4 rounded-r-lg border border-solid border-gray-200 border-l-0 min-h-[80px] flex flex-col items-start justify-center">
                        <p className="text-sm text-dark font-medium w-full">
                          <Link
                            to={url ?? ''}
                            target="_blank"
                            className="truncate block w-full"
                          >
                            {`${fileName[fileName.length - 1]}`}
                          </Link>
                        </p>

                        {!isViewable && user && (
                          <div className="relative inline-block group">
                            {(attachment?.created_by === Number(user?.id) ||
                              user?.role_name === ROLES.Admin) && (
                              <Button
                                onClickHandler={() => {
                                  deleteModal?.openModalWithData?.({
                                    attachmentId: attachment?.id,
                                  });
                                }}
                                className=" cursor-pointer text-xs text-danger underline underline-offset-4 inline-block relative hover:before:pointer-events-auto before:pointer-events-none before:absolute before:content-[''] before:w-[calc(100%_+_20px)]  before:h-[calc(100%_+_50px)]"
                              >
                                {t(
                                  'ProjectManagement.CustomCardModal.Button.deleteText'
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

            {initialBoardData?.funded_documents &&
              initialBoardData?.funded_documents.length > 3 && (
                <Button
                  onClickHandler={() => {
                    setSliceBy((prev) => {
                      return {
                        ...prev,
                        attachmentSlice:
                          initialBoardData?.funded_documents &&
                          sliceBy.attachmentSlice !==
                            initialBoardData?.funded_documents.length
                            ? initialBoardData?.funded_documents.length
                            : 3,
                      };
                    });
                  }}
                  className="w-fit text-sm text-primary underline underline-offset-4 font-medium hover:opacity-70"
                >
                  {sliceBy.attachmentSlice ===
                  initialBoardData?.funded_documents?.length
                    ? t('ProjectManagement.CustomCardModal.showLess')
                    : t('ProjectManagement.CustomCardModal.showMore')}
                </Button>
              )}
            {deleteModal.isOpen && (
              <ConfirmationPopup
                modal={deleteModal}
                bodyText={t(
                  'ProjectManagement.CustomCardModal.Button.deleteModalDesc'
                )}
                variants="primary"
                confirmButtonText={t('Button.deleteButton')}
                confirmButtonVariant="danger"
                deleteTitle={t(
                  'ProjectManagement.CustomCardModal.Button.deleteModalTitle'
                )}
                cancelButtonText={t('Button.cancelButton')}
                cancelButtonFunction={deleteModal.closeModal}
                confirmButtonFunction={() => {
                  deleteAttachment(
                    (deleteModal.modalData as { attachmentId: number }).attachmentId
                  );
                  deleteModal.closeModal();
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FundedAttachmentDisplay;
