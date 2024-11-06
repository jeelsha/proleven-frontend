export interface InvoiceProps {
  invoice_product: {
    company: CompanyProps;
    order: {
      order_number: string;
      slug: string;
    };
    payment_terms: {
      name: string;
      child: [{ name: string }];
    };
  }[];
  quotes: {
    total_amount: number;
    total_amount_without_tax: number;
    total_vat_amount: string | number;
    currency: string;
  };
  created_at: string;
  invoice_date: string | Date;
  payment_date: string | Date;
  payment_status: string;
  due_date: Date | string;
}

export interface CompanyProps {
  id: number;
  name: string;
  logo: string;
  slug: string;
}

export interface OrderDetails {
  id: number;
  order_number: string;
  invoice_date: Date;
  project_id: string;
  payment_terms: {
    id: string;
  };
  quotes: {
    quoteProduct: QuoteProductProps[];
  };
  project: undefined;
}

export interface QuoteProductProps {
  quote_id: number;
  code_id: number;
  project_id: number;
  title: string;
  invoice_status: string;
  description: string;
  units: number;
  codes: {
    code: string;
    courses: { start_date: string; end_date: string; code: string }[];
  };
  main_child?: {
    title?: string;
    id?: string;
    invoice_status?: string;
  }[];
  id?: string;
  vat_number: string;
  price: string;
  discount: number;
  vat_type: number;
  product_total_amount: number;
  product_total_vat_amount: number;
}
