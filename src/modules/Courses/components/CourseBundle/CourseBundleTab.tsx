import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
import { CourseStatus } from 'modules/Courses/Constants';
import AcceptTrainerAdmin from 'modules/Courses/pages/AdminTrainerRequest';
import CourseAttendeeList from 'modules/Courses/pages/CourseAttendeeList';

import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { useAxiosPost } from 'hooks/useAxios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import ViewResourceList from './ViewResourceList';
import ViewRoomList from './ViewRoomList';

const ViewCourseBundle = React.lazy(
  () => import('modules/Courses/components/CourseBundle/ViewCourseBundle')
);
type tabProps = {
  uniqueKey: string;
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};

const CourseBundleTab = () => {
  const location = useLocation()?.state;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const markAsPublishModal = useModal();

  const currentURL = new URL(window.location.href);
  const user = useSelector(getCurrentUser);
  const [markAsPublished, { isLoading: publishingBundle }] = useAxiosPost();
  const bundleSlug = currentURL.searchParams.get('slug');
  const [activeTab, setActiveTab] = useState(0);
  const [currentTabTitle, setCurrentTabTitle] = useState<string>(t('bundleDetail'));
  const dispatch = useDispatch();
  const rolesPermissionModal = useModal();
  const [showSideComponent, setShowSideComponent] = useState<boolean>(false);
  const [bundleTitle, setBundleTitle] = useState<string>();

  const handleMarkAsPublish = async () => {
    if (bundleSlug) {
      const { error } = await markAsPublished(
        `/course/bundle/mark-as-publish/${bundleSlug}`,
        {}
      );
      markAsPublishModal.closeModal();
      if (!error) {
        navigate(PRIVATE_NAVIGATION.coursesManagement.courseBundle.path);
      }
    }
  };

  const tabs: tabProps[] = [
    {
      uniqueKey: 'viewBundle',
      title: t('CoursesManagement.Bundle.AddEditBundle.courses'),
      component: (
        <ViewCourseBundle
          setCurrentTabTitle={setCurrentTabTitle}
          status={location?.status}
          activeTab={location?.activeTab}
          setShowSideComponent={setShowSideComponent}
          setBundleTitle={setBundleTitle}
        />
      ),
      icon: 'bookIcon',
    },
    {
      uniqueKey: 'viewTrainer',
      title: t('Calendar.filterTabs.trainersTitle'),
      component: <AcceptTrainerAdmin slug={bundleSlug} />,
      icon: 'trainerIcon',
    },
    {
      uniqueKey: 'viewRoom',
      title: t('CourseBundle.trainer.room'),
      component: <ViewRoomList />,
      icon: 'roomIcon',
    },
    {
      uniqueKey: 'viewResources',
      title: t('Calendar.eventDetails.resourceTitle'),
      component: <ViewResourceList />,
      icon: 'resourceIcon',
    },
    {
      uniqueKey: 'viewAttendees',
      title: t('ClientManagement.clientTabs.attendeeTitle'),
      component: <CourseAttendeeList bundleId={location?.bundle_id} />,
      icon: 'bookIcon',
    },
    // {
    //   uniqueKey: 'accessCourse',
    //   title: t('courseIndex.Access'),
    //   component: (
    //     <RolesPermission
    //       rolesPermissionModal={rolesPermissionModal}
    //       isCourseBundle
    //       slug={bundleSlug ?? undefined}
    //     />
    //   ),
    //   icon: 'accessIcon',
    // },
  ];
  let courseTabs = [...tabs];

  if (location?.status !== CourseStatus.publish) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'viewAttendees');
  }
  if (user?.role_name !== ROLES.Admin) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'accessCourse');
  }
  const renderSideComponent = () => {
    if (showSideComponent) {
      return (
        <div className="flex items-center gap-3 mb-2.5">
          <Button
            className="h-fit gap-1.5"
            small
            variants="secondary"
            onClickHandler={() => {
              navigate(
                `${PRIVATE_NAVIGATION.coursesManagement.courseManagement.path}/bundle/edit?bundle=${bundleSlug}`,
                {
                  state: {
                    activeTab,
                  },
                }
              );
            }}
          >
            <Image iconName="editPen" iconClassName="w-4 h-4" />
            {t('CoursesManagement.Edit')}
          </Button>
          <Button
            className="h-fit"
            small
            variants="primary"
            onClickHandler={() => {
              markAsPublishModal.openModal();
            }}
          >
            <Image iconName="bulkUpload" iconClassName="w-4 h-4" />
            {t('CoursesManagement.publish')}
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      {markAsPublishModal.isOpen && (
        <ConfirmationPopup
          modal={markAsPublishModal}
          bodyText={t('CoursesManagement.MarkAsPublish.bodyText', {
            COURSE: bundleTitle,
          })}
          popUpType="primary"
          confirmButtonText={t('CoursesManagement.publish')}
          deleteTitle={t('CoursesManagement.MarkAsPublished')}
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={markAsPublishModal.closeModal}
          confirmButtonFunction={handleMarkAsPublish}
          isLoading={publishingBundle}
        />
      )}
      <PageHeader
        text={currentTabTitle ?? t('CoursesManagement.Bundle.AddEditBundle.courses')}
        small
        url={PRIVATE_NAVIGATION.coursesManagement.courseBundle.path}
        passState={{ ...location }}
      >
        {courseTabs[activeTab].uniqueKey === 'accessCourse' ? (
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
          <></>
        )}
      </PageHeader>

      <div className="tab-wrapper">
        <CustomCard minimal bodyClass="!max-h-[unset]">
          <TabComponent
            current={activeTab}
            onTabChange={(status) => {
              dispatch(currentPageCount({ currentPage: 1 }));
              setActiveTab(status);
            }}
            sideComponent={renderSideComponent()}
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

export default CourseBundleTab;
