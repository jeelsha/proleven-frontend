import { useTranslation } from 'react-i18next';
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as Yup from 'yup';

// Send Mail Validation

export const QuoteSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    // destination_email: Yup.string()
    //   .email(t('Quote.company.validation.destinationEmailValidity'))
    //   .matches(
    //     /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
    //     t('UserManagement.validation.invalidEmail')
    //   )
    //   .required(t('Quote.company.validation.destinationEmailRequired')),

    currency: Yup.string().required(t('Quote.company.validation.currencyRequired')),
    academy: Yup.string().required(t('Quote.company.validation.academyRequired')),

    date: Yup.string().required(t('Quote.company.validation.dateRequired')),
    sales_rep_id: Yup.string().required(
      t('Quote.company.validation.salesRepRequired')
    ),
    payment_term_id: Yup.string().required(
      t('ClientManagement.clientForm.validation.paymentTermValidation')
    ),
    is_destination_goods: Yup.boolean(),
    destination_goods: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string().required(
          t('Quote.company.validation.destinationGoodsRequired')
        ),
      otherwise: () => Yup.string().notRequired(),
    }),

    address: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string().required(t('Quote.company.validation.addressRequired')),
      otherwise: () => Yup.string().notRequired(),
    }),
    cap_number: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.number()
          .typeError(t('Quote.company.validation.destinationCapValidity'))
          .test('len', t('Quote.company.validation.destinationCapLength'), (val) => {
            if (val === undefined || val === null) {
              return true;
            }
            const stringValue = String(val);
            return stringValue.length <= 6;
          })
          .required(t('Quote.company.validation.destinationCapRequired')),
      otherwise: () => Yup.string().notRequired(),
    }),
    province: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string().required(t('Quote.company.validation.provinceRequired')),
      otherwise: () => Yup.string().notRequired(),
    }),
    country: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string().required(t('Quote.company.validation.countryRequired')),
      otherwise: () => Yup.string().notRequired(),
    }),
    city: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () => Yup.string(),
      otherwise: () => Yup.string().notRequired(),
    }),
    email: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string()
          .email(t('Quote.company.validation.emailValidity'))
          .matches(
            /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
            t('UserManagement.validation.invalidEmail')
          )
          .required(t('Quote.company.validation.emailRequired')),
      otherwise: () => Yup.string().notRequired(),
    }),
    telephone: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string()
          .required(t('Quote.company.validation.telephoneRequired'))
          .test(
            'phone-validation',
            t('Quote.company.validation.telephoneValidity'),
            (value) => {
              if (value) {
                if (isValidPhoneNumber(value)) return true;
              }
            }
          ),
      otherwise: () => Yup.string().notRequired(),
    }),
    mobile_number: Yup.string().when('is_destination_goods', {
      is: (value: boolean) => value === true,
      then: () =>
        Yup.string()
          .required(t('Quote.company.validation.mobileRequired'))
          .test(
            'phone-validation',
            t('Quote.company.validation.mobileValidity'),
            (value) => {
              if (value) {
                if (isValidPhoneNumber(value)) return true;
              }
            }
          ),
      otherwise: () => Yup.string().notRequired(),
    }),
    quote_type: Yup.string(),
    total_discount: Yup.number()
      .nullable()
      .max(100, t('Quote.company.validation.discountValue', { Discount: 100 }))
      .min(0, t('Quote.company.validation.NegativeCheck')),
  });
};

export const ProductSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    quote_type: Yup.string(),
    product_type: Yup.string(),
    code_id: Yup.number().when('product_type', {
      is: (val: string) => val === 'product',
      then: () =>
        Yup.string().required(t('Quote.company.validation.productCodeRequired')),
    }),
    vat_primary_id: Yup.string().when('product_type', {
      is: (val: string) => val === 'product',
      then: () =>
        Yup.string().required(t('Quote.company.validation.vatNumberRequired')),
    }),
    price: Yup.string().when('product_type', {
      is: (val: string) => val === 'product',
      then: () =>
        Yup.number()
          .required(t('Quote.company.validation.priceRequired'))
          .min(0, t('Quote.product.price.validation.NegativeCheck'))
          .test(
            'is-decimal',
            t('Quote.product.price.validation.DecimalCheck'),
            (value) => /^\d+(\.\d{1,2})?$/.test(String(value))
          ),
    }),
    title: Yup.string().when('product_type', {
      is: (val: string) => val === 'product',
      then: () =>
        Yup.string().required(t('Quote.company.validation.productCodeRequired')),
    }),
    units: Yup.number()
      .min(1)
      .when(['quote_type', 'product_type'], {
        is: (val: string, buttonType: string) =>
          val === 'private' && buttonType === 'product',
        then: () =>
          Yup.number().max(
            100,
            t('Quote.product.units.validation.MaxUnitsExceeded')
          ),
      }),
    discount: Yup.string().when('product_type', {
      is: (val: string) => val === 'product',
      then: () =>
        Yup.number()
          .nullable()
          .max(100, t('Quote.company.validation.discountValue', { Discount: 100 }))
          .min(0, t('Quote.company.validation.NegativeCheck')),
    }),
    description: Yup.string().when('product_type', {
      is: (val: string) => val !== 'product',
      then: () =>
        Yup.string()
          .trim()
          .required(t('Codes.descriptionError'))
          .test('contains-meaningful-text', t('Codes.descriptionError'), (value) => {
            const textWithoutTags = value?.replace(/<\/?[^>]+(>|$)/g, '');
            return textWithoutTags?.trim() !== '';
          }),
      otherwise: () => Yup.string().notRequired(),
    }),
  });
};

export const QuoteValidationSchema = () => {
  return Yup.object().shape({
    quote: QuoteSchema(),
    product: Yup.array().of(ProductSchema()).required(),
  });
};

export const CompanyValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    selectedOption: Yup.string(),
    company_id: Yup.string().when('selectedOption', {
      is: (value: string) => value === 'existingClient',
      then: () => Yup.string().required(t('Quote.company.companyIdValidation')),
      otherwise: () => Yup.string().notRequired(),
    }),
  });
};
