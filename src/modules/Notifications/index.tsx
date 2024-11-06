import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { useIsRead } from 'redux-toolkit/slices/notificationReadSlice';
import NotificationList from './components/NotificationList';
import { useGetNotifications } from './hooks';
import PageHeader from 'components/PageHeader/PageHeader';

// ** redux **

// ** types **

const Notifications = () => {
  const { t } = useTranslation();
  const isRead = useSelector(useIsRead);
  const {
    hasData,
    handleIsRead,
    notification,
    isLoading,
    handleLoadMore,
    notificationCount,
  } = useGetNotifications();

  return (
    <>
      <PageHeader text="Notifications" small parentClass="mx-auto max-w-[845px]" />

      <div className="max-w-[863px] mx-auto">
        <div className="bg-white rounded-xl shadow-lg pt-5">
          <div className="tab-wrapper">
            {hasData && (
              <div className="tab-header flex justify-between px-5 border-b border-solid border-gray-200 mb-2">
                <div className="">
                  <Button
                    disabled={isRead.isRead}
                    onClickHandler={() => handleIsRead()}
                    className="flex items-center text-base font-normal text-grayText hover:text-primary select-none cursor-pointer pb-3"
                  >
                    <span className="w-5 h-5 block ">
                      <Image
                        iconName="checkRoundIcon"
                        iconClassName="w-full h-full"
                      />
                    </span>
                    <span className="max-w-[calc(100%_-_20px)] ps-1">
                      {t('Header.notificationDropdown.markTab')}
                    </span>
                    {notificationCount > 0 && (
                      <span className="max-w-[calc(100%_-_20px)] ps-1 text-danger">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
            <NotificationList
              notificationData={notification}
              handleIsRead={handleIsRead}
              isLoading={isLoading}
            />
          </div>

          <div
            className={`view-more px-5 py-3.5  cursor-pointer text-center ${
              hasData ? 'border-t border-solid border-gray-200' : ''
            }`}
          >
            {hasData && (
              <Button
                className="flex items-center gap-2 justify-center text-sm cursor-pointer select-none mx-auto"
                onClickHandler={() => {
                  handleLoadMore();
                }}
              >
                {t('Notification.loadMore')}
                <span className="w-4 h-4 block">
                  <Image iconName="arrowRoundIcon" iconClassName="w-full h-full" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
