import Image from 'components/Image';
import { generalNotificationProps } from '../types';

// ** constant **
import { IconTypes } from 'components/Icon/types';
import { FormatDateFromNow } from 'constants/common.constant';
import { useEffect, useState } from 'react';

const GeneralNotification = ({
  item,
  handleIsRead,
  storeLang,
  variant,
}: generalNotificationProps) => {
  const [iconName, setIconName] = useState<IconTypes>();
  const [iconColor, setIconColor] = useState('');

  const getVariantInfo = () => {
    switch (variant) {
      case 'USER': {
        setIconName('userProfile');
        setIconColor('#00BD9D');
        break;
      }
      case 'COURSE': {
        setIconName('bookOpenIcon');
        setIconColor('#56CCF2');
        break;
      }
      case 'CHAT': {
        setIconName('chatBubbleIcon');
        setIconColor('#FF6191');
        break;
      }
      case 'FEEDBACK': {
        setIconName('starSpeedIcon');
        setIconColor('#F2994A');
        break;
      }
      case 'CERTIFICATE': {
        setIconName('awardBadgeIcon');
        setIconColor('#00BD9D');
        break;
      }
      default: {
        setIconName('notificationBellIcon');
        setIconColor('#909DF9');
        break;
      }
    }
  };

  useEffect(() => {
    getVariantInfo();
  }, []);

  return (
    <div
      onClick={() => handleIsRead?.(item)}
      key={item?.id}
      className={`${
        item?.is_read ? 'bg-white' : 'bg-slate-100'
      } tab-content-item p-5 cursor-pointer border-b border-solid border-gray-200 last:border-b-0 hover:opacity-70`}
    >
      <div className="flex items-center">
        <div
          className="icons w-11 h-11 rounded-full text-white flex items-center justify-center"
          style={{ backgroundColor: iconColor }}
        >
          <Image iconName={iconName} />
        </div>
        <div className="max-w-[calc(100%_-_44px)] ps-2.5">
          <p className="text-base font-semibold text-black cursor-pointer">
            {item?.title}
          </p>
          <label className="block text-sm leading-[1.3] mt-1 cursor-pointer">
            {item?.message}
          </label>
          <span className="block mt-3 text-grayText text-xs leading-[1.2]">
            {storeLang?.language &&
              item?.created_at &&
              FormatDateFromNow(item?.created_at, true, storeLang?.language)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GeneralNotification;
