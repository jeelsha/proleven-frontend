import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import CourseFilters from 'components/CourseFilter/CourseFilters';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import TabComponent from 'components/Tabs';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { CourseStatus } from 'modules/Courses/Constants';
import { setParamsToApi } from 'modules/Courses/helper/CourseCommon';
import { CourseResponse } from 'modules/Courses/types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import {
  currentPageCount,
  currentPageSelector,
} from 'redux-toolkit/slices/paginationSlice';
import { FilterStatus, Role } from 'types/common';
import { useHandleExport } from 'utils';

// **Lazy Loader
const CreateCourseModal = React.lazy(
  () => import('modules/Courses/components/Management/CreateCourseModal')
);
const CourseManagement = React.lazy(
  () => import('modules/Courses/pages/Management/CourseManagement')
);

type tabProps = {
  uniqueKey: string;
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};

const PARAM_MAPPING = {
  courseStatus: 'courseStatus',
  courseCategory: 'courseCategory',
  courseSubCategory: 'courseSubCategory',
  companies: 'companies',
  trainingSpecialist: 'trainingSpecialist',
  courseType: 'courseType',
  fundedBy: 'fundedBy',
  filterDate: 'filterDate',
  payment_mode: 'payment_mode',
};

const CourseIndex = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.coursesManagement'));

  const dispatch = useDispatch();
  const { state } = useLocation();
  const createCourseModal = useModal();
  const [getAllCoursesByStatus, { isLoading: exportLoading }] = useAxiosGet();
  const { exportDataFunc } = useHandleExport();
  const url: URL = new URL(window.location.href);
  const QueryParams = url.search;

  const { currentPage } = useSelector(currentPageSelector);

  const [filterApply, setFilterApply] = useState<FilterStatus>({
    courseStatus: QueryParams ? url.searchParams.getAll('courseStatus') : [],
    courseType: QueryParams ? url.searchParams.getAll('courseType') : [],
    fundedBy: QueryParams ? url.searchParams.getAll('fundedBy') : [],
    courseCategory: QueryParams ? url.searchParams.getAll('courseCategory') : [],
    courseSubCategory: QueryParams
      ? url.searchParams.getAll('courseSubCategory')
      : [],
    companies: QueryParams ? url.searchParams.getAll('companies') : [],
    trainingSpecialist: QueryParams
      ? url.searchParams.getAll('trainingSpecialist')
      : [],
    filterDate: QueryParams
      ? url.searchParams.get('filterDate')
        ? JSON.parse(url.searchParams.get('filterDate') ?? '{}')
        : { startDate: '', endDate: '' }
      : { startDate: '', endDate: '' },
    payment_mode: QueryParams ? url.searchParams.get('payment_mode') ?? '' : '',
  });
  const [courseFilter, setCourseFilter] = useState<FilterStatus>({
    courseStatus: QueryParams ? url.searchParams.getAll('courseStatus') : [],
    courseType: QueryParams ? url.searchParams.getAll('courseType') : [],
    fundedBy: QueryParams ? url.searchParams.getAll('fundedBy') : [],
    courseCategory: QueryParams
      ? url.searchParams.getAll('courseCategory')?.[0]?.split(',')
      : [],
    courseSubCategory: QueryParams
      ? url.searchParams.getAll('courseSubCategory')?.[0]?.split(',')
      : [],
    companies: QueryParams ? url.searchParams.getAll('companies') : [],
    trainingSpecialist: QueryParams
      ? url.searchParams.getAll('trainingSpecialist')
      : [],
    filterDate: QueryParams
      ? url.searchParams.get('filterDate')
        ? JSON.parse(url.searchParams.get('filterDate') ?? '{}')
        : { startDate: '', endDate: '' }
      : { startDate: '', endDate: '' },
    payment_mode: QueryParams ? url.searchParams.get('payment_mode') ?? '' : '',
  });
  const user = useSelector(getCurrentUser);

  const activeRoleArray: Array<string | undefined> = [
    ROLES.Trainer,
    ROLES.TrainingSpecialist,
    ROLES.Admin,
  ];

  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState(
    activeRoleArray.includes(user?.role_name) ? 1 : state?.activeTab ?? 0
  );

  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return Object.values(filters).some((value) => {
      return typeof value === 'object'
        ? Object.values(value).some((item) => !_.isEmpty(item))
        : !_.isEmpty(value);
    });
  }, []);

  useUpdateQueryParameters(
    filterApply,
    PARAM_MAPPING,
    'isCourse',
    isTemplateCheck,
    state
  );

  const tabs: tabProps[] = [
    {
      uniqueKey: 'draftCourse',
      title: 'courseIndex.draft',
      component: (
        <CourseManagement
          search={search}
          status={CourseStatus.draft}
          activeTab={activeTab}
        />
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'publishCourse',
      title: 'courseIndex.published',
      component: (
        <CourseManagement
          search={search}
          status={CourseStatus.publish}
          activeTab={activeTab}
        />
      ),
      icon: 'publishCourseIcon',
    },
    {
      uniqueKey: 'unfilledCourse',
      title: 'courseIndex.unfilled',
      component: (
        <CourseManagement
          search={search}
          status={CourseStatus.incomplete}
          activeTab={activeTab}
        />
      ),
      icon: 'unfilledIcon',
    },
  ];

  let courseTabs = [...tabs];

  if (user?.role_name === ROLES.Trainer || user?.role_name === ROLES.SalesRep) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'unfilledCourse');
  }

  const getCourseStatus = () => {
    if (courseTabs[activeTab].uniqueKey === 'draftCourse') {
      return CourseStatus.draft;
    }
    if (courseTabs[activeTab].uniqueKey === 'publishCourse') {
      return CourseStatus.publish;
    }
    if (courseTabs[activeTab].uniqueKey === 'unfilledCourse') {
      return CourseStatus.incomplete;
    }
  };

  const roleArray: Role[] = [ROLES.Trainer, ROLES.SalesRep, ROLES.Accounting];

  const courseType = setParamsToApi('courseType');
  const courseCategory = setParamsToApi('courseCategory');
  const fundedBy = setParamsToApi('fundedBy');
  const courseSubCategory = setParamsToApi('courseSubCategory');
  const companies = setParamsToApi('companies');
  const trainingSpecialist = setParamsToApi('trainingSpecialist');
  const filterDate = setParamsToApi('filterDate');

  const handleExportData = async () => {
    const resp = await getAllCoursesByStatus('/course', {
      params: {
        tableView: true,
        status: getCourseStatus(),
        limit: 10,
        page: currentPage,
        search,
        course_type: courseType,
        courseCategory,
        courseSubCategory,
        fundedBy,
        companies,
        trainingSpecialist,
        allLanguage: courseTabs[activeTab].uniqueKey === 'unfilledCourse',
        ...filterDate,
      },
    });
    const modifiedVal = resp?.data?.data?.map((data: CourseResponse) => {
      return { ...data, companies: data?.companies?.toString() };
    });
    exportDataFunc({
      response: modifiedVal,
      exportFor: 'course',
    });
  };

  return (
    <>
      {createCourseModal.isOpen ? (
        <CreateCourseModal modal={createCourseModal} />
      ) : (
        ''
      )}
      <PageHeader small text={t('SideNavigation.coursesManagement')} isScroll>
        <div className="flex justify-end gap-2">
          <div>
            <SearchComponent
              onSearch={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e?.target?.value);
              }}
              value={search}
              placeholder={t('Table.tableSearchPlaceholder')}
              onClear={() => {
                setSearch('');
              }}
            />
          </div>
          {user?.role_name === ROLES.Trainer ? (
            ''
          ) : (
            <Button
              className="w-fit "
              variants="whiteBordered"
              onClickHandler={() => {
                handleExportData();
              }}
              isLoading={exportLoading}
              disabled={exportLoading}
            >
              <span className="w-5 h-5  inline-block me-2">
                <Image iconName="exportCsv" iconClassName="w-full h-full" />
              </span>
              {t('ClientManagers.managersButtons.exportButton')}
            </Button>
          )}
          <CourseFilters
            componentType="courseTab"
            courseStatus={getCourseStatus()}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            setFilterApply={setFilterApply}
            filterApply={filterApply}
          />
          {user?.role_name && !roleArray.includes(user?.role_name as Role) ? (
            <Button
              className="flex whitespace-nowrap gap-1"
              onClickHandler={createCourseModal.openModal}
              variants="primary"
            >
              <span>
                <Image iconName="plusSquareIcon" />
              </span>
              {t('CoursesManagement.createCourse')}
            </Button>
          ) : (
            ''
          )}
        </div>
      </PageHeader>
      <div className="tab-wrapper">
        <CustomCard minimal bodyClass="!max-h-[unset]">
          <TabComponent
            current={activeTab}
            onTabChange={(status) => {
              setFilterApply({});
              setCourseFilter({});
              dispatch(currentPageCount({ currentPage: 1 }));
              setActiveTab(status);
            }}
          >
            {courseTabs?.map(({ title, component, icon }, index) => (
              <TabComponent.Tab
                key={`TAB_${index + 1}`}
                title={t(title)}
                icon={icon}
              >
                {activeTab === index && component}
              </TabComponent.Tab>
            ))}
          </TabComponent>
        </CustomCard>
      </div>
    </>
  );
};

export default CourseIndex;
