import { UserModalType } from 'hooks/types';

export type acceptProps = {
  modal: UserModalType;
  courseCode: string;
  courseSlug?: string;
  participateSlug: string;
  refetch: () => void;
};
export interface CourseOption {
  id: number;
  title: string;
  code: string;
  progressive_number: string;
  start_date: string;
  end_date: string;
  type: CourseTypeEnum;
  mode: CourseModeEnum;
  slug: string;
}

export enum CourseModeEnum {
  InPerson = 'in-person',
  VideoConference = 'video-conference',
  Hybrid = 'hybrid',
}

export enum CourseTypeEnum {
  Academy = 'academy',
  Private = 'private',
}
