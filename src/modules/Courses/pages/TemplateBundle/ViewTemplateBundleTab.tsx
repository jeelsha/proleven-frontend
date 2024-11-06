import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import ViewBundle from 'modules/Courses/components/TemplateBundle/ViewBundle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

type tabProps = {
  uniqueKey: string;
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};
const ViewTemplateBundleTab = () => {
  const { t } = useTranslation();
  // Dynamic Title
  const updateTitle = useTitle()

  const dispatch = useDispatch();
  // const currentURL = new URL(window.location.href);
  // const bundleSlug = currentURL.searchParams.get('slug');
  const user = useSelector(getCurrentUser);

  // ** Modals
  const bundleModal = useModal();
  const rolesPermissionModal = useModal();

  // ** States
  const [activeTab, setActiveTab] = useState(0);
  const [currentTabTitle, setCurrentTabTitle] = useState<string>(() =>
    t('CourseBundle.courseDetails')
  );
  // const [courseBundleId, setCourseBundleId] = useState<number | null>(null);
  updateTitle(currentTabTitle)

  const tabs: tabProps[] = [
    {
      uniqueKey: 'templates',
      title: 'CoursesManagement.Bundle.AddEditBundle.courses',
      component: (
        <ViewBundle
          bundleModal={bundleModal}
          setCurrentTabTitle={setCurrentTabTitle}
        // setCourseBundleId={setCourseBundleId}
        />
      ),
      icon: 'bookIcon',
    },
    // {
    //   uniqueKey: 'accessCourse',
    //   title: 'courseIndex.Access',
    //   component: (
    //     <RolesPermission
    //       isCourseBundle
    //       courseBundleId={courseBundleId}
    //       rolesPermissionModal={rolesPermissionModal}
    //       slug={bundleSlug ?? undefined}
    //     />
    //   ),
    //   icon: 'accessIcon',
    // },
  ];
  let courseTabs = [...tabs];

  if (user?.role_name !== ROLES.Admin) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'accessCourse');
  }

  return (
    <>
      <PageHeader
        parentClass="mb-12"
        small
        text={currentTabTitle}
        url={PRIVATE_NAVIGATION.coursesManagement.templateBundle.path}
      >
        <div className="flex justify-end gap-2 flex-wrap">
          {tabs[activeTab].uniqueKey === 'templates' && (
            <Button variants="primary" onClickHandler={bundleModal.openModal}>
              <span className="w-5 h-5 inline-block me-2">
                <Image iconName="plusSquareIcon" iconClassName="w-full h-full" />
              </span>
              <span>{t('CoursesManagement.Bundle.AddEditBundle.addCourses')}</span>
            </Button>
          )}
          {tabs[activeTab].uniqueKey === 'accessCourse' ? (
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

export default ViewTemplateBundleTab;
