import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// ** utils **
import { getDateForChat } from 'utils/date';

// ** redux **
import { socketSelector } from 'redux-toolkit/slices/socketSlice';

// ** type **
import { ChatMessageType, ChatRoomPropType } from '../types';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** constants **
import { socketName } from 'constants/common.constant';

// ** style **
import '../style/chat.css';

// ** component **
import Image from 'components/Image';
import MessageList from './MessageList';
import SendMessage from './SendMessage';

const ChatRoom = ({
  setAttachFile,
  attachFile,
  chatWithUser,
  user,
  roomId,
  receiverId,
}: ChatRoomPropType) => {
  const socket = useSelector(socketSelector);

  const roomIdRef = useRef<number>();
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const currentScrollInput = useRef<{ prev: number; curr: number }>({
    prev: 0,
    curr: 0,
  });
  const isBottomScroll = useRef(false);

  const [getChat, { isLoading }] = useAxiosGet();

  const [chatList, setChatList] = useState<ChatMessageType[]>([]);
  const [isScroll, setIsScroll] = useState<boolean>(false);
  const [imageLoader, setImageLoader] = useState({
    loader: false,
    imageRoomId: 0,
  });
  const [baseImage, setBaseImage] = useState<(string | File)[]>([]);

  const [nextPage, setNextPage] = useState<{
    currentPage: number;
    lastPage: number;
  }>({
    currentPage: 1,
    lastPage: 1,
  });

  useEffect(() => {
    if (receiverId) {
      setChatList([]);
      isBottomScroll.current = true;
    }
  }, [receiverId]);

  useEffect(() => {
    if (socket) {
      socket.on(socketName.NEW_MESSAGE, handleNewMessage);
    }
  }, [socket]);

  useEffect(() => {
    if (roomId !== -1) {
      roomIdRef.current = roomId;
      if (roomIdRef.current) {
        fetchChat(true);
      }
    }
    isBottomScroll.current = true;
  }, [roomId]);

  useEffect(() => {
    // Scroll to bottom when chatList is updated
    if (isBottomScroll.current) {
      scrollToBottom();
    }
  }, [chatList, isBottomScroll.current]);

  useEffect(() => {
    if (nextPage.currentPage !== 1) {
      fetchChat();
    }
  }, [nextPage.currentPage]);

  const scrollToBottom = () => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTo({
        top: scrollDivRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const fetchChat = async (isRoomChange?: boolean) => {
    if (roomIdRef.current) {
      const response = await getChat('/chat/fetch-chat', {
        params: {
          room_id: roomIdRef.current,
          page: isRoomChange ? 1 : nextPage.currentPage,
          limit: 15,
        },
      });
      if (response?.data && response?.data?.data?.length > 0) {
        setChatOnScroll(response?.data?.data);
        setNextPage({
          currentPage: response?.data?.currentPage,
          lastPage: response?.data?.lastPage,
        });
      }
      if (scrollDivRef.current) {
        currentScrollInput.current.prev = currentScrollInput.current.curr;
        currentScrollInput.current.curr = scrollDivRef.current.scrollHeight;
        setTimeout(() => {
          if (
            scrollDivRef.current &&
            scrollDivRef.current.scrollHeight > currentScrollInput.current.curr
          ) {
            scrollDivRef.current.scrollTo({
              top:
                scrollDivRef.current.scrollHeight - currentScrollInput.current.curr,
              behavior: 'auto',
            });
          }
        }, 0);
      }
    }
  };

  const setChatOnScroll = (response: ChatMessageType[]) => {
    setChatList((prev) => {
      if (isScroll) {
        const prevChatList = [...prev];
        setIsScroll(false);
        if (chatList.length >= 1) {
          response?.forEach((item: ChatMessageType) => {
            const formattedDate = getDateForChat(item.date);
            const index = prevChatList.findIndex(
              (newItem) => newItem.date === formattedDate
            );
            if (index !== -1) {
              prevChatList[index]?.messages?.push(...item.messages);
            } else {
              prevChatList.push({
                ...item,
                room_id: item?.messages[0]?.room_id,
              });
            }
          });

          return prevChatList;
        }
      }

      return response?.map((item: ChatMessageType) => {
        return {
          ...item,
          room_id: item?.messages[0]?.room_id,
        };
      });
    });
  };

  const processNewMessage = (
    data: ChatMessageType['messages'],
    chatFormatDate: string,
    prevList: ChatMessageType[]
  ) => {
    const { room_id: roomId } = data[0];

    if (!roomIdRef.current || !chatFormatDate) return prevList;
    if (prevList.length === 0 && data[0].room_id === roomIdRef.current) {
      prevList.push({
        date: chatFormatDate,
        room_id: roomIdRef.current,
        messages: data,
      });
    } else {
      const existingMsgIndex = prevList.findIndex(
        (msg) => msg.date === chatFormatDate && msg.room_id === roomId
      );

      if (existingMsgIndex !== -1) {
        return prevList.map((item) =>
          item.room_id === roomId && item.date === chatFormatDate
            ? {
                ...item,
                messages: [...data, ...item.messages],
              }
            : item
        );
      }

      if (roomId === roomIdRef.current) {
        const updatedList = [...prevList];
        updatedList.unshift({
          date: chatFormatDate,
          room_id: roomIdRef.current,
          messages: data,
        });
        return updatedList;
      }
    }
    return prevList;
  };

  const handleNewMessage = (data: ChatMessageType['messages']) => {
    const chatFormatDate = getDateForChat(data[0].created_at);
    if (chatFormatDate) {
      setChatList((prev) => {
        return processNewMessage(data, chatFormatDate, [...prev]);
      });
    }
    setTimeout(scrollToBottom, 0);
  };

  const handleScroll = () => {
    const scrollTop = scrollDivRef.current?.scrollTop ?? 0;
    const scrollHeight = scrollDivRef.current?.scrollHeight ?? 0;
    const clientHeight = scrollDivRef.current?.clientHeight ?? 0;

    // Check if the user has scrolled to the top
    if (
      scrollTop === 0 &&
      !isBottomScroll.current &&
      nextPage.currentPage !== 0 &&
      nextPage.currentPage !== nextPage.lastPage
    ) {
      // Return if fetch chat api is on going
      if (isScroll) return;

      setNextPage((prev) => ({ ...prev, currentPage: nextPage.currentPage + 1 }));
      setIsScroll(true); // Set a flag to indicate scroll event fetching
    }
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
      isBottomScroll.current = false;
    }
  };

  return (
    <div className="w-[calc(100%_-_400px)] ps-5 h-auto">
      <div className="bg-white rounded-10px shadow-lg h-full flex flex-col">
        <div className="user-chat-header">
          <div className="icon w-12 h-12 rounded-full relative">
            <Image
              src={
                chatWithUser?.creatorUser?.profile_image ??
                'images/default-avatar.jpg'
              }
              imgClassName="w-full h-full object-cover rounded-full"
              width={50}
              height={50}
              alt="placeholderProfile"
              serverPath
            />
            {chatWithUser?.creatorUser?.chat_user_status !== 'offline' && (
              <span className="absolute bottom-[3px] right-1.5 w-2 h-2 bg-ic_1 rounded-full" />
            )}
          </div>
          <div className="max-w-[calc(100%_-_48px)] w-full ps-2.5 flex items-center justify-between">
            <p className="text-base font-medium text-dark block truncate relative pe-24">
              {chatWithUser?.creatorUser?.full_name}
            </p>
          </div>
        </div>

        <div className="userChatList h-[calc(100dvh_-_387px)] py-1.5 px-5">
          {isLoading && (
            <div className="py-5 flex justify-center items-center">
              <Image loaderType="Spin" />
            </div>
          )}
          <div
            key={`${roomId}`}
            ref={scrollDivRef}
            onScroll={() => {
              handleScroll();
            }}
            className="h-full overflow-auto flex flex-col justify-end [&_>_*]:h-full [&_>_*_>_*]:gap-y-4 pe-1"
          >
            <div>
              <MessageList
                baseImage={baseImage}
                imageLoader={imageLoader}
                chatList={chatList}
                user={user}
                chatWithUser={chatWithUser}
              />
            </div>
          </div>
        </div>
        <SendMessage
          setBaseImage={setBaseImage}
          setImageLoader={setImageLoader}
          chatWithUser={chatWithUser}
          user={user}
          roomId={roomId}
          setAttachFile={setAttachFile}
          attachFile={attachFile}
        />
      </div>
    </div>
  );
};
export default ChatRoom;
