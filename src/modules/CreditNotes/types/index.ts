import { TFunction } from 'i18next';
import { OrderNumberProps } from 'modules/Order/types';
import { Dispatch, SetStateAction } from 'react';

export interface InvoiceProps {
  company: CompanyProps;
  order?: {
    slug: string;
    order_number: string;
  };
  invoice?: {
    invoice_number: string;
    slug: string;
  };
  invoice_product: {
    company: CompanyProps;
    order: {
      order_number: string;
    };
  }[];
  quote_product?: {
    quotes?: {
      currency?: string;
    };
  };
  credit_price: number;
  created_at: string;
  payment_status: string;
  course_id: number;
  product_id: number;
}

export interface CompanyProps {
  id: number;
  name: string;
  logo: string;
}

export interface CreditInitialProps {
  credit_price: string;
  description: string;
}

export interface CreditNote {
  credit_price: number;
  description: string;
}
export interface ProductData {
  price: number;
  vat_type: number;
  units: number;
  product_total_vat_amount: number;
  product_total_amount?: number;
  discount?: number;
  quotes?: {
    total_amount_without_tax?: number;
  };
  credit_note: CreditNote[];
}

export interface QuoteDataProps {
  destination_email: string;
  destination_cap: string;
  date: string;
  payment_method: string;
  sales_rep_id: string;
  destination_province: string;
  account_holder: string;
  company?: CompanyDataProps;
  codice_fiscale?: string;
  cod_dest?: string;
  destination_telephone?: string;
  destination_mobile_number?: string;
  is_destination_goods: boolean;
  address: string;
  cap_number: string;
  email: string;
  country: string;
  city: string;
  currency: string;
  province: string;
  destination_goods: string;
  total_discount?: number;
  total_vat_amount?: number;
  total_amount?: number;
  total_amount_without_tax?: number;
}

export interface CompanyDataProps {
  country?: string;
  city?: string;
  address1?: string;
  logo?: string;
  name?: string;
  vat_number?: string;
  sdi_code?: string;
  accounting_emails?: [{ email: string; is_primary: boolean }];
  address2?: string;
  ateco_code?: string;
  is_invoice?: boolean;
  payment_term_id?: string | number;
  registration_number?: string;
  zip?: string;
  telephone?: string;
}
export interface ProductsProps {
  quoteData?: QuoteDataProps;
  productData?: ProductDataProps;
  t: TFunction<'translation', undefined>;
  totalProductAmount?: number;
  totalProductDiscount?: number;
  checkData?: boolean;
}

export interface ProductDataProps {
  product_status: string;
  title: string;
  description: string;
  vat_number: string;
  price: number;
  discount: number;
  invoice_status: string;
}

export interface ProductProps {
  invoice_id?: number;
  order_id?: number;
  course?:
    | {
        id?: number;
      }
    | CourseDataInvoiceProps;
  company?: {
    id?: number;
    vat_type: number;
    course_participates?: [
      {
        first_name?: string;
        last_name?: string;
        code?: string;
      }
    ];
  };
  payment_term_id?: number;
  description?: string;
  credit_price?: string;
  // course?: CourseDataInvoiceProps;
  order?: {
    orderNumber: string;
    slug: string;
    type: string;
  };
  quotes?: {
    currency: string;
  };
  product?: {
    units: number;
    price: number;
    discount?: number;
    id?: number;
    invoice_status?: string;
    title?: string;
    description: string;
    product_total_amount?: number;
    credit_note?: CreditNote[];
    product_type?: string;
  };
  id?: number;
  code?: string;
  title?: string;
  courseCategory?: { name: string };
  start_date?: string;
  end_date?: string;
  price?: number;
}

export enum OrderStatusType {
  Academic = 'Academic',
  Private = 'Private',
  Trainer = 'Trainer',
}

export interface courseDataProps {
  price?: number;
  credit_price: number;
  company: {
    course_participates: [
      {
        first_name?: string;
        last_name?: string;
        code?: string;
      }
    ];
    vat_type: number;
  };
}

export interface courseProps {
  course?: {
    id?: number;
  };
  quotes?: {
    currency: string;
  };
  credit_price?: number;
  credit_description?: string;
  product: {
    units: number;
    price: number;
    discount?: number;
    id?: number;
    invoice_status?: string;
    title?: string;
    description: string;
    product_total_amount?: number;
    credit_note?: CreditNote[];
  };
  id?: number;
  code?: string;
  title?: string;
  courseCategory?: { name: string };
  start_date?: string;
  end_date?: string;
  description?: string;
  company?: {
    course_participates?: [
      {
        first_name?: string;
        last_name?: string;
        code?: string;
      }
    ];
    vat_type?: number;
  };
  price?: number;
}
export interface CourseDataInvoiceProps {
  participate?: courseProps[];
  total_vat_amount: number;
  total_amount: number;
  // course: {
  id: number;
  // };
}

export interface InvoiceProductProps {
  invoice_product?: ProductProps[];
  course?: CourseDataInvoiceProps;
  main_product?: ProductProps[];
  price?: number;
  order_number?: string | OrderNumberProps[];
  invoice_number?: string;
  invoiceDate?: Date | string;
  quotes?: QuoteDataProps;
  company?: CompanyDataProps;
  invoice_date?: Date | string;
}

export interface FilterNoteProps {
  setFilterModal: Dispatch<SetStateAction<boolean>>;
  setFilterApply: Dispatch<SetStateAction<FilterApplyProps>>;
  t: TFunction<'translation', undefined>;
  filterApply: FilterApplyProps;
}

export interface FilterApplyProps {
  startDate?: string | Date;
  endDate?: string | Date;
}
