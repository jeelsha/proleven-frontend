import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const EmailTemplateValidation = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string().trim().required(t('emailTempValidation.titleRequired')),
    subject: Yup.string().trim().required(t('emailTempValidation.subjectRequired')),
    description: Yup.string().trim(),
  });
};
