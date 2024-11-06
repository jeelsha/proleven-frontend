import { TFunction } from 'i18next';

export const InvoiceStatus = (t: TFunction<'translation', undefined>) => {
  return [
    {
      label: t('InvoiceFilter.sent'),
      value: 'Sent',
    },
    {
      label: t('InvoiceFilter.overDue'),
      value: 'Over Due',
    },
    {
      label: t('InvoiceFilter.paid'),
      value: 'Paid',
    },
  ];
};
