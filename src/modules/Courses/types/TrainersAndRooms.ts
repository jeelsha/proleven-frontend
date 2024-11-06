import { TrainerSelected, TrainerSuggested } from 'modules/Courses/Constants';
import {
  CourseInitialValues,
  CourseResponse,
  ICourseTrainer,
} from 'modules/Courses/types';
import { ModalProps, SetFieldValue } from 'types/common';

export interface TrainerModalProps {
  values: CourseInitialValues;
  response: Array<Trainer>;
  name?: string;
  selectedValues?: Array<ICourseTrainer> | null;
  dates?: Array<string>;
  lessonTrainers?: Array<Trainer[]>;
  setFieldValue?: SetFieldValue;
  formLanguage?: string;
  isLessonWiseTrainer?: boolean;
}

export interface TrainerRoomInfoProps {
  values: CourseInitialValues;
  formLanguage?: string;
  fieldsToTranslate: Array<string>;
  currentLanguage: string;
  defaultLanguage: string;
  isLoading?: boolean;
  dates?: Array<string>;
  lessonTime?: Array<string>;
  locations?: Array<string | undefined>;
  setIsMainLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setFieldValue?: SetFieldValue;
  lessonTrainers?: Array<Trainer[]>;
}

export interface LessonWIseTrainerProps {
  values: CourseInitialValues;
  lessonTrainers?: Array<Trainer[]>;
  setFieldValue?: SetFieldValue;
  formLanguage?: string;
}

export interface Trainer {
  name: string;
  email: string;
  username: string;
  profile_image: string | null;
  id: number;
  rate: number | null;
  selected_status: TrainerSelected;
  assigned: boolean;
  dates: DateStatus[];
  suggested: boolean;
  role_name: string;
  suggested_status: TrainerSuggested;
  all_status: string;
}

interface LessonApprovalData {
  id: number;
}

interface DateStatus {
  date: string;
  status: string;
  lessonApprovalData: LessonApprovalData[];
}

export type CourseRooms = {
  id: number;
  title: string;
  maximum_participate: number;
  selected_status: TrainerSelected;
  assigned: boolean;
  slug: string;
};

export type AddTrainerModalProps = {
  modal: ModalProps;
  mainModal: ModalProps;
  selectedCourse?: CourseResponse | null;
  refetch?: () => void;
};
export type AddTrainerFormType = {
  trainer: Array<number>;
  trainer_type: string;
};

export enum TrainerType {
  Main = 'main',
  Optional = 'optional',
}
