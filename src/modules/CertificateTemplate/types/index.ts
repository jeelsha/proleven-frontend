export type InitFormType = {
  [key: string]: CertificateInitialValues;
};
export interface CertificateInitialValues {
  id?: number | null;
  title: string;
  notes: string;
  is_legislation_included: boolean;
  language: string;
  parent_table_id?: number | null;
  slug?: string | number;
}
export interface ITemplate {
  id: number;
  title: string;
  version: number;
  content: string;
  certificate_template_id: number | null;
  is_default: boolean;
  is_legislation_included: boolean;
  slug: string;
  note: Note[];
  created_by: null;
  updated_by: null;
  deleted_by: null;
  parent_table_id: number;
  language: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  latest_version: number;
}

interface Note {
  firstName: string;
  title: string;
  lastName: string;
  code: string;
  topics: string;
  duration: string;
  mode: string;
  lastLessonDate: string;
}
export interface InitialValues {
  [key: string]: string | boolean | null;
}

export interface ILanguage {
  title: string;
  content: string;
  key: string;
  is_legislation_included: string;
  label: string;
  note: string;
}
