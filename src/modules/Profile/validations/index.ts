import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const ChangePasswordValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    newPassword: Yup.string()
      .trim()
      .required(t('UserProfile.ChangePassword.newPasswordValidation'))
      .matches(/(?=.*[A-Z])/, t('UserProfile.ChangePassword.capitalPass'))
      .matches(/(?=.*[!@#$%^&()*])/, t('UserProfile.ChangePassword.specialChar'))
      .matches(/(?=.*[a-z])/, t('UserProfile.ChangePassword.lowerCase'))
      .matches(/(?=.*[0-9])/, t('UserProfile.ChangePassword.numberReq'))
      .min(8, t('UserProfile.ChangePassword.noSpace'))
      .max(15),
    oldPassword: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .required(t('UserProfile.ChangePassword.confirmPasswordValidation'))
      .oneOf(
        [Yup.ref('newPassword') || null],
        t('UserProfile.ChangePassword.matchConfirmPass')
      ),
  });
};
