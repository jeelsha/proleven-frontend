import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const SectorValidation = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    code: Yup.string().trim().required(t('Codes.codeError')),
    letter: Yup.string().trim().required(t('letterValidation')),
  });
};
