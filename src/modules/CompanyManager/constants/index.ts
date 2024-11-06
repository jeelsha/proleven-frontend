import { parseISO } from 'date-fns';
import { CourseLessonSession } from 'modules/CompanyManager/types';
import { useTranslation } from 'react-i18next';

export const AvailableFilterOptions = () => {
  const { t } = useTranslation();
  return [
    {
      label: t('CompanyManager.courses.availableOptionTitle'),
      value: CourseMarkAsEnum.Public,
    },
    {
      label: t('SoldOut'),
      value: CourseMarkAsEnum.SoldOut,
    },
  ];
};

export enum CourseMarkAsEnum {
  Public = 'publish',
  Private = 'private',
  SoldOut = 'sold_out',
  EnrollmentOpen = 'enrollment_open',
}

export enum courseProposedDateAction {
  accept = 'accept',
  reject = 'reject',
}

export const calculateTotalTime = (events: CourseLessonSession[]) => {
  return events.reduce((totalMinutes, event) => {
    const startTime: Date = parseISO(event.start_time);
    const endTime: Date = parseISO(event.end_time);
    return totalMinutes + (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  }, 0);
};

export const formatTotalTime = (totalMinutes: number) => {
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = Math.floor(totalMinutes % 60);

  if (totalHours > 0 && remainingMinutes > 0) {
    return `${totalHours}h ${remainingMinutes}m`;
  }
  if (totalHours === 0 && remainingMinutes > 0) {
    return `${remainingMinutes}m`;
  }
  if (totalHours > 0 && remainingMinutes === 0) {
    return `${totalHours}h`;
  }
  return `0h`;
};

export enum Conference {
  Zoom = 'zoom',
  Meet = 'google_calendar',
  Teams = 'microsoft_calendar',
}

export enum AddAttendeeEnum {
  newAttendee = 'Add New Attendee',
  existingAttendee = 'Add From Existing',
}
