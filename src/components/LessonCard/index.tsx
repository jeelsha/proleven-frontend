import { format, parseISO, setHours, setMinutes } from 'date-fns';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { CustomTimePicker } from 'components/TimePicker';
import BreakTimeModal from './BreakTimeModal';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** axios hooks **
import { useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';

// ** redux-slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

// ** types **
import { LessonSessionTimeSheet } from 'modules/Courses/types';
import { LessonCardProps } from './types';

// ** Helpers
import { isCurrentTimeGreaterThanGivenTime } from 'modules/Courses/helper/CourseCommon';
import { convertDateToUTCISOString } from 'utils/date';
import { REACT_APP_DATE_FORMAT } from 'config';

const getLessonCardVariant = (variant: string) => {
  switch (variant) {
    case 'red':
      return 'border-red-500';
    case 'secondary':
      return 'border-secondary';
    case 'orange':
      return 'border-orange2';
    default:
      return 'border-orange2';
  }
};

const LessonCard = ({
  variants,
  lessonSessionData,
  participateSlug,
  participateId,
  course,
  refetch,
  mark_as_signed,
}: LessonCardProps) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const [addMainAttendance] = useAxiosPut();

  const breakTimeModal = useModal();
  const earlyLeaveModal = useModal();
  const lateArrivalModal = useModal();

  const dateFormat = REACT_APP_DATE_FORMAT as string;

  const {
    lessonSession: data,
    mark_as_start_signed_at,
    mark_as_end_signed_at,
  } = lessonSessionData || {};
  const isSigned =
    mark_as_signed?.mark_as_start_signed && mark_as_signed?.mark_as_end_signed;

  const initialValues = {
    course_slug: '',
    course_participate_id: '',
    lesson_session_id: '',
    set_early_leave: '',
    set_early_arrival: '',
  };

  const [absentData, setAbsentData] = useState<{ [key: string]: unknown }>(
    initialValues
  );

  const onSetLateArrival = async (time: string) => {
    const [hour, minute] = time.split(':');
    const dateToSet = parseISO(absentData.session_date as string);
    const timeToSet = setMinutes(setHours(dateToSet, Number(hour)), Number(minute));
    const apiData = {
      set_early_arrival: convertDateToUTCISOString(timeToSet),
      course_participate_id: absentData.course_participate_id,
      course_slug: absentData.course_slug,
      lesson_session_id: absentData.lesson_session_id,
    };

    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      apiData
    );
    if (!error) setAbsentData({});

    refetch?.();
  };

  const onSetEarlyLeave = async (time: string) => {
    const [hour, minute] = time.split(':');
    const dateToSet = parseISO(absentData.session_date as string);
    const timeToSet = setMinutes(setHours(dateToSet, Number(hour)), Number(minute));
    const apiData = {
      set_early_leave: convertDateToUTCISOString(timeToSet),
      course_participate_id: absentData.course_participate_id,
      course_slug: absentData.course_slug,
      lesson_session_id: absentData.lesson_session_id,
    };

    const { error } = await addMainAttendance(
      '/trainer/courses/attendance-sheet/assign',
      apiData
    );
    if (!error) setAbsentData({});

    refetch?.();
  };

  const handleAbsentData = (data: LessonSessionTimeSheet, type: string) => {
    if (data) {
      setAbsentData({
        ...absentData,
        course_participate_id: participateId,
        course_slug: course?.slug,
        lesson_session_id: data?.id,
        starTime: format(parseISO(data?.start_time ?? ''), 'yyyy-MM-dd hh:mm a'),
        endTime: format(parseISO(data?.end_time ?? ''), 'yyyy-MM-dd hh:mm a'),
        session_date:
          type === 'early'
            ? format(parseISO(data?.end_time ?? ''), 'yyyy-MM-dd')
            : format(parseISO(data?.start_time ?? ''), 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <>
      <div
        className={`bg-white border-l-[3px] border-solid py-7 px-5 ${
          variants ? getLessonCardVariant(variants) : 'border-gray-400'
        }`}
      >
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Meeting Date  */}
          <div className="flex flex-col gap-3">
            <Button className="text-sm text-dark opacity-50">
              {t('lessonCard.meetingDate')}
            </Button>
            <p className="text-sm text-dark">
              {data?.start_time
                ? `${format(parseISO(data?.start_time), dateFormat)}`
                : ''}
            </p>
          </div>
          {/* Meeting Time  */}
          <div className="flex flex-col gap-3">
            <Button className="text-sm text-dark opacity-50">
              {t('lessonCard.meetingTime')}
            </Button>
            <p className="text-sm text-dark">
              {data?.start_time
                ? `${format(parseISO(data?.start_time), 'hh:mm a')}`
                : ''}
              -
              {data?.end_time
                ? `${format(parseISO(data?.end_time), 'hh:mm a')}`
                : ''}
            </p>
          </div>
          {/* JOINING TIME */}
          <div className="flex flex-col gap-3">
            <Button className="text-sm text-dark opacity-50">
              {t('lessonCard.joiningTime')}
            </Button>
            <p className="text-sm text-dark">
              {mark_as_start_signed_at
                ? `${format(parseISO(mark_as_start_signed_at), 'hh:mm a')}`
                : '-'}
            </p>
          </div>
          {/* LEAVE TIME */}
          <div className="flex flex-col gap-3">
            <Button className="text-sm text-dark opacity-50">
              {t('lessonCard.LeaveTime')}
            </Button>
            <p className="text-sm text-dark">
              {mark_as_end_signed_at
                ? `${format(parseISO(mark_as_end_signed_at), 'hh:mm a')}`
                : '-'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="text-sm text-dark opacity-50">
              {t('lessonCard.attendance')}
            </Button>
            <p className="text-sm text-dark">
              {data?.sessionAttendance ? `${data?.sessionAttendance}%` : '0%'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="text-sm text-dark opacity-50">
              Signature Status
            </Button>
            <p className="text-sm text-dark">
              {isSigned
                ? t('companyCard.signedText')
                : t('companyCard.unSignedText')}
            </p>
          </div>
        </div>
        {!isSigned &&
          data?.start_time &&
          isCurrentTimeGreaterThanGivenTime(data?.start_time) &&
          (user?.role_name === ROLES.Admin ||
            user?.role_name === ROLES.TrainingSpecialist) && (
            <div className="flex items-center flex-wrap gap-3">
              <Button
                onClickHandler={() => {
                  handleAbsentData(data as LessonSessionTimeSheet, 'late');
                  lateArrivalModal.openModal();
                }}
                variants="primaryBordered"
                className="gap-1"
              >
                <Image iconName="clockIcon" iconClassName="w-5 h-5" />
                {t('Tooltip.lateArrival')}
              </Button>
              <Button
                onClickHandler={() => {
                  handleAbsentData(data as LessonSessionTimeSheet, 'early');
                  earlyLeaveModal.openModal();
                }}
                variants="secondaryBordered"
                className="gap-1"
              >
                <Image iconName="stopwatchIcon" iconClassName="w-5 h-5" />
                {t('Tooltip.earlyLeave')}
              </Button>
              <Button
                onClickHandler={() => breakTimeModal.openModal()}
                variants="primaryBordered"
                className="gap-1"
              >
                <Image iconName="stopwatchIcon" iconClassName="w-5 h-5" />
                {t('Tooltip.breakTime')}
              </Button>
            </div>
          )}
      </div>
      {!_.isEmpty(data?.courseAttendanceLog) && (
        <div className="bg-white border-l-[3px] border-solid py-7 px-5 border-orange2">
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex flex-col gap-3">
              <Button className="text-sm text-dark opacity-50">
                {t('lessonCard.meetingDateTime')}
              </Button>
              <p className="text-sm text-dark">
                {data?.start_time
                  ? `${format(parseISO(data?.start_time), dateFormat)}`
                  : ''}
                -
                {data?.end_time
                  ? `${format(parseISO(data?.end_time), 'hh:mm a')}`
                  : ''}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="text-sm text-dark opacity-50">
                {t('breakTimeModal.datePicker.StartTimeLabel')}
              </Button>
              {data?.courseAttendanceLog.map((attendanceLog) => {
                return attendanceLog?.break_in && attendanceLog?.break_out ? (
                  <p key={attendanceLog.id} className="text-sm text-dark">
                    {attendanceLog?.break_in
                      ? format(parseISO(attendanceLog?.break_in), 'hh:mm a')
                      : ''}
                  </p>
                ) : (
                  ''
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              <Button className="text-sm text-dark opacity-50">
                {t('breakTimeModal.datePicker.EndTimeLabel')}
              </Button>
              {data?.courseAttendanceLog.map((attendanceLog) => {
                return attendanceLog?.break_in && attendanceLog?.break_out ? (
                  <p key={attendanceLog.id + 1} className="text-sm text-dark">
                    {attendanceLog?.break_out
                      ? format(parseISO(attendanceLog?.break_out), 'hh:mm a')
                      : ''}
                  </p>
                ) : (
                  ''
                );
              })}
            </div>
          </div>
        </div>
      )}
      {breakTimeModal.isOpen && (
        <BreakTimeModal
          refetch={refetch}
          breakTimeModal={breakTimeModal}
          data={data}
          participateSlug={participateSlug}
        />
      )}
      {lateArrivalModal.isOpen && (
        <CustomTimePicker
          modal={lateArrivalModal}
          onSubmit={onSetLateArrival}
          title={t('Tooltip.lateArrival')}
          startTime={(absentData?.starTime as string) ?? ''}
          endTime={(absentData?.endTime as string) ?? ''}
          customTime={{
            hour:
              new Date(absentData?.starTime as string).getHours() ??
              new Date().getHours(),
            minute:
              new Date(absentData?.starTime as string).getMinutes() ??
              new Date().getMinutes(),
          }}
        />
      )}
      {earlyLeaveModal.isOpen && (
        <CustomTimePicker
          modal={earlyLeaveModal}
          onSubmit={onSetEarlyLeave}
          startTime={(absentData?.starTime as string) ?? ''}
          endTime={(absentData?.endTime as string) ?? ''}
          customTime={{
            hour:
              new Date(absentData?.endTime as string).getHours() ??
              new Date().getHours(),
            minute:
              new Date(absentData?.endTime as string).getMinutes() ??
              new Date().getMinutes(),
          }}
          title={t('Tooltip.earlyLeave')}
        />
      )}
    </>
  );
};

export default LessonCard;
