//  ** type **
import { SetStateAction } from 'react';
import { AuthUserType } from 'redux-toolkit/slices/authSlice';

export type ChatUserListPropType = {
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setChatWithUser: React.Dispatch<React.SetStateAction<ChatUser | undefined>>;
  user?: Partial<AuthUserType | null>;
  setRoomId: React.Dispatch<React.SetStateAction<number>>;
  receiverId?: number;
  setReceiverId: React.Dispatch<React.SetStateAction<number | undefined>>;
  activeUser?: number;
};

export type ChatRoomPropType = {
  roomId: number;
  user?: Partial<AuthUserType | null>;
  chatWithUser: ChatUser;
  setAttachFile: React.Dispatch<React.SetStateAction<boolean>>;
  receiverId?: number;
  attachFile: boolean;
  setImageLoader?: React.Dispatch<
    SetStateAction<{
      loader: boolean;
      imageRoomId: number;
    }>
  >;
  setBaseImage?: React.Dispatch<SetStateAction<Array<string | File>>>;
};

export type InitialValueType = {
  chat_message_image: Array<File | string>;
  text: string;
};

export type SendMessageType = {
  text?: string;
  sender_id?: string;
  room_id?: number;
  chat_message_image?: Array<File | string>;
  receiver_id?: number;
};

export type ChatUser = {
  user_id: number;
  room_id: number;
  unreadMessageCount: number;
  lastMessage: null | string;
  lastMessageSentBy: null | string;
  lastMsgById: null | string;
  lastMessageTime: null | string;
  attachmentType: null | string;
  attachment: null | string;
  full_name: string;
  userRoom: {
    id: number;
    image: null | string;
    is_group_chat: boolean;
    name: string;
    is_active: null | boolean;
    slug: null | string;
    creator_id: null | number;
  };
  creatorUser: {
    id: number;
    full_name?: string;
    username: string;
    profile_image: string;
    chat_user_status: string;
    verified: boolean;
  };
};

export type SearchUserType = {
  unreadMessageCount: number;
  id: number;
  full_name: string;
  username: string;
  chat_user_status: boolean;
  profile_image: string;
  verified: boolean;
};

export type ChatMessageType = {
  date: string;
  room_id: number;
  messages: {
    id: number;
    text: string;
    media: null | string;
    media_type: string | null;
    sender_id: string;
    room_id: number;
    multiImageData: {
      created_at: string;
      id: number;
      media: string;
      media_type: string;
      parent_message_id: number;
      room_id: number;
      sender_id: number;
      text: string;
    }[];
    sender?: { username: string; profile_image: string };
    currentUnreadCount?: number;
    created_at: string;
    messageRoom?: MessageRoomType;
  }[];
};

type MessageRoomType = {
  id: number;
  image: null | string;
  is_group_chat: boolean;
  name: string;
  is_active: null | boolean;
  slug: null | string;
  creator_id: null | number;
  updated_at: string;
  deleted_at: null | string;
  roomUsers: [
    {
      id: number;
    },
    {
      id: number;
    }
  ];
};

export type RenderImageType = {
  index: number;
  limitedImages: boolean;
  imagesToRender: number;
  media?: string;
  src?: string;
  isLastImage?: number;
};

export type MessageListPropsType = {
  chatList: ChatMessageType[];
  user?: Partial<AuthUserType | null>;
  chatWithUser: ChatUser;
  imageLoader: {
    loader: boolean;
    imageRoomId: number;
  };
  baseImage: (string | File)[] | string | File;
};
export type UserListPropsType = {
  userList: ChatUser[];
  handleRoom: (data: ChatUser) => Promise<void>;
  activeUser?: number;
};
