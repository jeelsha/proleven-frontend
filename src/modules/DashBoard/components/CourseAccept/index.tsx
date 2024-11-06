import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import ErrorMessage from 'components/FormElement/ErrorMessage';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import { Form, Formik, FormikValues } from 'formik';
import { UserModalType } from 'hooks/types';
import { useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { TFunction } from 'i18next';
import _ from 'lodash';
import { AssignedStatus, CourseModeEnum } from 'modules/Courses/Constants';
import { getStatusClass } from 'modules/Courses/pages/AdminTrainerRequest/SessionCard';
import { CourseResponse } from 'modules/Courses/types';
import { CourseBundleInterfaceData } from 'modules/Courses/types/TemplateBundle';
import { ICourseAccept, LessonSessionApproval } from 'modules/EmailTemplate/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SetFieldValue } from 'types/common';
import { formatCurrency, getCurrencySymbol } from 'utils';
import RejectModal from '../CourseInvitation/RejectModal';
import { CourseAcceptSchema } from './validation';

type modalProps = {
  modal: UserModalType;
  refetchTrainers: () => void;
  bundleSlug?: string;
  bundleId?: number;
  refetch?: () => void;
  viewModeOnly?: boolean;
};
const CourseAcceptModal = ({
  modal,
  refetchTrainers,
  bundleSlug,
  bundleId,
  refetch,
  viewModeOnly = false,
}: modalProps) => {
  const { t } = useTranslation();
  const rejectModal = useModal();
  const data = modal?.modalData as CourseResponse;
  const [course, setCourse] = useState<ICourseAccept>();
  const [showReimbursementFees, setShowReimbursementFees] = useState('');
  const [slug, setSlug] = useState<{
    course_slug: string;
    course_bundle_id: number | null;
  }>({
    course_slug: '',
    course_bundle_id: 0,
  });
  const [updateCourseApi, { isLoading: isSubmitLoading }] = useAxiosPut();
  const [acceptCourse, { isLoading: acceptCourseLoader }] = useAxiosPut();

  const initialValue = !_.isEmpty(course?.lessonSessionApproval)
    ? (course?.lessonSessionApproval ?? []).reduce((acc, item, index) => {
        acc[index] = item?.lessonSessions?.slug ? item.lessonSessions.slug : '';
        return acc;
      }, {} as Record<number | string, string>)
    : (course?.sessions ?? []).reduce((acc, item, index) => {
        acc[index] = item?.slug ? item.slug : '';
        return acc;
      }, {} as Record<number | string, string>);
  initialValue.trainer_error = '';

  const apiUrl = !bundleSlug
    ? '/trainer/courses/invites'
    : '/trainer/courses/bundle/invites';
  const { response, isLoading } = useQueryGetFunction(apiUrl, {
    option: {
      profile: true,
      ...(data?.slug ? { course_slug: data?.slug } : {}),
      ...(bundleSlug ? { course_bundle_slug: bundleSlug } : {}),
      ...(bundleSlug ? { course_bundle_id: bundleId } : {}),
      // ...(!bundleSlug ? { trainer_accept_view: true } : {}),
      ...(viewModeOnly ? { processedInvitation: true } : {}),
      ...(viewModeOnly && bundleSlug ? { allBundleInvitation: true } : {}),
    },
  });
  useEffect(() => {
    if (response?.data) {
      setCourse(response?.data);
    }
  }, [response?.data]);

  const handleChange = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: SetFieldValue,
    index: number
  ) => {
    if (checkData.target.checked) {
      setFieldValue(
        String(index),
        !_.isEmpty(course?.lessonSessionApproval)
          ? course?.lessonSessionApproval?.[index]?.lessonSessions?.slug
          : course?.sessions?.[index]?.slug
      );
    } else {
      setFieldValue(String(index), '');
    }
  };

  const OnSubmit = async (value: FormikValues) => {
    delete value.trainer_error;
    const selectedSessions = Object.values(value).filter((value) => value !== '');
    const temp: { [key: string]: unknown } = {
      course_slug: data?.slug,
      accept_entire_course: !(course && course?.sessions?.length > 0),
      lesson_session_slugs: selectedSessions,
    };
    if (course?.course_bundle_id) {
      temp.course_bundle_id = course?.course_bundle_id;
    }
    const { error } = await updateCourseApi('/trainer/courses/invites/accept', temp);
    if (!error) {
      modal?.closeModal();
      refetchTrainers();
    }
  };

  const onAccept = async () => {
    const temp = {
      course_bundle_id: bundleId,
      accept_entire_bundle: true,
    };
    const { error } = await acceptCourse('/trainer/bundle/invites/accept', temp);
    if (!error) {
      modal?.closeModal();
      refetch?.();
    }
  };
  const renderDates = (
    startDate: string | number | Date | undefined,
    endDate: string | number | Date | undefined
  ) => (
    <p className="text-sm font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap">
      <Image
        iconName="calendarCheckIcon"
        iconClassName="w-[18px] h-[18px] inline-block me-1.5"
      />
      {startDate ? format(new Date(startDate), REACT_APP_DATE_FORMAT as string) : ''}{' '}
      - {endDate ? format(new Date(endDate), REACT_APP_DATE_FORMAT as string) : ''}
    </p>
  );
  const renderAddress = () => {
    let trainerAddress;

    if (data?.academy_id) {
      trainerAddress = data?.academy?.location;
    } else {
      trainerAddress = data?.lessonSessionApproval[0]?.lessons?.location;
    }

    return (
      <p className="text-sm font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap gap-3">
        <Image
          iconName="locationIcon"
          iconClassName="w-[18px] h-[18px] inline-block"
        />
        {trainerAddress || 'Address not available'}
      </p>
    );
  };

  const renderBundleAddress = (responseData: CourseBundleInterfaceData[]) => {
    const trainerAddress = responseData?.[0]?.courses?.academy?.location;

    return (
      <p className="text-sm font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap gap-3">
        <Image
          iconName="locationIcon"
          iconClassName="w-[18px] h-[18px] inline-block"
        />
        {trainerAddress || 'Address not available'}
      </p>
    );
  };

  const renderSessionTime = (
    startTime: string | number | Date,
    endTime: string | number | Date
  ) => (
    <>
      <p className="text-sm font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap gap-3">
        <Image
          iconName="calendarCheckIcon"
          iconClassName="w-[18px] h-[18px] inline-block"
        />
        <span>
          {startTime
            ? format(new Date(startTime), REACT_APP_DATE_FORMAT as string)
            : ''}
        </span>
      </p>
      <p className="text-sm font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap gap-3">
        <Image iconName="clockIcon" iconClassName="w-[18px] h-[18px] inline-block" />
        <span>
          {startTime ? format(new Date(startTime), 'hh:mm a') : ''} -{' '}
          {endTime ? format(new Date(endTime), 'hh:mm a') : ''}
        </span>
      </p>
    </>
  );

  const renderHourlyRateDetails = (item: LessonSessionApproval) => (
    <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
      <p className="text-sm text-primary font-medium mb-2 block">
        {t('UserManagement.addEditUser.hourlyRate')} :
      </p>
      <div className="flex gap-7">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">{t('trainer.hours')}</p>
          <span className="text-sm text-dark font-bold">{item?.hours}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">
            {t('CoursesManagement.CreateCourse.price')}
          </p>
          <span className="text-sm text-dark font-bold">
            {getCurrencySymbol('EUR')}{' '}
            {formatCurrency(Number(item?.trainerHourlyCharge ?? 0), 'EUR')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">{t('totalPrice')}</p>
          <span className="text-sm text-dark font-bold">
            {' '}
            {getCurrencySymbol('EUR')}{' '}
            {formatCurrency(Number(item?.hourlyRate ?? 0), 'EUR')}
          </span>
        </div>
      </div>
    </div>
  );

  const renderReimbursementFees = (item: LessonSessionApproval) => (
    <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
      <p className="text-sm text-primary font-medium mb-2 block">
        {t('reimbursementFees')} :
      </p>
      <div className="flex gap-7">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">{t('Payment.days')}</p>
          <span className="text-sm text-dark font-bold">{item?.totalDays}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">KM</p>
          <span className="text-sm text-dark font-bold">{item?.totalDistance}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">
            {t('CoursesManagement.CreateCourse.price')}
          </p>
          <span className="text-sm text-dark font-bold">
            {getCurrencySymbol('EUR')}{' '}
            {formatCurrency(Number(item?.travelFees ?? 0), 'EUR')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-dark/70 font-medium">
            {t('trainer.totalFees')}
          </p>
          <span className="text-sm text-dark font-bold">
            {getCurrencySymbol('EUR')}{' '}
            {formatCurrency(Number(item?.totalTravelFees), 'EUR')}
          </span>
        </div>
      </div>
    </div>
  );

  const renderNetTotal = (netTotal: number | string) => (
    <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0 ml-auto">
      <span className="text-sm text-primary font-medium mb-0 block">
        {t('wholeCourse')}
      </span>
      <p className="text-sm text-primary font-medium mb-2 block">
        {t('netTotal')} :
      </p>
      <div className="flex gap-7">
        <div className="flex flex-col gap-1">
          <span className="text-xl text-dark font-bold">
            {getCurrencySymbol('EUR')} {formatCurrency(Number(netTotal ?? 0), 'EUR')}
          </span>
        </div>
      </div>
    </div>
  );

  const renderLumpsumDetails = (item: LessonSessionApproval) => (
    <div className="flex flex-wrap gap-12">
      <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
        <p className="text-sm text-primary font-medium mb-2 block">
          {t('lumpsumpDetails')}
        </p>
        <div className="flex gap-7">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-dark/70 font-medium">{t('amount')}</p>
            <span className="text-sm text-dark font-bold">
              {' '}
              {getCurrencySymbol('EUR')}{' '}
              {formatCurrency(Number(item?.amount ?? 0), 'EUR')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-dark/70 font-medium">
              {t('reimbursementFees')}
            </p>
            <span className="text-sm text-dark font-bold">
              {getCurrencySymbol('EUR')}{' '}
              {formatCurrency(Number(item?.reimbursement_amount ?? 0), 'EUR')}
            </span>
          </div>
        </div>
      </div>
      {renderNetTotal(
        item?.amount
          ? item?.reimbursement_amount
            ? (item.amount + item.reimbursement_amount).toFixed(2)
            : item?.amount.toFixed(2)
          : item?.reimbursement_amount
          ? item?.reimbursement_amount.toFixed(2)
          : '0:00'
      )}
    </div>
  );

  const renderDefaultDetails = (item: LessonSessionApproval) => (
    <div className="flex flex-wrap gap-12">
      {renderHourlyRateDetails(item)}
      {item?.lesson_session_id === null || showReimbursementFees === `${item?.id}`
        ? renderReimbursementFees(item)
        : ''}
      {item?.lesson_session_id === null ? renderNetTotal(item?.totalNetFees) : ''}
    </div>
  );

  const renderDetails = (item: LessonSessionApproval) => {
    if (item?.is_lumpsum_select) {
      if (item?.lesson_session_id === null) {
        return renderLumpsumDetails(item);
      }
      return renderDefaultDetails(item);
    }
    return renderDefaultDetails(item);
  };

  const renderNotes = () => {
    return (
      <div>
        <p className="my-2 font-medium">{t('SendMail.Notes')}</p>

        <div className="flex gap-1.5 items-start">
          <Image
            iconName="checkRoundIcon2"
            iconClassName="w-4 h-4 flex-shrink-0 mt-1 text-grayText"
          />
          <p className="text-dark">{t('trainerNote1')}</p>
        </div>
        <div className="flex gap-1.5 items-start">
          <Image
            iconName="checkRoundIcon2"
            iconClassName="w-4 h-4 text-grayText mt-1"
          />
          <p className="text-dark">{t('trainerNote2')}</p>
        </div>
      </div>
    );
  };

  const getCourseAcceptanceText = (
    sessionApproval: LessonSessionApproval | undefined,
    t: TFunction<'translation', undefined>
  ) => {
    if (sessionApproval?.is_full_course) {
      return sessionApproval?.is_optional
        ? 'Accept entire course as Optional Trainer'
        : t('courseAccept.fullCourse');
    }
    return t('courseAccept.extraTrainer');
  };

  const getTotalFees = (values: Record<string, string | number>) => {
    const sessionCount = Object.values(values).filter(
      (value) => value !== ''
    ).length;
    const lessonSessionCount = course?.lessonSessionApproval?.length || 0;
    const totalFees = course?.lessonSessionApproval?.reduce(
      (acc, ls, ind) => {
        const lessonId = ls?.lessons?.id;
        if (
          lessonId &&
          values[ind] &&
          ls?.assigned_to_status !== AssignedStatus.Rejected &&
          ls?.trainer_assigned_to_status !== AssignedStatus.Rejected
        ) {
          let trainerFees = ls.hourlyRate;

          if (ls?.lessonSessions?.mode !== CourseModeEnum.VideoConference) {
            if (!acc.lessonIdsSet.has(lessonId)) {
              trainerFees += ls.totalTravelFees;
              acc.lessonIdsSet.add(lessonId);
            }
          }

          acc.total += trainerFees;
        }
        return acc;
      },
      { total: 0, lessonIdsSet: new Set() }
    );
    if (sessionCount + 1 === lessonSessionCount) {
      const fullCourseTotal = course?.lessonSessionApproval?.reduce((total, ls) => {
        if (ls?.is_full_course) {
          total = Number(ls?.amount) + Number(ls?.reimbursement_amount);
        }
        return total;
      }, 0);
      if (fullCourseTotal) {
        return fullCourseTotal > 0
          ? `${getCurrencySymbol('EUR')} ${formatCurrency(fullCourseTotal, 'EUR')}`
          : '-';
      }
    }
    if (totalFees) {
      return totalFees?.total > 0
        ? `${getCurrencySymbol('EUR')} ${formatCurrency(totalFees.total, 'EUR')}`
        : `${getCurrencySymbol('EUR')} 0`;
    }
  };

  const handleShowReimbursementFees = (item: LessonSessionApproval) => {
    setShowReimbursementFees((prev) =>
      prev === `${item?.id}` ? '' : `${item?.id}`
    );
  };

  const amount = response?.data?.data?.[0]?.amount ?? 0;
  const reimbursementAmount = response?.data?.data?.[0]?.reimbursement_amount ?? 0;
  const total = (amount + reimbursementAmount).toFixed(2);
  const sessionApproval = course?.lessonSessionApproval?.[0];

  return (
    <Modal
      modal={modal}
      headerTitle={viewModeOnly ? t('invitationStatus') : t('AcceptCourse')}
    >
      <>
        {!bundleSlug && (
          <Formik
            enableReinitialize
            initialValues={initialValue}
            validationSchema={CourseAcceptSchema()}
            onSubmit={(data) => OnSubmit(data)}
          >
            {({ values, setFieldValue }) => (
              <Form className="flex flex-col gap-4">
                {isLoading ? (
                  <>
                    <div className="lazy h-6 w-[270px]" />
                    <div className="lazy p-4 h-12 w-full" />
                    <div className="lazy h-[150px] w-full ps-4 pe-10" />
                    <div className="lazy h-[150px] w-full ps-4 pe-10" />
                    <div>
                      <p className="lazy h-5 w-[250px] my-2" />
                      <p className="lazy h-5 w-[300px] my-2" />
                      <p className="lazy h-5 w-2/3 my-2" />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-navText text-sm">
                      {getCourseAcceptanceText(sessionApproval, t)}
                    </p>
                    {course?.lessonSessionApproval?.[0]?.trainerRequest?.note ? (
                      <div className="p-4 rounded-lg border border-dashed border-green3 text-[14px] bg-green3/10 text-green-800">
                        <p>
                          <strong className="text-green-800">
                            {t('Quote.note.title')}:{' '}
                          </strong>
                          {course?.lessonSessionApproval?.[0]?.trainerRequest?.note}
                        </p>
                      </div>
                    ) : (
                      ''
                    )}

                    {(course?.lessonSessionApproval ?? []).map((item, index) => {
                      return (
                        <div
                          key={`Session_${index + 1}`}
                          className="bg-primaryLight ps-4 rounded-xl pe-10"
                        >
                          <div className="flex items-center py-4">
                            <div className="w-[78px] h-[58px] rounded-xl">
                              {item?.lesson_session_id === null ? (
                                <Image
                                  src={course?.image}
                                  width={100}
                                  height={100}
                                  imgClassName="w-full h-full object-cover rounded-lg"
                                  serverPath
                                />
                              ) : (
                                <div className="icons text-lg font-bold w-14 h-14 rounded-full flex items-center justify-center bg-secondary/30">
                                  <Image iconName="bookOpenIcon" />
                                </div>
                              )}
                            </div>
                            <div className="w-full max-w-[calc(100%_-_100px)] ps-4">
                              <div className="flex flex-col gap-3 w-full">
                                <div className="flex items-center gap-2">
                                  <p className="text-base text-blacktheme font-semibold line-clamp-1">
                                    {item?.lesson_session_id === null
                                      ? course?.title
                                      : `${t(
                                          'Calendar.eventDetails.sessionTitle'
                                        )}`}{' '}
                                  </p>
                                  {item?.lesson_session_id !== null && (
                                    <>
                                      <span className="w-1 h-1 bg-secondary rounded-full" />
                                      <p className="text-base text-blacktheme font-normal line-clamp-1">
                                        {item?.lessons?.title}
                                      </p>
                                    </>
                                  )}

                                  {item?.lesson_session_id !== null ? (
                                    <Button
                                      className="border border-primary text-[10px] rounded-full p-1 secondary leading-none"
                                      tooltipText={t(
                                        'Trainer.showReimbursementFees'
                                      )}
                                      onClickHandler={() =>
                                        handleShowReimbursementFees(item)
                                      }
                                    >
                                      <Image
                                        iconName="eyeIcon"
                                        iconClassName=" w-3 h-3"
                                        width={24}
                                        height={24}
                                      />
                                    </Button>
                                  ) : (
                                    ''
                                  )}
                                </div>
                                {item?.lesson_session_id === null
                                  ? renderDates(course?.start_date, course?.end_date)
                                  : renderSessionTime(
                                      item?.lessonSessions?.start_time,
                                      item?.lessonSessions?.end_time
                                    )}
                                {renderAddress()}
                                {viewModeOnly &&
                                  item?.trainer_assigned_to_status && (
                                    <div className="flex gap-2 bg-primary/[0.03] px-2.5 py-1.5 rounded-md">
                                      <p className="text-sm font-medium leading-4 text-dark flex items-center whitespace-nowrap">
                                        {t('trainerResponse')}:
                                      </p>
                                      <StatusLabel
                                        variants={getStatusClass(
                                          item?.trainer_assigned_to_status
                                        )}
                                        text={t(
                                          `trainerAccept.Status.${item?.trainer_assigned_to_status}`
                                        )}
                                        className="!h-fit"
                                      />
                                    </div>
                                  )}
                                {viewModeOnly && item?.assigned_to_status && (
                                  <div className="flex gap-2 bg-primary/[0.03] px-2.5 py-1.5 rounded-md">
                                    <p className="text-sm font-medium leading-4 text-dark flex items-center whitespace-nowrap">
                                      {t('trainingSpecialistResponse')}:
                                    </p>
                                    <StatusLabel
                                      variants={getStatusClass(
                                        item?.assigned_to_status
                                      )}
                                      text={t(
                                        `trainerAccept.Status.${item?.assigned_to_status}`
                                      )}
                                      className="!h-fit"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {item?.lesson_session_id &&
                            !viewModeOnly &&
                            item.trainer_assigned_to_status !==
                              AssignedStatus.Accepted ? (
                              <Checkbox
                                check={!!(!item?.lesson_session_id || values[index])}
                                name={`${index}`}
                                onChange={(checkData) => {
                                  if (values) {
                                    handleChange(checkData, setFieldValue, index);
                                  }
                                }}
                                parentClass="ms-auto"
                                disabled={
                                  !item?.lesson_session_id || item?.is_optional
                                }
                              />
                            ) : (
                              ''
                            )}
                          </div>
                          <div className="border-t border-solid border-dark/20 pt-5 pb-4">
                            {renderDetails(item)}
                          </div>
                        </div>
                      );
                    })}
                    {course && (course?.sessions ?? []).length > 0 && (
                      <div className="flex flex-col gap-2">
                        {course?.sessions?.map((item, index) => {
                          return (
                            <>
                              <div
                                key={`SessionValue_${index + 1}`}
                                className="bg-primaryLight ps-4 pe-10 py-4 rounded-xl flex items-center"
                              >
                                <div className="icons text-lg font-bold w-14 h-14 rounded-full text-black flex items-center justify-center bg-secondary/30">
                                  {`S${index + 1}`}
                                </div>

                                <div className="w-full max-w-[calc(100%_-_90px)] ps-4">
                                  <h3 className="text-sm text-blacktheme font-bold mb-2">
                                    <Button className="text-current">
                                      {t('Calendar.eventDetails.sessionTitle')}
                                      &nbsp;{index + 1}
                                    </Button>
                                    <Button className="text-current text-secondary text-[80%] inline-block mx-2.5">
                                      &bull;
                                    </Button>
                                    <Button className="text-current font-medium">
                                      {item?.lessonTitle}
                                    </Button>
                                  </h3>
                                  <p className="text-xs font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap">
                                    <Image
                                      iconName="calendarIcon2"
                                      iconClassName="  w-[18px] h-[18px] inline-block me-1.5"
                                    />
                                    {(item as unknown as CourseResponse)
                                      ? format(
                                          new Date(item?.start_time),
                                          `${
                                            REACT_APP_DATE_FORMAT as string
                                          } hh:mm a`
                                        )
                                      : ''}
                                    &nbsp;-&nbsp;
                                    {(item as unknown as CourseResponse)
                                      ? format(
                                          new Date(item?.end_time),
                                          `${
                                            REACT_APP_DATE_FORMAT as string
                                          } hh:mm a`
                                        )
                                      : ''}
                                  </p>
                                </div>
                                {viewModeOnly &&
                                  item?.trainer_assigned_to_status && (
                                    <div className="flex ">
                                      <p className="text-sm font-medium leading-4 text-dark/50  flex items-center whitespace-nowrap">
                                        {t('trainerResponse')}:{' '}
                                      </p>
                                      <StatusLabel
                                        variants={getStatusClass(
                                          item?.trainer_assigned_to_status
                                        )}
                                        text={t(
                                          `trainerAccept.Status.${item?.trainer_assigned_to_status}`
                                        )}
                                        className="h-fit"
                                      />
                                    </div>
                                  )}
                                {viewModeOnly && item?.assigned_to_status && (
                                  <div className="flex ">
                                    <p className="text-sm font-medium leading-4 text-dark/50  flex items-center whitespace-nowrap">
                                      {t('trainingSpecialistResponse')}:{' '}
                                    </p>
                                    <StatusLabel
                                      variants={getStatusClass(
                                        item?.assigned_to_status
                                      )}
                                      text={t(
                                        `trainerAccept.Status.${item?.assigned_to_status}`
                                      )}
                                      className="h-fit"
                                    />
                                  </div>
                                )}

                                {!viewModeOnly && (
                                  <Checkbox
                                    check={!!values[index]}
                                    name={`${index}`}
                                    onChange={(checkData) => {
                                      if (values) {
                                        handleChange(
                                          checkData,
                                          setFieldValue,
                                          index
                                        );
                                      }
                                    }}
                                    parentClass="ms-auto"
                                  />
                                )}
                              </div>
                              <div className="border-t border-solid border-dark/20 pt-5 pb-4">
                                {course?.course_bundle_id
                                  ? renderDetails(item.lessonSessionApproval[0])
                                  : ''}
                              </div>
                            </>
                          );
                        })}
                      </div>
                    )}

                    <ErrorMessage name="trainer_error" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-primary font-medium block">
                        {t('trainer.totalFees')} :
                      </span>
                      <span className="text-xl text-dark font-bold">
                        {getTotalFees(values)}
                      </span>
                    </div>

                    {!bundleSlug && !viewModeOnly && renderNotes()}
                    {!viewModeOnly && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variants="danger"
                          className="min-w-[140px]"
                          onClickHandler={() => {
                            setSlug({
                              course_slug: data?.slug,
                              course_bundle_id: data?.course_bundle_id
                                ? Number(data?.course_bundle_id)
                                : null,
                            });
                            rejectModal.openModal();
                          }}
                        >
                          {t('CompanyManager.trackCourse.modal.rejectTitle')}
                        </Button>
                        <Button
                          type="submit"
                          isLoading={isSubmitLoading}
                          disabled={isSubmitLoading}
                          variants="green"
                          className="min-w-[140px]"
                        >
                          {t('CompanyManager.trackCourse.modal.acceptTitle')}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Form>
            )}
          </Formik>
        )}
        {bundleSlug && (
          <>
            {isLoading ? (
              <div className="flex flex-col gap-4">
                <div className="lazy h-6 w-[270px]" />
                <div className="lazy p-4 h-12 w-full" />
                <div className="lazy h-[100px] w-full ps-4 pe-10" />
              </div>
            ) : (
              <>
                <div className="bg-primaryLight ps-4 rounded-xl pe-10">
                  <div>
                    {response?.data?.data?.[0]?.trainerRequest?.note ? (
                      <div className="p-4 rounded-lg border border-dashed border-green3 text-[14px] bg-green3/10 text-green-800">
                        <p>
                          <strong className="text-green-800">
                            {t('Quote.note.title')}:{' '}
                          </strong>
                          {response?.data?.data[0]?.trainerRequest?.note}
                        </p>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="flex items-center py-4">
                    <div className="w-full ps-4">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <p className="text-base text-blacktheme font-semibold line-clamp-1">
                            {response?.data?.data?.[0]?.course_bundle?.title}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-5 w-full">
                          <div>{renderBundleAddress(response?.data?.data)}</div>
                          <div>
                            {renderDates(
                              response?.data?.data?.[0]?.course_bundle?.start_date,
                              response?.data?.data?.[0]?.course_bundle?.end_date
                            )}
                            {viewModeOnly &&
                              response?.data?.data?.[0]
                                ?.trainer_assigned_to_status && (
                                <div className="my-4 flex gap-2 bg-primary/[0.03] px-2.5 py-1.5 rounded-md">
                                  <p className="text-sm font-medium leading-4 text-dark/50  flex items-center whitespace-nowrap">
                                    {t('trainerResponse')}:
                                  </p>
                                  <StatusLabel
                                    variants={getStatusClass(
                                      response?.data?.data?.[0]
                                        ?.trainer_assigned_to_status
                                    )}
                                    text={t(
                                      `trainerAccept.Status.${response?.data?.data?.[0]?.trainer_assigned_to_status}`
                                    )}
                                    className="!h-fit"
                                  />
                                </div>
                              )}
                            {viewModeOnly &&
                              response?.data?.data?.[0]?.assigned_to_status && (
                                <div className="my-4 flex gap-2 bg-primary/[0.03] px-2.5 py-1.5 rounded-md">
                                  <p className="text-sm font-medium leading-4 text-dark/50  flex items-center whitespace-nowrap">
                                    {t('trainingSpecialistResponse')}:{' '}
                                  </p>
                                  <StatusLabel
                                    variants={getStatusClass(
                                      response?.data?.data?.[0]?.assigned_to_status
                                    )}
                                    text={t(
                                      `trainerAccept.Status.${response?.data?.data?.[0]?.assigned_to_status}`
                                    )}
                                    className="h-fit"
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {response?.data?.data?.[0]?.amount > 0 ? (
                    <div className="border-t border-solid border-dark/20 pt-5 pb-4">
                      <div className="flex flex-wrap gap-12">
                        <div className="w-fit relative before:absolute before:content-[''] before:-right-6 before:top-0 before:h-full before:w-px before:bg-gray-200 last:before:opacity-0">
                          <p className="text-sm text-primary font-medium mb-2 block">
                            {t('lumpsumpDetails')}
                          </p>
                          <div className="flex gap-7">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('amount')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(response?.data?.data?.[0]?.amount ?? 0),
                                  'EUR'
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-dark/70 font-medium">
                                {t('reimbursementFees')}
                              </p>
                              <span className="text-sm text-dark font-bold">
                                {getCurrencySymbol('EUR')}{' '}
                                {formatCurrency(
                                  Number(
                                    response?.data?.data?.[0]
                                      ?.reimbursement_amount ?? 0
                                  ),
                                  'EUR'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        {renderNetTotal(total)}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-solid border-dark/20 pt-5 pb-4">
                      {renderDetails(response?.data?.data?.[0])}
                    </div>
                  )}
                </div>
                <div className="my-5 ps-4">
                  <p className="text-base text-blacktheme font-semibold line-clamp-1">
                    {t('acceptCourse.BundleSessionsTitle')} :{' '}
                  </p>
                </div>
                {bundleSlug &&
                  response?.data?.data &&
                  (response?.data?.data ?? []).length > 0 && (
                    <div className="flex flex-col gap-2">
                      {response?.data?.data
                        ?.filter(
                          (item: LessonSessionApproval) =>
                            !_.isNull(item?.lessonSessions)
                        )
                        .sort(
                          (a: LessonSessionApproval, b: LessonSessionApproval) => {
                            const dateA = new Date(
                              a?.lessonSessions?.start_time
                            ) as Date;
                            const dateB = new Date(
                              b?.lessonSessions?.start_time
                            ) as Date;
                            return dateA.getTime() - dateB.getTime(); // Ascending order
                          }
                        )
                        .map((item: LessonSessionApproval, index: number) => {
                          const updatedIndex = index + 1;
                          return (
                            <>
                              <div
                                key={`SessionValue_${updatedIndex}`}
                                className="bg-primaryLight ps-4 pe-10 py-4 rounded-xl flex items-center"
                              >
                                <div className="w-full max-w-[calc(100%_-_90px)] ps-4">
                                  <h3 className="text-sm text-blacktheme font-bold mb-2">
                                    <Button className="text-current font-medium">
                                      {item?.courses?.title}
                                      <Button className="text-current text-secondary text-[80%] inline-block mx-2.5">
                                        &bull;
                                      </Button>{' '}
                                      {item?.lessons?.title}{' '}
                                    </Button>
                                  </h3>
                                  <p className="text-xs font-medium leading-4 text-dark/50 flex items-center whitespace-nowrap">
                                    <Image
                                      iconName="calendarIcon2"
                                      iconClassName="  w-[18px] h-[18px] inline-block me-1.5"
                                    />
                                    {(item?.lessonSessions
                                      ?.start_time as unknown as CourseResponse)
                                      ? format(
                                          new Date(item?.lessonSessions?.start_time),
                                          `${REACT_APP_DATE_FORMAT as string}`
                                        )
                                      : ''}
                                    <Button className="text-current text-secondary text-[80%] inline-block mx-2.5">
                                      &bull;
                                    </Button>{' '}
                                    {(item?.lessonSessions
                                      ?.start_time as unknown as CourseResponse)
                                      ? format(
                                          new Date(item?.lessonSessions?.start_time),
                                          ` hh:mm a`
                                        )
                                      : ''}
                                    &nbsp;-&nbsp;
                                    {(item?.lessonSessions
                                      ?.end_time as unknown as CourseResponse)
                                      ? format(
                                          new Date(item?.lessonSessions?.end_time),
                                          `hh:mm a`
                                        )
                                      : ''}
                                  </p>
                                </div>
                              </div>
                            </>
                          );
                        })}
                    </div>
                  )}
                {/* {!viewModeOnly ? (
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variants="danger"
                      className="min-w-[140px]"
                      onClickHandler={() => {
                        modal?.closeModal();
                      }}
                    >
                      {t('Button.cancelButton')}
                    </Button>
                    <Button
                      onClickHandler={onAccept}
                      isLoading={acceptCourseLoader}
                      variants="green"
                      className="min-w-[140px]"
                    >
                      {t('Button.submit')}
                    </Button>
                  </div>
                ) : (
                  ''
                )} */}
                {!viewModeOnly && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variants="danger"
                      className="min-w-[140px]"
                      // isLoading={acceptCourseLoader}
                      // onClickHandler={() => {
                      //   setSlug({
                      //     course_slug: data?.slug,
                      //     course_bundle_id: data?.course_bundle_id
                      //       ? Number(data?.course_bundle_id)
                      //       : null,
                      //   });
                      //   rejectModal.openModal();
                      // }}

                      onClickHandler={() => {
                        setSlug({
                          course_slug: '',
                          course_bundle_id:
                            response?.data?.data[0]?.course_bundle_id,
                        });
                        rejectModal.openModal();
                      }}
                    >
                      {t('CompanyManager.trackCourse.modal.rejectTitle')}
                    </Button>
                    <Button
                      onClickHandler={onAccept}
                      isLoading={acceptCourseLoader}
                      disabled={isSubmitLoading}
                      variants="green"
                      className="min-w-[140px]"
                    >
                      {t('CompanyManager.trackCourse.modal.acceptTitle')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {rejectModal.isOpen && (
          <RejectModal
            modal={rejectModal}
            data={slug}
            refetchOrder={refetch}
            setSlug={setSlug}
            parentModal={modal}
            refetchTrainers={refetchTrainers}
            isBundle={!!bundleSlug}
          />
        )}
      </>
    </Modal>
  );
};

export default CourseAcceptModal;
