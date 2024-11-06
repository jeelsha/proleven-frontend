// ** Components ***
import CustomCard from 'components/Card';
import CourseFilters from 'components/CourseFilter/CourseFilters';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosGet } from 'hooks/useAxios';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import _ from 'lodash';
import { tabProps } from 'modules/Courses/pages/CourseViewDetail/types';
import ProjectManagement from 'modules/ProjectManagement_module';
import CoursePipeline from 'modules/ProjectManagement_module/CoursePipeline';
import UserInfo from 'modules/UsersManagement/pages/viewUser';
import CourseDetail from '../pages/courseDetail';

// ** Constants ***
import { Fields } from 'modules/UsersManagement/constants';

// ** Hoooks
import { User } from 'modules/UsersManagement/types';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

// ** Types ***
import { FilterStatus } from 'types/common';

// ** Slice ***
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

// ** Utils ***
import { convertRoleToUrl } from 'utils';

const PARAM_MAPPING = {
  courseType: 'courseType',
  courseStatus: 'courseStatus',
  courseCategory: 'courseCategory',
  courseSubCategory: 'courseSubCategory',
  filterDate: 'filterDate',
  fundedBy: 'fundedBy',
  payment_mode: 'payment_mode',
};

const UserTabList = () => {
  const { t } = useTranslation();
  const [getUsersApi] = useAxiosGet();
  const dispatch = useDispatch();
  const location = useLocation();
  const match = location.pathname.match(/\/users\/([^/]+)\/([^/]+)/);
  const [activeTab, setActiveTab] = useState(location?.state?.activeTab ?? 0);
  const slug = match?.[2];
  const { Role_Fields } = Fields();
  const currentRole = Role_Fields.find(
    (role) => convertRoleToUrl(role.key) === match?.[1]
  );
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const roleName = currentRole?.key || '';

  const [user, setUser] = useState<User | null>(null);
  const [filterApply, setFilterApply] = useState<FilterStatus>({
    courseType: params.getAll('courseType') ?? [],
    courseStatus: params.getAll('courseStatus') ?? [],
    courseCategory: params.getAll('courseCategory') ?? [],
    courseSubCategory: params.getAll('courseSubCategory') ?? [],
    fundedBy: params.getAll('fundedBy') ?? [],
    payment_mode: params.get('payment_mode') ?? '',
    filterDate: params.get('filterDate')
      ? JSON.parse(params.get('filterDate') ?? '{}')
      : { startDate: '', endDate: '' },
  });
  const [courseFilter, setCourseFilter] = useState<FilterStatus>({
    courseType: params.getAll('courseType') ?? [],
    courseStatus: params.getAll('courseStatus') ?? [],
    courseCategory: params.getAll('courseCategory') ?? [],
    fundedBy: params.getAll('fundedBy') ?? [],
    courseSubCategory: params.getAll('courseSubCategory') ?? [],
    payment_mode: params.get('payment_mode') ?? '',
    filterDate: params.get('filterDate')
      ? JSON.parse(params.get('filterDate') ?? '{}')
      : { startDate: '', endDate: '' },
  });

  const getUser = async () => {
    const response = await getUsersApi(`/users/${slug}`, {
      params: {
        role: currentRole?.id,
        ignore_is_active: true,
      },
    });
    setUser(response?.data);
  };
  const backRoute = `${
    PRIVATE_NAVIGATION.usersManagement.view.roleView.path
  }${convertRoleToUrl(roleName)}`;
  useEffect(() => {
    getUser();
  }, [slug]);

  const tabs: tabProps[] = [
    {
      uniqueKey: 'personalInfo',
      title: 'UserManagement.Tab.personalInfo',
      component: <UserInfo user={user} refetch={getUser} roleName={roleName} />,
      icon: 'userProfile',
    },
    {
      uniqueKey: 'tabCourses',
      title: 'UserManagement.Tab.courses',
      component: user?.id ? (
        <CourseDetail
          activeTab={1}
          userSlug={slug}
          userRolePath={match?.[1]}
          roleName={roleName}
          trainingSpecialistId={user?.id}
        />
      ) : (
        <></>
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'project',
      title: 'UserManagement.Tab.projectPipeline',
      component: <ProjectManagement isViewable trainingSpecialistId={user?.id} />,
      icon: 'navProjectPipelineIcon',
    },
    {
      uniqueKey: 'coursePipeline',
      title: 'UserManagement.Tab.coursePipeline',
      component: <CoursePipeline isViewable trainingSpecialistId={user?.id} />,
      icon: 'navCoursePipelineIcon',
    },
  ];
  let courseTabs = [...tabs];

  if (roleName === ROLES.Trainer || roleName === ROLES.Accounting) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'project');
  }
  if (
    roleName === ROLES.SalesRep ||
    roleName === ROLES.Trainer ||
    roleName === ROLES.Accounting
  ) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'coursePipeline');
  }

  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(filterApply, PARAM_MAPPING, 'isInvoice', isTemplateCheck);

  return (
    <div>
      <div className="flex justify-between gap-2 mb-5 items-center">
        <PageHeader small text={user?.full_name} url={backRoute} />
        {courseTabs[activeTab]?.uniqueKey === 'tabCourses' && (
          <div className="flex justify-end">
            <CourseFilters
              componentType="userManagement"
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
              setFilterApply={setFilterApply}
              filterApply={filterApply}
            />
          </div>
        )}
      </div>
      <CustomCard minimal>
        <TabComponent
          current={activeTab}
          onTabChange={(status) => {
            dispatch(currentPageCount({ currentPage: 1 }));
            setActiveTab(status);
          }}
        >
          {courseTabs?.map(({ title, component, icon }, index) => (
            <TabComponent.Tab key={`TAB_${index + 1}`} title={t(title)} icon={icon}>
              {activeTab === index && component}
            </TabComponent.Tab>
          ))}
        </TabComponent>
      </CustomCard>
    </div>
  );
};
export default UserTabList;
