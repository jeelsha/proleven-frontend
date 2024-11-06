import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const ReportsValidation = () => {
  const { t } = useTranslation();
  return Yup.object({
    startDate: Yup.string().required(t('CoursesManagement.Errors.Course.startDate')),
    endDate: Yup.string().required(t('CoursesManagement.Errors.Course.endDate')),
  });
};
