// ** Components **
import Button from 'components/Button/Button';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import TabComponent from 'components/Tabs';

// ** Constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// **  Hooks **
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** slices **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

const CourseCategories = React.lazy(
  () => import('modules/Courses/components/Category/Category')
);
const CourseSubCategories = React.lazy(
  () => import('modules/Courses/components/Subcategory/SubCategory')
);

type TabProps = {
  uniqueKey: string;
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};
const Courses = () => {
  const { t } = useTranslation();

  const modal = useModal();
  const user = useSelector(getCurrentUser);

  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const updateTitle = useTitle();


  const tabs: TabProps[] = [
    {
      uniqueKey: 'courseCategory',
      title: 'CoursesManagement.CourseCategory.courseCategory',
      component: <CourseCategories modal={modal} search={search} />,
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'courseSubCategory',
      title: 'CoursesManagement.CourseCategory.courseSubCategory',
      component: <CourseSubCategories search={search} />,
      icon: 'bookIcon',
    },
  ];
  updateTitle(activeTab === 0 ? t('CoursesManagement.CourseCategory.courseCategory') : t('CoursesManagement.CourseCategory.courseSubCategory'))
  return (
    <>
      <PageHeader
        small
        text={t('CoursesManagement.CourseCategory.coursesCategory')}
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
          {user?.role_name === ROLES.Admin &&
            tabs[activeTab].uniqueKey === 'courseCategory' ? (
            <Button
              variants="primary"
              className="flex whitespace-nowrap gap-1"
              onClickHandler={modal.openModal}
            >
              <span>
                <Image iconName="plusIcon" />
              </span>
              {t('CoursesManagement.CourseCategory.AddEditCategory.addCategory')}
            </Button>
          ) : (
            ''
          )}
        </div>
      </PageHeader>
      <div className="tab-wrapper">
        <TabComponent
          current={activeTab}
          onTabChange={(tabIndex) => setActiveTab(tabIndex)}
        >
          {tabs.map(({ title, component, icon, uniqueKey }, index) => (
            <TabComponent.Tab key={uniqueKey} title={t(title)} icon={icon}>
              {activeTab === index && component}
            </TabComponent.Tab>
          ))}
        </TabComponent>
      </div>
    </>
  );
};

export default Courses;
