import { FormikErrors } from 'formik';
import { Dispatch, SetStateAction } from 'react';

import { ModalProps } from 'types/common';

export interface EventUserDataProps {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string | null;
  username?: string;
  profile_image?: string | null;
  full_name?: string;
}

export interface EventManagerProps {
  id: number;
  manager_id: number;
  company_id: number;
  parent_table_id?: number | null;
  language?: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  manager: {
    id: number;
    user_id: number;
    user: {
      full_name: string;
    };
    job_title?: string;
    billing_address1?: string | null;
    billing_address2?: string | null;
    billing_city?: string | null;
    billing_country?: string | null;
    billing_state?: string | null;
    billing_zip?: string | null;
    parent_table_id?: number | null;
    language?: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
  };
}

export interface CompanyProps {
  id: number;
  name: string;
  company_manager: EventManagerProps[];
}

export interface EnrolledCourseProps {
  id: number;
  course_id: number;
  manager_id: number;
  course_slug: string;
  company_id: number;
  private_individual_id?: number | null;
  language?: string;
  slug: string;
  parent_table_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  company: CompanyProps;
}

export interface EventProps {
  id: number;
  lessonIndex?: number;
  title?: string;
  topic?: string;
  start_date?: string;
  end_date?: string;
  start: Date;
  end: Date;
  slug: string;
  mode?: string;
  lesson: {
    id?: string;
    title?: string;
    slug: string;
    mode?: string;
    language?: string;
    location?: string | null;
    lesson_sessions: {
      id: number;
      lesson_id: number;
      conference_provider_id?: string | null;
      calendar_provider_id?: string | null;
      client_meeting_link?: string | null;
      language?: string;
      parent_table_id?: number;
      slug: string;
      start_time: string;
      end_time: string;
      course_id: number;
      provider_meeting_link?: string | null;
      provider_meeting_event_id?: string | null;
      provider_start_meeting_link?: string | null;
      provider_meeting_id?: string | null;
      provider_meeting_additional_data?: string | null;
      provider_meeting_request_uid: string;
      provider_event_uid: string;
      provider_event_id?: string | null;
      provider_event_additional_data?: string | null;
      conference_change_key?: string | null;
      calendar_change_key?: string | null;
      created_by: number;
      assigned_to?: number | null;
      assigned_to_status?: string;
      created_at: string;
      updated_at: string;
      deleted_at?: string | null;
    }[];
  };
  course: {
    id: number;
    start_date: string;
    end_date: string;
    title: string;
    slug: string;
    type: string;
    image: string;
    lessons: {
      id: number;
      location: string;
    }[];
    academy?: {
      name?: string;
    };
    assigned_rooms?: [
      {
        course_room: {
          title?: string;
        };
      }
    ];
    course_resources?: [
      {
        resources: {
          title?: string;
        };
      }
    ];
    assignedTo?: EventUserDataProps | null;
    enrolled_courses: EnrolledCourseProps[];
    lessonSessionApproval?: {
      id: number;
      course_id: number;
      assigned_to: number;
      assigned_to_status: string;
      trainer_assigned_to_status: string;
      assignedToUser: EventUserDataProps;
    }[];
    createdByUser: EventUserDataProps;
    card?: {
      stage_id: number;
      stage: {
        name: string;
      };
    };
  };
  conference_provider?: {
    id?: string;
    token_provider?: string;
    token_provider_mail?: string;
  } | null;
  calendar_provider: {
    id?: string | null;
    token_provider?: string | null;
    token_provider_mail?: string | null;
  } | null;
  color?: string;
  trainerUser?: {
    first_name: string;
    last_name: string;
    id: number;
  };
  hangoutLink?: string;
  description?: string;
  agenda?: string;
}

export interface CalendarProps {
  modal: ModalProps;
  events: EventProps[];
  children?: JSX.Element;
  setEventSlug: Dispatch<SetStateAction<EventProps | undefined>>;
  filterModal: ModalProps;
  EventCreateModal: ModalProps;
  setCurrentCalendarView?: Dispatch<SetStateAction<string>>;
  setCurrentMonthView?: Dispatch<SetStateAction<string>>;
  setFilterValue?: Dispatch<
    SetStateAction<{
      start_date?: Date | string;
      end_date?: Date | string;
    }>
  >;
  setInitialValues?: React.Dispatch<
    SetStateAction<{
      trainer_id: string[];
    }>
  >;
  initialValues: { trainer_id: string[] };
  loading?: boolean;
  eventsLoading?: boolean;
  trainerColors: {
    [key: string]: string;
  };
  setTrainerColors: Dispatch<
    SetStateAction<{
      [key: string]: string;
    }>
  >;
}

interface Localizer {
  inRange: (start: Date, date: Date, end: Date) => boolean;
  endOf: (date: Date, unit: string) => Date;
}

export interface YearProps {
  date: Date;
  localizer: Localizer;
  events: EventProps[];
  onSelectEvent: (event: EventProps) => void;
  handleModalClose: (key: string) => void;
  onNavigate: (type: string, date: Date) => void;
  onView: (view: string) => void;
  handleModalOpen: (event: EventProps, eventId: string, taskID: string) => void;
  setShowPopOvers: (value: boolean) => void;
}

// CALENDAR TOOLBAR PROPS

export interface CustomToolbarProps {
  label: string;
  onView: (view: string) => void;
  views: string[];
  onNavigate: (action: 'TODAY' | 'PREV' | 'NEXT') => void;
  view: string;
}

export interface TabProps {
  id: string;
  title: string;
  name: string;
  slug: string;
}
export interface PositionState {
  display?: 'none' | 'block'; // Assuming display can only be 'none' or 'block'
  visibility?: string;
  height: number;
  width: number;
  top: string | number;
  left: string | number;
  maxHeight?: string | number;
}
export interface Positions {
  top: number;
  left: number;
  right?: number;
  bottom?: number;
}
export interface FilterProps {
  course: TabProps[];
  trainer: TabProps[];
  trainingspecialist: TabProps[];
  resource: TabProps[];
  room: TabProps[];
}

// Event Hover Types
export interface EventHoverProps {
  position: { position: string };
  className: string;
  hoveredEvent?: EventProps;
  user?: any;
}

export interface EventHoverChildrenProps {
  hoveredEvent?: EventProps;
  user?: any;
}

export interface PopupStyles {
  top: string;
  position: string;
  maxHeight?: string;
  left?: string;
  visibility?: string;
  opacity?: string;
  pointerEvents?: string;
  overflow?: string;
}

export interface CustomModalProps {
  taskInfo: EventProps;
  className: string;
  position: { position: string };
  user?: any;
}
export type IHandleMemberCheckBox = {
  checkData: React.ChangeEvent<HTMLInputElement>;
  values: {
    trainer_id: string[];
  };
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<{
    trainer_id: string[];
  }>>;
};

export interface TrainerEventResponse {
  [key: number]: TrainerEvent[];
}
interface TrainerUser {
  first_name: string;
  last_name: string;
  id: number;
}

export interface TrainerEvent {
  start_date: string;
  end_date: string;
  hangoutLink?: string;
  title: string;
  trainerUser: TrainerUser;
  description?: string;
}
