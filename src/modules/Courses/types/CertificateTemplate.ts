// ** Types **
import { Lesson } from 'modules/Courses/types';
import { SetFieldValue } from 'types/common';

export interface CertificateInfoProps {
  lessons: Array<Lesson>;
  fieldsToTranslate: Array<string>;
  currentLanguage: string;
  defaultLanguage: string;
  isMainLoading?: boolean;
  is_external_certificate?: boolean;
  certificate_id?: number | null;
  setFieldValue?: SetFieldValue;
  setFieldTouched?: (
    field: string,
    isTouched?: boolean | undefined,
    shouldValidate?: boolean | undefined
  ) => void;
}

export interface Note {
  uniqueNumber?: string;
  firstName?: string;
  title?: string;
  lastName?: string;
  code?: string;
  atecoCode?: string;
  profile?: string;
  duration?: string;
  lastLessonDate?: string;
}

export interface MainTemplate {
  id: number;
  title: string;
  version: number;
  content: string;
  certificate_template_id: number | null;
  is_default: boolean;
  is_legislation_included: boolean;
  slug: string;
  note?: Note[];
  parent_table_id: number | null;
  language: string;
  latest_version: number | null;
}

export interface CertificateTemplate {
  id: number;
  title: string;
  version: number;
  content: string;
  certificate_template_id: number | null;
  is_default: boolean;
  is_legislation_included: boolean;
  slug: string;
  parent_table_id: number | null;
  language: string;
  latest_version: number | null;
  mainTemplate: MainTemplate[];
}
