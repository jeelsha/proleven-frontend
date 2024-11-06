import Button from 'components/Button/Button';

// ** redux **
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** constants **
import {
  FILE_SUPPORTED_FORMATS,
  IMAGE_SUPPORTED_FORMATS,
  VIDEO_SUPPORTED_FORMATS,
} from 'constants/filesupport.constant';

// ** utils **

// ** types **
import Image from 'components/Image';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDateForChat } from 'utils/date';
import { UserListPropsType } from '../types';

const UserList = ({ userList, handleRoom, activeUser }: UserListPropsType) => {
  const storeLang = useSelector(useLanguage);
  const { t } = useTranslation();

  const renderAttachment = (item: string | null, type: string | null) => {
    if (item && type) {
      const mediaName = item?.includes('/') ? item?.split('/') : item?.split('\\');
      if (IMAGE_SUPPORTED_FORMATS.includes(type)) {
        return (
          <div className="flex items-center">
            <Button className="w-4 h-4">
              <Image iconName="imageIcon2" iconClassName="w-full h-full" />
            </Button>
            <Button className="text-xs truncate inline-block max-w-[calc(100%_-_16px)] ps-2">
              &nbsp;{mediaName[mediaName.length - 1]}
            </Button>
          </div>
        );
      }
      if (VIDEO_SUPPORTED_FORMATS.includes(type)) {
        return (
          <div className="flex items-center">
            <Button className="w-4 h-4">
              <Image iconName="videoIcon" iconClassName="w-full h-full" />
            </Button>
            <Button className="text-xs truncate inline-block max-w-[calc(100%_-_16px)] ps-2">
              &nbsp;{mediaName[mediaName.length - 1]}
            </Button>
          </div>
        );
      }
      if (FILE_SUPPORTED_FORMATS.includes(type))
        return (
          <div className="flex items-center">
            <Button className="w-4 h-4">
              <Image iconName="fileBlankIcon" iconClassName="w-full h-full" />
            </Button>
            <Button className="text-xs truncate inline-block max-w-[calc(100%_-_16px)] ps-2">
              &nbsp;{mediaName[mediaName.length - 1]}
            </Button>
          </div>
        );
    }
  };

  return (
    <div>
      {userList?.map((item, index) => (
        <div
          key={`user_${index + 1}`}
          onClick={() => handleRoom(item)}
          className={`userItem flex items-center px-7 py-3 cursor-pointer ${
            item.user_id === activeUser ? 'bg-gray-100' : ''
          }`}
        >
          <div className="icon w-12 h-12 rounded-full relative">
            <Image
              src={item?.creatorUser?.profile_image ?? 'images/default-avatar.jpg'}
              imgClassName="w-full h-full object-cover rounded-full"
              width={50}
              height={50}
              alt="userProfile"
              serverPath
            />
            {item?.creatorUser?.chat_user_status !== 'offline' && (
              <span className="absolute bottom-[3px] right-1.5 w-2 h-2 bg-ic_1 rounded-full" />
            )}
          </div>
          <div className="max-w-[calc(100%_-_48px)] w-full ps-2.5">
            <p className="text-base font-medium text-dark block truncate relative pe-24">
              {item?.creatorUser?.full_name ?? '.'}
              <label className="flex items-center absolute top-0 right-0">
                {item?.lastMessageTime && storeLang?.language && (
                  <span className=" text-xs text-[10px] text-grayText">
                    {getDateForChat(item?.lastMessageTime, true, t)}
                  </span>
                )}

                {item?.unreadMessageCount !== 0 && (
                  <span className="unread-message">{item?.unreadMessageCount}</span>
                )}
              </label>
            </p>
            <span className="text-sm leading-4 text-grayText block mt-1 truncate">
              {item?.lastMessage && item.lastMessage}
              {item?.attachment &&
                renderAttachment(item?.attachment, item?.attachmentType)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
