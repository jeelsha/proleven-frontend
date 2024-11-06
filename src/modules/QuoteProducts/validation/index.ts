import { TFunction } from 'i18next';
import * as Yup from 'yup';

export const productValidation = (t: TFunction<'translation', undefined>) => {
  return Yup.object().shape({
    reason: Yup.string().required(
      t('ProjectManagement.ReasonModal.validationMessage')
    ),
  });
};
