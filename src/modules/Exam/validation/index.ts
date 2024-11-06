import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const ExamValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    first_name: Yup.string().required(
      t('UserManagement.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('UserManagement.validation.lastNameRequired')
    ),
    language: Yup.string().required(t('CoursesManagement.Errors.Course.language')),
    exam_signature: Yup.string().required(t('Exam.signatureValidation')),
  });
};
