import ExcelJS from 'exceljs';
import { RoleFields } from 'types/common';
import { ROLES } from './roleAndPermission.constant';

const defaultStyleConfiguration: {
  alignment: Partial<{
    vertical?: 'top' | 'middle' | 'bottom';
    horizontal?: 'left' | 'center' | 'right';
  }>;
  width: number;
} = {
  alignment: {
    vertical: 'middle',
    horizontal: 'center',
  },
  width: 18,
};

export const UserManagementExportObject = (
  currentRole: RoleFields | undefined,
  t: (key: string) => string
) => {
  let structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('UserManagement.addEditUser.firstName'),
      key: 'first_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('UserManagement.addEditUser.lastName'),
      key: 'last_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('UserManagement.addEditUser.email'),
      key: 'email',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      width: 40,
    },
    {
      header: t('UserManagement.addEditUser.contact'),
      key: 'contact',
      ...defaultStyleConfiguration,
    },
    {
      header: t('UserManagement.addEditUser.departHead'),
      key: 'is_head',
      ...defaultStyleConfiguration,
    },
  ];

  if (currentRole?.title === ROLES.Trainer) {
    structure = [
      ...structure,
      {
        header: t('UserManagement.addEditUser.hourlyRate'),
        key: 'trainer.hourly_rate',
        ...defaultStyleConfiguration,
      },
      {
        header: t('UserManagement.addEditUser.travelReimbursement'),
        key: 'trainer.travel_reimbursement_fee',
        alignment: {
          vertical: 'middle',
          horizontal: 'center',
        },
        width: 25,
      },
      {
        header: t('UserManagement.addEditUser.trainerRate'),
        key: 'trainer.rate_by_admin',
        alignment: {
          vertical: 'middle',
          horizontal: 'center',
        },
        width: 25,
      },
    ];
  }
  return structure;
};

export const PrivateMembersExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('PrivateMembers.clientForm.fieldInfos.firstName'),
      key: 'first_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('PrivateMembers.clientForm.fieldInfos.lastName'),
      key: 'last_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('PrivateMembers.clientForm.fieldInfos.email'),
      key: 'email',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      width: 40,
    },
    {
      header: t('PrivateMembers.clientForm.fieldInfos.contact'),
      key: 'contact',
      ...defaultStyleConfiguration,
    },
    {
      header: t('PrivateMembers.clientForm.fieldInfos.codiceFiscale'),
      key: 'private_individual.codice_fiscale',
      ...defaultStyleConfiguration,
    },
    {
      header: t('PrivateMembers.clientForm.fieldInfos.role'),
      key: 'private_individual.job_title',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};

export const CodeExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('Codes.code'),
      key: 'code',
      ...defaultStyleConfiguration,
    },
    {
      header: t('Codes.description'),
      key: 'description',
      ...defaultStyleConfiguration,
    },
    {
      header: t('codeType'),
      key: 'course_code_type',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      width: 40,
    },
    {
      header: t('Codes.category'),
      key: 'courses.courseCategory.name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('Codes.subCategory'),
      key: 'courses.courseSubCategory.name',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};

export const AtecoCodeExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('AtecoCodes.name'),
      key: 'name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('AtecoCodes.description'),
      key: 'description',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};

export const CourseExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('CoursesManagement.CreateCourse.courseName'),
      key: 'title',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.Templates'),
      key: 'code_title',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.CreateCourse.startDate'),
      key: 'start_date',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.CreateCourse.endDate'),
      key: 'end_date',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.Category'),
      key: 'courseCategory.name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.ClientCompany'),
      key: 'companies',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.TrainingSpecialist'),
      key: 'training_specialist',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.FundedBy'),
      key: 'funded_by',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.Revenue'),
      key: 'courseRevenue',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};

export const CompanyManagerExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('ClientManagers.clientForm.fieldInfos.firstName'),
      key: 'user.first_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagers.clientForm.fieldInfos.lastName'),
      key: 'user.last_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagers.clientForm.fieldInfos.email'),
      key: 'user.email',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      width: 40,
    },
    {
      header: t('ClientManagers.clientForm.fieldInfos.contact'),
      key: 'user.contact',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagers.clientForm.fieldInfos.jobTitle'),
      key: 'job_title',
      ...defaultStyleConfiguration,
    },
  ];
  // if (response) {
  //   structure.push({
  //     header: t('ClientManagers.clientForm.fieldInfos.companies'),
  //     key: 'company.name',
  //     ...defaultStyleConfiguration,
  //   });
  // }
  return structure;
};

export const AllCompanyManagerExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('ClientManagers.clientForm.fieldInfos.firstName'),
      key: 'first_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagers.clientForm.fieldInfos.lastName'),
      key: 'last_name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagers.managersColumnTitles.managerEmail'),
      key: 'email',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      width: 40,
    },
    {
      header: t('ClientManagers.managersColumnTitles.managerMobileNo'),
      key: 'contact',
      ...defaultStyleConfiguration,
    },
    // {
    //   header: t('ClientManagers.managersColumnTitles.managerCompanyName'),
    //   key: 'managers.company_manager.company.name',
    //   ...defaultStyleConfiguration,
    // },
  ];
  // if (response) {
  //   structure.push({
  //     header: t('ClientManagers.clientForm.fieldInfos.companies'),
  //     key: 'company.name',
  //     ...defaultStyleConfiguration,
  //   });
  // }
  return structure;
};

export const CompanyManagerAttendeeExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: `${t('ClientManagers.clientForm.fieldInfos.firstName')}*`,
      key: 'first_name',
      ...defaultStyleConfiguration,
    },
    {
      header: `${t('ClientManagers.clientForm.fieldInfos.lastName')}*`,
      key: 'last_name',
      ...defaultStyleConfiguration,
    },
    {
      header: `${t('ClientManagers.clientForm.fieldInfos.email')} ${t(
        'removeHyperLink'
      )}`,
      key: 'email',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      width: 40,
    },
    {
      header: `${t('ClientManagers.clientForm.fieldInfos.contact')} ${t(
        'changeFormat'
      )}`,
      key: 'mobile_number',
      ...defaultStyleConfiguration,
    },
    {
      header: `${t('ClientManagers.clientForm.fieldInfos.jobTitle')}*`,
      key: 'job_title',
      ...defaultStyleConfiguration,
    },
    {
      header: `${t('CompanyManager.AttendeeList.codeTitle')}*`,
      key: 'code',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};
export const CompanyExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('ClientManagement.clientColumnTitles.clientTitle'),
      key: 'name',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagement.clientColumnTitles.codiceFiscale'),
      key: 'codice_fiscale',
      ...defaultStyleConfiguration,
    },

    {
      header: t('ClientManagement.clientColumnTitles.clientVatNo'),
      key: 'vat_number',
      ...defaultStyleConfiguration,
    },
    {
      header: t('ClientManagement.clientColumnTitles.clientCountry'),
      key: 'country',
      ...defaultStyleConfiguration,
    },
    {
      header: t('Auth.RegisterCompany.sdiCode'),
      key: 'sdi_code',
      ...defaultStyleConfiguration,
    },
    {
      header: t('Auth.RegisterCompany.atecoCode'),
      key: 'ateco_code',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};

export const TrainingSpecialistCourseExportObject = (t: (key: string) => string) => {
  const structure: Partial<ExcelJS.Column>[] = [
    {
      header: t('CoursesManagement.columnHeader.Name'),
      key: 'title',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.CreateCourse.courseCode'),
      key: 'code',
      ...defaultStyleConfiguration,
    },
    {
      header: t('CoursesManagement.columnHeader.Type'),
      key: 'type',
      ...defaultStyleConfiguration,
    },
    {
      header: t('reports.ratingTitle'),
      key: 'rating',
      ...defaultStyleConfiguration,
    },
    {
      header: t('reports.revenueTitle'),
      key: 'courseRevenue',
      ...defaultStyleConfiguration,
    },
    {
      header: t('reports.totalDays'),
      key: 'totalDays',
      ...defaultStyleConfiguration,
    },
  ];
  return structure;
};
