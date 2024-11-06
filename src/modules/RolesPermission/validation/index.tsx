import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export const RolePermissionModalValidation = () => {
  const { t } = useTranslation();

  return Yup.object().shape({
    user_id: Yup.string().required(t('Access.DropDown.Validation.User')),
  });
};
