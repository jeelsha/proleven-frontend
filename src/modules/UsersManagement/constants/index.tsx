import { CodeType } from 'modules/Codes/types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { RoleFields, StatusFields } from 'types/common';

export const Fields = () => {
  const { t } = useTranslation();

  const allRoles = useSelector(getRoles);
  const Role_Fields: RoleFields[] = allRoles.map((role) => {
    return {
      id: role.id,
      key: role.name,
      isChecked: false,
      title: role.name,
    };
  });

  const Status_Fields: StatusFields[] = [
    { id: 0, key: 'INACTIVE', title: t('Status.inactive'), isChecked: false },
    { id: 1, key: 'ACTIVE', title: t('Status.active'), isChecked: false },
  ];
  const isHead_Fields: StatusFields[] = [
    { id: 0, key: 'true', title: t('isHead.yes'), isChecked: false },
    { id: 1, key: 'false', title: t('isHead.no'), isChecked: false },
  ];

  const quoteStatus_Fields: StatusFields[] = [
    { id: 0, key: 'approved', title: t('quoteStatus.approved'), isChecked: false },
    { id: 1, key: 'open', title: t('filterTypeOpen'), isChecked: false },
    { id: 2, key: 'rejected', title: t('quoteStatus.rejected'), isChecked: false },
  ];

  const quoteType_Fields: StatusFields[] = [
    { id: 0, key: 'private', title: t('quoteType.private'), isChecked: false },
    { id: 1, key: 'academy', title: t('quoteType.academy'), isChecked: false },
  ];

  const isCourseCode_Fields: StatusFields[] = [
    {
      id: 0,
      key: CodeType.GENERAL,
      title: t('Header.notificationDropdown.generalTab'),
      isChecked: false,
    },
    { id: 1, key: CodeType.COURSE, title: t('ViewCourse.Title'), isChecked: false },
  ];

  const isSubCatEmpty: StatusFields[] = [
    { id: 0, key: 'true', title: t('empty.title'), isChecked: false },
    { id: 1, key: 'false', title: t('notEmpty.title'), isChecked: false },
  ];

  return {
    Role_Fields,
    Status_Fields,
    isHead_Fields,
    isCourseCode_Fields,
    quoteStatus_Fields,
    quoteType_Fields,
    isSubCatEmpty
  };
};

export enum CourseStatus {
  publish = 'Publish',
  draft = 'Draft',
}

export enum CourseType {
  Private = 'Private',
  Academy = 'Academy',
}
