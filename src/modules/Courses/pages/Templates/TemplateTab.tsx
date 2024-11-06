import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import TabComponent from 'components/Tabs';
import { useModal } from 'hooks/useModal';
import useUpdateQueryParameters from 'hooks/useSearchQuery';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { CourseStatus } from 'modules/Courses/Constants';
import CourseTamplateFilters from 'modules/Courses/components/CourseTamplateFilter/CourseTamplateFilters';
import { CoursesFilter } from 'modules/Courses/types/TemplateBundle';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import { FilterObject } from 'utils';

// ** Lazy Loader
const CourseTemplates = React.lazy(
  () => import('modules/Courses/pages/Templates/CourseTemplates')
);

type tabProps = {
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};

const PARAM_MAPPING = {
  courseCode: 'courseCode',
  courseCategory: 'category',
  courseSubCategory: 'subCategory',
};

const TemplateTab = () => {
  const url: URL = new URL(window.location.href);
  const params = url.search;
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.coursesTemplates'))
  const navigate = useNavigate();
  const bulkUploadModal = useModal();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const [filterApply, setFilterApply] = useState<CoursesFilter>({
    courseCode: params ? url.searchParams.getAll('courseCode') : [],
    category: params ? url.searchParams.getAll('courseCategory') : [],
    subCategory: params ? url.searchParams.getAll('courseSubCategory') : [],
  });

  const [courseFilter, setCourseFilter] = useState<CoursesFilter>({
    courseCode: params ? url.searchParams.getAll('courseCode') : [],
    category: params ? url.searchParams.getAll('courseCategory') : [],
    subCategory: params ? url.searchParams.getAll('courseSubCategory') : [],
  });
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState(state?.activeTab ?? 0);

  const isTemplateCheck = useCallback((filters: Record<string, any>) => {
    return (
      !_.isEmpty(filters.courseCode) ||
      !_.isEmpty(filters.category) ||
      !_.isEmpty(filters.subCategory)
    );
  }, []);

  useUpdateQueryParameters(
    filterApply,
    PARAM_MAPPING,
    'isTemplate',
    isTemplateCheck,
    state
  );

  const tabs: tabProps[] = [
    {
      title: 'templateIndex.draft',
      component: (
        <CourseTemplates
          search={search}
          status={CourseStatus.draft}
          activeTab={activeTab}
        />
      ),
      icon: 'bookIcon',
    },
    {
      title: 'templateIndex.unfilled',
      component: (
        <CourseTemplates
          search={search}
          status={CourseStatus.incomplete}
          activeTab={activeTab}
        />
      ),
      icon: 'unfilledIcon',
    },
  ];

  return (
    <div>
      <PageHeader
        text={t('CoursesManagement.Templates.coursesTemplates')}
        small
        isScroll
      >
        <div className="flex justify-end gap-2 flex-wrap">
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
          <Button
            variants="whiteBordered"
            onClickHandler={() => {
              bulkUploadModal.openModal();
            }}
          >
            <span className="w-5 h-5 inline-block me-2">
              <Image iconName="bulkUpload" iconClassName="w-full h-full" />
            </span>
            {t('PrivateMembers.membersButtons.bulkUploadButton')}
          </Button>
          <CourseTamplateFilters
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            setFilterApply={setFilterApply}
            filterApply={filterApply as unknown as FilterObject}
          />
          <Button
            onClickHandler={() =>
              navigate('/course/templates/add', {
                state: {
                  activeTab,
                },
              })
            }
            className="w-fit"
            variants="primary"
          >
            {t('CoursesManagement.Templates.createTemplate')}
          </Button>
        </div>
      </PageHeader>
      <div className="tab-wrapper">
        <CustomCard minimal bodyClass="!max-h-[unset]">
          <TabComponent
            current={activeTab}
            onTabChange={(status) => {
              dispatch(currentPageCount({ currentPage: 1 }));
              setActiveTab(status);
            }}
          >
            {tabs.map(({ title, component, icon }, index) => (
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
    </div>
  );
};

export default TemplateTab;
