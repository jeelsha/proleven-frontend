import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { REACT_APP_FRONT_URL } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosDelete, useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { connectData } from 'modules/Profile/constants';
import { ConnectedUsersProps } from 'modules/Profile/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { TokenProvider } from 'types/common';
import { openAuthWindow } from 'utils';

export const AccountSettings = () => {
  const { t } = useTranslation();
  const connectedModal = useModal();
  const disconnectedModal = useModal();
  const currentUser = useSelector(getCurrentUser);
  const [accountGetApi] = useAxiosGet();
  const [accountDeleteApi] = useAxiosDelete();
  const { search } = useLocation();
  const { tokenProvider } = useParams<{ tokenProvider?: string }>();

  const navigate = useNavigate();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUsersProps[]>();
  const [buttonLoader, setButtonLoader] = useState({
    index: -1,
    isLoading: false,
  });
  useEffect(() => {
    CallApi();
  }, [currentUser]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const tokenProviderParam: string | null =
      tokenProvider ?? urlSearchParams.get('tokenProvider');

    if (
      tokenProviderParam &&
      Object.values(TokenProvider).includes(tokenProviderParam as TokenProvider)
    ) {
      connectedModal.openModal();
    }
  }, []);

  const modifiedConnectData =
    currentUser?.role_name === ROLES.CompanyManager ||
      currentUser?.role_name === ROLES.PrivateIndividual ||
      currentUser?.role_name === ROLES.Trainer
      ? connectData().filter((item) => item.label !== 'Zoom')
      : connectData();
  const handleClick = (tokenProvider: string, index: number) => {
    setButtonLoader({
      index,
      isLoading: true,
    });
    openAuthWindow(
      tokenProvider,
      `${REACT_APP_FRONT_URL}${PRIVATE_NAVIGATION.userProfile.accountSettings.path}`,
      currentUser?.id,
      currentUser?.role_name === ROLES.Admin
    );
  };

  async function CallApi() {
    if (currentUser) {
      const response = await accountGetApi(
        `/users/${currentUser?.username}/social-connections?profile=true`
      );
      if (response?.data) {
        setConnectedUsers(response.data.data);
      }
    }
  }
  const handleDelete = async (id: string) => {
    const response = await accountDeleteApi(
      `/users/${currentUser?.username}/social-connections?role=${currentUser?.role_id}`,
      { user_social_account_id: id }
    );
    if (response?.data) {
      setConnectedUsers(response.data.data);
    }
    disconnectedModal.openModal();
    CallApi();
  };
  return (
    <div className="bg-primaryLight py-8 px-10 rounded-xl">
      <div className="flex flex-col gap-y-2.5 mt-5 mb-10 max-w-[840px]">
        {modifiedConnectData.map((data, index: number) => {
          const filteredUsers = connectedUsers?.filter(
            (filteredUser: ConnectedUsersProps) =>
              filteredUser?.token_provider === data.provider
          );
          if (filteredUsers && filteredUsers.length > 0) {
            return (
              <div
                className="py-5 px-7 bg-white rounded-lg border border-solid border-borderColor/50"
                key={`acc_settings_${index + 1}`}
              >
                <div className="flex flex-wrap justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <Button className="w-9 h-9 inline-block">
                      <Image iconName={data.icon} iconClassName="w-full h-full" />
                    </Button>
                    <div className="flex-[1_0_0%]">
                      <p className="text-dark text-base font-semibold">
                        {data.label}
                      </p>
                      {`${data.label}  ${t('Calendar.connection.connectionText')}`}
                    </div>
                  </div>
                  {currentUser?.role_name === ROLES.Admin && (
                    <Button
                      className="px-5 py-2.5 bg-offWhite3 w-fit text-primary text-base font-medium active:scale-95 transition-all duration-300 rounded-lg"
                      onClickHandler={() => handleClick(data.provider, index)}
                    >
                      {t('Calendar.connection.connectAccountTitle')}
                    </Button>
                  )}
                </div>
                {filteredUsers?.map((user) => (
                  <div
                    className="ps-14 flex flex-col group gap-5"
                    key={`connected_${user.id}`}
                  >
                    <div className="flex flex-wrap justify-between gap-4 items-center  mb-3 pb-3 border-b border-solid border-borderColor group-last:border-0 group-last:mb-0 group-last:pb-0">
                      <p className="font-medium bg-primary/5 text-primary px-2 py-1 h-fit rounded-md w-fit text-sm">
                        {user?.token_provider_mail}
                      </p>
                      <Button
                        className="px-5 py-2.5 w-fit bg-danger/5 text-danger text-base font-medium active:scale-95 transition-all duration-300 rounded-lg"
                        onClickHandler={() => handleDelete(user.id)}
                      >
                        {t('Calendar.connection.disconnectedTitle')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div
              className="py-5 px-7 bg-white rounded-lg border border-solid border-borderColor/50"
              key={`connect_${index + 1}`}
            >
              <div className="flex items-center gap-5">
                <Button className="w-9 h-9 inline-block">
                  <Image iconName={data.icon} iconClassName="w-full h-full" />
                </Button>
                <div className="flex-[1_0_0%]">
                  <p className="text-dark text-base font-semibold">{data.label}</p>
                  <Button className="text-sm text-navText">
                    {
                      currentUser?.role_name === ROLES.Trainer ?
                        t('Calendar.Trainer.connection.bodyText', { Account: data.label })
                        :
                        t('Calendar.connection.bodyText', { Account: data.label })

                    }
                  </Button>
                </div>
                {(currentUser?.role_name === ROLES.Admin ||
                  currentUser?.role_name === ROLES.TrainingSpecialist ||
                  (connectedUsers && connectedUsers?.length < 1)) && (
                    <Button
                      isLoading={
                        index === buttonLoader.index && buttonLoader.isLoading
                      }
                      className="px-5 py-2.5 bg-offWhite3 text-primary text-base font-medium active:scale-95 transition-all duration-300 rounded-lg"
                      onClickHandler={() => {
                        handleClick(data.provider, index);
                      }}
                    >
                      {t('Calendar.connection.connectTitle')} {data.label}
                    </Button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
      {disconnectedModal.isOpen && (
        <ConfirmationPopup
          modal={disconnectedModal}
          bodyText={t('Calendar.connection.connectionFail')}
          confirmButtonText={t('Exam.form.okTitle')}
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonFunction={() => {
            disconnectedModal.closeModal();
          }}
        />
      )}
      {connectedModal.isOpen && (
        <ConfirmationPopup
          modal={connectedModal}
          popUpType="success"
          bodyText={t('Calendar.connection.connectionSuccess')}
          confirmButtonText={t('Exam.form.okTitle')}
          confirmButtonFunction={() => {
            connectedModal.closeModal();
            navigate(PRIVATE_NAVIGATION.userProfile.accountSettings.path);
          }}
        />
      )}
    </div>
  );
};
