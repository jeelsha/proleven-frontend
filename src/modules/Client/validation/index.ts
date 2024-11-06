import { REACT_APP_RESTRICT_DUMMY_EMAIL_PROVIDERS } from 'config';
import { TFunction } from 'i18next';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { isDummyEmail } from 'utils';
import * as Yup from 'yup';

/* Company Validation */
const accountingEmailSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    email: Yup.string()
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .test('not-dummy-email', t('dummyEmailCheck'), (value) => {
        if (REACT_APP_RESTRICT_DUMMY_EMAIL_PROVIDERS === 'true' && value) {
          return !isDummyEmail(value);
        }
        return true;
      }),
  });
};

export const RegisterCompanyValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    name: Yup.string()
      .required(t('ClientManagement.clientForm.validation.companyNameValidation'))
      .max(100, 'company_name_format_validation'),
    codice_fiscale: Yup.string()
      .nullable()
      .when('address_country', {
        is: (val: string) => val?.toLowerCase() === 'italy',
        then: () =>
          Yup.string().required(
            t('PrivateMembers.clientForm.validation.codiceFiscaleValidation')
          ),
      }),
    address_country: Yup.string().required(
      t('ClientManagement.clientForm.validation.countryValidation')
    ),
    telephone: Yup.string()
      .required(t('RegisterCompanyValidationSchema.contactNumber'))
      .test(
        'phone-validation',
        t('RegisterCompanyValidationSchema.mobileNumber'),
        (value) => {
          if (value) {
            if (isValidPhoneNumber(value)) return true;
          }
        }
      ),
    // address_city: Yup.string().required(
    //   t('ClientManagement.clientForm.validation.cityValidation')
    // ),
    address_province: Yup.string().required(
      t('RegisterCompanyValidationSchema.provinceRequired')
    ),
    address_zip: Yup.number()
      .typeError(t('ClientManagement.clientForm.validation.zip_format_validation'))
      .positive(
        t('ClientManagement.clientForm.validation.zip_positive_format_validation')
      )
      .required(t('Quote.company.validation.destinationCapRequired')),
    address_l1: Yup.string().required(
      t('ClientManagement.clientForm.validation.companyAddressValidation')
    ),
    vat_number: Yup.string()
      .nullable()
      .when('address_country', {
        is: (val: string) => val?.toLowerCase() === 'italy',
        then: () =>
          Yup.string().required(
            t('ClientManagement.clientForm.validation.vatNumberValidation')
          ),
      }),
    sdi_code: Yup.string()
      .matches(
        /^(|[a-zA-Z0-9]{7})$/, // Allow empty string or exactly 7 alphanumeric characters
        t('ClientManagement.clientForm.validation.sdiCodeValidation')
      )
      .nullable()
      .default('')
      .label('SDI Code'),
    accounting_emails: Yup.array().of(accountingEmailSchema()),
    is_invoice: Yup.string().required(
      t('ClientManagement.clientForm.validation.selectInvoiceValidation')
    ),
    payment_term: Yup.string().required(
      t('ClientManagement.clientForm.validation.paymentTermValidation')
    ),
    vat_primary_id: Yup.string().required(
      t('ClientManagement.clientForm.validation.vat_type_validation')
    ),
    managers: Yup.array()
      .min(1, t('ClientManagement.clientForm.validation.managers_format_validation'))
      .required(t('ClientManagement.clientForm.validation.managersRequired')),
  });
};

/* Manager Validation */

export const ManagerValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object({
    first_name: Yup.string().required(
      t('ClientManagers.clientForm.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('ClientManagers.clientForm.validation.lastNameRequired')
    ),
    email: Yup.string()
      .email(t('ClientManagers.clientForm.validation.invalidEmail'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .required(t('ClientManagers.clientForm.validation.emailRequired')),
    contact: Yup.string().test(
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
    // companies: Yup.array()
    //   .required(t('ClientManagers.clientForm.validation.companiesRequired'))
    //   .min(1, t('ClientManagers.clientForm.validation.companies_format_validation')),
  });
};
export const ManagerBulkUploadValidationSchema = (t: TFunction<any, undefined>) => {
  return Yup.object({
    first_name: Yup.string().required(
      t('ClientManagers.clientForm.validation.firstNameRequired')
    ),
    // last_name: Yup.string().required(
    //   t('ClientManagers.clientForm.validation.lastNameRequired')
    // ),
    // job_title: Yup.string().required(
    //   t('ClientManagers.clientForm.validation.jobTitleRequired')
    // ),
    email: Yup.string()
      .email(t('ClientManagers.clientForm.validation.invalidEmail'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .required(t('ClientManagers.clientForm.validation.emailRequired')),
    contact: Yup.mixed().test(
      'is-string-or-number',
      t('PrivateMembers.clientForm.validation.invalidContact'),
      (value) => {
        if (typeof value === 'string' && value) {
          return /^[0-9+\-* ]+$/.test(value);
        }
        if (typeof value === 'number' && value) return true;
        return true;
      }
    ),
    // .required(t('ClientManagers.clientForm.validation.mobileRequired')),
    // manager: Yup.object().shape({
    //   job_title: Yup.string().required(
    //     t('ClientManagers.clientForm.validation.jobTitleRequired')
    //   ),
    //   companies: Yup.array()
    //     .required(t('ClientManagers.clientForm.validation.companiesRequired'))
    //     .min(
    //       1,
    //       t('ClientManagers.clientForm.validation.companies_format_validation')
    //     ),
    // }),
    // }
    // companies: Yup.array()
    //   .required(t('ClientManagers.clientForm.validation.companiesRequired'))
    //   .min(1, t('ClientManagers.clientForm.validation.companies_format_validation')),
  });
};

export const AttendanceValidationSchema = (t: TFunction<any, undefined>) => {
  return Yup.object({
    first_name: Yup.string().required(
      t('ClientManagers.clientForm.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('ClientManagers.clientForm.validation.lastNameRequired')
    ),
    job_title: Yup.string().required(
      t('ClientManagers.clientForm.validation.jobTitleRequired')
    ),
    // email: Yup.string()
    //   .transform((curr, orig) => (orig === '' ? null : curr))
    //   .email(t('ClientManagers.clientForm.validation.invalidEmail'))
    //   .matches(
    //     value,
    //     t('UserManagement.validation.invalidEmail')
    //   ),

    email: Yup.string().test(
      'email-validation',
      t('ClientManagers.clientForm.validation.invalidEmail'),
      (value) => {
        if (!_.isEmpty(value) && value) {
          if (/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(value))
            return true;
        } else {
          return true;
        }
      }
    ),
    mobile_number: Yup.mixed().test(
      'is-string-or-number',
      t('PrivateMembers.clientForm.validation.invalidContact'),
      (value) => {
        if (typeof value === 'string' && !_.isEmpty(value.trim())) {
          return /^[0-9+\-* ]+$/.test(value);
        }
        if (typeof value === 'number') return true;
        return true;
      }
    ),
    code: Yup.string().required(
      t('PrivateMembers.clientForm.validation.codiceFiscaleValidation')
    ),
  });
};
/* Member Validation */

export const MemberValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object({
    first_name: Yup.string().required(
      t('PrivateMembers.clientForm.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('PrivateMembers.clientForm.validation.lastNameRequired')
    ),
    email: Yup.string()
      .email(t('PrivateMembers.clientForm.validation.invalidEmail'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .test('not-dummy-email', t('dummyEmailCheck'), (value) => {
        if (REACT_APP_RESTRICT_DUMMY_EMAIL_PROVIDERS === 'true' && value) {
          return !isDummyEmail(value);
        }
        return true;
      })
      .required(t('PrivateMembers.clientForm.validation.emailRequired')),
    contact: Yup.string().test(
      'phone-validation',
      t('PrivateMembers.clientForm.validation.invalidContact'),
      (value) => {
        if (value) {
          if (isValidPhoneNumber(value)) return true;
        }
        return true;
      }
    ),
    codice_fiscale: Yup.string().required(
      t('PrivateMembers.clientForm.validation.codiceFiscaleValidation')
    ),
    job_title: Yup.string().required(
      t('PrivateMembers.clientForm.validation.roleValidation')
    ),
  });
};

export const MemberBulkUploadValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object({
    first_name: Yup.string().required(
      t('PrivateMembers.clientForm.validation.firstNameRequired')
    ),
    last_name: Yup.string().required(
      t('PrivateMembers.clientForm.validation.lastNameRequired')
    ),
    email: Yup.string()
      .email(t('PrivateMembers.clientForm.validation.invalidEmail'))
      .matches(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        t('UserManagement.validation.invalidEmail')
      )
      .required(t('PrivateMembers.clientForm.validation.emailRequired')),
    contact: Yup.mixed().test(
      'is-string-or-number',
      t('PrivateMembers.clientForm.validation.invalidContact'),
      (value) => {
        if (typeof value === 'string' && value) {
          return /^[0-9+\-*]+$/.test(value);
        }
        if (typeof value === 'number' && value) return true;
        return true;
      }
    ),
    // .test(
    //   'phone-validation',
    //   t('PrivateMembers.clientForm.validation.invalidContact'),
    //   (value) => {
    //     if (value) {
    //       if (isValidPhoneNumber(value)) return true;
    //     }
    //   }
    // ),
    privateIndividual: Yup.object().shape({
      codice_fiscale: Yup.string().required(
        t('PrivateMembers.clientForm.validation.codiceFiscaleValidation')
      ),
      job_title: Yup.string().required(
        t('PrivateMembers.clientForm.validation.roleValidation')
      ),
    }),
  });
};
