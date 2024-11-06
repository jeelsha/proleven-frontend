import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import StatusLabel from 'components/StatusLabel';
import ToolTip from 'components/Tooltip';
import { format } from 'date-fns';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import _ from 'lodash';
import { SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import '../../../ProjectManagement_module/style/index.css';

import { REACT_APP_DATE_FORMAT } from 'config';
import { AssignedSession, IAdminTrainerRequest, IForm } from './types';

export const getStatusClass = (item: string) => {
  switch (item) {
    case 'accepted':
      return 'completed';
    case 'requested':
      return 'pending';
    case 'rejected':
      return 'cancelled';
    default:
      return 'pending';
  }
};
type ISessionType = {
  refetch: () => void;
  refetchShowTrainer?: () => void;
  data: AssignedSession;
  slug: string | null | undefined;
  isLessonChecked: (trainerId: number, lessonSlug: string) => boolean;
  item: IAdminTrainerRequest;
  values: IForm;
  setSelectedLessons: React.Dispatch<
    SetStateAction<
      {
        trainerId: number | undefined;
        lesson_slug: string[];
      }[]
    >
  >;
};
const SessionCard = ({
  data,
  slug,
  isLessonChecked,
  item,
  values,
  setSelectedLessons,
  refetch,
  refetchShowTrainer,
}: ISessionType) => {
  const { t } = useTranslation();
  const [markAsAbsent] = useAxiosPost();
  const markAsAbsentModal = useModal();

  const getTrainerType = (data: AssignedSession): string => {
    switch (true) {
      case data?.is_optional === true:
        return t('OptionalTrainer');
      case data?.is_full_course === true:
        return t('MainTrainer');
      case data?.lessonSessions !== null:
        return t('SessionTrainer');
      default:
        return t('MainTrainer');
    }
  };

  const handleChange = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    trainerId: number
  ) => {
    const newData = checkData.target.value;
    const isChecked = checkData.target.checked;
    setSelectedLessons((prevState) => {
      const existingEntry = prevState.find((entry) => entry.trainerId === trainerId);

      if (isChecked) {
        if (existingEntry) {
          return prevState.map((entry) =>
            entry.trainerId === trainerId
              ? {
                  ...entry,
                  lesson_slug: [...new Set([...entry.lesson_slug, newData])],
                }
              : entry
          );
        }
        return [...prevState, { trainerId, lesson_slug: [newData] }];
      }
      if (existingEntry) {
        const updatedLessonSlug = existingEntry.lesson_slug.filter(
          (slug) => slug !== newData
        );
        return updatedLessonSlug?.length
          ? prevState.map((entry) =>
              entry.trainerId === trainerId
                ? { ...entry, lesson_slug: updatedLessonSlug }
                : entry
            )
          : prevState.filter((entry) => entry.trainerId !== trainerId);
      }
      return prevState;
    });
  };

  const handleMarkAsAbsent = async () => {
    if (data?.lessonSessions?.slug && item?.user?.id) {
      const markAsAbsentPayload = {
        trainer_id: item?.user?.id,
        lesson_session_slugs: [data?.lessonSessions?.slug],
      };

      const { error } = await markAsAbsent(
        `/course/trainers/mark-as-absent/${data?.courses?.slug}`,
        markAsAbsentPayload
      );
      if (!error) {
        markAsAbsentModal.closeModal();
        refetch();
        refetchShowTrainer?.();
      }
    }
  };
  return (
    <>
      <div className="border border-solid border-borderColor rounded-lg p-5 bg-white flex flex-col">
        <div className="flex justify-between  mb-3 gap-2 ">
          <div className="flex gap-3">
            {(data?.trainer_assigned_to_status === 'accepted' ||
              data?.trainer_assigned_to_status === 'requested') &&
              data?.assigned_to_status === 'requested' &&
              data?.is_optional === false &&
              data?.lesson_session_id && (
                <Checkbox
                  value={data?.lessonSessions?.slug}
                  parentClass="shrink-0"
                  check={
                    !data?.lessonSessions?.id ||
                    isLessonChecked(item?.user?.id, data?.lessonSessions?.slug)
                  }
                  customClass="!rounded-[2px] checked:!bg-secondary/70 checked:!ring-secondary/70"
                  onChange={(checkData) => {
                    if (values) {
                      handleChange(checkData, item?.user?.id);
                    }
                  }}
                  disabled={!data?.lesson_session_id}
                />
              )}

            <div>
              {data?.is_full_course === true ? (
                <p className="text-lg font-semibold text-dark mb-1 leading-none">
                  {data?.lessonSessions !== null ? 'Session' : t('FullCourse')}
                </p>
              ) : (
                <p className="text-lg font-semibold text-dark mb-1 leading-none">
                  {t('Calendar.eventDetails.sessionTitle')}
                </p>
              )}
              {data?.lessonSessions?.lesson?.title && (
                <p className="text-sm leading-4 text-dark flex flex-wrap items-center mt-3">
                  <strong>{t('Calendar.eventDetails.lessonTitle')}:</strong>
                  <Button className="ms-2">
                    {data?.lessonSessions?.lesson?.title}
                    {data?.distance ? `: (${data?.distance} Km)` : ''}
                  </Button>
                </p>
              )}
              {data?.courses?.title ? (
                <p className="text-base font-semibold text-dark mb-1 leading-none">
                  {'courses =>'}
                  {data?.courses?.title}
                </p>
              ) : (
                slug && (
                  <p className="text-base font-semibold text-dark mb-1 leading-none">
                    {t('Bundle.trainer')}
                  </p>
                )
              )}
              <Button className="text-xs text-dark font-medium flex  flex-wrap items-center gap-5 gap-y-3 mt-3">
                {(!slug || data?.courses?.title) &&
                data?.lesson_session_id === null ? (
                  <p className="text-sm leading-4 text-dark flex items-center">
                    <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                      <Image
                        iconName="calendarIcon2"
                        iconClassName="w-full h-full"
                      />
                    </Button>
                    {data?.courses?.start_date
                      ? `${format(
                          new Date(data?.courses?.start_date),
                          REACT_APP_DATE_FORMAT as string
                        )}`
                      : ''}
                    -
                    {data?.courses?.end_date
                      ? `${format(
                          new Date(data?.courses?.end_date),
                          REACT_APP_DATE_FORMAT as string
                        )}`
                      : ''}
                  </p>
                ) : (
                  <p className="text-sm leading-4 text-dark flex items-center">
                    <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                      <Image
                        iconName="calendarIcon2"
                        iconClassName="w-full h-full"
                      />
                    </Button>
                    {data?.lessonSessions?.start_time
                      ? `${format(
                          new Date(data?.lessonSessions?.start_time),
                          REACT_APP_DATE_FORMAT as string
                        )}`
                      : ''}
                  </p>
                )}
                {data?.lessonSessions !== null && (
                  <p className="text-sm leading-4 text-dark flex items-center">
                    <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                      <Image iconName="clockIcon" iconClassName="w-full h-full" />
                    </Button>
                    {data?.lessonSessions?.start_time
                      ? `${format(
                          new Date(data?.lessonSessions?.start_time),
                          'hh:mm a'
                        )}`
                      : ''}
                    -
                    {data?.lessonSessions?.end_time
                      ? `${format(
                          new Date(data?.lessonSessions?.end_time),
                          'hh:mm a'
                        )}`
                      : ''}
                  </p>
                )}
              </Button>

              {data?.lessonSessions?.lesson?.mode && (
                <p className="text-sm font-normal text-dark mt-3">
                  <strong>{t('CompanyManager.courseDetails.mode')}:</strong>
                  <Button className="ms-1">
                    {data?.lessonSessions?.lesson?.mode}
                  </Button>
                </p>
              )}
            </div>
          </div>

          <div
            className={`flex  self-start flex-shrink-0 ${
              data?.available === false ? 'flex-wrap gap-1' : 'gap-2'
            }`}
          >
            <StatusLabel
              variants="WhiteBorder"
              text={getTrainerType(data)}
              className="h-fit min-h-9 shrink-0 ml-auto"
            />

            {data?.assigned_to_status === 'accepted' &&
            data?.lesson_session_id !== null &&
            data?.is_optional === false &&
            _.isNull(data?.course_bundle_id) &&
            data?.available ? (
              <Button
                parentClass="h-fit"
                className="action-button red-btn shrink-0"
                tooltipText={t('Tooltip.absent')}
                onClickHandler={() => markAsAbsentModal.openModal()}
              >
                <Image
                  iconName="userCrossIcon"
                  iconClassName="stroke-current w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>
            ) : (
              data?.available === false && (
                <StatusLabel
                  text={t('trainerAbsent')}
                  variants="cancelled"
                  className="h-fit min-h-9 shrink-0 ml-auto"
                />
              )
            )}
          </div>
        </div>

        {!_.isEmpty(data?.selected_users) && (
          <p className="text-sm leading-4 text-dark flex items-center mb-3 border-t border-solid border-borderColor pt-3">
            <div className="mr-5">
              <span>{t('approved')}</span>
            </div>

            <div className="member-wrapper flex items-center gap-1">
              <div className="flex">
                {!_.isEmpty(data?.selected_users) &&
                  data?.selected_users?.map((trainer, index) => {
                    return (
                      <div
                        key={`trainer_${index + 1}`}
                        className="member-img-div relative group"
                      >
                        <ToolTip
                          position="top"
                          text={`${trainer?.assignedToUser?.first_name} ${trainer?.assignedToUser?.last_name}`}
                        />
                        <Image
                          imgClassName="w-full h-full rounded-full object-cover"
                          width={40}
                          height={40}
                          alt="memberImage"
                          src={
                            trainer?.assignedToUser?.profile_image ??
                            '/images/member.png'
                          }
                          serverPath
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </p>
        )}

        <div className="flex gap-3 items-start mt-auto border-t border-solid border-borderColor pt-3">
          {data?.trainer_assigned_to_status === 'accepted' &&
            data?.assigned_to_status === 'requested' &&
            data?.is_optional === false && <div className="w-[20px] shrink-0" />}
          <div className="grid gap-3  flex-auto">
            <div className="grid grid-cols-[40%_1fr] items-center gap-3">
              <p className="text-sm">{t('trainerResponse')}</p>
              <StatusLabel
                variants={getStatusClass(data?.trainer_assigned_to_status)}
                text={t(`trainerAccept.Status.${data?.trainer_assigned_to_status}`)}
                className="h-fit min-h-9"
              />
            </div>
            {data?.trainer_assigned_to_status !== 'rejected' && (
              <div className="grid grid-cols-[40%_1fr] items-center gap-3">
                <p className="text-sm">{t('trainingSpecialistResponse')}</p>
                <StatusLabel
                  variants={getStatusClass(data?.assigned_to_status)}
                  text={t(`trainerAccept.Status.${data?.assigned_to_status}`)}
                  className="h-fit min-h-9"
                />
              </div>
            )}
            {((data?.is_full_course === true && data?.lessonSessions === null) ||
              (data?.is_full_course === false && data?.lessonSessions !== null) ||
              !_.isNull(
                data?.course_bundle_id && _.isNull(data?.lesson_session_id)
              )) &&
            data?.trainer_assigned_to_status === 'rejected' &&
            data?.reject_note ? (
              <p className="text-sm leading-4 text-dark flex items-start mt-3">
                <strong className="min-w-[160px]">
                  {t('trainerRejectReason')}:
                </strong>{' '}
                <span className="ms-2">{data?.reject_note}</span>
              </p>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
      <ConfirmationPopup
        modal={markAsAbsentModal}
        bodyText={t('absentModal.admin.bodyText', {
          NAME: `${item?.user?.first_name} ${item?.user?.last_name}`,
          SESSION: data?.lessonSessions?.lesson?.title,
        })}
        variants="primary"
        confirmButtonText="Confirm"
        deleteTitle="Are you sure?"
        confirmButtonFunction={handleMarkAsAbsent}
        confirmButtonVariant="primary"
        cancelButtonText={t('Button.cancelButton')}
        cancelButtonFunction={() => {
          markAsAbsentModal.closeModal();
        }}
      />
    </>
  );
};

export default SessionCard;
