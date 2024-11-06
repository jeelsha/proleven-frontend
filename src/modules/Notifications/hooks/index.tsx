import { languageConstant } from 'constants/common.constant';
import { PUBLIC_NAVIGATION } from 'constants/navigation.constant';
import { useAxiosGet, useAxiosPatch } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { setIsRead } from 'redux-toolkit/slices/notificationReadSlice';
import {
  currentNotificationPageCount,
  currentNotificationPageSelector,
} from 'redux-toolkit/slices/paginationSlice';
import { socketSelector } from 'redux-toolkit/slices/socketSlice';
import { INotification, LanguageEnum } from '../types';

export const useGetNotifications = () => {
  const socket = useSelector(socketSelector);
  const dispatch = useDispatch();
  const [updateOneNotification] = useAxiosPatch();
  const [updateAllNotification] = useAxiosPatch();
  const [getNotification, { isLoading }] = useAxiosGet();
  const currentPage = useSelector(currentNotificationPageSelector);

  const [notification, setNotification] = useState<INotification[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [hasData, setHasData] = useState<boolean>(false);
  const [lastPage, setLastPage] = useState<number>();
  const storeLang = useSelector(useLanguage);
  const [languageData, setLanguageData] = useState<string>(storeLang?.language);

  const getAllNotification = async () => {
    const { error, data } = await getNotification('/notification', {
      params: {
        page: currentPage,
      },
    });
    if (!error) {
      if (data?.data) {
        const newData = data?.data;
        if (newData) {
          setLastPage(data?.lastPage);
          setHasData(data?.lastPage !== currentPage);
          const cloneNotification = JSON.parse(JSON.stringify(notification));
          cloneNotification.unshift(...newData);
          if (languageData === storeLang.language) {
            setNotification(cloneNotification);
          } else {
            setNotification(newData);
          }
          setLanguageData(storeLang.language);
          if (newData.some((item: INotification) => !item.is_read))
            dispatch(setIsRead({ isRead: false }));
        }
      }
    }
  };

  useEffect(() => {
    if (!window.location.href.includes(PUBLIC_NAVIGATION.somethingWentWrong)) {
      getAllNotification();
    }
  }, [currentPage, storeLang]);
  useEffect(() => {
    if (socket) {
      socket.on(`notification-data`, (data) => {
        const temp = [...notification];
        const filterData = data.find((notification: INotification) => {
          const language =
            languageData === languageConstant.EN
              ? LanguageEnum.english
              : LanguageEnum.italian;

          return notification?.language === language;
        });
        temp.unshift(filterData);
        setNotification(temp);
      });
      socket.on(`notification-count`, (data) => {
        setNotificationCount(data);
        if (data === 0) {
          dispatch(setIsRead({ isRead: true }));
        }
      });
      socket.on(`notification-read`, (data) => {
        setNotification(data);
      });
    }
  }, [socket, notification]);

  const handleLoadMore = () => {
    if (lastPage)
      if (currentPage < lastPage) {
        dispatch(currentNotificationPageCount(currentPage + 1));
      }
  };

  const handleIsRead = async (data?: INotification) => {
    if (data) {
      const res = {
        is_read: true,
      };
      if (!data.is_read) {
        const { error } = await updateOneNotification(
          `/notification/${data.id}`,
          res
        );
        if (!error) {
          const updatedNotificationList = notification.map((item) => {
            if (item.id === data.id) {
              return { ...item, is_read: true };
            }
            return item;
          });
          setNotification(updatedNotificationList);
        }
      }
    } else {
      const updatedNotificationList = notification.map((item) => {
        if (item.is_read) {
          dispatch(setIsRead({ isRead: true }));
        }
        return { ...item, is_read: true };
      });
      setNotification(updatedNotificationList);
      await updateAllNotification(`/notification/all`, { is_read: true });
    }
  };

  return {
    hasData,
    handleLoadMore,
    handleIsRead,
    isLoading,
    notification,
    notificationCount,
  };
};
