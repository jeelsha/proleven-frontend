import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ConnectedUserList from './UserList';

// ** redux **
import { socketSelector } from 'redux-toolkit/slices/socketSlice';

// ** hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';

// ** constants **
import { socketName } from 'constants/common.constant';

// ** types**
import {
  ChatMessageType,
  ChatUser,
  ChatUserListPropType,
  SearchUserType,
} from '../types';

// ** component **
import NoDataFound from 'components/NoDataFound';

// ** style **
import Image from 'components/Image';
import SearchComponent from 'components/Table/search';
import '../style/chat.css';

const ChatUserList = ({
  setChatWithUser,
  user,
  setReceiverId,
  setRoomId,
  setLoader,
  receiverId,
  activeUser,
}: ChatUserListPropType) => {
  const { t } = useTranslation();

  const activeRoomId = useRef(null);

  const [getConnectedUser, { isLoading }] = useAxiosGet();
  const [getUser, { isLoading: searchLoading }] = useAxiosGet();
  const [readMessage] = useAxiosPost();
  const [createRoom] = useAxiosPost();

  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [searchUser, setSearchUser] = useState<string>('');
  const socket = useSelector(socketSelector);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setLoader?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    socket?.on(socketName.NEW_MESSAGE, (data) => {
      if (data[0].count > 0) {
        setNewUserList(data);
      } else {
        getUserList();
      }
      if (activeRoomId.current && data[0].room_id === activeRoomId.current) {
        HandleReadMessage(activeRoomId.current, data);
      }
    });
    ManageUnreadCount();
  }, [socket]);

  useEffect(() => {
    if (!_.isEmpty(searchUser)) {
      searchUserFunc();
    } else {
      getUserList();
    }
  }, [searchUser]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchUser(search);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const userFindIndex = (users: ChatUser[], id: string | number) => {
    const index = users?.findIndex((item) => item.room_id === id);
    return index;
  };

  const setNewUserList = (data: ChatMessageType['messages']) => {
    setUserList((prev) => {
      const newUserList = [...prev];
      if (prev.length > 0) {
        const fromIndex = userFindIndex(newUserList, data[0].room_id);
        if (fromIndex !== -1 && newUserList[fromIndex]) {
          newUserList[fromIndex].lastMessage = data[0].text;
          newUserList[fromIndex].attachment = data[0].media;
          newUserList[fromIndex].attachmentType = data[0].media_type;
          newUserList[fromIndex].lastMessageTime = data[0].created_at;
        }
        if (fromIndex !== 0) {
          newUserList.splice(0, 0, newUserList.splice(fromIndex, 1)[0]);
        }
      }
      return newUserList;
    });
  };

  const searchUserFunc = async () => {
    const searchResponse = await getUser('/chat/users', {
      params: {
        search: searchUser,
      },
    });

    if (searchResponse) {
      const obj = searchResponse?.data?.data?.map((item: SearchUserType) => {
        return {
          unreadMessageCount: 0,
          creatorUser: {
            id: item.id,
            full_name: item.full_name,
            chat_user_status: item.chat_user_status,
            profile_image: item.profile_image,
            verified: item.verified,
          },
        };
      });
      setUserList(obj);
    }
  };

  const getUserList = async () => {
    const response = await getConnectedUser('/chat/list');

    if (response?.data) {
      setUserList(response.data.data);
    }
  };

  const readMessageCall = async (data: string | number) => {
    await readMessage('/chat/read-message', {
      room_id: data,
    });
  };

  const ManageUnreadCount = () => {
    socket?.on(socketName.UNREAD_MESSAGE, (data) => {
      if (
        data.count !== 0 &&
        activeRoomId.current &&
        data.room_id === activeRoomId.current
      ) {
        HandleReadMessage(activeRoomId.current);
      } else {
        setUserList((prev) => {
          const indexUser = prev?.map((item) => {
            if (item.room_id === data.room_id) {
              return { ...item, unreadMessageCount: data.count };
            }
            return item;
          });
          return indexUser;
        });
      }
    });
  };

  const HandleReadMessage = (
    data: string | number,
    messageData?: ChatMessageType['messages']
  ) => {
    setUserList((prev) => {
      const newUser = [...prev];
      const index = userFindIndex(newUser, data);

      if (!_.isEmpty(messageData)) {
        if (index !== -1 && messageData?.[0]?.currentUnreadCount !== 0) {
          newUser[index].unreadMessageCount = 0;
          readMessageCall(data);
        }
      } else if (index !== -1 && newUser[index].unreadMessageCount !== 0) {
        newUser[index].unreadMessageCount = 0;
        readMessageCall(data);
      }
      return newUser;
    });
  };

  const handleCreateRoom = async (receiver: number) => {
    if (receiverId !== receiver) {
      setLoader(true);
      const { data } = await createRoom('/chat/create-room', {
        creator_id: user?.id,
        user_id: receiver,
      });
      setLoader(false);
      activeRoomId.current = data;
      setRoomId(data);
      HandleReadMessage(data);
    }
  };

  const handleRoom = async (data: ChatUser) => {
    setChatWithUser?.(data);
    setReceiverId(data.creatorUser?.id);
    handleCreateRoom(data.creatorUser?.id);
  };

  return (
    <div className="w-[380px]">
      <div className="bg-white rounded-10px shadow-lg py-5">
        <div className="px-6">
          <SearchComponent
            onSearch={(e) => {
              setSearch(e.target.value);
            }}
            placeholder={t('Chat.chatSearchPlaceholder')}
          />
        </div>
        <div className="px-6 my-3">
          <span className="text-sm text-grayText capitalize font-medium">
            {t('Chat.messages')}
          </span>
        </div>
        {isLoading || searchLoading ? (
          <div className="flex justify-center items-center h-[calc(100dvh_-_377px)]">
            <Image loaderType="Spin" />
          </div>
        ) : (
          <div className="userList overflow-auto no-scrollbar h-[calc(100dvh_-_377px)]">
            {_.isEmpty(userList) ? (
              <NoDataFound
                className="border-none"
                message={t('Chat.userNotFound')}
              />
            ) : (
              <ConnectedUserList
                activeUser={activeUser}
                userList={userList}
                handleRoom={handleRoom}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUserList;
