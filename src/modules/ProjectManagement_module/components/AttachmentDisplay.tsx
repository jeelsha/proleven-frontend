import { t } from 'i18next';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

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

const AttachmentDisplay = ({
  initialBoardData,
  setInitialBoardData,
  setInitialBoard,
  isMove,
  isViewable,
  isCoursePipeline = false,
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
    const promises = (initialBoardData?.card_attachments ?? []).map(async (item) => {
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
        updatedData: initialBoardData.card_attachments,
        keyToInsert: 'card_attachments',
        isArray: false,
      });
    preloadUrls();
  }, [initialBoardData.card_attachments]);

  const deleteAttachment = async (attachment_id: number) => {
    if (isMove) isMove.current = true;
    const updatedAttachment = initialBoardData?.card_attachments?.filter(
      (doc) => doc.id !== attachment_id
    );
    await deleteApi(`/cards/attachment/${initialBoardData?.id}/${attachment_id}`);

    if (updatedAttachment) {
      setInitialBoardData?.((prev) => {
        return {
          ...prev,
          card_attachments: updatedAttachment,
          // card_attachments: updatedAttachment,
        };
      });
    }
    setCardData({
      setInitialBoard,
      initialBoardData,
      updatedData: updatedAttachment as Cards['card_attachments'],
      keyToInsert: 'card_attachments',
      isArray: false,
    });
  };

  return (
    <>
      {!initialBoardData?.card_attachments?.length ? (
        ''
      ) : (
        <div className="mt-7">
          {!_.isEmpty(initialBoardData?.card_attachments) && (
            <p className="block w-full text-sm leading-4 text-grayText mb-2.5">
              {t('ProjectManagement.CustomCardModal.Button.attachment')}
            </p>
          )}
          <div className="flex flex-col gap-y-5">
            {!_.isEmpty(initialBoardData?.card_attachments) &&
              initialBoardData?.card_attachments
                ?.slice(0, sliceBy.attachmentSlice)
                ?.map((attachment) => {
                  const fileName = attachment?.attachment_url.split('/');
                  const url = preloadedUrls[attachment?.attachment_url];
                  return (
                    <div key={attachment?.id} className="flex flex-wrap">
                      <Link
                        to={url}
                        target="_blank"
                        className="w-24 h-16 rounded-lg border border-solid border-grayText overflow-hidden"
                      >
                        <Image
                          width={100}
                          height={100}
                          alt={t(
                            'ProjectManagement.CustomCardModal.attachmentAltText'
                          )}
                          src={attachment?.attachment_url}
                          imgClassName="w-full h-full object-cover object-center rounded-lg"
                          serverPath
                        />
                      </Link>
                      <div className="w-[calc(100%_-_96px)] ps-4">
                        <p className="text-sm text-dark font-medium truncate">{`${
                          fileName[fileName.length - 1]
                        }`}</p>

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
                                className=" cursor-pointer text-xs text-danger underline underline-offset-4 inline-block"
                              >
                                {t(
                                  'ProjectManagement.CustomCardModal.Button.deleteText'
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {isCoursePipeline && (
                        <span className="text-grayText text-sm font-semibold leading-4 mt-1">
                          {(attachment?.show_trainer ||
                            attachment?.show_company_manager) && (
                            <div className="flex gap-1 items-center">
                              <Image
                                iconName="checkRoundIcon2"
                                iconClassName="w-4 h-4 text-grayText"
                              />
                              <Button className="text-xs text-dark font-medium">
                                {`${t(
                                  'ProjectManagement.CustomCardModal.attachmentVisible'
                                )} ${
                                  attachment?.show_trainer
                                    ? `${t(
                                        'ProjectManagement.CustomCardModal.attachmentVisibleTrainer'
                                      )}`
                                    : ''
                                } ${
                                  attachment?.show_company_manager &&
                                  attachment?.show_trainer
                                    ? `${t(
                                        'ProjectManagement.CustomCardModal.attachmentVisibleAnd'
                                      )}`
                                    : ''
                                } ${
                                  attachment?.show_company_manager
                                    ? `${t(
                                        'ProjectManagement.CustomCardModal.attachmentVisibleCompanyManager'
                                      )}`
                                    : ''
                                }`}
                              </Button>
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}

            {initialBoardData?.card_attachments &&
              initialBoardData?.card_attachments.length > 3 && (
                <Button
                  onClickHandler={() => {
                    setSliceBy((prev) => {
                      return {
                        ...prev,
                        attachmentSlice:
                          initialBoardData?.card_attachments &&
                          sliceBy.attachmentSlice !==
                            initialBoardData?.card_attachments.length
                            ? initialBoardData?.card_attachments.length
                            : 3,
                      };
                    });
                  }}
                  className="w-fit text-sm text-primary underline underline-offset-4 font-medium hover:opacity-70"
                >
                  {sliceBy.attachmentSlice ===
                  initialBoardData?.card_attachments?.length
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

export default AttachmentDisplay;
