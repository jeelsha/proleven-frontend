import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const CodeValidation = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    name: Yup.string().trim().required(t('Codes.codeError')),
    description: Yup.string().trim().required(t('Codes.descriptionError')),
    risk: Yup.string().trim(),
    ateco_letter: Yup.string().trim().required(t('letterValidation')),
  });
};

export const AtecoCodeBulkUploadValidationSchema = (
  t: TFunction<any, undefined>
) => {
  return Yup.object({
    name: Yup.string().trim().required(t('Codes.codeError')),
    description: Yup.string().trim().required(t('Codes.descriptionError')),
  });
};
