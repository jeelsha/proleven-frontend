import CustomCard from 'components/Card';
import NoDataFound from 'components/NoDataFound';
import { useQueryGetFunction } from 'hooks/useQuery';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { CourseData, ReportsProps } from '../types';

const CourseReport = ({ t, filterData, className }: ReportsProps) => {
  const { response, isLoading } = useQueryGetFunction(`/reports/percentage`, {
    option: {
      ...(filterData?.startDate && { start_date: filterData?.startDate }),
      ...(filterData?.endDate && { end_date: filterData?.endDate }),
    },
  });
  const getData2 = (data: CourseData) => {
    const {
      academyCoursesPercentage,
      privateCoursesPercentage,
      bundleCoursesPercentage,
    } = data || {};

    const privateCoursePer = privateCoursesPercentage
      ? parseFloat(privateCoursesPercentage)
      : 0;
    const academyCoursePer = academyCoursesPercentage
      ? parseFloat(academyCoursesPercentage)
      : 0;
    const bundleCoursePer = bundleCoursesPercentage
      ? parseFloat(bundleCoursesPercentage)
      : 0;

    return {
      labels: [
        t('CoursesManagement.CourseType.Private'),
        t('CoursesManagement.CourseType.Academy'),
      ],
      datasets: [
        {
          data: [
            privateCoursePer,
            ...[
              bundleCoursesPercentage
                ? [academyCoursePer + bundleCoursePer]
                : [academyCoursePer],
            ],
          ],
          backgroundColor: ['#17bd9e', '#0B4565'],
        },
      ],
    };
  };

  const doughnutBarData = getData2(response?.data);
  const dataArray = doughnutBarData?.datasets?.[0]?.data;
  const isAllDataZero = dataArray.every((value) => value === 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      title: {
        display: true,
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };
  return (
    <CustomCard
      cardClass={className ?? ''}
      headerClass="pb-2"
      title={t('reports.course.title')}
      minimal
    >
      <>
        {isAllDataZero ? <NoDataFound /> : ''}

        {!isAllDataZero && isLoading ? (
          <div className="w-full rounded-lg min-h-[300px] ">
            <div className="flex w-full gap-5 flex-row">
              <div className="lazy w-[400px] h-[300px]" />
              <div className="flex items-center justify-end w-full">
                <ul className="flex flex-col gap-y-2 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="w-full flex ps-3">
                      <span className="lazy w-5 h-5 inline-block mr-2" />
                      <span className="lazy w-[250px] h-6 text-black/50" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}

        {!isAllDataZero && !isLoading ? (
          <div className="flex flex-row">
            {response?.data?.academyCoursesPercentage === '0.00' &&
              response?.data?.privateCoursesPercentage === '0.00' && (
                <div className="mt-10">
                  <NoDataFound />
                </div>
              )}
            {isLoading && <div className="lazy w-full rounded-lg min-h-[300px] " />}
            {response?.data?.academyCoursesPercentage > '0.00' ||
            response?.data?.privateCoursesPercentage > '0.00' ? (
              <div className="flex flex-row">
                <div className="h-[300px] w-[300px]">
                  <Doughnut data={doughnutBarData} options={options} />
                </div>

                <div className="flex items-center justify-end">
                  <ul className="flex flex-col gap-y-2">
                    <li>
                      <span className="w-3 h-3 bg-[#0B4565] inline-block mr-2" />
                      <span className=" text-black/50">
                        {t('reports.academyCourseCount')}:
                        <i className="font-semibold text-black not-italic ps-1">
                          {response?.data?.academyCoursesPercentage}
                        </i>
                      </span>
                    </li>
                    <li>
                      <span className="w-3 h-3 bg-[#0B4565] inline-block mr-2" />
                      <span className=" text-black/50">
                        {t('reports.academyCourseRevenue')}:
                        <i className="font-semibold text-black not-italic ps-1">
                          {getCurrencySymbol('EUR')}
                          {formatCurrency(
                            Number(response?.data?.academyRevenue),
                            'EUR'
                          )}
                        </i>
                      </span>
                    </li>
                    <li>
                      <span className="w-3 h-3 bg-[#0B4565] inline-block mr-2" />
                      <span className=" text-black/50">
                        {t('reports.academyBundleCourseCount')}:
                        <i className="font-semibold text-black not-italic ps-1">
                          {response?.data?.bundleCoursesPercentage}
                        </i>
                      </span>
                    </li>
                    <li>
                      <span className="w-3 h-3 bg-[#0B4565] inline-block mr-2" />
                      <span className=" text-black/50">
                        {t('reports.academyBundleCourseRevenue')}:
                        <i className="font-semibold text-black not-italic ps-1">
                          {getCurrencySymbol('EUR')}
                          {formatCurrency(
                            Number(response?.data?.bundleRevenue),
                            'EUR'
                          )}
                        </i>
                      </span>
                    </li>
                    <li>
                      <span className="w-3 h-3 bg-[#17bd9e] inline-block mr-2" />
                      <span className=" text-black/50">
                        {t('reports.privateCourseCount')}:
                        <i className="font-semibold text-black not-italic ps-1">
                          {response?.data?.privateCoursesPercentage}
                        </i>
                      </span>
                    </li>
                    <li>
                      <span className="w-3 h-3 bg-[#17bd9e] inline-block mr-2" />
                      <span className=" text-black/50">
                        {t('reports.privateCourseRevenue')}:
                        <i className="font-semibold text-black not-italic ps-1">
                          {getCurrencySymbol('EUR')}
                          {formatCurrency(
                            Number(response?.data?.privateCourseRevenue),
                            'EUR'
                          )}
                        </i>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
      </>
    </CustomCard>
  );
};

export default CourseReport;
