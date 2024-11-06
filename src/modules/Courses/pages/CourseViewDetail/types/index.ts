import { IconTypes } from 'components/Icon/types';

export type ICourseData = {
  access: IAccess[];
  course_bundle_id: number;
};
export type tabProps = {
  title: string;
  component: JSX.Element;
  icon?: IconTypes;
  uniqueKey: string;
};

export type IAccess = {
  delete: boolean;
  edit: boolean;
  user_id: number;
  view: boolean;
};
