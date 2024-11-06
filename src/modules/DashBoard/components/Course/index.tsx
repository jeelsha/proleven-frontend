import Button from 'components/Button/Button';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import { ROLES } from 'constants/roleAndPermission.constant';

import 'modules/DashBoard/components/style/dashboard.css';
import { Courses, DashboardCourse } from 'modules/DashBoard/types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

type CoursePropsType = {
  courses?: DashboardCourse[] | Courses[];
  title?: string;
  subtitle?: string;
  countOfVisitors?: string;
  isCourseLoading?: boolean;
};

export const Course = ({
  courses,
  title,
  subtitle,
  countOfVisitors,
  isCourseLoading,
}: CoursePropsType) => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const navigate = useNavigate();
  const renderCourseContent = () => {
    if (isCourseLoading) {
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
      <div className="flex flex-col gap-4 mt-6 max-h-[320px] overflow-auto pe-2">
        {(courses as DashboardCourse[])?.map((courseData, index) => (
          <div className="flex items-center" key={`course_${index + 1}`}>
            <div className="w-[70px] h-[50px]">
              <Image
                src={courseData?.image ?? '/images/no-image.png'}
                width={36}
                height={36}
                imgClassName="w-full h-full object-cover rounded-lg"
                serverPath
              />
            </div>

            <div className="w-full max-w-[calc(100%_-_64px)] ps-4 flex-1">
              <div className="flex justify-between w-full ">
                {user?.role_name === ROLES.Trainer ? (
                  <Button
                    onClickHandler={() => {
                      navigate(`/trainer/courses/view/${courseData.slug}`, {
                        state: {
                          status: courseData.status,
                          fromDashboard: true,
                        },
                      });
                    }}
                  >
                    <h3 className="text-lg text-blacktheme font-semibold break-words text-left hyphens-auto lg:line-clamp-none line-clamp-1 pr-3">
                      {courseData.title}
                    </h3>
                  </Button>
                ) : (
                  <Button
                    onClickHandler={() => {
                      navigate(`/courses/view/${courseData.slug}`, {
                        state: {
                          status: courseData.status,
                          fromDashboard: true,
                        },
                      });
                    }}
                  >
                    <h3 className="text-lg text-blacktheme font-semibold break-words text-left hyphens-auto lg:line-clamp-none line-clamp-1 pr-3">
                      {courseData.template_title}
                    </h3>
                  </Button>
                )}
                <p className="text-blacktheme font-medium break-all lg:line-clamp-none line-clamp-1 min-w-20">
                  {courseData.total_lessons} &nbsp; {t('CourseBundle.lesson')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="popular-courses-container">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl text-blacktheme font-semibold line-clamp-1">
            {title}
          </h2>
          {!Number.isNaN(Number(countOfVisitors)) ? (
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
