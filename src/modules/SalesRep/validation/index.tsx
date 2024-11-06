import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const SalesRepValidation = () => {
  const { t } = useTranslation();

  return Yup.object().shape({
    sales_rep_id: Yup.string().required(
      t('Quote.company.validation.salesRepRequired')
    ),
  });
};
