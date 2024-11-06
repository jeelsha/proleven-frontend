import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const RoomValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string()
      .required(t('Calendar.createEventValidation.topic'))
      .max(255, t('room.TitleLengthValidation')),
    maximum_participate: Yup.number()
      .required(t('MaximumParticipant.Required'))
      .min(1, t('CoursesManagement.Errors.Course.maxParticipantNonNegative')),
  });
};
