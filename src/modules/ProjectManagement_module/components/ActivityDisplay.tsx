// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import CardModalActivity from './CardModalActivity';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';

// ** Utils
import { t } from 'i18next';
import _ from 'lodash';
import '../style/index.css';
import { format, parseISO } from 'date-fns';

// ** Hooks
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';

// ** types  **
import { AttachmentActivityDisplayProps, IOpenModalWithData } from '../types';

// ** Constants
import { REACT_APP_DATE_FORMAT } from 'config';
import { getLocale } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** Slice
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

const ActivityDisplay = ({
  initialBoardData,
  setInitialBoardData,
  allowCreateActivity = true,
  setInitialBoard,
  isMove,
  className,
  commentSlice,
  isViewable,
  isCoursePipeline,
}: AttachmentActivityDisplayProps) => {
  const { language } = useSelector(useLanguage);
  const deleteModal = useModal();

  const [commentDelete] = useAxiosDelete();

  const user = useSelector(getCurrentUser);
  const [replyData, setReplyData] = useState({
    isReply: false,
    reply_user_id: '',
    reply_comment_id: '',
  });
  const [commentDeleteData, setCommentDeleteData] = useState<IOpenModalWithData>();
  const scrollDivRef = useRef<HTMLDivElement>(null);

  const [sliceBy, setSliceBy] = useState({
    activitySlice: commentSlice ?? 5,
  });
  useEffect(() => {
    setCommentDeleteData(deleteModal.modalData as IOpenModalWithData);
  }, [deleteModal.modalData]);

  useEffect(() => {
    if (sliceBy.activitySlice !== 3 && initialBoardData?.card_activities) {
      scrollToTop();
    }
  }, [initialBoardData]);

  const scrollToTop = () => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  function boldTextInSquareBrackets(description: string) {
    let result = description.replace(/\(\d+(,\d+)*\)/g, ''); // Remove the content inside parentheses along with parentheses
    result = result.replace(/@\[([^\]]+)\]/g, (_match, p1) => {
      return `@<strong>${p1}</strong>`;
    });

    return result;
  }

  const handleDelete = async (cardId: number, comment_id: number) => {
    if (isMove) isMove.current = true;

    const { error } = await commentDelete(
      `/cards/reply/${cardId}`,
      {},
      {
        params: {
          comment_id,
        },
      }
    );
    if (!error) {
      const updatedComment = initialBoardData?.card_activities?.filter(
        (doc) => doc.id !== comment_id
      );
      if (updatedComment) {
        setInitialBoardData?.((prev) => {
          return {
            ...prev,
            card_activities: updatedComment,
          };
        });
      }
    }
  };

  const handleChildDelete = async (cardId: number, childId: number) => {
    if (isMove) isMove.current = true;

    const { error } = await commentDelete(
      `/cards/reply/${cardId}`,
      {},
      {
        params: {
          comment_id: childId,
        },
      }
    );

    if (!error) {
      const updatedCardActivities = initialBoardData?.card_activities?.map(
        (cardActivity) => {
          if (cardActivity?.parent?.some((child) => child.id === childId)) {
            return {
              ...cardActivity,
              parent: cardActivity.parent.filter((child) => child.id !== childId),
            };
          }
          return cardActivity;
        }
      );

      setInitialBoardData?.((prev) => ({
        ...prev,
        card_activities: updatedCardActivities,
      }));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-y-5 mt-7">
        {!_.isEmpty(initialBoardData?.card_activities) &&
          initialBoardData?.card_activities
            ?.slice(0, sliceBy.activitySlice)
            ?.map((activity, index) => (
              <div
                key={`comment_${index + 1}`}
                ref={scrollDivRef}
                className={` comment-list ${className}`}
              >
                <div key={`activity_${index + 1}`} className="flex flex-wrap">
                  <div className="w-9 h-9">
                    <Image
                      width={32}
                      height={32}
                      alt={t('ProjectManagement.CustomCardModal.attachmentAltText')}
                      src={
                        activity?.createdByUser?.profile_image ??
                        '/images/default-avatar.jpg'
                      }
                      imgClassName="w-full h-full object-cover rounded-full"
                      serverPath
                    />
                  </div>
                  <div className="max-w-[calc(100%_-_36px)] w-full ps-3 pb-1">
                    <div className="text-sm text-grayText leading-4">
                      <strong className="font-semibold text-dark">
                        {`${activity?.createdByUser?.first_name} ${activity?.createdByUser?.last_name}`}
                      </strong>
                      &nbsp;
                      <span className="text-grayText text-[10px] leading-4 mt-1">
                        {activity?.created_at &&
                          format(
                            parseISO(activity?.created_at),
                            REACT_APP_DATE_FORMAT as string,
                            {
                              locale: getLocale(language),
                            }
                          )}
                      </span>
                    </div>
                    <div
                      className="bg-white rounded-md p-[8px_12px] shadow-[#959da533_0px_0px_6px] mt-2 text-[14px] w-[calc(100%_-_10px)]"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: boldTextInSquareBrackets(activity?.description),
                      }}
                    />
                    {activity?.is_system_default === false && !commentSlice && (
                      <div className="flex flex-row gap-3 mt-1.5">
                        <Button
                          className=" cursor-pointer text-xs text-danger underline underline-offset-4 inline-block"
                          onClickHandler={() =>
                            setReplyData({
                              isReply: !replyData.isReply,
                              reply_user_id: String(activity?.createdByUser?.id),
                              reply_comment_id: String(activity?.id),
                            })
                          }
                        >
                          {t('reply')}
                        </Button>

                        {!isViewable && user && (
                          <div className="relative  group flex">
                            {(activity?.createdByUser?.id === Number(user?.id) ||
                              user?.role_name === ROLES.Admin) && (
                              <Button
                                onClickHandler={() => {
                                  deleteModal?.openModalWithData?.({
                                    initialBoardId: initialBoardData?.id,
                                    commentId: activity?.id,
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
                    )}
                    {!_.isEmpty(activity?.parent) && (
                      <div className="p-4 rounded-lg bg-offWhite2  border border-solid border-offWhite mt-4">
                        {activity?.parent?.map((child) => {
                          return (
                            <div
                              className="bg-white rounded-md p-[8px_12px] shadow-[#959da533_0px_0px_6px] mb-2 text-[14px] w-full"
                              key={child?.id}
                            >
                              <div className="mb-2 flex justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6">
                                    <Image
                                      width={32}
                                      height={32}
                                      alt={t(
                                        'ProjectManagement.CustomCardModal.attachmentAltText'
                                      )}
                                      src={
                                        child?.createdByUser?.profile_image ??
                                        '/images/default-avatar.jpg'
                                      }
                                      imgClassName="w-full h-full object-cover rounded-full"
                                      serverPath
                                    />
                                  </div>
                                  <div className="text-sm leading-4 flex items-center gap-2">
                                    <span className="font-semibold text-dark">{`${child?.createdByUser?.first_name} ${child?.createdByUser?.last_name}`}</span>
                                    <span className="text-grayText text-[10px] leading-4 ">
                                      {activity?.created_at &&
                                        format(
                                          parseISO(child?.created_at),
                                          REACT_APP_DATE_FORMAT as string,
                                          {
                                            locale: getLocale(language),
                                          }
                                        )}
                                    </span>
                                  </div>
                                </div>
                                {(child?.createdByUser?.id === Number(user?.id) ||
                                  user?.role_name === ROLES.Admin) && (
                                  <div className="relative  group flex">
                                    <Button
                                      onClickHandler={() =>
                                        deleteModal?.openModalWithData?.({
                                          initialBoardId: initialBoardData?.id,
                                          commentId: null,
                                          childId: child?.id,
                                        })
                                      }
                                      parentClass="h-fit"
                                      className="text-danger w-8 h-8 cursor-pointer"
                                    >
                                      <Image
                                        iconName="deleteIcon"
                                        iconClassName="w-5 h-5 stroke-current"
                                      />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div
                                className=""
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                  __html: boldTextInSquareBrackets(
                                    child.description
                                  ),
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        {allowCreateActivity &&
          initialBoardData?.card_activities &&
          initialBoardData?.card_activities?.length > 5 && (
            <Button
              onClickHandler={() => {
                setSliceBy({
                  activitySlice:
                    sliceBy.activitySlice !==
                      initialBoardData?.card_activities?.length &&
                    initialBoardData?.card_activities
                      ? initialBoardData?.card_activities?.length
                      : 5,
                });
              }}
              className="w-fit text-sm text-primary underline underline-offset-4 font-medium hover:opacity-70"
            >
              {sliceBy.activitySlice === initialBoardData?.card_activities?.length
                ? t('ProjectManagement.CustomCardModal.showLess')
                : t('ProjectManagement.CustomCardModal.showMore')}
            </Button>
          )}
      </div>
      {setInitialBoardData && allowCreateActivity && !isViewable && (
        <CardModalActivity
          initialBoardData={initialBoardData}
          isMove={isMove}
          setInitialBoard={setInitialBoard}
          setInitialBoardCard={setInitialBoardData}
          card_id={initialBoardData?.id}
          replyData={replyData}
          setReplyData={setReplyData}
          isCoursePipeline={isCoursePipeline}
        />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('deleteCommentSubtitle')}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonVariant="danger"
          deleteTitle={t('deleteComment')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={deleteModal.closeModal}
          confirmButtonFunction={() => {
            if (commentDeleteData?.childId) {
              handleChildDelete(
                commentDeleteData?.initialBoardId as number,
                commentDeleteData?.childId
              );
            } else {
              handleDelete(
                commentDeleteData?.initialBoardId as number,
                commentDeleteData?.commentId as number
              );
            }
            deleteModal.closeModal();
          }}
        />
      )}
    </>
  );
};

export default ActivityDisplay;
