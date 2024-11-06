import { REACT_APP_RESTRICT_DUMMY_EMAIL_PROVIDERS } from 'config';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useTranslation } from 'react-i18next';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { isDummyEmail } from 'utils';
import * as Yup from 'yup';

export const UserValidationSchema = (roleValidation: string | undefined) => {
  const { t } = useTranslation();
  let TrainerSchema = {};

  if (roleValidation && roleValidation === ROLES.Trainer) {
    TrainerSchema = {
      trainer: Yup.object().shape({
        hourly_rate: Yup.number()
          .min(0, t('UserManagement.validation.trainerNegativeHourlyRate'))
          .max(1000, t('User.hourlyRate.maxPrice.validation'))
          .required(t('UserManagement.addEditUser.hourlyRateValidation')),
        travel_reimbursement_fee: Yup.number()
          .min(0, t('UserManagement.validation.trainerNegativeHourlyRate'))
          .max(10000, t('User.travelReimbursement.maxPrice.validation')),
        reimbursement_threshold: Yup.number()
          .min(0, t('UserManagement.validation.trainerNegativeHourlyRate'))
          .max(500)
          .required(t('trainer.thresholdValidation')),

        rate_by_admin: Yup.number()
          .min(0, t('UserManagement.validation.trainerRateValidation'))
          .max(5, t('UserManagement.validation.trainerMaxRateValidation')),
        location: Yup.string().required(
          t('Auth.RegisterTrainer.LocationValidation')
        ),
        codice_fiscale: Yup.string(),
        vat_number: Yup.string(),
        sub_categories: Yup.array()
          .required(t('Auth.RegisterTrainer.CourseValidation'))
          .min(1, t('Auth.RegisterTrainer.CourseValidation')),
      }),
    };
  }
  const baseSchema = Yup.object().shape({
    first_name: Yup.string().required(
      t('UserManagement.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('UserManagement.validation.lastNameRequired')
    ),
    email: Yup.string()
      .email(t('UserManagement.validation.invalidEmail'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .test('not-dummy-email', t('dummyEmailCheck'), (value) => {
        if (
          REACT_APP_RESTRICT_DUMMY_EMAIL_PROVIDERS === 'true' &&
          value &&
          roleValidation &&
          roleValidation === ROLES.Trainer
        ) {
          return !isDummyEmail(value);
        }
        return true;
      })
      .required(t('UserManagement.validation.emailRequired')),
    contact: Yup.string()
      .nullable()
      .test(
        'phone-validation',
        t('ClientManagers.clientForm.validation.invalidContact'),
        (value) => {
          if (value) {
            if (isValidPhoneNumber(value)) return true;
          } else {
            return true;
          }
        }
      ),
    role: Yup.string().required(t('UserManagement.validation.roleRequired')),
    active: Yup.string().required(t('UserManagement.validation.statusRequired')),
    ...TrainerSchema,
  });
  return baseSchema;
};

export const UserBulkUploadValidationSchema = (
  roleValidation: string | undefined
) => {
  const { t } = useTranslation();
  let TrainerSchema = {};

  if (roleValidation && roleValidation === ROLES.Trainer) {
    TrainerSchema = {
      trainer: Yup.object().shape({
        hourly_rate: Yup.number().required(
          t('UserManagement.addEditUser.hourlyRateValidation')
        ),
        travel_reimbursement_fee: Yup.number(),
        rate_by_admin: Yup.number()
          .min(0, t('UserManagement.validation.trainerRateValidation'))
          .max(5, t('UserManagement.validation.trainerMaxRateValidation')),
      }),
    };
  }
  const baseSchema = Yup.object().shape({
    first_name: Yup.string().required(
      t('UserManagement.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('UserManagement.validation.lastNameRequired')
    ),
    email: Yup.string()
      .email(t('UserManagement.validation.invalidEmail'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .required(t('UserManagement.validation.emailRequired')),
    contact: Yup.mixed().test(
      'is-string-or-number',
      t('PrivateMembers.clientForm.validation.invalidContact'),
      (value) => {
        if (typeof value === 'string' && value) {
          return /^[0-9+\-*. ]+$/.test(value);
        }
        if (typeof value === 'number' && value) return true;
        return true;
      }
    ),
    // .test(
    //   'phone-validation',
    //   t('RegisterCompanyValidationSchema.mobileNumber'),
    //   (value) => {
    //     if (value) {
    //       if (isValidPhoneNumber(value)) return true;
    //     }
    //   }
    // ),
    is_head: Yup.string()
      .required(t('UserManagement.validation.departHeadRequired'))
      .test(
        'depart-head-validation',
        t('UserManagement.validation.departValueValidation'),
        (value) => {
          if (value) {
            if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')
              return true;
          }
        }
      ),
    ...TrainerSchema,
  });
  return baseSchema;
};
