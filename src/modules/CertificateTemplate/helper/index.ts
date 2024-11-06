import { CertificateInitialValues } from '../types';

export const updateInitialValues = (
  values: CertificateInitialValues,
  currentFormLanguage: string,
  DEFAULT_LANGUAGE: string | undefined,
  DEFAULT_LANGUAGE_DATA: CertificateInitialValues | null
): CertificateInitialValues => {
  return {
    ...values,
    language: currentFormLanguage,
    ...(currentFormLanguage !== DEFAULT_LANGUAGE && DEFAULT_LANGUAGE_DATA?.id
      ? {
          parent_table_id: DEFAULT_LANGUAGE_DATA.id,
          slug: DEFAULT_LANGUAGE_DATA.slug,
        }
      : {}),
  };
};

export const setCurrentFormData = (
  updatedValues: CertificateInitialValues,
  data: CertificateInitialValues,
  currentFormLanguage: string,
  DEFAULT_LANGUAGE_DATA: CertificateInitialValues | null
): CertificateInitialValues => {
  return {
    ...updatedValues,
    language: currentFormLanguage,
    slug: DEFAULT_LANGUAGE_DATA?.slug ?? data?.slug,
  };
};

export const setNextFormData = (
  nextFormData: CertificateInitialValues,
  data: CertificateInitialValues,
  nextFormLanguage: string,
  DEFAULT_LANGUAGE_DATA: CertificateInitialValues | null
): CertificateInitialValues => {
  return {
    ...nextFormData,
    language: nextFormLanguage,
    parent_table_id: DEFAULT_LANGUAGE_DATA?.id ?? data?.id,
    slug: DEFAULT_LANGUAGE_DATA?.slug ?? data?.slug,
  };
};

export function translateFieldValues(
  obj: CertificateInitialValues,
  fieldsToTranslate: Array<string>
) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      return [key, fieldsToTranslate.includes(key) ? translateValue(value) : value];
    })
  );
}

const translateValue = (value: string): string => {
  return value.split('').reverse().join('');
};
