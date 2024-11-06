import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import CourseFilters from 'components/CourseFilter/CourseFilters';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import _ from 'lodash';
import { CourseStatus, CourseType } from 'modules/Courses/Constants';
import SurveyResult from 'modules/Courses/components/SurveyTemplate/SurveyResult';
import CompanyDetail from 'modules/Courses/pages/CourseViewDetail/CompanyDetail';
import QuoteDetails from 'modules/Courses/pages/CourseViewDetail/QuoteDetails';
import { Fields } from 'modules/UsersManagement/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { FilterStatus } from 'types/common';
import AcceptTrainerAdmin from '../AdminTrainerRequest';
import CourseAttendeeList from '../CourseAttendeeList';
import ViewCourse from '../ViewCourse';
import { tabProps } from './types';

const ViewCourseIndex = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const markAsPublishModal = useModal();
  const user = useSelector(getCurrentUser);
  const { Role_Fields } = Fields();
  const currentRole = Role_Fields.find((role) => role.key === ROLES.CompanyManager);
  const url: URL = new URL(window.location.href);
  const [activeTab, setActiveTab] = useState<string>(
    state?.corseActiveTab ?? 'viewCourse'
  );
  const [currentTabTitle, setCurrentTabTitle] = useState<string>(t('courseDetail'));
  const [courseBundleId, setCourseBundleId] = useState<number | null>(null);
  const rolesPermissionModal = useModal();

  const [objToPass, setObjToPass] = useState<{ [key: string]: unknown }>({});
  const [filterApply, setFilterApply] = useState<FilterStatus>({
    companies: [],
  });

  const [courseFilter, setCourseFilter] = useState<FilterStatus>({
    companies: [],
  });

  const [isButtonsVisible, setIsButtonsVisible] = useState(true);

  const [markAsPublished, { isLoading: publishingCourse }] = useAxiosPost();

  useEffect(() => {
    if (!_.isEmpty(state)) {
      setObjToPass({
        [!_.isEmpty(state) && state.comingFromCoursePipeline && 'course_cardId']:
          !_.isEmpty(state) && state.comingFromCoursePipeline && state.course_cardId,
        [!_.isEmpty(state) && state.fromClientManager && 'role']: currentRole?.id,
        [!_.isEmpty(state) && state.fromClientManager && 'companyId']:
          state?.companyId,
        ...state,
      });
    }
  }, [state]);

  const tabs: tabProps[] = [
    {
      uniqueKey: 'viewCourse',
      title: 'CoursesManagement.ViewCourse.Details',
      component: (
        <ViewCourse
          setCourseBundleId={setCourseBundleId}
          setCurrentTabTitle={setCurrentTabTitle}
        />
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'viewAttendees',
      title: 'CompanyManager.AttendeeList.title',
      component: <CourseAttendeeList filterApply={filterApply} />,
      icon: 'userGroupIcon',
    },
    {
      uniqueKey: 'viewTrainer',
      title: 'trainerAsItIs',
      component: (
        <AcceptTrainerAdmin
          currentTabTitle={currentTabTitle}
          courseType={state?.type}
          courseStatus={state?.status}
        />
      ),
      icon: 'teacher',
    },
    {
      uniqueKey: 'quotes',
      title: 'courseIndex.quotes',
      component: <QuoteDetails state={state} setActiveTab={setActiveTab} />,
      icon: 'navQuotesIcon',
    },
    {
      uniqueKey: 'company',
      title: 'courseIndex.company',
      component: <CompanyDetail state={state} setActiveTab={setActiveTab} />,
      icon: 'userStrokeSD',
    },
    {
      uniqueKey: 'surveyResult',
      title: 'courseIndex.surveyResult',
      component: <SurveyResult />,
      icon: 'navTemplateManagementIcon',
    },
  ];

  let courseTabs = [...tabs];

  if ((state?.status || url.searchParams.get('status')) !== CourseStatus.publish) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'viewAttendees');
  }
  if ((state?.status || url.searchParams.get('status')) !== CourseStatus.publish) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'surveyResult');
  }
  if ((state?.status || url.searchParams.get('status')) === CourseStatus.publish) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'accessCourse');
  }
  if (
    state?.isTemplate ||
    url.searchParams.get('isTemplate') ||
    state?.isTemplateBundle
  )
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'viewTrainer');
  if (user?.role_name !== ROLES.Admin) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'accessCourse');
  }
  if ((state?.type || url.searchParams.get('type')) !== CourseType.Private) {
    courseTabs = courseTabs.filter(
      (item) => item.uniqueKey !== 'quotes' && item.uniqueKey !== 'company'
    );
  }

  const pageHeaderNavigate = () => {
    switch (true) {
      case url.searchParams.has('isCourse'):
        return `/course-management${url.search ?? ''}`;
      case _.isEmpty(state):
        return '/course-management';
      case state.comingFromCoursePipeline:
        return '/course-pipeline';
      case state.comingFromCourseRequest:
        return `/manager/requested-courses/${state.slug}`;
      case state.isTemplate && url.searchParams.has('isTemplate'):
        return `/course/templates${url.search ?? ''}`;
      case state.isTemplate:
        return '/course/templates';
      case state.isTemplateBundle && !!state.bundleSlug:
        return `/template-bundle/view?slug=${state.bundleSlug}`;
      case state.isTemplateBundle:
        return '/template-bundle';
      case state.isCourseBundle && !!state.courseBundleSlug:
        return `/course-bundle/view?slug=${state.courseBundleSlug}`;
      case state.isCourseBundle:
        return '/course-bundle';
      case state.fromTrainer:
        return `/users/${state.userRolePath}/${state.userSlug}`;
      case state.fromClientCompany:
        return `/clients/company/view/${state?.userSlug}`;
      case state.fromClientManager:
        return `/clients/managers/${state?.userSlug}`;
      case state?.fromAttendee:
        return `/clients/attendee/${state?.attendeeSlug}`;
      case state?.fromDashboard:
        return `/`;
      default:
        return '/course-management';
    }
  };
  const getTitleText = (): string => {
    if (activeTab === 'viewCourse') {
      return state?.isTemplate || url.searchParams.get('isTemplate')
        ? t('CoursesManagement.ViewCourse.Template')
        : t('Calendar.courseEventTitle');
    }
    return currentTabTitle;
  };

  const handleMarkAsPublish = async () => {
    if (slug) {
      const { error } = await markAsPublished(`/course/mark-as-publish/${slug}`, {});
      markAsPublishModal?.closeModal();
      if (!error) {
        setIsButtonsVisible(false);
      }
    }
  };

  const renderSideComponent = () => {
    if (
      isButtonsVisible &&
      (state?.status === CourseStatus.draft ||
        url.searchParams.get('status') === CourseStatus.draft) &&
      (user?.role_name === ROLES.TrainingSpecialist ||
        user?.role_name === ROLES.Admin)
    ) {
      return (
        <div className="flex items-center gap-3 mb-2.5">
          <Button
            className="h-fit gap-1.5"
            small
            variants="secondary"
            onClickHandler={() => {
              navigate(`/course-management/edit?slug=${slug}`, {
                state: {
                  activeTab: 0,
                },
              });
            }}
          >
            <Image iconName="editPen" iconClassName="w-4 h-4" />
            {t('CoursesManagement.Edit')}
          </Button>
          <Button
            className="h-fit"
            small
            variants="primary"
            onClickHandler={() => {
              markAsPublishModal.openModal();
            }}
          >
            <Image iconName="bulkUpload" iconClassName="w-4 h-4" />
            {t('CoursesManagement.publish')}
          </Button>
        </div>
      );
    }

    if (
      state?.fromDashboard &&
      (state?.status === CourseStatus.publish ||
        url.searchParams.get('status') === CourseStatus.publish) &&
      (user?.role_name === ROLES.TrainingSpecialist ||
        user?.role_name === ROLES.Admin)
    ) {
      return (
        <div className="flex items-center gap-3 mb-2.5">
          <Button
            className="h-fit gap-1.5"
            small
            variants="secondary"
            onClickHandler={() => {
              navigate(`/courses/company-list/${slug}`, {
                state: {
                  ...state,
                  url: `/courses/view/${slug}`,
                  publish_course_slug: slug,
                  // activeTab,
                },
              });
            }}
          >
            <Image iconName="userGroupIcon" iconClassName="stroke-current w-5 h-5" />
            {t('SideNavigation.client.companyTitle')}
          </Button>
        </div>
      );
    }
    return null;
  };

  const currentTab = courseTabs.findIndex((item) => item.uniqueKey === activeTab);
  return (
    <>
      <div className="container">
        <PageHeader
          small
          url={pageHeaderNavigate()}
          text={getTitleText()}
          passState={objToPass}
        >
          <div className="flex justify-end gap-2 flex-wrap">
            {activeTab === 'viewAttendees' && (
              <CourseFilters
                componentType="attendeesTabFilter"
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                setFilterApply={setFilterApply}
              />
            )}
            {activeTab === 'accessCourse' &&
            (_.isNull(courseBundleId) || _.isUndefined(courseBundleId)) ? (
              <Button
                className="flex whitespace-nowrap gap-1 ms-auto"
                onClickHandler={() => rolesPermissionModal.openModal()}
                variants="primary"
              >
                <span>
                  <Image iconName="plusSquareIcon" />
                </span>
                {t('Access.AddButton.Title')}
              </Button>
            ) : (
              ''
            )}
          </div>
        </PageHeader>
        <div className="tab-wrapper">
          <CustomCard minimal bodyClass="!max-h-[unset]">
            <TabComponent
              current={currentTab}
              onTabChange={(index) => setActiveTab(courseTabs[index].uniqueKey)}
              sideComponent={renderSideComponent()}
            >
              {courseTabs.map(({ title, component, icon }, index) => {
                return (
                  <TabComponent.Tab
                    key={`tab_${index + 1}`}
                    title={t(title)}
                    icon={icon}
                  >
                    {currentTab === index && component}
                  </TabComponent.Tab>
                );
              })}
            </TabComponent>
          </CustomCard>
        </div>
        {markAsPublishModal && markAsPublishModal.isOpen && (
          <ConfirmationPopup
            modal={markAsPublishModal}
            bodyText={t('CoursesManagement.MarkAsPublish.course')}
            popUpType="primary"
            confirmButtonText={t('CoursesManagement.publish')}
            deleteTitle={t('CoursesManagement.MarkAsPublished')}
            cancelButtonText={t('Button.cancelButton')}
            cancelButtonFunction={() => {
              markAsPublishModal.closeModal();
            }}
            confirmButtonFunction={handleMarkAsPublish}
            isLoading={publishingCourse}
          />
        )}
      </div>
    </>
  );
};

export default ViewCourseIndex;
