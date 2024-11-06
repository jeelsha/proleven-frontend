import 'components/Layout/components/style/topHeader.css';

import Button from 'components/Button/Button';
import Image from 'components/Image';
import { LanguagesDropdown } from 'components/Layout/components/header/components/LanguagesDropdown';
import { NotificationDropdown } from 'components/Layout/components/header/components/NotificationDropdown';
import { ProfileDropdown } from 'components/Layout/components/header/components/ProfileDropdown';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import {
  SidebarSelector,
  hideSidebar,
  showSidebar,
} from 'redux-toolkit/slices/sidebarSlice';
import { CompanyDropdown } from './components/CompanyDropdown';

export const CommonHeader = () => {
  const { t } = useTranslation();
  const openSidebar = useSelector(SidebarSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getCurrentUser);
  return (
    <header
      className={`${user?.role_name !== ROLES.CompanyManager &&
        user?.role_name !== ROLES.PrivateIndividual
        ? 'header-container px-4 relative !z-[124]'
        : ' bg-white px-4'
        }`}
    >
      {user?.role_name !== ROLES.CompanyManager &&
        user?.role_name !== ROLES.PrivateIndividual ? (
        <Button
          className="absolute w-10 h-10 md:w-8 md:h-8 p-1.5 select-none rounded-lg md:rounded-full border bg-white flex items-center justify-center top-5 md:top-7 cursor-pointer md:-left-4"
          onClickHandler={() => {
            if (openSidebar) dispatch(hideSidebar());
            else dispatch(showSidebar());
          }}
        >
          <Image iconName='lineMenuIcon' iconClassName='w-full h-full md:hidden' />
          <Image
            iconName="chevronRight"
            iconClassName={`hidden md:block ${openSidebar
              ? 'rotate-180 transition-all duration-500'
              : 'transition-all duration-500'
              }`}
          />
        </Button>
      ) : (
        ''
      )}
      <nav className="max-w-[calc(100%_-_50px)] ml-auto md:max-w-full flex basis-full border-b items-center w-full md:mx-auto relative transition-all duration-500 py-3 z-[124]">
        <div className=" w-full flex items-center justify-end flex-col md:flex-row ms-auto md:ps-4 sm:justify-between sm:gap-x-3 sm:order-3">

          {user?.role_name !== ROLES.Admin
            && user?.role_name !== ROLES.TrainingSpecialist
            && user?.role_name !== ROLES.Trainer
            && user?.role_name !== ROLES.Accounting
            && user?.role_name !== ROLES.SalesRep ?
            <Button onClickHandler={() => navigate('/')}>
              <Image
                src="/images/pe_full_logo.svg"
                imgClassName="w-16 sm:w-auto max-h-[56px]"
                alt="Logo"
              />
            </Button> : ''}
          <div className="prolevenWhiz-text">
            {t('Header.prolevenWhiz')}
            <Image iconClassName="w-6 h-6 ms-2" iconName="magicPen" />
          </div>

          <div className="flex flex-wrap gap-2 ms-auto">
            {user?.role_name === ROLES.CompanyManager && <CompanyDropdown />}
            <LanguagesDropdown />
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </nav>
    </header>
  );
};
