import Button from 'components/Button/Button';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import StatusLabel from 'components/StatusLabel';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import _ from 'lodash';
import 'modules/DashBoard/components/style/dashboard.css';
import { IDashboardCustomCardData } from 'modules/DashBoard/types';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

type CoursePropsType = {
  courses?: IDashboardCustomCardData[];
  title?: string;
  subtitle?: string;
  countOfVisitors?: string;
  columnHead?: string;
  isImage?: boolean;
  cardType?: string;
  isLoading?: boolean;
};

export const DashboardCustomCard = ({
  courses,
  title,
  subtitle,
  countOfVisitors,
  cardType,
  isImage = true,
  isLoading,
  columnHead,
}: CoursePropsType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getStatus = (item: string) => {
    if (item.includes('days')) {
      const intNumber = item.split(' ')[0];
      if (Number(intNumber) < 5) return 'completed';
      if (Number(intNumber) > 5 && Number(intNumber) < 10) {
        return 'pending';
      }
      if (Number(intNumber) > 10) return 'cancelled';
    }
    if (item.includes('%')) {
      const percentage = item.split('%')[0];
      if (Number(percentage) > 50) {
        return 'completed';
      }
      return 'pending';
    }
    return 'pending';
  };

  const renderCourseContent = () => {
    if (isLoading) {
      return (
        <div className="mt-3">
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div className="flex items-center mt-3" key={`${index + 1}`}>
                <div className="w-[70px] h-[50px] lazy rounded-lg" />

                <div className="flex-1 ps-4 ">
                  <div className="flex justify-between ">
                    <div className="flex-1 ">
                      <div className="h-6 lazy rounded mb-2 " />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      );
    }

    if (!courses || courses.length === 0) {
      return <NoDataFound />;
    }

    return (
      <div className="flex flex-col mt-6 max-h-[320px] overflow-auto pe-2">
        {(courses as IDashboardCustomCardData[])?.map(
          (courseData: IDashboardCustomCardData, index: number) => {
            return (
              <div
                className="flex items-center border-b border-b-gray-200 py-4"
                key={`course_${index + 1}`}
              >
                {isImage && (
                  <div className="w-[70px] h-[50px]">
                    <Image
                      src={courseData?.image ?? '/images/no-image.png'}
                      width={36}
                      height={36}
                      imgClassName="w-full h-full object-cover rounded-lg"
                      serverPath
                    />
                  </div>
                )}

                <div
                  className={`w-full  ${
                    isImage ? 'ps-4 max-w-[calc(100%_-_64px)]' : ''
                  }`}
                >
                  <div className="flex justify-between w-full ">
                    <div className="flex flex-col items-start gap-y-2">
                      {courseData.trainer_name && (
                        <h3 className="text-lg leading-normal text-blacktheme word-break hyphens-auto text-left font-semibold lg:line-clamp-none line-clamp-1 pr-3">
                          {courseData.trainer_name}
                          &nbsp; &nbsp;
                          <span className="   text-sm w-fit leading-4  px-2.5 py-1.5 inline-flex items-center justify-center rounded-md h-fit min-h-7 bg-green2/10 text-green2">
                            {courseData.type}
                          </span>
                        </h3>
                      )}
                      {courseData.training_specialist_name && (
                        <div className="flex flex-wrap gap-1">
                          {courseData.training_specialist_name.map((item) => (
                            <>
                              <span className="  text-sm w-fit leading-4 px-2.5 py-1.5 font-semibold inline-flex items-center justify-center rounded-md h-fit min-h-7 bg-siteBG2 text-green2">
                                {item}
                              </span>
                            </>
                          ))}
                        </div>
                      )}
                      <Button
                        // disabled={cardType === 'courseProposal'}
                        onClickHandler={() =>
                          navigate(`/courses/view/${courseData.slug}`, {
                            state: {
                              fromDashboard: true,
                              status: courseData.status,
                              isCourse: true,
                              activeTab: 0,
                              type: courseData.course_type,
                              course_id: courseData.course_id,
                            },
                          })
                        }
                      >
                        <div className="flex align-middle items-center">
                          <h3
                            className={` text-blacktheme ${
                              courseData.trainer_name
                                ? 'text-[15px]'
                                : 'text-[15px] font-semibold'
                            } break-words hyphens-auto leading-normal lg:line-clamp-none line-clamp-1 pr-3 mb-2 text-left`}
                          >
                            {courseData.title}
                          </h3>
                        </div>
                      </Button>
                      {cardType === 'courseProposal' &&
                      courseData?.training_specialist
                        ? courseData?.training_specialist
                        : ''}
                      {cardType === 'courseProposal' &&
                        !_.isEmpty(courseData?.quote_number) && (
                          <div className="flex gap-x-2 flex-wrap gap-2 mb-2">
                            {courseData?.quote_number?.map((quote) => {
                              return (
                                <span
                                  key={quote}
                                  className="   text-sm w-fit leading-4  px-2.5 py-1.5 inline-flex items-center justify-center rounded-md h-fit min-h-7 bg-green2/10 text-green2"
                                >
                                  {quote}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      {!courseData?.trainer_name && cardType !== 'courseProposal' ? (
                        <span className="text-sm">{courseData.category}</span>
                      ) : (
                        ''
                      )}
                      {!_.isEmpty(courseData?.companies) &&
                        courseData?.companies && (
                          <p>
                            {courseData?.companies
                              .slice(0, 2)
                              .map((company, index, array) => (
                                <>
                                  <Link
                                    to={`${PRIVATE_NAVIGATION.clientsManagement.company.list.path}/view/${company?.slug}`}
                                    target="_blank"
                                    className="flex-1"
                                  >
                                    {company?.name}
                                  </Link>
                                  {index < array.length - 1 && ', '}
                                </>
                              ))}
                            {courseData?.companies.length > 2 && ', ...'}
                          </p>
                        )}
                      {!_.isEmpty(courseData?.quotes) && courseData?.quotes && (
                        <p>
                          {courseData?.quotes
                            .slice(0, 2)
                            .map((quote, index, array) => (
                              <>
                                <Link
                                  to={`${PRIVATE_NAVIGATION.quotes.list.path}/view/${quote?.slug}`}
                                  target="_blank"
                                >
                                  <span className="max-w-[220px] hover:underline decoration-blue">
                                    {quote?.quote_number}
                                  </span>
                                </Link>
                                {index < array.length - 1 && ', '}
                              </>
                            ))}
                          {courseData?.quotes.length > 2 && ', ...'}
                        </p>
                      )}
                    </div>
                    <Button className="shrink-0">
                      <StatusLabel
                        text={courseData.count}
                        variants={getStatus(String(courseData.count))}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  };

  return (
    <div className="popular-courses-container">
      <div className="flex justify-between">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-blacktheme font-semibold line-clamp-1">
              {title}
            </h2>
            {columnHead ? (
              <span className="font-semibold line-clamp-1 text-blacktheme pe-4">
                {columnHead}
              </span>
            ) : (
              ''
            )}
          </div>
          {countOfVisitors ? (
            <p className="line-clamp-1">
              {t('Dashboard.courses.descriptionText1')}&nbsp;
              {countOfVisitors ?? 0}
              &nbsp;
              {t('Dashboard.courses.descriptionText2')}
            </p>
          ) : (
            <p className="line-clamp-3">{subtitle}</p>
          )}
        </div>
      </div>
      {renderCourseContent()}
    </div>
  );
};
