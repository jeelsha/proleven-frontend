import { Course } from 'modules/Courses/types';
import { ModalProps, SetFieldValue } from 'types/common';
import { FilterObject } from 'utils';

export type AddEditCodeProps = {
  modal: ModalProps;
  data: Code | null;
  setData: React.Dispatch<React.SetStateAction<Code | null>>;
  refetch: () => void;
};

export interface Code {
  id?: number;
  code: string;
  description: string;
  slug?: string;
  courses?: Array<Course>;
  course_title: string | null;
  course_price: string | null;
  course_code_type?: string | null;
  isCodeAssigned?: number;
  title?: string;
  price?: string;
}

export enum CodeType {
  GENERAL = 'general',
  COURSE = 'course',
}

export interface CodeFilterTypes {
  category: string[];
  subCategory: string[];
}

export interface CodeTemplateFilter {
  setFilterApply?: React.Dispatch<React.SetStateAction<CodeFilterTypes>>;
  courseFilter: CodeFilterTypes;
  filterApply?: FilterObject;
  setCourseFilter: React.Dispatch<React.SetStateAction<CodeFilterTypes>>;
  values?: CodeFilterTypes;
  setFieldValue?: SetFieldValue;
}
