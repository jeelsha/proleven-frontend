import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

const NoteValidationSchema = (
  invoiceProductPrices: number[],
  t: TFunction<'translation', undefined>
) => {
  return Yup.object().shape({
    credit_price: Yup.string()
      .test(
        'required-if-not-empty',
        t('Quote.company.validation.priceRequired'),
        function (value) {
          if (value && value.trim().length === 0) {
            return this.createError({
              message: t('Quote.company.validation.priceRequired'),
            });
          }
          return true;
        }
      )
      .test(
        'is-decimal',
        t('Quote.product.price.validation.DecimalCheck'),
        (value) => {
          if (value && value.trim().length > 0) {
            return /^\d+(\.\d{1,2})?$/.test(String(value));
          }
          return true;
        }
      )
      .test('is-less-than-product-price', function (value) {
        if (value && value.trim().length > 0) {
          const { path, createError } = this;
          const matched = path.match(/\d+/);
          if (matched) {
            const index = parseInt(matched[0], 10);
            const productPrice = invoiceProductPrices[index];
            if (parseFloat(value) > productPrice) {
              return createError({
                path,
                message: `${value} should be lesser than invoice product price ${productPrice}`,
              });
            }
          }
        }
        return true;
      })
      .test(
        'required-if-description-filled',
        t('Quote.company.validation.priceRequired'),
        function (value) {
          const { description } = this.parent;
          if (
            description &&
            description.trim().length > 0 &&
            (!value || value.trim().length === 0)
          ) {
            return this.createError({
              message: t('Quote.company.validation.priceRequired'),
            });
          }
          return true;
        }
      ),
    description: Yup.string()
      .test(
        'required-if-not-empty',
        t('Quote.company.validation.priceRequired'),
        function (value) {
          if (value && value.trim().length === 0) {
            return this.createError({
              message: t('Quote.company.validation.priceRequired'),
            });
          }
          return true;
        }
      )
      .test(
        'required-if-credit-price-filled',
        t('Codes.descriptionError'),
        function (value) {
          const { credit_price } = this.parent;
          if (
            credit_price &&
            credit_price.trim().length > 0 &&
            (!value || value.trim().length === 0)
          ) {
            return this.createError({
              message: t('Codes.descriptionError'),
            });
          }
          return true;
        }
      ),
  });
};

export const creditNoteValidation = (invoiceProductPrices: number[]) => {
  const { t } = useTranslation();
  return Yup.object().shape({
    creditNotes: Yup.array()
      .of(NoteValidationSchema(invoiceProductPrices, t))
      .required(),
  });
};

export default creditNoteValidation;

export const NoteFilterValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    startDate: Yup.string().required(t('CoursesManagement.Errors.Course.startDate')),
    endDate: Yup.string().required(t('CoursesManagement.Errors.Course.endDate')),
  });
};
