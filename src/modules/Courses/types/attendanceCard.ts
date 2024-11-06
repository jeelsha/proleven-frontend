import { UserModalType } from 'hooks/types';
import {
  CourseParticipant,
  LessonSession,
} from 'modules/Courses/pages/Attendance/types';
import { Data } from 'modules/Courses/pages/Attendance/types/sessionTypes';
import { SetStateAction } from 'react';
import { LessonBreak } from '.';

export type attendanceProps = {
  refetch?: () => void;
  isEdit: boolean;
  lessonWiseAttendance?: boolean;
  data: CourseParticipant | Data;
  index: number;
  OnSubmit?: (
    data: CourseParticipant,
    signature: File | null,
    type: 'begin' | 'end'
  ) => Promise<void>;
  course?: {
    end_date: string;
    id: number;
    start_date: string;
  } | null;
  setAbsentData?: React.Dispatch<
    SetStateAction<{
      [key: string]: unknown;
    }>
  >;
  absentData?: {
    [key: string]: unknown;
  };
  location?: {
    lessonSessionId: number;
    slug: string;
  };
  absentModal?: UserModalType;
  lateArrivalModal?: UserModalType;
  earlyLeaveModal?: UserModalType;
  breakTimeModal?: UserModalType;
  setParticipateSlug?: React.Dispatch<SetStateAction<string>>;
  setSelectedData?: React.Dispatch<SetStateAction<LessonSession>>;
};

export interface CourseAttendanceSheetProps {
  courseAttendanceSheet: {
    lessonSession: {
      start_time: Date | string;
      end_time: Date | string;
    };
    set_early_arrival: boolean;
    set_early_leave: boolean;
    mark_as_start_signed_at: string | number | Date;
    mark_as_end_signed_at: string | number | Date;
    mark_as_absent: string | boolean;
  }[];
}
export interface CourseAttendanceActionProps {
  id: number;
  courseAttendanceLog: SetStateAction<LessonBreak[]>;
  slug: string;
  courseAttendanceSheet: {
    lessonSession: {
      start_time: Date | string;
      end_time: Date | string;
    };
    set_early_arrival: boolean;
    set_early_leave: boolean;
    mark_as_start_signed_at: string | number | Date;
    mark_as_end_signed_at: string | number | Date;
    mark_as_absent: string | boolean;
  }[];
}
