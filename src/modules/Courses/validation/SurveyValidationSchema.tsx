import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { TFunctionProps } from '../types';

type SurveyQuestionProps = {
  option?: object[];
  question: string;
  survey_target: string;
  question_type: string;
};
const findIndicesOfSameOptions = (
  answersArray: { answer: string; slug?: string }[] | undefined
): number[] => {
  const answerTexts = (answersArray ?? []).map((answer) => answer.answer);

  const result: number[] = (answersArray ?? []).reduce(
    (acc: number[], answer, index) => {
      const currentAnswer = answer.answer;
      const indices = answerTexts.reduce((indicesAcc: number[], text, textIndex) => {
        if (textIndex !== index && text === currentAnswer) {
          return [...indicesAcc, textIndex];
        }
        return indicesAcc;
      }, []);
      return indices.length > 0 ? [...acc, ...indices] : acc;
    },
    []
  );

  return result;
};

const findIndicesOfSameQuestion = (
  questionsArray: SurveyQuestionProps[]
): number[] => {
  const questionTexts = questionsArray.map((question) => question.question);
  const result: number[] = questionsArray.reduce(
    (acc: number[], question, index) => {
      const currentQuestion = question.question;
      const indices = questionTexts.reduce(
        (indicesAcc: number[], text, textIndex) => {
          if (textIndex !== index && text === currentQuestion) {
            return [...indicesAcc, textIndex];
          }
          return indicesAcc;
        },
        []
      );
      return indices.length > 0 ? [...acc, ...indices] : acc;
    },
    []
  );

  return result;
};

export const OptionSchema = ({ t }: TFunctionProps) => {
  return Yup.object().shape({
    answer: Yup.string().required(
      t('CourseManagement.createSurvey.validation.optionName')
    ),
  });
};
export const SurveyQuestionSchema = () => {
  const { t } = useTranslation();
  return Yup.object()
    .shape({
      survey_target: Yup.string().required(
        t('CourseManagement.createSurvey.validation.surveyTarget')
      ),
      question_type: Yup.string().required(
        t('CourseManagement.createSurvey.validation.type')
      ),
      question: Yup.string().required(
        t('CourseManagement.createSurvey.validation.question')
      ),
      option: Yup.array().when('question_type', {
        is: (val: string) => {
          return val === 'mcq' || val === 'multiselect';
        },
        then: () => Yup.array().of(OptionSchema({ t })).required(),
      }),
    })
    .test('is-unique', '', (value, { path }) => {
      if (value?.question_type === 'mcq' || value?.question_type === 'multiselect') {
        const duplicateAnswers = findIndicesOfSameOptions(value?.option ?? []);
        if ((duplicateAnswers ?? []).length > 1) {
          const errors = duplicateAnswers.map((index) => {
            return new Yup.ValidationError(
              t('CourseManagement.createSurvey.validation.optionsMustBeUnique'),
              {},
              `${path}.option[${index}].answer`
            );
          });
          return new Yup.ValidationError(errors);
        }
      }
      return true;
    });
};

export const SurveyValidationSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string().required(
      t('CourseManagement.createSurvey.validation.surveyName')
    ),
    question: Yup.array()
      .of(SurveyQuestionSchema())
      .required()
      .test('is-unique-question', '', (values, { path }) => {
        const duplicateQuestions = findIndicesOfSameQuestion(values ?? []);

        if ((duplicateQuestions ?? []).length > 1) {
          const errors = duplicateQuestions.map((index) => {
            return new Yup.ValidationError(
              t('CoursesManagement.createSurvey.validation.questionsMustBeUnique'),
              {},
              `${path}[${index}].question`
            );
          });
          return new Yup.ValidationError(errors);
        }
        return true;
      }),
  });
};
