import { Option } from 'components/FormElement/types';
import { FieldArrayRenderProps, FormikValues } from 'formik';
import { TFunction } from 'i18next';
import { Dispatch, SetStateAction } from 'react';
import { ModalProps, SetFieldValue } from 'types/common';

export interface Product {
  code_id: number | string;
  description: string;
  units: number;
  discount: number | string;
  product_total_amount: number | string;
  title: string;
  vat_number: string;
  price: number | string;
  product_status?: string;
  id?: number;
  quote_id?: number | string;
  codes?: { code: string };
  quote_type?: string;
  invoice_status?: string;
  product_type?: string;
  product_sequence?: number;
  isOpen?: boolean;
  product_total_vat_amount?: string | number;
  vat_type?: string | number;
  vat_type_id?: string | number;
  order_close?: boolean;
  vat_primary_id?: string | number;
  slug?: string;
  product_total?: string | number;
  product_vat_total?: string | number;
}
export interface Quote {
  address: string;
  comments?: string;
  destination_goods: string;
  is_destination_goods: boolean;
  cap_number: number | string;
  city: string;
  date: string | Date;
  email: string;
  telephone: number | string;
  mobile_number: number | string;
  sales_rep_id: number | string;
  country: string;
  payment_method: string;
  vat_type?: string | number;
  vat_type_id?: string | number;
  vat_primary_id?: string | number;
  province: string;
  currency: string;
  company_id?: number | string;
  id?: string;
  funded_by?: string;
  currency_symbol?: string;
  academy?: string;
  quote_number?: string;
  total_discount: number | string;
  total_amount: number | string;
  total_vat_amount: number | string;
  destination_email: string;
  quote_type: string;
  destination_cap: string | number;
  destination_province: string | number;
  codice_fiscale: string | number;
  cod_dest: string;
  destination_mobile_number: string | number;
  destination_telephone: string | number;
  payment_term_id?: string | number;
  payment_term?: string | number;
  total_amount_without_tax?: number;
}

export interface Company {
  name: string;
  vat_number: string;
  sdi_code: string;
  country: string;
  city: string;
  address1: string;
  logo: string;
  vat_type: number;
  codice_fiscale: string;
  id: string | number;
}
export interface Attachment {
  id: string;
  quote_id: string;
  attachment_type: string;
  attachment: string;
}
export interface QuoteInitialProps {
  quote: Quote;
  product: Product[];
  company?: Company;
  deleteProduct?: { id?: number; delete_reason?: string }[];
  internal_attachment?: string[];
  client_attachment?: string[];
  attachment?: Attachment[];
}

export interface QuoteModalInitialProps {
  modal: ModalProps;
  quoteSlug?: string;
}

export interface QuoteResponseValues {
  quote_type: string;
  address: string;
  comments?: string;
  cap_number: string | number;
  city: string;
  company_id: number;
  destination_goods: string;
  country: string;
  email: string;
  is_destination_goods: boolean;
  language: string;
  mobile_number: string | number;
  payment_method: string;
  telephone: string | number;
  status: string;
  currency: string;
  parent_table_id: number;
  quote: string;
  province: string;
  sales_rep_id: number | string;
  quoteProduct: Product[];
  id: string;
  total_discount: number | string;
  total_vat_amount: number | string;
  quote_number?: string;
  quoteAttachment?: {
    attachment_type?: string;
    attachment: string;
  }[];
  total_amount: number | string;
  total_amount_without_tax: number;
  date: string;
  slug: string;
  vat_type?: string | number;
  vat_type_id?: string | number;
  vat_primary_id?: string | number;
  project_id?: number;
  funded_by?: string;
  academy: string;
  destination_email: string;
  destination_cap: string | number;
  destination_province: string | number;
  codice_fiscale: string | number;
  cod_dest: string;
  destination_mobile_number: string | number;
  isQuoteAssigned?: boolean;
  destination_telephone: string | number;
  payment_term_id: string | number;
  company: {
    id: number;
    name: string;
    logo: string;
    address1: string;
    address2?: string;
    city?: string;
    state: string | null;
    country: string;
    zip?: string;
    vat_number?: string;
    ateco_code?: string;
    sdi_code?: string;
    address_province: string;
    vat_type: number;
    vat_primary_id?: string | number;
    codice_fiscale?: string;
    telephone?: string;
    slug: string;
  };
  order: {
    status: string;
  }[];
}
export type AddEditFormType = {
  formData: QuoteInitialProps;
  setInitialValues: React.Dispatch<React.SetStateAction<QuoteInitialProps>>;
  slug: string | undefined;
  updateQuoteLoading?: boolean;
  isClone?: boolean;
  issuedBy?: string;
  setIssuedBy: React.Dispatch<React.SetStateAction<string | undefined>>;
};
/* filter props */
export type FilterOptionsType = {
  companies: TabDetailProps[];
  codes: TabDetailProps[];
  filterDate: {
    startDate: string | Date;
    endDate: string | Date;
  };
  payment_mode: string;
  salesRep: TabDetailProps[];
};
export type FilterOptionsClearType = {
  companies: TabDetailProps[];
  codes: TabDetailProps[];
  salesRep: TabDetailProps[];
};

export interface TabDetailProps {
  id: string;
  title: string;
  full_name: string;
  slug: string;
  name: string;
  logo: string;
  code: string;
  course_title: string;
  courses: {
    courseSubCategory: {
      name: string;
    };
  }[];
}

export interface FilterProps {
  modal: ModalProps;
  setQuoteFilters: React.Dispatch<React.SetStateAction<FilterOptionsType>>;
  quoteFilters: FilterOptionsType;
}

export interface DeleteProductArray {
  id?: number;
  delete_reason?: string;
  deleteIndex?: number;
}

export interface VatTypeProps {
  id?: number;
  value?: number;
  description?: string;
  vat_id?: number;
}

export interface CreateProductProps {
  t: TFunction<'translation', undefined>;
  setFieldValue: SetFieldValue;
  setFieldTouched: SetFieldValue;
  values: FormikValues;
  defaultCodesNames: Option[];
  defaultCourseNames: Option[];
  setRejectData: Dispatch<SetStateAction<DeleteProductArray | undefined>>;
  deleteModal: ModalProps;
  codesResponse?: {
    data?: {
      data?: {
        course_title: string;
        description?: string;
        id: number;
        code: string;
        title?: string;
        price?: string;
        courses: { price: string }[];
      }[];
    };
  };
  isLoading: boolean;
  product: Product;
  vatTypeOption?: Option[];
  vatType?: VatTypeProps[];
  productArrayHelpers: FieldArrayRenderProps;
  id?: number;
  slug?: string;
  closeAll: boolean;
  updateLoading?: boolean;
  index: number;
}

export interface CompanyProps {
  t: TFunction<'translation', undefined>;
  values: FormikValues;
  countries: { countries: { id: string; name: string }[] };
  cities: { cities: { id: string; name: string }[] };
  setFieldValue: SetFieldValue;
  companyLoading?: boolean;
  vatTypeLoading?: boolean;
  companyVatTypeOption?: Option[];
}

export interface CodeQuotesProps {
  t: TFunction<'translation', undefined>;
  codeId: number;
  companyId: number;
}

export interface CodeResponseProps {
  created_at: string;
  price: number;
  quotes: {
    status: string;
    currency: string;
    slug: string;
    quote_number: string;
  };
}

export interface QuoteProductProps {
  values: FormikValues;
  setFieldValue: SetFieldValue;
  setFieldTouched: SetFieldValue;
  t: TFunction<'translation', undefined>;
  deleteModal: ModalProps;
  setDeleteProductArray: Dispatch<SetStateAction<DeleteProductArray[]>>;
  deleteProductArray: DeleteProductArray[];
  calculateTotalPrice: (arg1: number | string, arg2: number | string) => void;
  formData: QuoteInitialProps;
  vatTypeOption: Option[];
  updateLoading?: boolean;
}

export interface SalesRepOptions {
  label: string;
  value: string;
  isSelected: boolean;
}
