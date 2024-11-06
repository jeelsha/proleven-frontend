import { FormikValues } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const SystemValidationSchema = (formValues: FormikValues) => {
  const { t } = useTranslation();

  return Yup.object().shape({
    startDate:
      formValues.start_time !== ''
        ? Yup.string().required(t('CoursesManagement.Errors.Course.startDate'))
        : Yup.string().notRequired(),
    endDate:
      formValues.end_time !== ''
        ? Yup.string().required(t('CoursesManagement.Errors.Course.endDate'))
        : Yup.string().notRequired(),
    start_time: Yup.string(),
    end_time: Yup.string(),
  });
};
