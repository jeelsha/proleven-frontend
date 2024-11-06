import { useTranslation } from 'react-i18next';

export const Months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export enum CourseModeEnum {
  InPerson = 'in-person',
  VideoConference = 'video-conference',
  Hybrid = 'hybrid',
}

export const CourseMode = (mode: CourseModeEnum) => {
  const { t } = useTranslation();
  const modeTranslations = {
    [CourseModeEnum.InPerson]: t('CoursesManagement.CourseModeEnum.InPerson'),
    [CourseModeEnum.VideoConference]: t(
      'CoursesManagement.CourseModeEnum.VideoConference'
    ),
    [CourseModeEnum.Hybrid]: t('CoursesManagement.CourseModeEnum.Hybrid'),
  };

  return modeTranslations[mode];
};

export const getCourseModeEnum = (mode?: string): CourseModeEnum => {
  switch (mode) {
    case 'in-person':
      return CourseModeEnum.InPerson;
    case 'video-conference':
      return CourseModeEnum.VideoConference;
    case 'hybrid':
      return CourseModeEnum.Hybrid;
    default:
      return CourseModeEnum.InPerson;
  }
};
