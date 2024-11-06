import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import TabComponent from 'components/Tabs';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import { CourseStatus } from 'modules/Courses/Constants';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

// ** Lazy Loader
const CourseBundle = React.lazy(() => import('modules/Courses/pages/CourseBundle'));
const CreateCourseBundle = React.lazy(
  () => import('modules/Courses/pages/CourseBundleTab/CreateCourseBundle')
);
const CourseManagement = React.lazy(
  () => import('modules/Courses/pages/Management/CourseManagement')
);

type tabProps = {
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};
const CourseBundleIndex = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('SideNavigation.courseBundle'))

  const dispatch = useDispatch();
  const { state } = useLocation();
  const createCourseModal = useModal();
  const user = useSelector(getCurrentUser);

  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState(state?.activeTab ?? 0);

  const tabs: tabProps[] = [
    {
      title: t('CourseBundle.draftBundles'),
      component: (
        <CourseBundle
          search={search}
          status={CourseStatus.draft}
          activeTab={activeTab}
        />
      ),
      icon: 'bookIcon',
    },
    {
      title: t('CourseBundle.publishedBundles'),
      component: (
        <CourseBundle
          search={search}
          status={CourseStatus.publish}
          activeTab={activeTab}
        />
      ),
      icon: 'bookIcon',
    },
  ];
  const courseTabs = [...tabs];

  if (user?.role_name === ROLES.Trainer) {
    courseTabs.splice(2, 0, {
      title: t('Course.bundledCourses'),
      component: <CourseManagement search={search} status={CourseStatus.publish} />,
      icon: 'bookIcon',
    });
  }
  return (
    <>
      {createCourseModal.isOpen ? (
        <CreateCourseBundle modal={createCourseModal} />
      ) : (
        ''
      )}
      <PageHeader
        small
        text={t('SideNavigation.courseBundle')}
        isScroll
      >
        <div className="flex justify-end gap-2 ">
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
          <Button
            variants="primary"
            className="flex whitespace-nowrap gap-1"
            onClickHandler={createCourseModal.openModal}
          >
            <span>
              <Image iconName="plusSquareIcon" />
            </span>
            {t('CourseBundle.create')}
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
        </CustomCard>
      </div>
    </>
  );
};

export default CourseBundleIndex;
