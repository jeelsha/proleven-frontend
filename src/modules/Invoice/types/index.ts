import { Option } from 'components/FormElement/types';
import { TFunction } from 'i18next';
import { SetStateAction } from 'react';

export interface InvoiceFilterType {
  invoiceStatus?: string[];
  startDueDate: string;
  endDueDate: string;
  filterDate: {
    startDate: string | Date;
    endDate: string | Date;
  };
  paymentStartDate: string | Date;
  paymentEndDate: string | Date;
  payment_mode: string;
  paymentFilterMode: string;
  salesRep: number[];
  companies?: Array<string>;
}

export interface InvoiceFilterDateType {
  invoiceStatus?: string[];
  startDueDate: string;
  endDueDate: string;
  paymentStartDate: string | Date;
  paymentEndDate: string | Date;
  payment_mode: string;
  paymentFilterMode: string;
  salesRep?: number[];
  formValue?: {
    salesRep?: Option[];
  };
  companies?: Array<string>;
}
export interface FilterInvoiceProps {
  setFilterModal: React.Dispatch<SetStateAction<boolean>>;
  setInvoiceFilters: React.Dispatch<SetStateAction<InvoiceFilterType>>;
  t: TFunction<'translation', undefined>;
  invoiceFilters: InvoiceFilterType | undefined;
  salesRepResponse?: Option[];
}

export type InvoiceAttributesType = {
  id?: number;
  company_id?: number;
  slug?: string;
  payment_status?: PaymentStatus;
  invoice_number?: string;
  price?: number;
  due_date?: Date | string;
  invoice_date?: Date | string;
  payment_date?: Date | string;
  fatture_invoice_id?: number;
  fatture_invoice_number?: number;
  file_path?: string;
  files?: [];
  trainer_id?: number;
  year?: number;
  created_by?: number;
  old_invoice_pdf?: string;
};

export enum PaymentStatus {
  Sent = 'Sent',
  OverDue = 'Over Due',
  Paid = 'Paid',
}
