import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { TFunction } from 'i18next';
import { CreditNote } from 'modules/CreditNotes/types';
import { Dispatch, SetStateAction } from 'react';
import { AuthUserType } from 'redux-toolkit/slices/authSlice';
import { ModalProps } from 'types/common';

export interface OrderProps {
  status: string;
  order_type: string;
  order_number: string;
  description?: string[];
  payment_status?: string;
  company: {
    name: string;
    payment_term_id: number;
    id: string;
    sdi_code: string;
    is_invoice: boolean;
    slug: string;
  };
  quotes: {
    id?: number;
    quote_number: string;
    quoteProduct: [];
    total_amount?: number;
    total_discount?: number;
    funded_by?: string;
    slug: string;
    currency?: string;
  };
  course: {
    participate?: CourseDataInvoiceProps;
    type: string;
  };
  order_comment:
    | {
        created_at?: string;
        comment?: string;
      }[]
    | undefined;
  order_attachment: { file_path: string }[];
  client_purchase_order?: PurchaseOrderProps[];
  id?: number;
  invoice_number?: string | Date;
  invoice_date?: string | Date;
  purchase_reminder_date: Date | string;
  purchase_reminder?: [];
  created_at: Date | string;
  netAmount: number;
  type: string;
  created_by: Date | string;
  slug: string;
}

export interface InvoiceModalProps {
  invoice: InvoiceSubProps[];
}
export interface InvoiceSubProps {
  invoice_number: number | string;
  slug: string;
}
export interface CloseModalProps {
  modal: ModalProps;
  data: {
    status?: string;
    order_type?: string;
    slug?: string;
    purchase_reminder?: [];
  };
  refetchOrder: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<{ data?: OrderProps; error?: string }, Error>>;
}

export interface AcademyModalProps {
  type: string;
}
export interface ReminderDateModalProps {
  modal: ModalProps;
  data: {
    id?: number;
    status?: string;
    order_type?: string;
    slug?: string;
    purchase_reminder?: [];
  };
}

export interface ComponentProps {
  orderId?: number;
  t: TFunction<'translation', undefined>;
  OrderCommentFetch?: () => void;
  getOrderData?: () => void;
  orderAttachments?: { file_path: string }[];
  clientPurchaseOrder?: PurchaseOrderProps[];
  paymentTermId?: number;
  purchaseOrder?: Date | string;
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

export interface ProductData {
  price: number;
  vat_type: number;
  units: number;
  product_total_vat_amount: number;
  product_total_amount?: number;
  discount?: number;
  credit_note?: CreditNote[];
}
export interface ProductProps {
  quoteData?: QuoteDataProps;
  productData?: ProductDataProps;
  t: TFunction<'translation', undefined>;
  totalProductAmount?: number;
  totalProductDiscount?: number;
  checkData?: boolean;
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
  quote_number?: string;
  academy?: string;
}
export interface QuoteProps {
  quoteData?: QuoteDataProps;
  companyData?: CompanyDataProps;
  order_number?: string | OrderNumberProps[];
  invoice_number?: string;
  LastPODate?: React.ReactElement | null;
  lastPODatePresent?: string | Date;
  invoiceDate?: Date | string;
  statusRenderData?: React.ReactElement | null;
  t: TFunction<'translation', undefined>;
  orderDate?: string | Date;
}
export interface OrderNumberProps {
  order_number: string;
  slug: string;
}

export interface PurchaseOrderProps {
  order_number: string;
  del: string;
  cig: string;
  cup: string;
  description: string;
  payment_term_name?: string;
  order_id?: number;
  slug?: string;
}

export interface OrderFilters {
  orderType: string[];
  orderStatus: string[];
  orderRoleType: string[];
  purchaseOrderType: string[];
  clientOrderType: string[];
  fundedByType: string[];
  sdiCode: string[];
  issuedBy: string[];
  payment_mode: string;
  companies: string[];
}

export interface OrderFiltersDate {
  orderType: string[];
  orderStatus: string[];
  orderRoleType: string[];
  purchaseOrderType: string[];
  clientOrderType: string[];
  fundedByType: string[];
  sdiCode: string[];
  issuedBy: string[];
  filterDate: {
    startDate: string | Date;
    endDate: string | Date;
  };
  payment_mode: string;
  companies: string[];
}
export interface FilterOrderProps {
  setFilterModal: Dispatch<SetStateAction<boolean>>;
  setOrderFilters: Dispatch<SetStateAction<OrderFiltersDate>>;
  t: TFunction<'translation', undefined>;
  orderFilters: OrderFiltersDate | undefined;
}

export interface OrderCommentDisplayProps {
  orderCommentList:
    | {
        created_at?: string;
        comment?: string;
        orderUser?: { full_name?: string };
      }[]
    | undefined;
  CurrentUser: Partial<AuthUserType | null> | undefined;
  t: TFunction<'translation', undefined>;
  storeLang: { language: string };
}

export interface courseProps {
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
  quotes?: {
    currency?: string;
  };
  credit_price?: number;
  price?: number;
}

export interface CourseDataInvoiceProps {
  participate?: courseProps[];
  total_vat_amount: number;
  total_amount: number;
}

export interface CourseDataProps {
  participate?: courseProps[];
  total_vat_amount: number;
  total_amount: number;
}

export interface OrderCourseDetails {
  t: TFunction<'translation', undefined>;
  courseData?: CourseDataInvoiceProps;
}
