import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
import { useRolePermission } from 'hooks/useRolePermission';
import { useTitle } from 'hooks/useTitle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import Academies from './Academies';
import { AccountSettings } from './AccountConnection';
import { ReminderEmails } from './ReminderEmails';

const AccountIndex = () => {
  const { t } = useTranslation();
  const user = useSelector(getCurrentUser);
  const [tab, setTab] = useState('AccountConnections');
  const updateTitle = useTitle();
  updateTitle(
    tab === 'AccountConnections'
      ? t('AccountSetting.AccountConnectionTitle')
      : tab === 'Academies'
      ? t('AccountSetting.AcademiesTitle')
      : tab === 'Emails'
      ? t('SideNavigation.emailParent')
      : 'Proleven Whiz'
  );
  const addAddress = useModal();
  const AddAcademy = useRolePermission(FeaturesEnum.Academy, PermissionEnum.Create);
  return (
    <section className={`${user?.role_name === ROLES.Admin ? '' : 'mt-5'}`}>
      <div className={`${user?.role_name === ROLES.Admin ? '' : 'container'}`}>
        <CustomCard minimal>
          <div className="flex flex-wrap">
            {useRolePermission(FeaturesEnum.Academy, PermissionEnum.View) ? (
              <div className="w-full max-w-[300px] border-e border-solid border-borderColor ps-5 pt-5">
                <ul className="flex flex-col gap-y-1 sticky top-5">
                  <li className="relative">
                    <Button
                      onClickHandler={() => setTab('AccountConnections')}
                      className={`${
                        tab === 'AccountConnections'
                          ? 'text-dark border-r-4 border-r-lime border-solid font-medium'
                          : 'text-navText'
                      } text-base cursor-pointer py-2 inline-block w-full text-left select-none`}
                    >
                      {t('AccountSetting.AccountConnectionTitle')}
                    </Button>
                  </li>
                  <li className="relative">
                    <Button
                      onClickHandler={() => setTab('Academies')}
                      className={`${
                        tab === 'Academies'
                          ? 'text-dark border-r-4 border-r-lime border-solid font-medium'
                          : 'text-navText'
                      } text-base cursor-pointer py-2 inline-block w-full text-left select-none`}
                    >
                      {t('AccountSetting.AcademiesTitle')}
                    </Button>
                  </li>
                  <li className="relative">
                    <Button
                      onClickHandler={() => setTab('Emails')}
                      className={`${
                        tab === 'Emails'
                          ? 'text-dark border-r-4 border-r-lime border-solid font-medium'
                          : 'text-navText'
                      } text-base cursor-pointer py-2 inline-block w-full text-left select-none`}
                    >
                      {t('SideNavigation.emailParent')}
                    </Button>
                  </li>
                </ul>
              </div>
            ) : (
              <></>
            )}

            <div className="w-full max-w-[calc(100%_-_300px)] ps-10 pt-5">
              <div className="">
                <div className="flex justify-between">
                  <p className="text-xl text-dark font-semibold mb-15px">
                    {tab === 'AccountConnections'
                      ? `${t('AccountSetting.AccountConnectionTitle')}`
                      : tab === 'Academies'
                      ? `${t('AccountSetting.AcademiesTitle')}`
                      : ''}
                  </p>
                  {tab === 'Academies' && AddAcademy && (
                    <Button
                      variants="primary"
                      className="gap-1"
                      onClickHandler={addAddress.openModal}
                    >
                      <Image iconName="plusIcon" iconClassName="w-4 h-4" />
                      {t('AccountSetting.AddButton')}
                    </Button>
                  )}
                </div>
                {tab === 'AccountConnections' && <AccountSettings />}
                {tab === 'Academies' && <Academies addAddress={addAddress} />}
                {tab === 'Emails' && <ReminderEmails />}
              </div>
            </div>
          </div>
        </CustomCard>
      </div>
    </section>
  );
};

export default AccountIndex;
