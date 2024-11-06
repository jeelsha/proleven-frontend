// ** imports **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import ClientCourseListing from './ClientCourseListing';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** imports **
import { useQueryGetFunction } from 'hooks/useQuery';
import ViewAttendee from 'modules/CompanyManager/pages/ViewAttendee';

// ** types **
import {
  CompanyCourseList,
  CompanyCourseListProps,
  FetchAttendeeDetails,
} from 'modules/CompanyManager/types';
import { TabProps } from 'types/common';

// ** redux **
import { useTitle } from 'hooks/useTitle';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';

const ClientAttendeeTab = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('ClientManagement.clientTabs.attendeeDetailsTitle'));

  const { state } = useLocation();

  const { currentPage } = useSelector(currentPageSelector);
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');
  const [attendeeView, setAttendeeView] = useState<FetchAttendeeDetails>();
  const [activeTab, setActiveTab] = useState(state?.activeTab ?? 0);
  const [clientGetApi, { isLoading: isAttendeeLoading }] = useAxiosGet();
  const url: URL = new URL(window.location.href);

  const { slug: SlugName } = useParams();
  async function CallApi() {
    const response = await clientGetApi(`/course/participates`, {
      params: {
        slug: SlugName,
      },
    });
    setAttendeeView(response?.data);
  }
  useEffect(() => {
    CallApi();
  }, []);
  const { response: courseList, isLoading: courseLoading } = useQueryGetFunction(
    `/course/participates`,
    {
      option: {
        participate_slug: SlugName,
        is_participate_code: true,
      },
      page: currentPage,
      limit,
      sort,
    }
  );

  const filteredCourseList: CompanyCourseListProps = {
    data: {
      data: (courseList?.data?.data || []).filter(
        (course: CompanyCourseList) => course?.course_id !== null
      ),
      count: courseList?.data?.data?.filter(
        (course: CompanyCourseList) => course?.course_id !== null
      ).length,
      lastPage: courseList?.data?.lastPage,
    },
  };
  const tabs: TabProps[] = [
    {
      uniqueKey: 'managerInfo',
      title: t('ClientManagers.clientTabs.managerInfo'),
      component: (
        <ViewAttendee
          attendee={attendeeView}
          isAttendeeLoading={isAttendeeLoading}
        />
      ),
      icon: 'userProfile',
    },
    {
      uniqueKey: 'courseInfo',
      title: t('ClientManagement.clientTabs.courseTitle'),
      component: (
        <ClientCourseListing
          activeTab={1}
          courseLoading={courseLoading}
          unknownCompany={state?.unknownCompany}
          courseList={filteredCourseList}
          setLimit={setLimit}
          setSort={setSort}
          sort={sort}
          limit={limit}
          t={t}
          comingFromManagerProfile={
            state?.comingFromManagerProfile ?? state?.comingFromAttendeeTab
          }
        />
      ),
      icon: 'bookIcon',
    },
  ];

  return (
    <>
      <PageHeader
        small
        text={attendeeView?.full_name ?? t('CoursesManagement.ViewCourse.Details')}
        url={
          url.searchParams.has('isAttendee')
            ? `${PRIVATE_NAVIGATION.clientsManagement.attendee.list.path}${
                url?.search ?? ''
              }`
            : PRIVATE_NAVIGATION.clientsManagement.attendee.list.path
        }
      />
      <CustomCard minimal>
        <TabComponent
          current={activeTab}
          onTabChange={(status) => setActiveTab(status)}
        >
          {tabs.map(({ title, component, icon }, index) => (
            <TabComponent.Tab key={`TAB_${index + 1}`} title={t(title)} icon={icon}>
              {activeTab === index && component}
            </TabComponent.Tab>
          ))}
        </TabComponent>
      </CustomCard>
    </>
  );
};
export default ClientAttendeeTab;
