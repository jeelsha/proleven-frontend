import { ROLES } from 'constants/roleAndPermission.constant';
import { useTranslation } from 'react-i18next';
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as Yup from 'yup';

export const ViewProfileValidationSchema = (roleValidation: string | undefined) => {
  const { t } = useTranslation();
  let TrainerSchema = {};

  if (roleValidation && roleValidation === ROLES.Trainer) {
    TrainerSchema = {
      trainer: Yup.object().shape({
        hourly_rate: Yup.number().required(
          t('UserManagement.addEditUser.hourlyRateValidation')
        ),
        travel_reimbursement_fee: Yup.number(),
        location: Yup.string().required(
          t('Auth.RegisterTrainer.LocationValidation')
        ),
        sub_categories: Yup.array()
          .required(t('Auth.RegisterTrainer.CourseValidation'))
          .min(1, t('Auth.RegisterTrainer.CourseValidation')),
      }),
    };
  }
  return Yup.object().shape({
    first_name: Yup.string()
      .trim()
      .required(t('UserManagement.validation.firstNameRequired')),
    email: Yup.string()
      .required(t('UserManagement.validation.emailRequired'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      ),
    last_name: Yup.string()
      .trim()
      .required(t('UserManagement.validation.lastNameRequired')),
    contact: Yup.string()
      .required(t('PrivateMembers.clientForm.validation.mobileRequired'))
      .test(
        'phone-validation',
        t('PrivateMembers.clientForm.validation.invalidContact'),
        (value) => {
          if (value) {
            if (isValidPhoneNumber(value)) return true;
          }
        }
      ),
    ...TrainerSchema,
  });
};
