import CustomCard from 'components/Card';
import { IconTypes } from 'components/Icon/types';
import PageHeader from 'components/PageHeader/PageHeader';
import SearchComponent from 'components/Table/search';
import TabComponent from 'components/Tabs';
import { useTitle } from 'hooks/useTitle';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import AllInvitation from './AllInvitation';
import BundleRequest from '../BundleRequest/BundleRequest';

type tabProps = {
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
};
const AllInvitations = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('Dashboard.Trainer.CourseInvitation.invite'));

  const { state } = useLocation();
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState(state?.activeTab ?? 0);

  const tabs: tabProps[] = [
    {
      title: t('Dashboard.Trainer.CourseInvitation.courseTitle'),
      component: <AllInvitation search={search} />,
      icon: 'bookIcon',
    },
    {
      title: t('BundleRequest.title'),
      component: <BundleRequest search={search} activeTab={activeTab} isView />,
      icon: 'bookIcon',
    },
  ];

  return (
    <>
      <PageHeader
        // parentClass="mb-12"
        small
        text={t('allInvitations')}
      >
        <div className="flex justify-end gap-2 flex-wrap">
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
      </PageHeader>
      <div className="tab-wrapper">
        <CustomCard minimal bodyClass="!max-h-[unset]">
          <TabComponent current={activeTab} onTabChange={setActiveTab}>
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
    </>
  );
};

export default AllInvitations;
