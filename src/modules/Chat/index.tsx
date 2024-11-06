import { useState } from 'react';

// ** style **
import './style/chat.css';

// ** type **
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

import { ChatUser } from './types';

// ** component **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import { useTitle } from 'hooks/useTitle';
import ChatRoom from './components/ChatRoom';
import ChatUserList from './components/ChatUserList';

const Chat = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle()
  updateTitle(t('SideNavigation.chatTitle'))
  const user = useSelector(getCurrentUser);

  const [receiverId, setReceiverId] = useState<number>();
  const [roomId, setRoomId] = useState<number>(-1);
  const [attachFile, setAttachFile] = useState(false);
  const [chatWithUser, setChatWithUser] = useState<ChatUser>();
  const [loader, setLoader] = useState<boolean>(false);

  return (
    <div>
      <PageHeader text={t('SideNavigation.chatTitle')} small />
      <Button
        onClickHandler={() => setAttachFile(false)}
        className={`fixed top-0 left-0 w-full h-full bg-black/70 z-3 transition-all duration-500 ${attachFile
          ? 'opacity-100 pointer-events-auto'
          : ' opacity-0 pointer-events-none'
          }`}
      />
      <div className="chat-wrapper">
        <div className="flex flex-wrap gap-y-8">
          <ChatUserList
            setLoader={setLoader}
            setChatWithUser={setChatWithUser}
            user={user}
            setRoomId={setRoomId}
            receiverId={receiverId}
            setReceiverId={setReceiverId}
            activeUser={chatWithUser?.user_id}
          />
          {chatWithUser && roomId > 0 ? (
            <ChatRoom
              roomId={roomId}
              user={user}
              chatWithUser={chatWithUser}
              setAttachFile={setAttachFile}
              receiverId={receiverId}
              attachFile={attachFile}
            />
          ) : (
            <div className="991:w-[calc(100%_-_400px)] 991:ps-5 w-full  h-[calc(100dvh_-_240px)]">
              {!loader ? (
                <NoDataFound
                  iconName="chatBubbleIcon"
                  className="no-chat border-none bg-white rounded-10px shadow-lg py-5 h-full flex flex-col justify-center text-center"
                  message={t('Chat.startChatting')}
                  desc=" "
                />
              ) : (
                <div className="h-full flex justify-center items-center">
                  <Image loaderType="Spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
