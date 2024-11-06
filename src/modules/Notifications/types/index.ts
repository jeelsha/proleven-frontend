import { LanguageType } from 'redux-toolkit/slices/languageSlice';

export interface INotification {
  id: number;
  title: string;
  message: string;
  type: NotificationTypes;
  is_read: boolean;
  user_id: number;
  created_by: null | string;
  language?: string;
  generated_type: NotificationTypes;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: null | string;
}

export enum NotificationTypes {
  USER = 'USER',
  GENERAL = 'GENERAL',
  COURSE = 'COURSE',
  CHAT = 'CHAT',
  FEEDBACK = 'FEEDBACK',
  CERTIFICATE = 'CERTIFICATE',
}
export type generalNotificationProps = {
  item: INotification;
  handleIsRead: (data: INotification) => void;
  storeLang: LanguageType;
  variant?: 'USER' | 'GENERAL' | 'COURSE' | 'CHAT' | 'FEEDBACK' | 'CERTIFICATE';
};

export type NotificationProps = {
  notificationData: INotification[];
  handleIsRead: (data: INotification) => void;
  isLoading: boolean;
};

export type ImperativeType = {
  handleLoadMore: () => void;
  handleIsRead: () => Promise<void>;
};

export enum LanguageEnum {
  italian = 'italian',
  english = 'english',
}
