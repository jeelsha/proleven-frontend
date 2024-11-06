import { useTranslation } from 'react-i18next';

export const useBulkUploadMessageConstant = () => {
  const { t } = useTranslation();
  const uploadNotes = {
    mobileNumber: t('BulkUploadNotes.mobileNumber'),
    email: t('BulkUploadNotes.email'),
    CodiceFiscale: t('BulkUploadNotes.CodiceFiscale'),
    DepartHead: t('BulkUploadNotes.DepartHead'),
    AllowedCodeCourse: t('BulkUploadNotes.AllowedCourseType'),
    CodeCourseType: t('BulkUploadNotes.CourseTypeText'),
  };
  return { uploadNotes };
};
