// **components**
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import SignatureCanvas from 'components/Layout/components/Signature';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { ROLES } from 'constants/roleAndPermission.constant';

import { format, isAfter, parseISO, subMinutes } from 'date-fns';
import {
  CourseParticipant,
  LessonSession,
} from 'modules/Courses/pages/Attendance/types';
import { Data } from 'modules/Courses/pages/Attendance/types/sessionTypes';
import '../../../Chat/style/chat.css';

import { useAxiosDelete } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { attendanceProps } from 'modules/Courses/types/attendanceCard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

type AllowedRoles = 'Admin' | 'TrainingSpecialist' | 'Trainer';

const AttendanceCard = ({
  data,
  index,
  OnSubmit,
  isEdit,
  lessonWiseAttendance,
  setAbsentData,
  absentData,
  location,
  absentModal,
  lateArrivalModal,
  earlyLeaveModal,
  breakTimeModal,
  setParticipateSlug,
  setSelectedData,
  refetch,
}: attendanceProps) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const [activeIndex, setActiveIndex] = useState<number[]>([]);
  const [activeIndexForMenu, setActiveIndexForMenu] = useState<number[]>([]);
  const deleteModal = useModal();
  const [breakDeleteApi] = useAxiosDelete();

  const toggleCard = (index: number) => {
    if (activeIndex.includes(index)) {
      setActiveIndex(activeIndex.filter((i) => i !== index));
    } else {
      setActiveIndex([...activeIndex, index]);
      setActiveIndexForMenu(activeIndexForMenu.filter((i) => i !== index));
    }
  };

  const toggleCardForMenu = (index: number) => {
    if (activeIndexForMenu.includes(index)) {
      setActiveIndexForMenu(activeIndexForMenu.filter((i) => i !== index));
    } else {
      setActiveIndexForMenu([...activeIndexForMenu, index]);
    }
  };

  const handleDelete = async (slug: string) => {
    await breakDeleteApi(`/course/participates/delete-break/${slug}`);

    deleteModal.closeModal();
    if (refetch) {
      refetch();
    }
  };
  const startDate = data?.courseAttendanceSheet[0]?.course?.start_date;
  const currentDate = new Date();

  const isManuallySigned =
    data?.courseAttendanceSheet[0]?.mark_as_start_signed &&
    !data?.courseAttendanceSheet[0]?.start_signature;

  function checkCondition(dateString: string) {
    if (dateString) {
      const date = parseISO(dateString);
      const one_day_before_date = new Date(date);
      one_day_before_date.setDate(date.getDate() - 1);
      const condition = currentDate > one_day_before_date;
      return condition;
    }
  }
  const start_time = data?.courseAttendanceSheet[0]?.lessonSession?.start_time;
  const end_time = data?.courseAttendanceSheet[0]?.lessonSession?.end_time;
  const showSessionWiseAttendance = start_time
    ? isAfter(new Date(), new Date(parseISO(start_time).getTime() - 30 * 60 * 1000))
    : false;
  const showStartAttendance = checkCondition(startDate);
  const currDate = new Date();

  const renderAttendanceSignButton = () => {
    return (
      <>
        {(data as Data).courseAttendanceSheet[0]?.mark_as_absent === '0' && (
          <div className="grid grid-cols-2 gap-7">
            {showStartAttendance && (
              <SignatureCanvas
                title={t('AttendanceSheet.SignBeginning')}
                signImage={
                  (data as CourseParticipant)?.courseAttendanceSheet[0]
                    ?.start_signature
                }
                isEdit={isEdit}
                data={data as CourseParticipant}
                OnSubmit={OnSubmit}
                type="begin"
              />
            )}
            <SignatureCanvas
              title={t('AttendanceSheet.SignEnd')}
              signImage={
                (data as CourseParticipant)?.courseAttendanceSheet[0]?.end_signature
              }
              OnSubmit={OnSubmit}
              data={data as CourseParticipant}
              isEdit={isEdit}
              type="end"
            />
          </div>
        )}
      </>
    );
  };
  const attendanceSheet = (data as Data).courseAttendanceSheet[0];
  const checkRole = [ROLES.Admin, ROLES.TrainingSpecialist, ROLES.Trainer].includes(
    user?.role_name as AllowedRoles
  );

  const checkStartTime = currDate >= subMinutes(parseISO(start_time), 30);

  const checkBothSigned = !(
    attendanceSheet?.mark_as_end_signed === true &&
    attendanceSheet?.mark_as_start_signed === true
  );
  const checkAbsentSigned = attendanceSheet?.mark_as_absent === '0';
  const shouldShowButtons =
    checkRole && checkStartTime && checkAbsentSigned && checkBothSigned;
  return (
    <div key={data?.id} className="mb-6 break-inside-avoid">
      <CustomCard minimal>
        <div>
          <div className="flex justify-between items-center">
            {activeIndex.includes(index) ? (
              <p className="text-sm font-medium text-dark">
                {data?.first_name}&nbsp;
                {data?.last_name}
              </p>
            ) : (
              <p />
            )}
            <div className="flex flex-row gap-3 relative z-1">
              <Button
                onClickHandler={() => toggleCard(index)}
                className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary"
              >
                <Image
                  iconName={!activeIndex.includes(index) ? 'minusIcon' : 'plusIcon'}
                />
              </Button>
              {lessonWiseAttendance && shouldShowButtons ? (
                <div className="w-7 h-7 ">
                  <div
                    className={`p-2 shadow-lg absolute right-0 min-w-[200px] bg-white rounded-lg top-full z-1 transition-all duration-300 ${
                      activeIndexForMenu.includes(index)
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-col gap-y-1">
                      {((user?.role_name === ROLES.Admin ||
                        user?.role_name === ROLES.TrainingSpecialist ||
                        user?.role_name === ROLES.Trainer) &&
                        currDate >= subMinutes(parseISO(start_time), 30) &&
                        (data as Data).courseAttendanceSheet[0]
                          ?.mark_as_start_signed !== true) ||
                      (data as Data).courseAttendanceSheet[0]?.mark_as_end_signed !==
                        true ? (
                        <>
                          <Button
                            onClickHandler={() => {
                              setAbsentData?.({
                                ...absentData,
                                course_participate_id: (data as Data)?.id,
                                course_slug: location?.slug,
                                lesson_session_id: location?.lessonSessionId,
                                mark_as_absent: true,
                                starTime: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.start_time ?? ''
                                  ),
                                  'yyyy-MM-dd hh:mm a'
                                ),
                                endTime: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.end_time ?? ''
                                  ),
                                  'yyyy-MM-dd hh:mm a'
                                ),
                                // session_date:
                                //   type === 'early'
                                //     ? format(parseISO(data?.end_time ?? ''), 'yyyy-MM-dd')
                                //     : format(parseISO(data?.start_time ?? ''), 'yyyy-MM-dd'),
                                session_date: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.start_time
                                  ),
                                  'yyyy-MM-dd'
                                ),
                              });
                              lateArrivalModal?.openModal();
                              toggleCardForMenu(index);
                            }}
                            parentClass="h-fit"
                            className="profile-item"
                          >
                            <div className="flex w-5 h-5">
                              <Image iconName="clockIcon" />
                            </div>
                            <div className="block max-w-[calc(100%_-_28px)] ps-2 w-full text-nowrap">
                              {t('Tooltip.lateArrival')}
                            </div>
                          </Button>
                          <Button
                            onClickHandler={() => {
                              setAbsentData?.({
                                ...absentData,
                                course_participate_id: (data as Data)?.id,
                                course_slug: location?.slug,
                                lesson_session_id: location?.lessonSessionId,
                                mark_as_absent: true,
                                starTime: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.start_time ?? ''
                                  ),
                                  'yyyy-MM-dd hh:mm a'
                                ),
                                endTime: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.end_time ?? ''
                                  ),
                                  'yyyy-MM-dd hh:mm a'
                                ),
                                session_date: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.start_time
                                  ),
                                  'yyyy-MM-dd'
                                ),
                              });
                              earlyLeaveModal?.openModal();
                              toggleCardForMenu(index);
                            }}
                            parentClass="h-fit"
                            className="profile-item"
                          >
                            <div className="flex w-5 h-5">
                              <Image iconName="stopwatchIcon" />
                            </div>
                            <div className="block max-w-[calc(100%_-_28px)] ps-2 w-full text-nowrap">
                              {t('Tooltip.earlyLeave')}
                            </div>
                          </Button>
                          <Button
                            onClickHandler={() => {
                              setAbsentData?.({
                                ...absentData,
                                course_participate_id: (data as Data)?.id,
                                course_slug: location?.slug,
                                lesson_session_id: location?.lessonSessionId,
                                starTime: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.start_time ?? ''
                                  ),
                                  'yyyy-MM-dd hh:mm a'
                                ),
                                endTime: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.end_time ?? ''
                                  ),
                                  'yyyy-MM-dd hh:mm a'
                                ),
                                mark_as_absent: true,
                                session_date: format(
                                  parseISO(
                                    (data as Data)?.courseAttendanceSheet[0]
                                      ?.lessonSession?.start_time
                                  ),
                                  'yyyy-MM-dd'
                                ),
                              });
                              setSelectedData?.(
                                (data as Data)?.courseAttendanceSheet[0]
                                  ?.lessonSession as unknown as LessonSession
                              );
                              setParticipateSlug?.((data as Data)?.slug);
                              breakTimeModal?.openModal();
                              toggleCardForMenu(index);
                            }}
                            parentClass="h-fit"
                            className="profile-item "
                          >
                            <div className="flex w-5 h-5">
                              <Image iconName="stopwatchIcon" />
                            </div>
                            <div className="block max-w-[calc(100%_-_28px)] ps-2 w-full text-nowrap">
                              {t('Tooltip.AddBreakTime')}
                            </div>
                          </Button>
                        </>
                      ) : (
                        ''
                      )}
                      {(data as Data).courseAttendanceSheet[0]?.mark_as_absent ===
                        '0' &&
                      !(data as Data).courseAttendanceSheet[0]
                        ?.mark_as_start_signed ? (
                        <Button
                          onClickHandler={() => {
                            setAbsentData?.({
                              ...absentData,
                              course_participate_id: (data as Data)?.id,
                              course_slug: location?.slug,
                              lesson_session_id: location?.lessonSessionId,
                              mark_as_absent: true,
                              session_date: format(
                                parseISO(
                                  (data as Data)?.courseAttendanceSheet[0]
                                    ?.lessonSession?.start_time
                                ),
                                'yyyy-MM-dd'
                              ),
                            });
                            absentModal?.openModal();
                            toggleCardForMenu(index);
                          }}
                          parentClass="h-fit"
                          className="profile-item hover:!bg-red-500 !text-red-500 hover:!text-white "
                        >
                          <div className=" w-5 h-5">
                            <Image iconName="userCrossIcon" />
                          </div>
                          <div className="block max-w-[calc(100%_-_28px)] ps-2 w-full text-nowrap">
                            {t('Tooltip.absent')}
                          </div>
                        </Button>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  {lessonWiseAttendance &&
                  currDate >= subMinutes(parseISO(start_time), 30) &&
                  shouldShowButtons ? (
                    <Button
                      onClickHandler={() => toggleCardForMenu(index)}
                      className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary"
                    >
                      <Image iconName="threeDotVerticalIcon" />
                    </Button>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          {!activeIndex.includes(index) && (
            <div
              className={`${
                activeIndex.includes(index) ? '' : '-mt-7'
              }  flex flex-col gap-7`}
            >
              <div className="grid gap-y-4 grid-cols-2 1400:grid-cols-4">
                <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                  <p className="text-sm text-dark opacity-50">
                    {t('Auth.RegisterTrainer.trainerName')}
                  </p>
                  <p className="text-base text-dark">
                    {data?.first_name}&nbsp;
                    {data?.last_name}
                  </p>
                </div>
                {lessonWiseAttendance ? (
                  <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                    <p className="text-sm text-dark opacity-50">{t('absent')}</p>
                    <p
                      className={`text-base text-dark w-fit flex items-center gap-2 px-2 rounded  ${
                        (data as Data)?.courseAttendanceSheet[0]?.mark_as_absent ===
                        '0'
                          ? 'bg-green-700/20 text-green-700'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {(data as Data)?.courseAttendanceSheet[0]?.mark_as_absent ===
                      '0'
                        ? t('confirmationChoices.noOption')
                        : t('confirmationChoices.yesOption')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                    {data?.company_id === null ? (
                      <>
                        <p className="text-sm text-dark opacity-50">
                          {t('unknownCompanyName')}
                        </p>
                        <p className="text-base text-dark">
                          {(data as CourseParticipant)?.company_name}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-dark opacity-50">
                          {t('Quote.company.detail.nameTitle')}
                        </p>
                        <p className="text-base text-dark">{data?.company?.name}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                  <p className="text-sm text-dark opacity-50">
                    {t('signedManually')}
                  </p>
                  <p className="text-base text-dark">
                    {isManuallySigned ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="col-span-2 1400:col-span-4 flex flex-col gap-0.5 relative ps-5 1400:ps-0 1400:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                  <p className="text-sm text-dark opacity-50">
                    {t('Quote.company.detail.codiceFiscaleTitle')}
                  </p>
                  <p className="text-base text-dark">{data?.code}</p>
                </div>
              </div>
              {lessonWiseAttendance && (
                <div className="grid gap-y-4  grid-cols-2 1400:grid-cols-4">
                  <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                    {data?.company_id === null ? (
                      <>
                        <p className="text-sm text-dark opacity-50">
                          {t('unknownCompanyName')}
                        </p>
                        <p className="text-base text-dark">
                          {(data as CourseParticipant)?.company_name}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-dark opacity-50">
                          {t('Quote.company.detail.nameTitle')}
                        </p>
                        <p className="text-base text-dark">{data?.company?.name}</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                    <p className="text-sm text-dark opacity-50">
                      {t('sessionTimings')}
                    </p>
                    <p className="text-base text-dark">
                      {start_time ? format(parseISO(start_time), 'hh:mm aa') : ''}

                      {end_time ? (
                        <>
                          <span>-</span>
                          {format(parseISO(end_time), 'hh:mm aa')}
                        </>
                      ) : (
                        ''
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                    <p className="text-sm text-dark opacity-50">
                      {t('joinLeaveTime')}
                    </p>
                    {(data as Data)?.courseAttendanceSheet[0]
                      ?.mark_as_start_signed_at ||
                    (data as Data)?.courseAttendanceSheet[0]
                      ?.mark_as_end_signed_at ? (
                      <p className="text-base text-dark">
                        {(data as Data)?.courseAttendanceSheet[0]
                          ?.mark_as_start_signed_at
                          ? format(
                              new Date(
                                (data as Data)?.courseAttendanceSheet[0]
                                  ?.mark_as_start_signed_at as string
                              ),
                              'hh:mm aa'
                            )
                          : '-'}
                        /{' '}
                        {(data as Data)?.courseAttendanceSheet[0]
                          ?.mark_as_end_signed_at
                          ? format(
                              new Date(
                                (data as Data)?.courseAttendanceSheet[0]
                                  ?.mark_as_end_signed_at as string
                              ),
                              'hh:mm aa'
                            )
                          : '-'}
                      </p>
                    ) : (
                      <p className="text-base text-dark">-</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 relative ps-5 1400:first:ps-0 1400:first:before:hidden before:absolute before:content-[''] before:h-[80%] before:w-px before:top-0 before:bottom-0 before:my-auto before:bg-dark/10 before:left-0">
                    <p className="text-sm text-dark opacity-50">{t('breakTimes')}</p>
                    <div className="flex gap-3">
                      {(data as Data)?.courseAttendanceLog?.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {(data as Data)?.courseAttendanceLog.map(
                            (attendanceLog, attendanceIndex) => (
                              <div key={attendanceLog.id} className="flex gap-3">
                                {attendanceLog.break_out ? (
                                  <>
                                    <p className="text-base text-dark">
                                      {format(
                                        parseISO(attendanceLog?.break_in as string),
                                        'hh:mm a'
                                      )}
                                    </p>
                                    <span>-</span>
                                    <p className="text-base text-dark">
                                      {format(
                                        parseISO(attendanceLog?.break_out),
                                        'hh:mm a'
                                      )}
                                    </p>
                                    {lessonWiseAttendance ? (
                                      <Button
                                        className={`${
                                          index === 0
                                            ? 'action-button red-btn relative group '
                                            : ''
                                        } deleteIconBreakCard dangerBorder button`}
                                        onClickHandler={() => {
                                          deleteModal.openModal();
                                        }}
                                      >
                                        <Image
                                          iconName="deleteIcon"
                                          iconClassName="w-full h-full"
                                        />
                                      </Button>
                                    ) : (
                                      ''
                                    )}
                                    <ConfirmationPopup
                                      modal={deleteModal}
                                      bodyText="something"
                                      variants="primary"
                                      confirmButtonText={t('Button.deleteButton')}
                                      confirmButtonVariant="danger"
                                      deleteTitle={t('Button.deleteTitle')}
                                      cancelButtonText={t('Button.cancelButton')}
                                      cancelButtonFunction={deleteModal.closeModal}
                                      confirmButtonFunction={() =>
                                        handleDelete(
                                          (data as Data).courseAttendanceLog[
                                            attendanceIndex
                                          ]?.slug
                                        )
                                      }
                                    />
                                  </>
                                ) : (
                                  ''
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!lessonWiseAttendance ? renderAttendanceSignButton() : ''}
              {lessonWiseAttendance && showSessionWiseAttendance
                ? renderAttendanceSignButton()
                : ''}
            </div>
          )}
        </div>
      </CustomCard>
    </div>
  );
};

export default AttendanceCard;
