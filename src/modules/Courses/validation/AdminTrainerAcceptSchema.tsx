import { TFunction } from 'i18next';
import * as Yup from 'yup';

export const AdminTrainerAcceptSchema = (
  t: TFunction<'translation', undefined>,
  index: number
) => {
  return Yup.object().shape({
    formValues: Yup.array()
      .of(
        Yup.object().shape({
          lumpsum_amount: Yup.number(),
          reimbursement_fee: Yup.number().nullable(),
          isLumpsumCheck: Yup.bool(),
        })
      )
      .test(
        'negative-error',
        'lumpsum_amount must be greater than 0 when checked',
        (values) => {
          const isChecked = values?.[index]?.isLumpsumCheck;
          const LumpsumAmount = values?.[index]?.lumpsum_amount;

          if (isChecked && (LumpsumAmount === undefined || LumpsumAmount <= 0)) {
            throw new Yup.ValidationError(
              t('lumpsumAmountValidation'),
              null,
              `formValues[${index}].lumpsum_amount`
            );
          }

          return true;
        }
      )
      .test(
        'negative-error',
        'lumpsum_amount must be greater than 0 when checked',
        (values) => {
          const isChecked = values?.[index]?.isLumpsumCheck;
          const ReimbursementAmount = values?.[index]?.reimbursement_fee;

          if (isChecked && !!(ReimbursementAmount && ReimbursementAmount <= 0)) {
            throw new Yup.ValidationError(
              t('reimbursementFeeValidation'),
              null,
              `formValues[${index}].reimbursement_fee`
            );
          } else if (ReimbursementAmount === undefined) return true;
          return true;
        }
      ),
  });
};
