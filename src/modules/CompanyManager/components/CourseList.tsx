// ** imports **
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import CourseCard from 'components/CourseCard';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import Pagination from 'components/Pagination/Pagination';

// ** types **
import { REACT_APP_DATE_FORMAT } from 'config';
import _ from 'lodash';
import { CourseDetailsProps, CourseListProps } from 'modules/CompanyManager/types';

const CourseList = ({
  coursesResponse = [],
  courseLoading,
  startRecord,
  endRecord,
  isDataAvailable,
  limit,
  currentPage,
  setLimit,
  totalPages,
  dataCount,
  navigateUrl,
  navigateTrackCourse,
  otherText,
  activeTab,
}: CourseListProps) => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const renderResponseData = () => {
    if (courseLoading) {
      return (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      );
    }

    if (
      !courseLoading &&
      coursesResponse &&
      Array.isArray(coursesResponse) &&
      coursesResponse.length > 0
    ) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 1200:grid-cols-2 1400:grid-cols-3 2xl:grid-cols-4 gap-4">
          {coursesResponse.map((courseData: CourseDetailsProps) => (
            <CourseCard
              key={courseData.id}
              imagesrc={courseData?.image}
              categories={courseData?.courseCategory?.name}
              title={courseData?.title}
              courseStatus={courseData?.status}
              dateTime={`
              ${
                courseData.start_date &&
                format(
                  new Date(courseData.start_date),
                  REACT_APP_DATE_FORMAT as string
                )
              }- 
              ${
                courseData?.end_date &&
                format(
                  new Date(courseData.end_date),
                  REACT_APP_DATE_FORMAT as string
                )
              }`}
              coursePrice={courseData?.price}
              courseMode={courseData?.mode}
              courseAddress={
                !_.isNil(courseData?.academy)
                  ? courseData?.academy?.location
                  : courseData?.lessons?.[0]?.location
              }
              participant={t('CompanyManager.perParticipantTitle')}
              onClick={() => {
                navigate(`${navigateUrl}/${courseData.slug}`, {
                  state: {
                    activeTab,
                    comingFromManagerForm: state?.comingFromManagerForm,
                    navigateBackUrl: navigateUrl,
                    courseType: courseData?.type,
                  },
                });
              }}
              courseType={courseData?.type}
              otherText={otherText}
              otherClick={() => {
                navigate(`${navigateTrackCourse}/${courseData.slug}`, {
                  state: {
                    activeTab,
                    comingFromManagerForm: state?.comingFromManagerForm,
                  },
                });
              }}
              stageName={courseData?.card?.stage?.name}
            />
          ))}
        </div>
      );
    }

    if (!courseLoading && coursesResponse?.length === 0)
      return (
        <CustomCard
          cardClass="shadow-none"
          bodyClass="h-[calc(100dvh_-_440px)] flex items-center justify-center"
          minimal
        >
          <NoDataFound
            message={t('Table.noDataFound')}
            className="justify-between"
          />
        </CustomCard>
      );
  };
  return (
    <div className="flex flex-col gap-4">
      {renderResponseData()}
      {limit ? (
        <div className="table-footer flex justify-between items-center mt-5">
          <div className="">
            <p className="text-sm text-grayText font-medium">
              {isDataAvailable
                ? t('Table.ShowingRecords', { startRecord, endRecord, dataCount })
                : ''}
            </p>
          </div>
          {totalPages ? (
            <Pagination
              setLimit={setLimit}
              currentPage={currentPage ?? 1}
              dataPerPage={limit ?? 10}
              dataCount={dataCount}
              totalPages={totalPages}
            />
          ) : (
            ''
          )}
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default CourseList;
