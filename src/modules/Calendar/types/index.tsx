import { UserModalType } from 'hooks/types';

export interface ProfileCardProps {
  title?: string;
  profileData?: {
    profile_image?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface LessonSession {
  start_time?: string;
  end_time?: string;
  mode?: string;
  session_conference_provider?: string;
  client_meeting_link: string;
  provider_meeting_link: string;
}

export interface EventShowProps {
  isOtherCalendar?: boolean;
  modal: {
    isOpen: boolean;
    closeModal: () => void;
    openModal: () => void;
  };
  eventDetails?: CalendarEventDetails;
  isLoading?: boolean;
  EventCreateModal?: UserModalType;
  deleteModal?: UserModalType;
  setIsEventEdit?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CalendarEventDetails {
  slug?: string;
  title: string;
  topic: string;
  agenda: string;
  type: string;
  image: string;
  conference_provider_id?: number;
  calendar_provider_id?: number;
  meeting_start_link?: string;
  conference_provider?: {
    id?: string;
    token_provider?: string;
    token_provider_mail?: string;
  };
  calendar_provider: {
    id?: string;
    token_provider?: string;
    token_provider_mail?: string;
  };
  course_resources?: [
    {
      resources: {
        title?: string;
      };
    }
  ];
  assigned_rooms?: [
    {
      course_room: {
        title?: string;
      };
    }
  ];
  course_notes: {
    id: string;
    content?: string;
  }[];
  start_date?: string;
  end_date?: string;
  createdByUser?: {
    profile_image?: string;
    full_name?: string;
  };
  assignedTo?: {
    profile_image?: string;
    full_name?: string;
  };
  enrolled_courses?: {
    company?: {
      name?: string;
      company_manager?: {
        id?: number;
        manager?: {
          user?: {
            full_name: string;
          };
        };
      }[];
    };
  }[];
  course?: {
    card?: {
      stage?: { name?: string };
    };
  };
  card?: {
    stage?: { name?: string };
  };
  lessons: {
    id: string;
    calendar_provider?: string;
    conference_provider: string;
    client_meeting_link: string;
    location?: string;
    mode: string;
    place_address: string;
    address_map_link: string;
    lesson_sessions?: LessonSession[];
    title: string;
  }[];
  trainerUser?: {
    first_name: string;
    last_name: string;
    id: number;
  };
  hangoutLink?: string;
  description?: string;
  lessonSessionApproval?: LessonSessionApproval[];
}

export interface LessonSessionApproval {
  id: number;
  course_id: number;
  assigned_to: number;
  is_optional: boolean;
  is_full_course: boolean;
  assignedToUser: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface EventIntialProps {
  date: string | Date;
  topic: string;
  agenda: string;
  start_time: string;
  end_time: string;
  calendar_provider_id: number | string;
  conference_provider_id: number | string;
  calendar_provider: number | string;
  conference_provider: number | string;
}
export interface SessionCardProps {
  eventDetails?: CalendarEventDetails;
}

export interface Meeting {
  id: number;
  organizer_id: number;
  topic: string;
  start_date: string;
  end_date: string;
  agenda: string;
  slug: string;
  status: string;
  conference_provider_id: number;
  calendar_provider_id: number;
  meeting_event_id: number | null;
  meeting_link: string | null;
  meeting_start_link: string | null;
  meeting_id: number | null;
  meeting_additional_data: any | null;
  meeting_request_uid: string;
  event_uid: string;
  event_id: number | null;
  event_additional_data: any | null;
  conference_change_key: string | null;
  calendar_change_key: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  createdByUser: User;
  organizer: User;
  conference_provider: any | null;
  calendar_provider: any | null;
}

export interface User {
  full_name: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact: string | null;
  username: string;
  profile_image: string | null;
}
