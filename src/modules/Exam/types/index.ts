import { FormikValues } from 'formik';

// survey props
export interface SurveyQuestionProps {
  question: string;
  question_type: string;
  survey_target: string;
  option?: { answer: string }[];
  rating: number;
  answer: string;
  id?: string;
  is_required?: boolean;
  slug?: string;
  range?: number;
  label?: { key: string; value: string }[];
  rate?: number;
  surveyQuestionResult?: {
    answer?: string;
    rate?: number;
    answer_id?: number;
  }[];
  surveyAnswer?: {
    answer: string;
    slug: string;
    id?: string;
    is_correct?: boolean;
  }[];
}
export interface SurveyInitialProps {
  title: string;
  note?: string;
  question?: SurveyQuestionProps[];
  surveyTemplateQuestion?: SurveyQuestionProps[];
}

export interface SurveyTypeSelectionProps {
  questionData: SurveyQuestionProps;
  index: number;
  values: FormikValues;
  slugValue: string | undefined;
}

export interface ParticipateDataProps {
  first_name: string;
  language: string;
  isRetest: boolean;
}

export interface Questions {
  id: string;
  slug: string;
  marks: number;
  question: string;
  answers: {
    id: number;
    answer: string;
    slug: string;
  }[];
}
export interface FormDataProps {
  id: number;
  course_id: number;
  questions: Questions[];
}
export interface Answers {
  question_slug: string;
  answer_slug: string;
}
export interface Participate {
  first_name: string;
  last_name: string;
  id: number;
  slug: string;
  language: string;
  attempts: number;
}
export interface FeedbackValueProps {
  course_id: number;
  exam_participate_slug?: string;
  rating?: number;
  comment?: string;
}

export interface SurveyShowProps {
  surveyTemplateQuestion: SurveyQuestionProps[];
}
