import Button from 'components/Button/Button';
import Image from 'components/Image';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import _ from 'lodash';
import { CourseModeEnum, TrainerCourseModeEnum } from 'modules/Courses/Constants';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { ITrainerInvoice } from '../types';

const LessonData = (props: {
  courseDetail: ITrainerInvoice['trainerCourseBundle'];
  lessonData: ITrainerInvoice['courseData']['0']['lesson_session'];
  hourRate?: ITrainerInvoice['courseData']['0']['lession_price'];
  travelReimbursement?: ITrainerInvoice['courseData']['0']['travel_reimbursement'];
  lumpsumData?: boolean;
  lumpsumDetail?: ITrainerInvoice['courseData']['0']['lumpsum_price'];
  date: Date | string;
  lessonId: number;
  index: number;
  showReimbursementFeesIndex: number;
  setShowReimbursementFeesIndex: (detail: number) => void;
  showReimbursementFees: string;
  setShowReimbursementFees: (detail: number) => void;
}) => {
  const {
    date,
    courseDetail,
    lessonData,
    hourRate,
    travelReimbursement,
    lumpsumData,
    lumpsumDetail,
    lessonId,
    index,
    showReimbursementFeesIndex,
    setShowReimbursementFeesIndex,
    showReimbursementFees,
    setShowReimbursementFees,
  } = props;
  const { t } = useTranslation();

  const dateConvert = (start: string) => {
    const parseStart = parseISO(start);

    const startDate = format(
      utcToZonedTime(parseStart, 'UTC'),
      REACT_APP_DATE_FORMAT as string
    );

    return startDate;
  };

  const convertStartEndTime = () => {
    if (lessonData?.start_time && lessonData?.end_time) {
      return `${format(parseISO(lessonData?.start_time), 'hh:mm aa')} - ${format(
        parseISO(lessonData?.end_time),
        'hh:mm aa'
      )}`;
    }
    return '-';
  };

  const getTrainerType = () => {
    switch (true) {
      case lessonData?.lesson?.mode === CourseModeEnum.InPerson:
        return TrainerCourseModeEnum.InPerson;
      case lessonData?.lesson?.mode === CourseModeEnum.VideoConference:
        return TrainerCourseModeEnum.VideoConference;
      case lessonData?.lesson?.mode === CourseModeEnum.Hybrid:
        return TrainerCourseModeEnum.Hybrid;
      default:
        return '-';
    }
  };

  const lessonBasicDetail = courseDetail
    ? [
        {
          label: t('Calendar.createEvent.date'),
          value: date ? dateConvert(date as string) : '-',
        },
      ]
    : [
        {
          label: t('Trainer.invoice.lessonName'),
          value: lessonData?.lesson?.title ?? '-',
        },
        {
          label: t('Trainer.invoice.lessonMode'),
          value: getTrainerType(),
        },
        {
          label: t('Trainer.invoice.lessonDate'),
          value: lessonData?.lesson?.date
            ? dateConvert(lessonData?.lesson?.date)
            : '-',
        },
        {
          label: t('Trainer.invoice.sessionTime'),
          value: convertStartEndTime(),
        },
      ];

  const hourRateDetail = [
    {
      label: t('Trainer.invoice.hour'),
      value: hourRate?.hours ?? '-',
    },
    {
      label: t('Trainer.invoice.price'),
      value:
        `${getCurrencySymbol('EUR')} ${formatCurrency(
          Number(hourRate?.price),
          'EUR'
        )}` ?? '-',
    },
    {
      label: t('Trainer.invoice.totalPrice'),
      value:
        `${getCurrencySymbol('EUR')} ${formatCurrency(
          Number(hourRate?.total_price),
          'EUR'
        )}` ?? '-',
    },
  ];

  const travelReimbursementDetail = [
    {
      label: t('Trainer.invoice.days'),
      value: travelReimbursement?.days ?? '-',
    },
    {
      label: t('Trainer.invoice.km'),
      value: travelReimbursement?.kilometer ?? '-',
    },
    {
      label: t('Trainer.invoice.price'),
      value:
        `${getCurrencySymbol('EUR')} ${formatCurrency(
          Number(travelReimbursement?.reimbursement_price),
          'EUR'
        )}` ?? '-',
    },
    {
      label: t('Trainer.invoice.totalPrice'),
      value:
        `${getCurrencySymbol('EUR')} ${formatCurrency(
          Number(travelReimbursement?.reimbursement_total_price),
          'EUR'
        )}` ?? '-',
    },
  ];

  const lumpSumDataDetail = [
    {
      label: t('Trainer.invoice.reimbursementAmount'),
      value:
        `${getCurrencySymbol('EUR')} ${formatCurrency(
          Number(lumpsumDetail?.reimbursement_amount),
          'EUR'
        )}` ?? '-',
    },
    {
      label: t('Trainer.invoice.total'),
      value:
        `${getCurrencySymbol('EUR')} ${formatCurrency(
          Number(lumpsumDetail?.net_total),
          'EUR'
        )}` ?? '-',
    },
  ];
  const handleShowReimbursementFees = (item: number, index: number) => {
    setShowReimbursementFees(item);
    setShowReimbursementFeesIndex(index + 1);
  };
  const renderDetails = (item: {
    label: string | number;
    value: string | number;
  }) => (
    <div className="flex gap-7">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-dark font-medium">{item?.label}</p>
        <span className="text-xs text-dark font-bold">{item?.value}</span>
      </div>
    </div>
  );
  return (
    <div className="p-4 border border-solid border-borderColor rounded-lg w-full max-w-[calc(100%_-_175px)] ml-auto">
      <div className="flex flex-col gap-y-4">
        {/* Lesson REPEATER */}
        <div className="flex items-center max-w-[750px] ">
          <div className="group grid grid-cols-2 1200:grid-cols-4 gap-4 max-w-[100%_-_36px] w-full ps-5 relative">
            {lessonBasicDetail?.map((data) => (
              <div className="relative">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {data?.label}
                </span>
                <p className="text-sm text-dark font-semibold">{data?.value}</p>

                {courseDetail && (
                  <Button
                    className="!absolute ml-4 left-full top-2 border border-primary text-[10px] w-6 h-6 !p-0 flex items-center justify-center rounded-full p-1 secondary leading-none"
                    tooltipText={t('Trainer.showReimbursementFees')}
                    onClickHandler={() =>
                      handleShowReimbursementFees(lessonId, index)
                    }
                  >
                    <Image
                      iconName="eyeIcon"
                      iconClassName="h-[16px]"
                      width={24}
                      height={24}
                    />
                  </Button>
                )}
              </div>
            ))}
            {_.isNull(courseDetail) && (
              <Button
                className="!absolute ml-4 left-full top-2 border border-primary text-[10px] w-6 h-6 !p-0 flex items-center justify-center rounded-full p-1 secondary leading-none"
                tooltipText={t('Trainer.showReimbursementFees')}
                onClickHandler={() => handleShowReimbursementFees(lessonId, index)}
              >
                <Image
                  iconName="eyeIcon"
                  iconClassName="h-[16px]"
                  width={24}
                  height={24}
                />
              </Button>
            )}
          </div>
        </div>
        {/* Lesson REPEATER */}
      </div>
      <div className="border-t border-solid border-dark/20 mt-3 pt-4">
        {!lumpsumData ? (
          <div className="flex flex-wrap gap-16">
            {/* Hour rate detail */}
            <div className="w-fit">
              <p className="text-sm text-primary font-medium mb-2 block">
                {t('Trainer.invoice.hourlyRateTitle')}
              </p>
              <div className="flex gap-7">
                {hourRateDetail?.map((hourData) => (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-dark font-medium">
                      {hourData?.label}
                    </p>
                    <span className="text-xs text-dark font-bold">
                      {hourData?.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Reimbursement Fees */}
            {showReimbursementFeesIndex
              ? Number(showReimbursementFees) === lessonId &&
                Number(showReimbursementFeesIndex) === index + 1 && (
                  <div className="w-fit">
                    <p className="text-sm text-primary font-medium mb-2 block">
                      {t('Trainer.invoice.travelRateTitle')}
                    </p>
                    <div className="flex gap-7">
                      {travelReimbursementDetail?.map((travel) =>
                        renderDetails(travel)
                      )}
                    </div>
                  </div>
                )
              : null}
          </div>
        ) : (
          <div className="flex flex-wrap gap-16">
            {/* Reimbursement Fees */}
            <div className="w-fit">
              <p className="text-sm text-primary font-medium mb-2 block">
                {t('Trainer.invoice.lumpSumTitle')}
              </p>

              <div className="flex flex-wrap gap-7">
                <div>
                  <p className="text-xs text-dark font-medium">
                    {t('Trainer.invoice.amount')}
                  </p>
                  <span className="text-xs text-dark font-bold">
                    {`${getCurrencySymbol('EUR')} ${formatCurrency(
                      Number(lumpsumDetail?.amount),
                      'EUR'
                    )}`}
                  </span>
                </div>
                {showReimbursementFeesIndex
                  ? Number(showReimbursementFees) === lessonId &&
                    Number(showReimbursementFeesIndex) === index + 1 && (
                      <>
                        {lumpSumDataDetail?.map((travel) => (
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-dark font-medium">
                              {travel?.label}
                            </p>
                            <span className="text-xs text-dark font-bold">
                              {travel?.value}
                            </span>
                          </div>
                        ))}
                      </>
                    )
                  : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonData;
