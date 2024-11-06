import { UserModalType } from 'hooks/types';
import { TFunction } from 'i18next';
import { SetStateAction } from 'react';
import { Params } from 'react-router-dom';

type User = {
  [key: string]: string | number | null | boolean | undefined;
  first_name: string;
  last_name: string;
  profile_image: string;
  id: number;
  trainerHourlyCharge: number;
  travelFees: number | null;
  hours: number;
  totalFees: number | null;
  coursePrice: number;
  courseRevenue: number;
  totalParticipate: number;
  profit: number;
  hourlyRate: number | null;
  totalDistance: number;
  totalDays: number;
  totalTravelFees: number;
  totalNetFees: number;
  override?: boolean;
};

type Course = {
  title: string;
  start_date: string;
  end_date: string;
  slug: string;
};

export type LessonSession = {
  id: number;
  lesson_id: number;
  lesson: {
    mode: string;
    title: string | undefined;
  };
  conference_provider_id: string | null;
  calendar_provider_id: string | null;
  client_meeting_link: string | null;
  language: string;
  parent_table_id: string | null;
  slug: string;
  start_time: string;
  end_time: string;
  course_id: number;
  provider_meeting_link: string | null;
  provider_meeting_event_id: string | null;
  provider_start_meeting_link: string | null;
  provider_meeting_id: string | null;
  provider_meeting_additional_data: string | null;
  provider_meeting_request_uid: string;
  provider_event_uid: string;
  provider_event_id: string | null;
  provider_event_additional_data: string | null;
  conference_change_key: string | null;
  calendar_change_key: string | null;
  created_by: number;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
export interface ReassignPayloadDataProps {
  reassigned_resources: {
    trainer_id: string;
    resources: {
      id: number;
      quantity: number;
    }[];
  }[];
  course_room_id?: number;
  lesson_session_slugs?: string[];
  without_approval?: boolean;
  trainer_id: number;
  profit: number;
}
export type AssignedSession = {
  id: number;
  available: boolean;
  distance?: number;
  assigned_to: number;
  lesson_session_id: number | null;
  course_id: number;
  course_bundle_id: number | null;
  assigned_to_status: string;
  trainer_assigned_to_status: string;
  lesson_id: number | null;
  reject_note: string | null;
  is_full_course: boolean;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  courses: Course;
  lessonSessions: LessonSession | null;
  selected_user: {
    id: number;
    assignedToUser: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  selected_users: {
    id: number;
    assignedToUser: {
      id: number;
      first_name: string;
      last_name: string;
      profile_image?: string;
    };
  }[];
};

export type IAdminTrainerRequest = {
  user: User;
  assignedSession: AssignedSession[];
  amount?: number;
  reimbursement_amount?: number;
  is_lumpsum_select?: boolean;
  note?: string;
};

export type acceptModalProps = {
  withoutApproval?: boolean;
  modal: UserModalType;
  course_slug?: string;
  refetch?: () => void;
  refetchShowTrainer?: () => void;
  getAssignedTrainersForBundle?: () => Promise<void>;
  isOptional?: boolean | null;
  bundle_slug?: string | null;
  bundleId?: number | null;
  lessonSlugs?: {
    trainerId: number | undefined;
    lesson_slug: string[];
  }[];
};
export type Room = {
  id: number;
  title: string;
  totalQty: string;
};

export type Resource = {
  id: number;
  title: string;
  totalQty: number;
  usedQty: number;
};

export type RoomResourceType = {
  mainRooms: Room[];
  optionalRoom: Room[];
  mainResources: Resource[];
  optionalResources: Resource[];
  isResourceAvaliableForEachTrainer: boolean;
  totalOptionalResources: number;
};
interface TrainerRoomAndUsers {
  assignedTo: AssignedTo;
  room: Room | null;
  resources: Resource[];
}
interface AssignedTo {
  first_name: string;
  last_name: string;
  id: number;
}

export type IReassignData = {
  trainerRoomAndUsers: TrainerRoomAndUsers[];
  optionalRoom: Room[];
  optionalResources: Resource[];
};
export type acceptProps = {
  slug?: string | null;
  currentTabTitle?: string | null;
  courseType?: string;
  courseStatus?: string;
};

export interface IFormValue {
  lumpsum_amount?: number;
  reimbursement_fee?: number;
  isLumpsumCheck: boolean;
}

export interface IForm {
  formValues?: IFormValue[];
}
export type sendRequestProps = {
  courseStatus?: string;
  courseType?: string;
  modal: UserModalType;
  trainerData: IAdminTrainerRequest[];
  currentTabTitle?: string | null;
  refetch: () => void;
  params: Readonly<Params<string>>;
  setTrainerIds: React.Dispatch<SetStateAction<number[]>>;
  bundleSlug?: string | null;
};
export type ITrainerCardProps = {
  refetch: () => void;
  isRejected?: boolean;
  refetchShowTrainer?: () => void;
  courseStatus?: string;
  courseType?: string;
  item: IAdminTrainerRequest;
  index: number;
  formValue: IForm;
  handleLumpsumFunction: (trainerId: number, values?: IFormValue) => Promise<void>;
  showLumpsumField: boolean;
  showLumpsumInBundle: boolean | '' | null | undefined;
  profitIcon: (
    value: number,
    t: TFunction<any, undefined>
  ) => JSX.Element | 'Out of range';
  selectedLessons: {
    trainerId: number | undefined;
    lesson_slug: string[];
  }[];
  setSelectedLessons: React.Dispatch<
    SetStateAction<
      {
        trainerId: number | undefined;
        lesson_slug: string[];
      }[]
    >
  >;
  slug: string | null | undefined;
  paramSlug: string | null | undefined;
};

interface Trainer {
  profile_image: string;
  assigned_to_status: string;
  assignedToUser: string;
  id: number;
  is_full_course: boolean;
  is_optional: boolean;
  is_lesson_trainer: boolean;
}

interface AssignedToUser {
  first_name: string;
  last_name: string;
  id: number;
}

export interface LessonSessionApproval {
  assigned_to_status: string;
  is_full_course: boolean;
  course_id: number;
  lesson_session_id: number;
  is_optional: boolean;
  available: boolean;
  assignedToUser: AssignedToUser;
}

interface ILessonSession {
  id: number;
  lesson_id: number;
  conference_provider_id: string | null;
  calendar_provider_id: string | null;
  client_meeting_link: string | null;
  language: string;
  parent_table_id: number;
  slug: string;
  start_time: string;
  end_time: string;
  course_id: number;
  provider_meeting_link: string | null;
  provider_meeting_event_id: string | null;
  provider_start_meeting_link: string | null;
  provider_meeting_id: string | null;
  provider_meeting_additional_data: string | null;
  provider_meeting_request_uid: string;
  provider_event_uid: string;
  provider_event_id: string | null;
  provider_event_additional_data: string | null;
  conference_change_key: string | null;
  calendar_change_key: string | null;
  created_by: number;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lessonSessionApproval: LessonSessionApproval[];
}

interface Lesson {
  id: number;
  title: string;
  mode: string;
  conference_provider: string | null;
  calendar_provider: string | null;
  client_meeting_link: string | null;
  language: string;
  parent_table_id: number;
  slug: string;
  location: string | null;
  longitude: number | null;
  latitude: number | null;
  date: string;
  address_map_link: string | null;
  place_address: string | null;
  course_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  lesson_sessions: ILessonSession[];
}

export interface AssignedTrainerCourse {
  id: number;
  title: string;
  lessons: Lesson[];
  main_trainers: Trainer[];
  optional_trainers: Trainer[];
}
