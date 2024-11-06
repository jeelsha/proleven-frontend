import {
  FILE_SUPPORTED_FORMATS,
  IMAGE_SUPPORTED_FORMATS,
} from 'constants/filesupport.constant';
import { QuoteInitialProps } from 'modules/Quotes/types';
import { useTranslation } from 'react-i18next';

export enum ProductTypeEnum {
  product = 'product',
  description = 'description',
}

export const quoteInitialValue: QuoteInitialProps = {
  quote: {
    address: '',
    comments: '',
    destination_goods: '',
    cap_number: '',
    email: '',
    telephone: '',
    mobile_number: '',
    country: '',
    city: '',
    province: '',
    payment_method: '',
    sales_rep_id: '',
    is_destination_goods: false,
    date: new Date() ?? '',
    company_id: '',
    total_discount: '',
    total_amount: '',
    destination_email: '',
    destination_cap: '',
    destination_province: '',
    quote_type: 'private',
    quote_number: '',
    codice_fiscale: '',
    cod_dest: '',
    destination_mobile_number: '',
    destination_telephone: '',
    total_vat_amount: '',
    payment_term_id: '',
    vat_type: '',
    vat_type_id: '',
    vat_primary_id: '',
    funded_by: '',
    academy: 'proleven_sri',
    currency: 'EUR',
    currency_symbol: '€',
  },
  internal_attachment: [],
  client_attachment: [],
  attachment: [],
  product: [
    {
      code_id: '',
      description: '',
      units: 1,
      discount: '',
      product_total_amount: '',
      product_total_vat_amount: '',
      vat_type: '',
      title: '',
      vat_number: '',
      price: '',
      quote_type: 'private',
      product_type: ProductTypeEnum.product,
      product_sequence: 1,
      isOpen: false,
      vat_type_id: '',
      vat_primary_id: '',
      product_total: '',
      product_vat_total: '',
    },
  ],
  deleteProduct: [],
};

export function removeEmptyStrings(obj: QuoteInitialProps) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key as keyof QuoteInitialProps];
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && (value as string).trim() === '')
    ) {
      delete obj[key as keyof QuoteInitialProps];
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        value.forEach((element) => {
          if (typeof element === 'object') {
            removeEmptyStrings(element as unknown as QuoteInitialProps);
          }
        });
      } else {
        removeEmptyStrings(value as unknown as QuoteInitialProps);
      }
    }
  });
}

export const QuoteType = () => {
  return [
    {
      label: 'Private',
      value: 'private',
    },
    {
      label: 'Academy',
      value: 'academy',
    },
  ];
};

export const AcademyType = () => {
  const { t } = useTranslation();
  return [
    {
      label: t('ClientManagement.clientForm.fieldInfos.academyOptionSRI'),
      value: 'proleven_sri',
    },
    {
      label: t('ClientManagement.clientForm.fieldInfos.academyOptionGmbH'),
      value: 'proleven_gmbh',
    },
  ];
};

export const FundedBy = {
  'proleven-academy': 'Proleven Management',
  'client-address': 'Customer Management',
  ClientAddress: 'client-address',
  ProlevenAcademy: 'proleven-academy',
  NAN: 'NAN',
};

export const Currencies = ['EUR', 'CHF'];

export enum QuoteStatusEnum {
  approved = 'approved',
  requested = 'requested',
  rejected = 'rejected',
  open = 'open',
}

export const FileAcceptType = {
  image: IMAGE_SUPPORTED_FORMATS,
  document: FILE_SUPPORTED_FORMATS,
};

export function containsOnlyDigits(str: string) {
  return /^\d+$/.test(str);
}
