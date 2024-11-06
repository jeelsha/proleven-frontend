import CustomCard from 'components/Card';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import { courseDataProps } from 'modules/CreditNotes/types';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { OrderCourseDetails } from '../types';

export const CourseDetails = ({ courseData, t }: OrderCourseDetails) => {
  // const paramsData = useLocation();

  const getTotalVat = (data: courseDataProps) => {
    const price =
      Number(data.price) * Number(data?.company?.course_participates?.length);
    const vat = Number(data.company?.vat_type) / 100;
    const total_vat = price * vat;
    return total_vat.toFixed(2);
  };
  const getTotalAmount = (data: courseDataProps) => {
    const price =
      Number(data.price) * Number(data?.company?.course_participates?.length);
    return price.toFixed(2);
  };
  return (
    <div className="mt-30px">
      <CustomCard minimal title={t('order.enrollCourseDetails')}>
        <div className="border-t border-solid border-borderColor pt-5 flex flex-col gap-5">
          {courseData?.participate?.map((enrollCourseData) => {
            return (
              <div className="" key={enrollCourseData?.id}>
                {/* <p className="text-xl font-semibold text-dark mb-4">
                  {t('CoursesManagement.CreateCourse.course')}
                </p> */}

                <div className="bg-primaryLight px-8 py-7 rounded-10px">
                  <div className="grid gap-3 mb-2">
                    <StatusLabel text="Invoiced" variants="completed" />
                    <p className="text-lg font-semibold">
                      {enrollCourseData?.title}
                    </p>
                    <p
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: enrollCourseData?.description as string,
                      }}
                    />
                  </div>

                  <div className="grid gap-5 grid-cols-4 bg-white rounded-lg shadow-md p-5 px-0 mb-6">
                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('Quote.company.product.productCode')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {enrollCourseData?.code}
                      </p>
                    </div>

                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('ClientManagement.courseListing.category')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {enrollCourseData?.courseCategory?.name}
                      </p>
                    </div>

                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('Auth.RegisterCompany.vatType')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {enrollCourseData?.company?.vat_type}%
                      </p>
                    </div>

                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('Quote.company.product.priceParticipateTitle')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {getCurrencySymbol()}{' '}
                        {formatCurrency(Number(enrollCourseData?.price)) ?? 0}
                      </p>
                    </div>

                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('trainer.totalParticipate')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {enrollCourseData?.company?.course_participates?.length}
                      </p>
                    </div>

                    <div className="min-w-[140px] ">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('Quote.company.product.totalVatAmount')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {getCurrencySymbol()}{' '}
                        {formatCurrency(
                          Number(
                            getTotalVat(enrollCourseData as courseDataProps) || 0
                          )
                        ) ?? 0}
                      </p>
                    </div>
                    <div className="min-w-[140px] ">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('Quote.company.product.totalProductAmountTitle')}
                      </span>
                      <span className="text-sm text-dark font-semibold">
                        {getCurrencySymbol()}{' '}
                        {formatCurrency(
                          Number(
                            getTotalAmount(enrollCourseData as courseDataProps) || 0
                          )
                        ) ?? 0}
                      </span>
                    </div>

                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('ClientManagement.courseListing.startDate')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {enrollCourseData?.start_date &&
                          format(
                            new Date(enrollCourseData?.start_date),
                            REACT_APP_DATE_FORMAT as string
                          )}
                      </p>
                    </div>

                    <div className="px-5">
                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                        {t('ClientManagement.courseListing.endDate')}
                      </span>
                      <p className="text-sm text-dark font-semibold">
                        {enrollCourseData?.end_date &&
                          format(
                            new Date(enrollCourseData?.end_date),
                            REACT_APP_DATE_FORMAT as string
                          )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-5">
                    {enrollCourseData?.company?.course_participates?.map(
                      (data, index: number) => {
                        return (
                          <div
                            className="grid gap-1 bg-white rounded-lg shadow-md p-5"
                            key={`participate)_${index + 1}`}
                          >
                            <p className="text-sm text-dark font-semibold">
                              <span className="inline-block mr-2 text-sm text-dark/50 mb-1 font-medium">
                                {t('UserProfile.settings.firstName')} :
                              </span>
                              {data?.first_name}
                            </p>

                            <p className="text-sm text-dark font-semibold">
                              <span className="inline-block mr-2 text-sm text-dark/50 mb-1 font-medium">
                                {t('UserProfile.settings.lastName')} :
                              </span>
                              {data?.last_name}
                            </p>

                            <p className="text-sm text-dark font-semibold">
                              <span className="inline-block mr-2 text-sm text-dark/50 mb-1 font-medium">
                                {t('Codes.code')} :
                              </span>
                              {data?.code}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-30px">
            <div className="flex flex-wrap gap-16 justify-end text-right">
              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.totalVatAmount')}
                </span>
                <p className="text-[20px] text-dark font-semibold">
                  {getCurrencySymbol()}{' '}
                  {formatCurrency(Number(courseData?.total_vat_amount)) ?? 0}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.netTotalProductAmountTitle')}
                </span>
                <p className="text-4xl text-dark font-semibold">
                  {getCurrencySymbol()}{' '}
                  {formatCurrency(Number(courseData?.total_amount)) ?? 0}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.totalProductAmountTitle')}
                </span>
                <p className="text-[20px] text-dark font-semibold">
                  {getCurrencySymbol()}{' '}
                  {formatCurrency(
                    Number(courseData?.total_vat_amount) +
                      Number(courseData?.total_amount)
                  ) ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};
