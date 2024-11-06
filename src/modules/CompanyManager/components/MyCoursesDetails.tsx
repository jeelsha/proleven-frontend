// ** imports **
import { REACT_APP_API_BASE_URL, REACT_APP_DATE_FORMAT } from 'config';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import CourseCard from 'components/CourseCard';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import AttendeeList from 'modules/CompanyManager/components/AttendeeList';
import AttendeeExamListView from 'modules/CompanyManager/components/attendees/AttendeeExamListView';
import AttendeeExamListing from 'modules/CompanyManager/components/attendees/AttendeeExamListing';
import CourseDetailCard from 'modules/CompanyManager/components/courses/CourseDetailCard';
import { CourseHeader } from 'modules/CompanyManager/components/courses/CourseHeader';
import CourseSession from 'modules/CompanyManager/components/courses/CourseSession';
import CourseSessionTitle from 'modules/CompanyManager/components/courses/CourseSessionTitle';
import EnrollCourseCard from 'modules/CompanyManager/components/courses/EnrollCourseCard';
// ** constants
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
// ** hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import {
  CourseDetailProps,
  CourseDetailsProps,
  CourseLessonProps,
} from 'modules/CompanyManager/types';

// ** redux **
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import { IconTypes } from 'components/Icon/types';
import _ from 'lodash';
import { CourseStatus } from 'modules/Courses/Constants';
import AttendanceSheet from 'modules/Courses/pages/Attendance';
import { tabProps } from 'modules/Courses/pages/CourseViewDetail/types';
import { courseManagementAcceptedStage } from 'modules/ProjectManagement_module/enum';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useCompany } from 'redux-toolkit/slices/companySlice';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

const MyCoursesDetails = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const getActiveTab = () => {
    if (!_.isEmpty(state)) {
      if (state?.myCourseTab) {
        return state?.myCourseTab;
      }
      if (state?.courseId) {
        return state?.activeTab;
      }
      return 0;
    }
    return 0;
  };
  const [downloadAttendanceSheetOfCourse, { isLoading: pdfDownloading }] =
    useAxiosPost();
  const [companyManagerGetApi, { isLoading: courseDetailLoader }] = useAxiosGet();
  const [activeTab, setActiveTab] = useState(getActiveTab());
  const params = useParams();
  const slugValue = params.slug;
  const dispatch = useDispatch();
  const downloadModal = useModal();

  const firstRender = useRef(false);

  const [courseDetails, setCourseDetails] = useState<CourseDetailProps>();
  const ActiveCompany = useSelector(useCompany);
  const navigate = useNavigate();
  const user = useSelector(getCurrentUser);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { response: coursesResponse, isLoading } = useQueryGetFunction(
    '/managers/course/all',
    {
      limit: 3,
      option: {
        courseSubCategory: courseDetails?.courseSubCategory?.id,
        course_to_ignore: slugValue,
        company_id: ActiveCompany?.company?.id,
      },
    }
  );
  const [slugObj, setSlugObj] = useState<{
    examSlug: string;
    participateSlug: string;
  }>({
    examSlug: '',
    participateSlug: '',
  });
  const CourseDetail = async () => {
    if (user?.role_name === ROLES.CompanyManager) {
      const { data } = await companyManagerGetApi(`/managers/course/all`, {
        params: {
          detailedView: true,
          course_slug: slugValue,
          company_id: ActiveCompany?.company?.id,
          ...(!_.isEmpty(state) && { type: state?.courseType }),
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
  const DownloadPdf = async (language: string) => {
    const response = await downloadAttendanceSheetOfCourse(
      `/course/companies/participate/attendance-sheet/download/${slugValue}`,
      { companies: [ActiveCompany?.company?.id], language },
      { params: { userTimezone } }
    );
    if (response.data) {
      const extractedPath = response.data;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  useEffect(() => {
    if (user?.role_name === ROLES.CompanyManager && firstRender.current) {
      firstRender.current = false;
      navigate(PRIVATE_NAVIGATION.dashboard.view.path);
    }
    firstRender.current = true;
  }, [ActiveCompany]);

  useEffect(() => {
    CourseDetail();
  }, []);

  useEffect(() => {
    if (
      user?.role_name !== ROLES.CompanyManager &&
      user?.role_name !== ROLES.PrivateIndividual
    ) {
      navigate('/');
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
          meetingLink={lesson?.client_meeting_link}
          isCompanyEnrolled={courseDetails?.is_company_enrolled}
        />
      ),
    })
  );

  const tabs: tabProps[] = [
    {
      uniqueKey: 'courseDetail',
      title: 'CompanyManager.AttendeeList.courseDetailsTitle',
      component: (
        <CourseDetailCard
          CourseDetails={CourseDetails}
          courseDetail={courseDetails}
        />
      ),
      icon: 'pencilLineStrokeSD',
    },
    ...(courseDetails?.type === 'private'
      ? [
          ...(courseManagementAcceptedStage.includes(
            courseDetails?.stage?.name as string
          )
            ? [
                {
                  uniqueKey: 'attendeeList',
                  title: 'CompanyManager.AttendeeList.attendeeInfoTitle',
                  icon: 'bookIcon' as IconTypes,
                  component: (
                    <AttendeeList
                      courseMarkAs={courseDetails?.marked_as}
                      activeTab={activeTab}
                      fromCompanyManager
                      courseId={courseDetails?.id}
                      start_date={courseDetails?.start_date}
                      end_date={courseDetails?.end_date}
                    />
                  ),
                },
              ]
            : []),
        ]
      : [
          {
            uniqueKey: 'attendeeList',
            title: 'CompanyManager.AttendeeList.attendeeInfoTitle',
            icon: 'bookIcon' as IconTypes,
            component: (
              <AttendeeList
                courseMarkAs={courseDetails?.marked_as}
                activeTab={activeTab}
                fromCompanyManager
                courseId={courseDetails?.id}
                start_date={courseDetails?.start_date}
                end_date={courseDetails?.end_date}
              />
            ),
          },
        ]),

    {
      uniqueKey: 'attendeeExam',
      title: 'ExamModal.title',
      icon: 'userIcon2',
      component: (
        <div>
          <PageHeader
            url={`/manager/my-courses/${slugObj?.examSlug}`}
            customHandleBack={() => {
              setSlugObj?.({
                examSlug: '',
                participateSlug: '',
              });
            }}
            small
            showBackButton={!!slugObj?.examSlug}
            text={t('attendees.exam.title')}
          />
          {slugObj?.examSlug ? (
            <AttendeeExamListView
              examSlug={slugObj?.examSlug}
              participateSlug={slugObj?.participateSlug}
              courseSlug={slugValue}
            />
          ) : (
            <AttendeeExamListing setSlugObj={setSlugObj} />
          )}
        </div>
      ),
    },
    {
      uniqueKey: 'mainAttendeeList',
      title: 'AttendanceSheet',
      icon: 'bookIcon',
      component: (
        <>
          <div className="mb-4 flex justify-end gap-2">
            <h2 className="text-dark font-bold leading-[1.5] me-auto undefined text-2xl">
              {t('AttendanceSheet')}
            </h2>

            <Button
              className=""
              variants="primary"
              onClickHandler={() => {
                downloadModal?.openModal();
              }}
            >
              <span className="w-5 h-5 inline-block me-2">
                <Image iconName="downloadFile" iconClassName="w-full h-full" />
              </span>
              {t('AttendanceSheet')}
            </Button>
          </div>
          <div className="mb-4">
            <AttendanceSheet
              activeTab={activeTab}
              urlToNavigate={{
                url: `${PRIVATE_NAVIGATION.companyManager.myCourses.list.path}/${slugValue}`,
              }}
              showPageHeader={false}
            />
          </div>
          {downloadModal?.isOpen && (
            <DownloadFileModal
              modal={downloadModal}
              handleAccept={(data) => DownloadPdf(data)}
              germanIgnore="true"
              disabled={pdfDownloading}
            />
          )}
        </>
      ),
    },
  ];
  let courseTabs = [...tabs];

  if (courseDetails?.status === CourseStatus.draft) {
    courseTabs = courseTabs.filter(
      (item) =>
        item.uniqueKey === 'courseDetail' || item.uniqueKey === 'attendeeList'
    );
  }
  const handleActiveTab = (tab: number) => {
    setActiveTab(tab);
    dispatch(currentPageCount({ currentPage: 1 }));
    setSlugObj({
      examSlug: '',
      participateSlug: '',
    });
  };

  return (
    <div>
      <CourseHeader courseHeaderData={courseDetails} state={state} />
      <div className="container">
        <div className="flex flex-wrap pt-7 flex-row-reverse">
          <EnrollCourseCard
            courseDetails={courseDetails}
            courseDetailLoader={courseDetailLoader || isLoading}
          />
          {user?.role_name === ROLES.CompanyManager ? (
            <div className="max-w-[calc(100%_-_500px)] w-full pe-7">
              <TabComponent
                current={activeTab}
                onTabChange={(status) => {
                  handleActiveTab(status);
                }}
              >
                {courseTabs.map(({ title, component, icon }, index) => (
                  <TabComponent.Tab
                    key={`TAB_${index + 1}`}
                    title={t(title)}
                    icon={icon}
                  >
                    {activeTab === index && component}
                  </TabComponent.Tab>
                ))}
              </TabComponent>
            </div>
          ) : (
            <div className="max-w-[calc(100%_-_500px)] w-full pe-7">
              <CourseDetailCard
                CourseDetails={CourseDetails}
                courseDetail={courseDetails}
              />

              <div className="mt-9">
                <p className="text-2xl leading-[1.3] font-bold text-dark mb-5">
                  {t('CompanyManager.courseDetails.otherCoursesTitle')}
                </p>
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
                            courseStatus={courseData?.status}
                            courseType={courseData?.type}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursesDetails;
