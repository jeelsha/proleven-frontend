// ** imports **
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import { AttendeeInfo } from 'modules/CompanyManager/components/attendees/AttendeeInfo';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** types **
import TabComponent from 'components/Tabs';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import {
  CompanyCourseListProps,
  FetchAttendeeDetails,
} from 'modules/CompanyManager/types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { currentPageSelector } from 'redux-toolkit/slices/paginationSlice';
import { TabProps } from 'types/common';
import ClientCourseListing from './ClientCourseListing';

const AttendeeViewDetail = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('ClientManagement.clientTabs.attendeeDetailsTitle'));

  const [companyManagerGetApi] = useAxiosGet();
  const { state } = useLocation();
  const { currentPage } = useSelector(currentPageSelector);
  const params = useParams();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(0);
  const [attendeeDetail, setAttendeeDetail] = useState<
    FetchAttendeeDetails | undefined
  >();
  const [limit, setLimit] = useState<number>(10);
  const [sort, setSort] = useState<string>('-updated_at');

  async function CallApi() {
    const response = await companyManagerGetApi(`/course/participates`, {
      params: {
        slug: params.slug,
        company_id: location?.state?.companyId,
      },
    });
    setAttendeeDetail(response?.data);
  }

  const { response: courseList, isLoading: courseLoading } = useQueryGetFunction(
    `/course/participates`,
    {
      option: {
        participate_slug: attendeeDetail?.slug,
        is_participate_code: true,
      },
      page: currentPage,
      limit,
      sort,
    }
  );

  useEffect(() => {
    CallApi();
  }, []);

  const tabs: TabProps[] = [
    {
      uniqueKey: 'managerInfo',
      title: t('CompanyManager.AttendeeList.attendeeInfoTitle'),
      component: <AttendeeInfo data={attendeeDetail} />,
      icon: 'userProfile',
    },
    {
      uniqueKey: 'courseInfo',
      title: t('ClientManagement.clientTabs.courseTitle'),
      component: (
        <ClientCourseListing
          activeTab={0}
          courseLoading={courseLoading}
          unknownCompany={state?.unknownCompany}
          courseList={courseList as CompanyCourseListProps}
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

  const getUrl = () => {
    if (!_.isEmpty(location) && location.state.comingFromManagerProfile) {
      return '/attendee';
    }
    if (state?.activeTab === undefined) {
      return '/attendee';
    }

    return `/manager/my-courses/${attendeeDetail?.course?.slug}`;
  };

  return (
    <section className="pt-5 container">
      <PageHeader
        small
        text={
          attendeeDetail?.full_name ??
          t('CompanyManager.AttendeeList.attendeeDetailsTitle')
        }
        url={getUrl()}
        passState={{ ...location?.state }}
        isScroll
      />
      <CustomCard
        bodyClass="max-h-[calc(100dvh_-_300px)] px-0 overflow-y-auto "
        minimal
      >
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
    </section>
  );
};

export default AttendeeViewDetail;
