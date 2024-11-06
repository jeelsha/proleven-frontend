import { apiCallConstant } from 'constants/common.constant';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const CertificateTemplateValidation = () => {
  const { t } = useTranslation();
  const dynamicObject: { [key: string]: Yup.StringSchema<string> } = {};
  Object.values(apiCallConstant).forEach((lang) => {
    dynamicObject[`title_${lang}`] = Yup.string()
      .trim()
      .required(t('Calendar.createEventValidation.topic'));
    dynamicObject[`content_${lang}`] = Yup.string()
      .trim()
      .required(t('certificateContent'));
  });
  return Yup.object({
    ...dynamicObject,
  });
};
