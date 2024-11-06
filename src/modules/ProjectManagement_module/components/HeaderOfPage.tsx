import { useTranslation } from 'react-i18next';

// ** component **
import Button from 'components/Button/Button';
import FilterIcon2 from 'components/Icon/assets/FilterIcon2';
import PageHeader from 'components/PageHeader/PageHeader';

// ** type **
import { UserModalType } from 'hooks/types';

const HeaderOfPage = (props: { modal: UserModalType }) => {
  const { modal } = props;

  const { t } = useTranslation();

  return (
    <PageHeader text={t('SideNavigation.projectDetails')} small>
      <div className="flex items-end gap-2">
        <div className="relative group">
          <Button
            onClickHandler={modal.openModal}
            variants="primary"
            className="flex gap-x-2"
          >
            <span className="w-5 h-5 inline-block">
              <FilterIcon2 className="w-full h-full" />
            </span>
            {t('ProjectManagement.Header.filter')}
          </Button>
        </div>
        <span className="bg-ic_2/30 text-danger px-3 py-2.5 font-medium text-sm leading-5 rounded-md">
          {t('ProjectManagement.Header.dueDate')}
        </span>
      </div>
    </PageHeader>
  );
};

export default HeaderOfPage;
