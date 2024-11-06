import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const BonusValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    bonus: Yup.number().min(0, t('Trainer.invoice.courseBonusValidation')),
  });
};
