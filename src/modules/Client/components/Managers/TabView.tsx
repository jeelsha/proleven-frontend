import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { useAxiosGet } from 'hooks/useAxios';
import { useTitle } from 'hooks/useTitle';
import { ManagerData } from 'modules/Client/types';
import { COURSE_TYPE } from 'modules/Courses/Constants';
import { tabProps } from 'modules/Courses/pages/CourseViewDetail/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import CourseListing from './CourseListing';
import ViewDetails from './ViewDetails';

const TabView = () => {
  const { t } = useTranslation();
  const [managerView, setManagerView] = useState<ManagerData>();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('ClientManagers.clientTabs.managerDetailTitle'));
  const [clientGetApi] = useAxiosGet();
  const { slug } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const [managerId, setManagerId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState(location.state.activeTab ?? 0);
  const [userId, setUserId] = useState<number | undefined>();
  async function CallApi() {
    const response = await clientGetApi(`/managers/${slug}`, {
      params: {
        companyId: location.state.compayId,
        role: location.state.role,
      },
    });
    setManagerId(response?.data?.id);
    setManagerView(response?.data);
    setUserId(response?.data?.user_id);
  }
  useEffect(() => {
    CallApi();
  }, []);

  const tabs: tabProps[] = [
    {
      uniqueKey: 'viewUserProfile',
      title: t('ClientManagers.clientTabs.managerInfo'),
      component: <ViewDetails data={managerView} />,
      icon: 'userProfile',
    },
    {
      uniqueKey: 'academyCourse',
      title: t('ClientManagement.clientTabs.academyCourse'),
      component: (
        <CourseListing
          managerId={managerId}
          userId={userId}
          companyId={location?.state?.companyId}
          activeTab={1}
          userSlug={slug}
          type={COURSE_TYPE.Academy}
        />
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'privateCourse',
      title: t('ClientManagement.clientTabs.privateCourse'),
      component: (
        <CourseListing
          managerId={managerId}
          userId={userId}
          companyId={location?.state?.companyId}
          activeTab={1}
          userSlug={slug}
          type={COURSE_TYPE.Private}
        />
      ),
      icon: 'bookIcon',
    },
  ];

  return (
    <>
      <PageHeader
        small
        text={managerView?.user?.full_name}
        url={PRIVATE_NAVIGATION.clientsManagement.managers.list.path}
      />
      <CustomCard minimal>
        <TabComponent
          current={activeTab}
          onTabChange={(status) => {
            dispatch(currentPageCount({ currentPage: 1 }));

            setActiveTab(status);
          }}
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

export default TabView;
