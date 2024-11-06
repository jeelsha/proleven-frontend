import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** components **
import NoDataFound from 'components/NoDataFound';

// ** redux **
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** type **
import Image from 'components/Image';
import { INotification, NotificationProps } from '../types';
import GeneralNotification from './GeneralNotification';

const NotificationList = ({
  notificationData,
  handleIsRead,
  isLoading,
}: NotificationProps) => {
  const { t } = useTranslation();
  const storeLang = useSelector(useLanguage);

  if (isLoading && notificationData?.length === 0) {
    return (
      <div className="flex justify-center">
        <Image loaderType="Spin" />
      </div>
    );
  }

  return (
    <div
      // max-h-[calc(100dvh_-_310px)]
      className={`tab-content max-h-[calc(100dvh_-_310px)] min-h-[76px] overflow-auto no-scrollbar ${
        _.isEmpty(notificationData) ? 'flex items-center justify-center' : ''
      }`}
    >
      {!_.isEmpty(notificationData) ? (
        notificationData?.map((item: INotification) => {
          return (
            <GeneralNotification
              key={item.id}
              item={item}
              handleIsRead={handleIsRead}
              storeLang={storeLang}
              variant={item.type}
            />
          );
        })
      ) : (
        <NoDataFound message={t('Notification.noNotification')} />
      )}
      {isLoading && notificationData?.length > 0 ? (
        <div className="flex justify-center p-5">
          <Image loaderType="Spin" />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default NotificationList;
