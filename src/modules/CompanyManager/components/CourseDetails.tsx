// ** imports **
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** components **
import CourseCard from 'components/CourseCard';
import CourseDetailCard from 'modules/CompanyManager/components/courses/CourseDetailCard';
import { CourseHeader } from 'modules/CompanyManager/components/courses/CourseHeader';
import CourseSession from 'modules/CompanyManager/components/courses/CourseSession';
import CourseSessionTitle from 'modules/CompanyManager/components/courses/CourseSessionTitle';
import EnrollCourseCard from 'modules/CompanyManager/components/courses/EnrollCourseCard';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import {
  CourseDetailProps,
  CourseDetailsProps,
  CourseLessonProps,
} from 'modules/CompanyManager/types';

// ** redux **
import { REACT_APP_DATE_FORMAT } from 'config';
import { useTitle } from 'hooks/useTitle';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

const CourseDetails = () => {
  const user = useSelector(getCurrentUser);
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const [companyManagerGetApi, { isLoading: courseDetailLoader }] = useAxiosGet();
  const navigate = useNavigate();
  const params = useParams();
  const { state } = useLocation();
  const ActiveCompany = useSelector(useCompany);
  const slugValue = params.slug;
  const currentLanguage = useSelector(useLanguage);
  const [courseDetails, setCourseDetails] = useState<CourseDetailProps>();
  const { response: coursesResponse } = useQueryGetFunction('/managers/course/all', {
    limit: 3,
    option: {
      courseSubCategory: courseDetails?.courseSubCategory?.id,
      course_to_ignore: slugValue,
    },
  });
  const CourseDetail = async () => {
    if (user?.role_name === ROLES.CompanyManager) {
      const { data } = await companyManagerGetApi(`/managers/course/all`, {
        params: {
          detailedView: true,
          course_slug: slugValue,
          company_id: ActiveCompany?.company?.id,
        },
      });
      setCourseDetails(data);
    } else {
      const { data } = await companyManagerGetApi(`/private-individual/course/all`, {
        params: {
          detailedView: true,
          course_slug: slugValue,
          private_individual_id: user?.id,
        },
      });
      setCourseDetails(data);
    }
  };

  useEffect(() => {
    CourseDetail();
  }, [currentLanguage, ActiveCompany?.company?.id, slugValue]);

  useEffect(() => {
    switch (user?.role_name) {
      case ROLES.Trainer:
        navigate('/');
        break;
      case ROLES.Admin:
      case ROLES.TrainingSpecialist:
        navigate(
          `/courses/view/${slugValue}?status=publish&activeTab=1&isCourse=true`
        );
        break;
      case ROLES.Accounting:
      case ROLES.SalesRep:
        navigate(`/courses/view/${slugValue}`);
        break;
      case ROLES.CompanyManager:
      case ROLES.PrivateIndividual:
        break;
      default:
        navigate('/');
        break;
    }
  }, [user]);

  const CourseDetails = courseDetails?.lessons?.map(
    (lesson: CourseLessonProps, index: number) => ({
      title: (
        <CourseSessionTitle
          lessonTitle={lesson?.title}
          lessonData={lesson}
          lessonNumber={index + 1}
        />
      ),
      content: (
        <CourseSession
          sessionData={lesson?.lesson_sessions}
          isCompanyEnrolled={courseDetails?.is_company_enrolled}
        />
      ),
    })
  );
  updateTitle(courseDetails?.title ?? 'Proleven Whiz');
  return (
    <section>
      <CourseHeader courseHeaderData={courseDetails} state={state} />
      <div className="container">
        <div className="flex flex-wrap pt-7 flex-row-reverse">
          <EnrollCourseCard
            courseDetails={courseDetails}
            type="course"
            courseDetailLoader={courseDetailLoader}
          />
          <div className="max-w-[calc(100%_-_500px_-_1.75rem)] w-full pe-7">
            <CourseDetailCard
              CourseDetails={CourseDetails}
              courseDetail={courseDetails}
            />
            <div className="mt-9">
              {coursesResponse?.data?.data.length > 0 && (
                <p className="text-2xl leading-[1.3] font-bold text-dark mb-5">
                  {t('CompanyManager.courseDetails.otherCoursesTitle')}
                </p>
              )}
              <div className="grid 1200:grid-cols-2 1600:grid-cols-3 gap-5">
                {Array.isArray(coursesResponse?.data?.data) &&
                  coursesResponse?.data?.data.length > 0 &&
                  coursesResponse?.data?.data.map(
                    (courseData: CourseDetailsProps) => (
                      <div key={courseData.id}>
                        <CourseCard
                          imagesrc={courseData?.image}
                          categories={courseData?.courseCategory?.name}
                          title={courseData?.title}
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
                          participant={t('CompanyManager.perParticipantTitle')}
                          onClick={() => {
                            navigate(
                              `${PRIVATE_NAVIGATION.companyManager.courses.list.path}/${courseData.slug}`
                            );
                          }}
                        />
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetails;
