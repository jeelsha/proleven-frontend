import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const EventValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object({
    topic: Yup.string().required(t('Calendar.createEventValidation.topic')),
    date: Yup.date().required(t('Calendar.createEventValidation.date')),
    start_time: Yup.string().required(t('Calendar.createEventValidation.startTime')),
    end_time: Yup.string().required(t('Calendar.createEventValidation.endTime')),
    agenda: Yup.string().required(t('Calendar.createEventValidation.agenda')),
    // conference_provider: Yup.object().required(
    //   t('Calendar.createEventValidation.conferenceProvider')
    // ),
    // calendar_provider: Yup.object().required(
    //   t('Calendar.createEventValidation.calendarProvider')
    // ),
  });
};
