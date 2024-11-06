import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const BreakTimeValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    breaks: Yup.array().of(
      Yup.object().shape({
        break_in: Yup.date().required(
          t('breakTimeModal.datePicker.timeStartValidation')
        ),
        break_out: Yup.date().required(
          t('breakTimeModal.datePicker.timeEndValidation')
        ),
      })
    ),
  });
};
