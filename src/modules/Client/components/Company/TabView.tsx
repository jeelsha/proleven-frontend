import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import TabComponent from 'components/Tabs';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosGet } from 'hooks/useAxios';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { CompanyViewProps } from 'modules/Client/types';
import { COURSE_TYPE } from 'modules/Courses/Constants';
import { tabProps } from 'modules/Courses/pages/CourseViewDetail/types';
import { Fields } from 'modules/UsersManagement/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { useDebounce, useHandleExport } from 'utils';
import AttendeeListing from './AttendeeListing';
import CourseListing from './CourseListing';
import ProfileListing from './ProfileListing';
import ViewForm from './ViewDetails';

const TabView = () => {
  const updateTitle = useTitle();
  const { t } = useTranslation();
  const params = useParams();
  const [GetCompany] = useAxiosGet();
  const [getAllUserByRole] = useAxiosGet();
  const { exportDataFunc } = useHandleExport();
  const { state } = useLocation();
  const allRoles = useSelector(getRoles);

  const getActiveTab = () => {
    if (!_.isEmpty(state)) {
      if (state?.fromCourse) {
        return 0;
      }
      if (state?.activeTab) {
        return state?.activeTab;
      }
      return 0;
    }
    return 0;
  };
  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [search, setSearch] = useState<string>('');

  const debouncedSearch = useDebounce(search, 500);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);
  const { Role_Fields } = Fields();
  const currentRolePrivateIndividual = Role_Fields.find(
    (role) => role.key === ROLES.PrivateIndividual
  );

  const [companyData, setCompanyData] = useState<CompanyViewProps | undefined>();
  const user = useSelector(getCurrentUser);

  const GetCompanyId = async () => {
    const response = await GetCompany(`/companies/${params.slug}`, {
      params: { role: currentRole?.id },
    });
    const properData = response.data;
    if (properData) {
      properData.accounting_emails =
        typeof properData?.accounting_emails === 'string'
          ? JSON.parse(properData?.accounting_emails)
          : properData?.accounting_emails ?? null;
    }
    setCompanyData(properData);
  };
  useEffect(() => {
    GetCompanyId();
  }, []);

  const tabs: tabProps[] = [
    {
      uniqueKey: 'viewUserProfile',
      title: t('ClientManagement.clientTabs.companyInfo'),
      component: companyData ? <ViewForm companyInfo={companyData} /> : <></>,
      icon: 'userProfile',
    },
    {
      uniqueKey: 'academyCourse',
      title: t('ClientManagement.clientTabs.academyCourse'),
      component: companyData?.id ? (
        <CourseListing
          CompanyId={companyData?.id as number | undefined}
          activeTab={1}
          userSlug={params?.slug}
          role={state?.role}
          type={COURSE_TYPE.Academy}
        />
      ) : (
        <></>
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'privateCourse',
      title: t('ClientManagement.clientTabs.privateCourse'),
      component: companyData?.id ? (
        <CourseListing
          CompanyId={companyData?.id as number | undefined}
          activeTab={2}
          userSlug={params?.slug}
          role={state?.role}
          type={COURSE_TYPE.Private}
        />
      ) : (
        <></>
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'attendeeList',
      title: t('ClientManagement.clientTabs.attendeeTitle'),
      component: companyData?.id ? (
        <AttendeeListing
          debouncedSearch={debouncedSearch}
          CompanyId={companyData?.id as number | undefined}
          group
        />
      ) : (
        <></>
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'profileList',
      title: t('Profiles.profiles'),
      component: companyData?.id ? (
        <ProfileListing company_id={companyData?.id} />
      ) : (
        <></>
      ),
      icon: 'bookIcon',
    },
  ];

  let renderTab = [...tabs];

  if (user?.role_name === ROLES.SalesRep || user?.role_name === ROLES.Accounting) {
    renderTab = renderTab.filter(
      (item) =>
        item.uniqueKey !== 'privateCourse' &&
        item.uniqueKey !== 'academyCourse' &&
        item.uniqueKey !== 'attendeeList'
    );
  }

  const handleActiveTab = (tab: number) => {
    setActiveTab(tab);
  };

  const handleExportData = async () => {
    const resp = await getAllUserByRole('/course/participates', {
      params: {
        company_id: companyData?.id as number,
        view: true,
        isGroupByCode: true,
      },
    });
    if (currentRolePrivateIndividual) {
      exportDataFunc({
        response: resp?.data?.data,
        currentRole: currentRolePrivateIndividual,
        exportFor: 'attendee',
      });
    }
  };

  const returnTo = () => {
    if (state?.fromCourse) {
      return state?.url;
    }
    if (state?.fromDashboard) {
      return PRIVATE_NAVIGATION.dashboard.view.path;
    }
    return PRIVATE_NAVIGATION.clientsManagement.company.list.path;
  };
  updateTitle(companyData?.name ?? t('ClientManagement.clientForm.viewTitle'))
  return (
    <>
      <PageHeader
        small
        text={companyData?.name ?? t('ClientManagement.clientForm.viewTitle')}
        url={returnTo()}
        passState={{
          ...state,
          ...(state?.fromCourse ? { corseActiveTab: 'company' } : {}),
        }}
      >
        {activeTab === 3 ? (
          <div className="flex gap-2">
            <Button
              className="whitespace-nowrap"
              variants="whiteBordered"
              onClickHandler={() => {
                handleExportData();
              }}
            >
              <span className="w-5 h-5 inline-block me-2">
                <Image iconName="exportCsv" iconClassName="w-full h-full" />
              </span>
              {t('ClientManagers.managersButtons.exportButton')}
            </Button>
            <SearchComponent
              onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e?.target?.value);
              }}
              value={search}
              placeholder={t('Table.attendeeSearchPlaceholder')}
              onClear={() => {
                setSearch('');
              }}
            />
          </div>
        ) : (
          <></>
        )}
      </PageHeader>
      <CustomCard minimal>
        <TabComponent
          current={activeTab}
          onTabChange={(status) => {
            handleActiveTab(status);
          }}
        >
          {renderTab.map(({ title, component, icon }, index) => (
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
