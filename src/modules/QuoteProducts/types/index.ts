import { TFunction } from 'i18next';
import { Course } from 'modules/Courses/types';
import { SetStateAction } from 'react';
import { ModalProps } from 'types/common';

export interface QuoteProductsProps {
  id: string;
  title: string;
  invoice_status: string;
  course?: { title?: string };
  codes: { course_code_type: string; courses: { slug: string }[] };
  product: {
    course?: {
      slug?: string;
      start_date?: string;
      end_date?: string;
    };
    invoice_product: {
      slug: string;
    };
  }[];
  quotes: {
    order: OrderProps[];
    status: string;
    company: {
      id: number;
      slug?: string;
      is_invoice?: boolean;
      name?: string;
    };
  };
  courseQuotes: Course;
  order?: OrderProps;
}
export interface OrderProps {
  order_number: string;
  slug: string;
  client_purchase_order?: { order_number?: string; id?: number }[];
}
export interface AcademicQuoteProductsProps {
  id: string;
  title: string;
  invoice_status: string;
  course?: { title?: string; slug?: string };
  codes: { course_code_type: string; courses: { slug?: string }[] };
  product: {
    codes?: { courses?: { slug?: string }[] };
  };
  invoice_product: {
    slug: string;
  };
  quotes: {
    order: { order_number: string; slug: string }[];
    status: string;
    company: {
      id: number;
      slug?: string;
      name?: string;
    };
  };
}

export interface HoldSelectedData {
  id: string;
  invoice_status: string;
  reason: string;
  quote_id: string;
}

export interface HoldModalProps {
  modal: ModalProps;
  t: TFunction<'translation', undefined>;
  selectedData: HoldSelectedData;
  ProductRefetch: () => void;
}
export interface ProductFilterType {
  status: string[];
  productType: string[];
}

export interface FilterProductProps {
  setFilterModal: React.Dispatch<SetStateAction<boolean>>;
  setProductFilters: React.Dispatch<SetStateAction<ProductFilterType>>;
  t: TFunction<'translation', undefined>;
  productFilters: ProductFilterType | undefined;
}

export interface PrivateProductProps {
  t: TFunction<'translation', undefined>;
  setSort: React.Dispatch<SetStateAction<string>>;
  sort: string;
  limit: number;
  setLimit: React.Dispatch<SetStateAction<number>>;
  setProductFilters: React.Dispatch<SetStateAction<ProductFilterType>>;
  filterModal: boolean;
  setFilterModal: React.Dispatch<SetStateAction<boolean>>;
  search: string;
}

export interface AcademicProductsProps {
  course: {
    start_date: string;
    end_date: string;
  };
}

export interface SystemLogsProps {
  reason: string;
  old_status: string;
  new_status: string;
  created_at: Date;
  product_users?: {
    full_name: string;
  };
}
