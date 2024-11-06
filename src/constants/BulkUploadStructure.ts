import { RoleFields } from 'types/common';
import { ROLES } from './roleAndPermission.constant';

export const UserManagementBulkUploadObject = (
  currentRole: RoleFields,
  t: (key: string) => string
) => {
  const formFields = new Map([
    [
      'first_name',
      {
        isRequired: true,
        value: '',
        name: t('UserManagement.addEditUser.firstName'),
      },
    ],
    [
      'last_name',
      {
        isRequired: true,
        value: '',
        name: t('UserManagement.addEditUser.lastName'),
      },
    ],
    [
      'email',
      {
        isRequired: true,
        value: '',
        name: t('UserManagement.addEditUser.email'),
      },
    ],
    [
      'contact',
      {
        isRequired: false,
        value: '',
        name: t('UserManagement.addEditUser.contact'),
      },
    ],
    [
      'is_head',
      {
        isRequired: true,
        value: '',
        name: t('UserManagement.addEditUser.departHead'),
      },
    ],
  ]);
  if (currentRole?.title === ROLES.Trainer) {
    formFields.set('trainer.hourly_rate', {
      isRequired: true,
      value: '',
      name: t('UserManagement.addEditUser.hourlyRate'),
    });
    formFields.set('trainer.travel_reimbursement_fee', {
      isRequired: false,
      value: '',
      name: t('UserManagement.addEditUser.travelReimbursement'),
    });
    formFields.set('trainer.rate_by_admin', {
      isRequired: false,
      value: '',
      name: t('UserManagement.addEditUser.trainerRate'),
    });
  }
  return formFields;
};

export const PrivateMembersBulkUploadObject = (t: (key: string) => string) => {
  const formFields = new Map([
    [
      'first_name',
      {
        isRequired: true,
        value: '',
        name: t('PrivateMembers.clientForm.fieldInfos.firstName'),
      },
    ],
    [
      'last_name',
      {
        isRequired: true,
        value: '',
        name: t('PrivateMembers.clientForm.fieldInfos.lastName'),
      },
    ],
    [
      'email',
      {
        isRequired: true,
        value: '',
        name: t('PrivateMembers.clientForm.fieldInfos.email'),
      },
    ],
    [
      'contact',
      {
        isRequired: false,
        value: '',
        name: t('PrivateMembers.clientForm.fieldInfos.contact'),
      },
    ],
    [
      'privateIndividual.codice_fiscale',
      {
        isRequired: true,
        value: '',
        name: t('PrivateMembers.clientForm.fieldInfos.codiceFiscale'),
      },
    ],
    [
      'privateIndividual.job_title',
      {
        isRequired: true,
        value: '',
        name: t('PrivateMembers.clientForm.fieldInfos.role'),
      },
    ],
  ]);
  return formFields;
};

export const CompanyManagerBulkUploadObject = (t: (key: string) => string) => {
  const formFields = new Map([
    [
      'first_name',
      {
        isRequired: true,
        value: '',
        name: t('ClientManagers.clientForm.fieldInfos.firstName'),
      },
    ],
    [
      'last_name',
      {
        isRequired: true,
        value: '',
        name: t('ClientManagers.clientForm.fieldInfos.lastName'),
      },
    ],
    [
      'email',
      {
        isRequired: true,
        value: '',
        name: t('ClientManagers.clientForm.fieldInfos.email'),
      },
    ],
    [
      'contact',
      {
        isRequired: false,
        value: '',
        name: t('ClientManagers.clientForm.fieldInfos.contact'),
      },
    ],
    [
      'manager.job_title',
      {
        isRequired: true,
        value: '',
        name: t('ClientManagers.clientForm.fieldInfos.jobTitle'),
      },
    ],
  ]);
  return formFields;
};

export const CompanyManagerAttendeesBulkUploadObject = (
  t: (key: string) => string
) => {
  const formFields = new Map([
    [
      'first_name',
      {
        isRequired: true,
        value: '',
        name: t('CompanyManager.AttendeeList.firstNameTitle'),
      },
    ],
    [
      'last_name',
      {
        isRequired: true,
        value: '',
        name: t('CompanyManager.AttendeeList.lastNameTitle'),
      },
    ],
    [
      'email',
      {
        isRequired: true,
        value: '',
        name: t('CompanyManager.AttendeeList.emailTitle'),
      },
    ],
    [
      'mobile_number',
      {
        isRequired: true,
        value: '',
        name: t('CompanyManager.AttendeeList.contactTitle'),
      },
    ],
    [
      'code',
      {
        isRequired: true,
        value: '',
        name: t('CompanyManager.AttendeeList.codeTitle'),
      },
    ],
    [
      'job_title',
      {
        isRequired: true,
        value: '',
        name: t('CompanyManager.AttendeeList.roleTitle'),
      },
    ],
  ]);
  return formFields;
};

export const CodeBulkUploadObject = (t: (key: string) => string) => {
  const formFields = new Map([
    [
      'code',
      {
        isRequired: true,
        value: '',
        name: t('Codes.code'),
      },
    ],
    [
      'description',
      {
        isRequired: true,
        value: '',
        name: t('Codes.description'),
      },
    ],
    [
      'course_code_type',
      {
        isRequired: true,
        value: '',
        name: t('codeType'),
      },
    ],
  ]);
  return formFields;
};

export const AtecoCodeBulkUploadObject = (t: (key: string) => string) => {
  const formFields = new Map([
    [
      'name',
      {
        isRequired: true,
        value: '',
        name: t('AtecoCodes.name'),
      },
    ],
    [
      'description',
      {
        isRequired: true,
        value: '',
        name: t('AtecoCodes.description'),
      },
    ],
  ]);
  return formFields;
};

export const CourseTemplateBulkUploadObject = (t: (key: string) => string) => {
  const formFields = new Map([
    [
      'category_id',
      {
        isRequired: true,
        value: '',
        name: 'Category',
      },
    ],
    [
      'title',
      {
        isRequired: true,
        value: '',
        name: 'Course Title IT',
      },
    ],
    [
      'title_en',
      {
        isRequired: true,
        value: '',
        name: 'Course Title EN',
      },
    ],
    [
      'sub_category_id',
      {
        isRequired: true,
        value: '',
        name: 'Sub Category EN',
      },
    ],
    [
      'sub_category_id',
      {
        isRequired: true,
        value: '',
        name: 'Sub Category IT',
      },
    ],
    [
      'code_id',
      {
        isRequired: true,
        value: '',
        name: t('Codes.code'),
      },
    ],
    [
      'price',
      {
        isRequired: true,
        value: '',
        name: 'Price',
      },
    ],
    // [
    //   'duration',
    //   {
    //     isRequired: true,
    //     value: '',
    //     name: 'Duration',
    //   },
    // ],
    // [
    //   'validity',
    //   {
    //     isRequired: true,
    //     value: '',
    //     name: 'Validity',
    //   },
    // ],
    // [
    //   'maximum_participation_attendance',
    //   {
    //     isRequired: true,
    //     value: '',
    //     name: 'Maximum number of participants',
    //   },
    // ],
  ]);
  return formFields;
};
