import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const RecoverCourseValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    course_id: Yup.string().required(t('recoverModal.validation.courseDropDown')),
  });
};
