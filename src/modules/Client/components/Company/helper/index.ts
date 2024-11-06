import _ from 'lodash';
import { CompanyInitialProps, CompanyViewProps } from 'modules/Client/types';

export const getRegisterInitialValue = (
  companyData: CompanyViewProps | undefined
) => {
  const {
    name = '',
    address1 = '',
    address2 = '',
    zip = '',
    company_payment,
    country = '',
    city = '',
    address_province = '',
    description = '',
    logo = '',
    company_manager,
    ateco_code = '',
    sdi_code = '',
    accounting_emails,
    is_invoice = false,
    vat_number = '',
    vat_type = '',
    vat_primary_id = '',
    vat_type_id = '',
    ateco_id = '',
    codice_fiscale = '',
    telephone = '',
  } = companyData || {};
  const registerInitialValue: CompanyInitialProps = {
    name,
    address_l1: address1,
    address_l2: address2,
    address_zip: zip,
    payment_term: company_payment?.id ?? 7,
    address_country: country,
    address_city: city,
    address_province,
    description,
    company_logo: !_.isNil(logo) ? logo : '',
    codice_fiscale,
    ateco_id,
    managers:
      company_manager?.map(({ manager }) => {
        return manager?.user_id;
      }) ?? [],
    ateco_code,
    sdi_code,
    accounting_emails:
      typeof accounting_emails === 'string'
        ? JSON.parse(accounting_emails)
        : accounting_emails ?? [{ email: '', isPrimary: false }],
    is_invoice,
    vat_number,
    vat_type,
    vat_type_id,
    vat_primary_id,
    telephone,
    role: 0,
  };
  return registerInitialValue;
};

export function extractBeforeParenthesisAndRemovePeriods(input: string) {
  const index = input.indexOf('(');
  if (index === -1) {
    return input.replace(/\./g, '');
  }
  const beforeParenthesis = input.substring(0, index).trim();
  return beforeParenthesis.replace(/\./g, '');
}

export function extractInsideParenthesis(input: string) {
  const startIndex = input.indexOf('(');
  const endIndex = input.indexOf(')');

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return '';
  }

  const insideParenthesis = input.substring(startIndex + 1, endIndex).trim();
  return insideParenthesis;
}
