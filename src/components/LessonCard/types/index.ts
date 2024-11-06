import { UserModalType } from 'hooks/types';
import {
  AttendanceCourse,
  LessonSessionData,
  LessonSessionTimeSheet,
} from 'modules/Courses/types';

export interface LessonCardProps {
  variants?: 'red' | 'secondary' | 'orange';
  // data?: LessonSessionTimeSheet;
  lessonSessionData?: LessonSessionData;
  isCompanyManager?: boolean;
  participateSlug?: string;
  participateId?: number;
  course?: AttendanceCourse;
  mark_as_signed?: {
    mark_as_start_signed: boolean | null;
    mark_as_end_signed: boolean | null;
  };
  refetch?: () => void;
}

export type BreakTimeModalProps = {
  breakTimeModal: UserModalType;
  data: LessonSessionTimeSheet | undefined;
  participateSlug: string | undefined;
  lesson_session_id?: number;
  refetch?: () => void;
};
