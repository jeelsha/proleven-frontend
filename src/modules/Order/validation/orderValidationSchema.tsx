import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const OrderValidationSchema = () => {
  const { t } = useTranslation();

  return Yup.object().shape({
    reason: Yup.string().required(t('orderReasonRequired')),
  });
};
