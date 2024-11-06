import { apiCallConstant } from 'constants/common.constant';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const AcademyValidationSchema = () => {
  const { t } = useTranslation();
  const dynamicObject: { [key: string]: Yup.StringSchema<string> } = {};
  Object.values(apiCallConstant).forEach((lang) => {
    dynamicObject[`name_${lang}`] = Yup.string()
      .trim()
      .required(t('AcademyValidation.NameValidation'));
  });
  return Yup.object({
    location: Yup.string().trim().required(t('AcademyValidation.AddressValidation')),
    ...dynamicObject,
  });
};

export const MailsValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    reminderEmails: Yup.array().of(
      Yup.object().shape({
        email: Yup.string()
          .email(t('UserManagement.validation.invalidEmail'))
          .required(t('Auth.LoginValidation.emailReq')),
      })
    ),
    trainerEmails: Yup.array().of(
      Yup.object().shape({
        email: Yup.string()
          .email(t('UserManagement.validation.invalidEmail'))
          .required(t('Auth.LoginValidation.emailReq')),
      })
    ),
    satisfactionEmails: Yup.array().of(
      Yup.object().shape({
        email: Yup.string()
          .email(t('UserManagement.validation.invalidEmail'))
          .required(t('Auth.LoginValidation.emailReq')),
      })
    ),
  });
};
