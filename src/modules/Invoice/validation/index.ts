import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const InvoiceValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object({
    company_id: Yup.string().required(t('Quote.company.companyIdValidation')),
    order_id: Yup.array()
      .of(Yup.string().required(t('order.validation')))
      .required(t('order.validation'))
      .min(1, t('order.validation')),
  });
};
