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
import ViewSurvey from 'modules/Courses/components/SurveyTemplate/ViewSurvey';
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
const SurveyTab = () => {
  const { t } = useTranslation();
  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('CourseManagement.createSurvey.surveyDetails'))
  const dispatch = useDispatch();
  const user = useSelector(getCurrentUser);

  const [activeTab, setActiveTab] = useState(0);
  const rolesPermissionModal = useModal();

  const tabs: tabProps[] = [
    {
      uniqueKey: 'surveyDetails',
      title: 'surveyTemplate.SurveyDetail',
      component: <ViewSurvey />,
      icon: 'bookIcon',
    },
    // {
    //   uniqueKey: 'accessCourse',
    //   title: 'courseIndex.Access',
    //   component: (
    //     <RolesPermission
    //       rolesPermissionModal={rolesPermissionModal}
    //       isSurveyTemplate
    //     />
    //   ),
    //   icon: 'bookIcon',
    // },
  ];

  let courseTabs = [...tabs];

  if (user?.role_name !== ROLES.Admin) {
    courseTabs = courseTabs.filter((item) => item.uniqueKey !== 'accessCourse');
  }

  return (
    <>
      <PageHeader
        small
        text={t('CourseManagement.createSurvey.surveyDetails')}
        url={PRIVATE_NAVIGATION.coursesManagement.surveyTemplate.list.path}
      >
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

export default SurveyTab;
