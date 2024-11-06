import { useTranslation } from 'react-i18next';

export interface PaymentTermsProps {
  id?: number;
  name?: string;
  payment_mode: string;
  payment_due: paymentDue;
  days?: number;
  due_days?: number;
  payment_percentage?: number;
  end_of_month?: boolean;
  custom_due_days?: number;
  slug?: string;
  custom: [
    {
      days: number;
      payment_percentage: number;
      end_of_month: boolean;
      custom_due_days: number;
    }
  ];
}
export type customType = {
  days: number;
  payment_percentage: number;
  end_of_month: boolean;
  custom_due_days: number;
};

export enum paymentDue {
  IMMEDIATE = 'Immediate',
  DUE = 'Due',
  CUSTOM = 'Custom',
}

export enum paymentMode {
  WIRE_TRANSFER = 'Wire Transfer',
  BANCOMAT = "Bancomat"
}

export const paymentModeOptions = () => {
  const { t } = useTranslation();
  return [
    {
      label: t('Payment.Immediate'),
      value: paymentDue?.IMMEDIATE,
    },
    {
      label: t('Payment.Due.title'),
      value: paymentDue?.DUE,
    },
    {
      label: t('Payment.Custom'),
      value: paymentDue?.CUSTOM,
    },
  ];
};
