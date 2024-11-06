// ** Yup Validation **
import * as Yup from 'yup';

// ** Hooks **
import { useTranslation } from 'react-i18next';

// ** Redux
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

export const ProfileValidation = () => {
  const { t } = useTranslation();
  const { allLanguages } = useSelector(useLanguage);

  const dynamicObject: { [key: string]: Yup.StringSchema<string> } = {};
  (allLanguages ?? []).forEach((lang) => {
    dynamicObject[`job_title_${lang.name}`] = Yup.string()
      .trim()
      .required(t('Profiles.errors.title'));
    dynamicObject[`description_${lang.name}`] = Yup.string()
      .trim()
      .required(t('Profiles.errors.description'));
  });
  return Yup.object({
    ...dynamicObject,
  });
};
