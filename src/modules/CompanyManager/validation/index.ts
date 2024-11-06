// ** imports **
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

// ** constants

// ** redux **
import { ROLES } from 'constants/roleAndPermission.constant';
import _ from 'lodash';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { AuthUserType } from 'redux-toolkit/slices/authSlice';

export const AttendeeValidationSchema = (
  CurrentUser: Partial<AuthUserType | null> | undefined,
  isFromSideBar: boolean,
  isUnknown: boolean
) => {
  const { t } = useTranslation();

  let additionalSchema = {};

  if (
    CurrentUser?.role_name === ROLES.Trainer ||
    CurrentUser?.role_name === ROLES.Admin ||
    CurrentUser?.role_name === ROLES.TrainingSpecialist
  ) {
    additionalSchema = {
      company_id: Yup.string().required(
        t('CompanyManager.AttendeeList.companyRequiredValidation')
      ),
      ...(!isFromSideBar && {
        course_id: Yup.string().required(
          t('CompanyManager.AttendeeList.courseRequiredValidation')
        ),
        ...(!isUnknown &&
          CurrentUser?.role_name !== ROLES.Trainer && {
            manager_id: Yup.string().nullable(),
          }),
        ...(isUnknown && {
          company_name: Yup.string().required('Company name is required'),
        }),
      }),
    };
  }

  return Yup.object({
    first_name: Yup.string().required(
      t('CompanyManager.AttendeeList.firstNameValidation')
    ),
    last_name: Yup.string().required(
      t('CompanyManager.AttendeeList.lastNameValidation')
    ),
    job_title: Yup.string().required(
      t('CompanyManager.AttendeeList.roleValidation')
    ),

    code: Yup.string().required(
      t('PrivateMembers.clientForm.validation.codiceFiscaleValidation')
    ),
    mobile_number: Yup.string().test(
      'phone-validation',
      t('RegisterCompanyValidationSchema.mobileNumber'),
      (value) => {
        if (!_.isEmpty(value) && value) {
          if (isValidPhoneNumber(value)) return true;
        } else {
          return true;
        }
      }
    ),
    ...additionalSchema,
  });
};

export const AddRequestCourseSchema = () => {
  const { t } = useTranslation();
  return Yup.object({
    category_id: Yup.array()
      .of(Yup.string().required())
      .min(1, t('CoursesManagement.Bundle.AddEditBundle.Error.courseCategory')),
    course_slugs: Yup.array()
      .of(Yup.string().required())
      .min(1, t('CoursesManagement.Bundle.AddEditBundle.Error.courses')),
    description: Yup.string().required(t('CoursesManagement.Errors.Course.notes')),
  });
};
