import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

//  ** components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import TrainerDetail from 'modules/TrainerInvoice/Components/TrainerDetail';

//  ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
// import { isLastDayOfMonth } from 'date-fns';
// import { utcToZonedTime } from 'date-fns-tz';
import Image from 'components/Image';
import { REACT_APP_ENCRYPTION_KEY } from 'config';
import { isLastDayOfMonth, isSameMonth } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { useAxiosPost } from 'hooks/useAxios';
import { useTitle } from 'hooks/useTitle';
import FilterMonthTrainerOrder from 'modules/TrainerInvoice/Components/FilterMonthTrainerOrder';
import InvoiceCourseDetail from 'modules/TrainerInvoice/Components/InvoiceCourseDetail';
import LessonData from 'modules/TrainerInvoice/Components/LessonData';
import TrainerCourseBundleDetail from 'modules/TrainerInvoice/Components/TrainerCourseBundle';
import { ITrainerInvoice, LessonApproval } from 'modules/TrainerInvoice/types';
import { useSelector } from 'react-redux';
import { getUserRole } from 'redux-toolkit/slices/authSlice';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { aesDecrypt } from 'utils/encrypt';

const CurrentMonthOrder = () => {
  const { t } = useTranslation();
  const currentURL = new URL(window.location.href);
  const trainerId = currentURL.searchParams.get('trainer');
  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';
  const decryptedText = trainerId ? aesDecrypt(trainerId, KEY) : '';
  const date = currentURL.searchParams.get('date');

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('Trainer.invoice.currentMonthOrderTitle'));

  const [callSendOrder] = useAxiosPost();
  const userRole = useSelector(getUserRole);

  const [trainerInvoice, setTrainerInvoice] = useState<ITrainerInvoice[]>([]);
  const [showReimbursementFees, setShowReimbursementFees] = useState('');
  const [dateValue, setDateValue] = useState<string | Date>(new Date());
  const [showReimbursementFeesIndex, setShowReimbursementFeesIndex] =
    useState<number>(0);
  const [filterModal, setFilterModal] = useState(false);
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);

  const { response, refetch } = useQueryGetFunction('/trainer', {
    option: {
      monthly: true,
      view: true,
      ...(!_.isEmpty(decryptedText) && { trainerId: decryptedText }),
      ...(!_.isEmpty(date) && { date }),
      ...(_.isEmpty(date) && dateValue && { date: dateValue }),
    },
  });

  useEffect(() => {
    if (response?.data) {
      setTrainerInvoice(response?.data?.responseData?.data);
    }
  }, [response?.data]);

  const findMonthLastFiveDays = () => {
    const utcCurrentDate = utcToZonedTime(new Date(), 'UTC');
    const lastDay = isLastDayOfMonth(utcCurrentDate);
    const isMonth = isSameMonth(utcCurrentDate, new Date(dateValue));

    return !isMonth ? true : lastDay;
  };

  const getTrainerType = (data: LessonApproval): string => {
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

  const isLastDay = findMonthLastFiveDays();
  const handleSendOrder = async () => {
    if (isLastDay) {
      const sendOrderObj: { [key: string]: unknown } = {
        ...(!_.isEmpty(decryptedText) && { trainer_id: decryptedText }),
        ...(dateValue && { date: dateValue }),
      };
      const orderData: { [key: string]: unknown }[] = [];
      if (!_.isEmpty(trainerInvoice)) {
        trainerInvoice?.map((item) => {
          return item.courseData?.forEach((course) => {
            orderData.push({
              course_id: course?.course_id,
              price: !course?.lumpsum_data
                ? course?.net_total
                : Number(course?.net_amount) - (Number(course?.bonus) ?? 0),
              trainer_invoice_id: course?.id,
              hours: course?.lession_price?.hours,
              reimbursementFees:
                course?.travel_reimbursement?.reimbursement_total_price,
              bonus: course?.bonus ? course?.bonus : 0,
            });
          });
        });
      }
      if (!_.isEmpty(orderData)) {
        sendOrderObj.trainerData = orderData;
      }
      await callSendOrder('/trainer/order-add', {
        ...sendOrderObj,
      });
    }
  };
  const totalAmount = (courseData: ITrainerInvoice['courseData']) => {
    return (
      _.reduce(
        courseData,
        (total, item) => {
          const amount = item?.lumpsum_data
            ? item?.net_amount
            : item?.net_amount
            ? Number(item?.net_total)
            : 0;
          return total + amount;
        },
        0
      ) + (courseData[0]?.lumpsum_data ? 0 : Number(courseData[0].bonus))
    );
  };
  const handleShowIndex = (data: number) => {
    setShowReimbursementFeesIndex(data);
  };

  const handleShowReimbursementFees = (data: number) => {
    setShowReimbursementFees((prev) => (prev === `${data}` ? '' : `${data}`));
  };

  const travelReimbursement = (
    courseData: ITrainerInvoice['courseData'],
    lesson: {
      lesson_id: number | null;
      travel_reimbursement: {
        days: number;
        kilometer: number;
        reimbursement_price: number;
        reimbursement_total_price: number;
      };
    }
  ) => {
    const travel_reimbursement =
      courseData.find(
        (data) =>
          lesson?.lesson_id === data?.lesson_id &&
          data?.travel_reimbursement?.kilometer > 0
      )?.travel_reimbursement || lesson?.travel_reimbursement;

    return travel_reimbursement;
  };

  const getSlug = (courseData: ITrainerInvoice['courseData']) => {
    const slug =
      courseData.find((data) => Number(data?.bonus) > 0)?.slug ||
      courseData[0]?.slug;
    return slug;
  };

  return (
    <div>
      <PageHeader
        small
        text={
          !_.isEmpty(trainerInvoice) &&
          trainerInvoice[0]?.courseData[0]?.trainer_user
            ? `${trainerInvoice[0]?.courseData[0]?.trainer_user?.full_name} ${t(
                'Trainer.invoice.trainerOrderTitle'
              )}`
            : t('Trainer.invoice.currentMonthTitle')
        }
        url={
          userRole === 'Trainer'
            ? PRIVATE_NAVIGATION.trainerOrder.previousMonthOrder.view.path
            : PRIVATE_NAVIGATION.trainerInvoice.list.path
        }
      >
        <div>
          {_.isNull(date) && (
            <div className="flex gap-2">
              <div className="relative flex">
                <Button
                  onClickHandler={() => {
                    setFilterModal(!filterModal);
                  }}
                  variants="primary"
                  className="gap-1 !flex !py-2.5 !px-3.5"
                >
                  {dateValue && <span className="filter-badge" />}
                  <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
                  {t('Calendar.filterButton')}
                </Button>
                {filterModal && (
                  <div
                    ref={modalRef}
                    className={`${
                      filterModal && 'z-1'
                    } absolute  right-0 top-full before:absolute transition-all duration-300`}
                  >
                    <div className="bg-white rounded-xl shadow-xl w-[340px]">
                      <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                        <h5 className="text-base leading-5 font-semibold text-dark">
                          {t('ProjectManagement.Header.filter')}
                        </h5>
                      </div>
                      <div className="px-5 py-3">
                        <div className="flex flex-col gap-y-3">
                          <FilterMonthTrainerOrder
                            setFilterModal={setFilterModal}
                            dateValue={dateValue}
                            setDateValue={setDateValue}
                            t={t}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button
                disabled={!isLastDay}
                className={`${!isLastDay ? 'opacity-50' : ''}`}
                onClickHandler={handleSendOrder}
                value={t('Trainer.invoice.sendOrderButton')}
                variants="primary"
              />
            </div>
          )}
        </div>
      </PageHeader>

      {userRole !== 'Trainer' && (
        <CustomCard minimal>
          <TrainerDetail
            trainerData={
              !_.isEmpty(trainerInvoice) ? trainerInvoice[0]?.trainer : null
            }
          />
        </CustomCard>
      )}

      {!_.isEmpty(trainerInvoice) && (
        <CustomCard minimal cardClass="mt-30px" bodyClass="flex flex-col gap-y-4">
          <>
            {trainerInvoice?.map((data, index) => {
              return (
                <div
                  key={`trainerInvoice_${index + 1}`}
                  className="p-4 border border-solid border-borderColor rounded-lg flex flex-col gap-y-4"
                >
                  {data?.trainerCourseBundle ? (
                    <TrainerCourseBundleDetail
                      slug={
                        !_.isEmpty(data?.courseData) ? getSlug(data?.courseData) : ''
                      }
                      courseBonus={
                        !_.isEmpty(data?.courseData)
                          ? data?.courseData[0]?.bonus
                          : ''
                      }
                      trainerType={
                        !_.isEmpty(data?.courseData)
                          ? getTrainerType(data?.courseData[0]?.lesson_approval)
                          : ''
                      }
                      trainerId={
                        !_.isEmpty(data?.courseData)
                          ? data?.courseData[0]?.trainer_id.toString()
                          : ''
                      }
                      courseDetail={data?.trainerCourseBundle}
                      // courseDetail={data?.trainerCourse}
                      reFetchTrainer={refetch}
                      userRole={userRole}
                    />
                  ) : (
                    <InvoiceCourseDetail
                      slug={
                        !_.isEmpty(data?.courseData)
                          ? data?.courseData?.find((data) => !_.isNull(data?.bonus))
                              ?.slug ?? data?.courseData[0]?.slug
                          : ''
                      }
                      courseBonus={
                        !_.isEmpty(data?.courseData)
                          ? data?.courseData?.find((data) => !_.isNull(data?.bonus))
                              ?.bonus ?? data?.courseData[0]?.bonus
                          : ''
                      }
                      trainerType={
                        !_.isEmpty(data?.courseData)
                          ? getTrainerType(data?.courseData[0]?.lesson_approval)
                          : ''
                      }
                      trainerId={
                        !_.isEmpty(data?.courseData)
                          ? data?.courseData[0]?.trainer_id.toString()
                          : ''
                      }
                      courseDetail={data?.trainerCourse}
                      // courseDetail={data?.trainerCourse}
                      reFetchTrainer={refetch}
                      userRole={userRole}
                    />
                  )}

                  {/* Lesson Data */}
                  {data?.courseData?.map((lesson, index) => {
                    return (
                      <LessonData
                        date={data?.courseData[0]?.lesson_date}
                        courseDetail={data?.trainerCourseBundle}
                        key={`lesson_index_${index + 1}`}
                        hourRate={lesson?.lession_price}
                        travelReimbursement={travelReimbursement(
                          data?.courseData,
                          lesson
                        )}
                        lessonData={lesson?.lesson_session}
                        lumpsumData={lesson?.lumpsum_data}
                        lumpsumDetail={lesson?.lumpsum_price}
                        lessonId={lesson?.id}
                        index={index}
                        showReimbursementFeesIndex={showReimbursementFeesIndex}
                        setShowReimbursementFeesIndex={handleShowIndex}
                        showReimbursementFees={showReimbursementFees}
                        setShowReimbursementFees={handleShowReimbursementFees}
                      />
                    );
                  })}
                  {/* Lesson Data */}
                  <div className="flex justify-end">
                    <div>
                      <p className="font-semibold text-lg">
                        {t('Trainer.invoice.totalAmount')}
                      </p>
                      {`${getCurrencySymbol('EUR')} ${formatCurrency(
                        Number(totalAmount(data?.courseData)),
                        'EUR'
                      )}`}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="ml-auto flex gap-7">
              <div>
                <p className="font-semibold text-lg">{t('Trainer.invoice.total')}</p>
                {`${getCurrencySymbol('EUR')} ${formatCurrency(
                  Number(response?.data?.total?.course_total_amount),
                  'EUR'
                )}`}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {t('Trainer.invoice.totalBonus')}
                </p>
                {`${getCurrencySymbol('EUR')} ${formatCurrency(
                  Number(response?.data?.total?.course_total_bonus),
                  'EUR'
                )}`}
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {t('Trainer.invoice.totalAmount')}
                </p>
                {`${getCurrencySymbol('EUR')} ${formatCurrency(
                  Number(response?.data?.total?.course_total),
                  'EUR'
                )}`}
              </div>
            </div>
          </>
        </CustomCard>
      )}
    </div>
  );
};

export default CurrentMonthOrder;
