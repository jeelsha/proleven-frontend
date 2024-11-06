import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { CodeType } from '../types';

export const CodeValidation = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    code: Yup.string().trim().required(t('Codes.codeError')),
    course_code_type: Yup.string().nullable(),
    title: Yup.string()
      .trim()
      .nullable()
      .when('course_code_type', {
        is: (val: string) => val === CodeType.GENERAL,
        then: () => Yup.string().trim().required(t('CourseBundle.titleRequired')),
      }),
    price: Yup.string()
      .trim()
      .nullable()
      .when('course_code_type', {
        is: (val: string) => val === CodeType.GENERAL,
        then: () =>
          Yup.number().min(0, t('CoursesManagement.Errors.Course.invalidPrice')).required(t('Quote.company.validation.priceRequired')),
      }),

    description: Yup.string().trim().nullable(),
  });
};

export const CodeBulkUploadValidationSchema = (t: TFunction<any, undefined>) => {
  return Yup.object({
    code: Yup.string().trim().required(t('Codes.codeError')),
    description: Yup.string().trim().required(t('Codes.descriptionError')),
    course_code_type: Yup.string()
      .required(t('Codes.codeRequiredError'))
      .test('code_type', t('codeTypeError'), (val) => {
        if (val === CodeType.COURSE || val === CodeType.GENERAL) {
          return true;
        }
        return false;
      }),
  });
};
