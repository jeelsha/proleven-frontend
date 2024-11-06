// ** Yup **
import * as Yup from 'yup';

// ** Hooks **
import { useTranslation } from 'react-i18next';

// ** Types **
import { TFunctionProps } from 'modules/Courses/types';

// ** Helper **
import { differenceInMilliseconds } from 'date-fns';
import { checkIsNotVideoConference } from 'modules/Courses/helper';
import {
  checkTimeOverlap,
  findIndicesOfSameAnswer,
  findIndicesOfSameQuestion,
  isEmptyHtmlString,
  validateURL,
} from 'modules/Courses/helper/CourseCommon';

const sessionSchema = () => {
  const { t } = useTranslation();
  return Yup.object()
    .shape({
      start_time: Yup.date().required(
        t('CoursesManagement.Errors.Lessons.startTime')
      ),
      end_time: Yup.date().required(t('CoursesManagement.Errors.Lessons.endTime')),
      mode: Yup.string().trim().required(t('CoursesManagement.Errors.Lessons.mode')),
    })
    .test('is-time-valid', (value, { path }) => {
      const { start_time, end_time } = value || {};
      const differenceInMS =
        start_time && end_time ? differenceInMilliseconds(end_time, start_time) : 0;
      if (differenceInMS < 60 * 1000) {
        return new Yup.ValidationError(
          t('CoursesManagement.Errors.Sessions.inValidTime'),
          null,
          `${path}.end_time`
        );
      }
      return true;
    });
};

const topicsSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    topic: Yup.string()
      .nullable()
      .when('is_external_certificate', {
        is: (val: boolean) => {
          return !val;
        },
        then: () =>
          Yup.string()
            .trim()
            .required(t('CoursesManagement.Errors.Lessons.topic'))
            .test(
              'not-empty-html',
              t('CoursesManagement.Errors.Lessons.topic'),
              (value) => !value || !isEmptyHtmlString(value)
            ),
      }),
  });
};

const lessonSchema = () => {
  const { t } = useTranslation();
  return Yup.object()
    .shape({
      session: Yup.array().of(sessionSchema()),
      topics: Yup.array().of(topicsSchema()).nullable(),
      title: Yup.string()
        .trim()
        .required(t('CoursesManagement.Errors.Lessons.title')),
      client_meeting_link: Yup.string()
        .nullable()
        .test(
          'is-url-valid',
          t('CoursesManagement.Errors.Lessons.url'),
          validateURL
        ),
      location: Yup.string().nullable(),
      language: Yup.string().trim(),
    })
    .test('is-valid-time', 'Time must be valid', (val, { path }) => {
      const errors: Yup.ValidationError[] = [];

      /* ******************** Duplicate Dates Validation ******************** */
      const overlappingSessions = checkTimeOverlap(val?.session ?? []);
      if (overlappingSessions.length > 0) {
        errors.push(
          ...overlappingSessions.flatMap(([index1, index2]) => [
            new Yup.ValidationError(
              t('CoursesManagement.Errors.Lessons.sessionOverlap', {
                Session: index2 + 1,
              }),
              null,
              `${path}.session[${index1}].start_time`
            ),
            new Yup.ValidationError(
              t('CoursesManagement.Errors.Lessons.sessionOverlap', {
                Session: index1 + 1,
              }),
              null,
              `${path}.session[${index2}].end_time`
            ),
          ])
        );
      }

      /* ******************** Location Validation ******************** */
      const location = val?.location?.trim();
      const isNotVideoConference = checkIsNotVideoConference(val?.session ?? []);
      if (isNotVideoConference && !location) {
        errors.push(
          new Yup.ValidationError(
            t('Auth.RegisterTrainer.LocationValidation'),
            null,
            `${path}.location`
          )
        );
      }
      if (errors?.length) throw new Yup.ValidationError(errors);
      return true;
    });
};

const courseSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string().trim().required(t('CoursesManagement.Errors.Course.title')),
    course_notes: Yup.array().nullable(),
    duration: Yup.number()
      .required(t('CoursesManagement.Errors.Course.duration'))
      .min(0.1, t('CoursesManagement.Errors.Course.durationNonNegative')),
    code: Yup.string().trim().required(t('CoursesManagement.Errors.Course.code')),
    code_id: Yup.string().trim().required(t('CoursesManagement.Errors.Course.code')),
    has_exam: Yup.boolean().required(t('CoursesManagement.Errors.Course.hasExam')),
    need_digital_attendance_sheet: Yup.boolean().required(
      t('CoursesManagement.Errors.Course.needDigitalAttendanceSheet')
    ),

    price: Yup.number()
      .nullable()
      .min(0, t('CoursesManagement.Errors.Course.priceNonNegative')),
    category_id: Yup.number().required(
      t('CoursesManagement.Errors.Course.category')
    ),
    validity: Yup.number().required(t('CoursesManagement.Errors.Course.validity')),
    main_resources: Yup.array(),
    optional_resources: Yup.array(),
    survey_template_id: Yup.number().required(
      t('CoursesManagement.Errors.Course.survey')
    ),
    certificate_template_id: Yup.number()
      .nullable()
      .when('is_external_certificate', {
        is: (val: boolean) => {
          return !val;
        },
        then: () =>
          Yup.number().required(
            t('CoursesManagement.Errors.Course.certificateTemplate')
          ),
      }),
    certificate_title: Yup.string()
      .nullable()
      .when('is_external_certificate', {
        is: (val: boolean) => {
          return !val;
        },
        then: () =>
          Yup.string()
            .trim()
            .required(t('CoursesManagement.Errors.Course.certificateTitle')),
      }),
  });
};

const answerSchema = ({ t }: TFunctionProps) => {
  return Yup.object({
    answer: Yup.string()
      .trim()
      .required(t('CoursesManagement.Errors.Exam.answerRequired')),
  });
};

const questionSchema = ({ t }: TFunctionProps) => {
  return Yup.object({
    question: Yup.string()
      .trim()
      .required(t('CoursesManagement.Errors.Exam.questionRequired')),
    correct_answer: Yup.string()
      .trim()
      .required(t('CoursesManagement.Errors.Exam.correctAnswerRequired')),
    marks: Yup.number()
      .required(t('CoursesManagement.Errors.Exam.markRequired'))
      .min(1, t('CoursesManagement.Errors.Exam.markMustBePositive')),
    answers: Yup.array(answerSchema({ t }))
      .required()
      .test(
        'is-unique',
        t('CoursesManagement.Errors.Exam.answersMustBeUnique'),
        (value, { path, parent }) => {
          const errors: Yup.ValidationError[] = [];
          const { duplicateAnswers, isCorrectAnswerValid } = findIndicesOfSameAnswer(
            value,
            parent?.correct_answer ?? ''
          );
          const errorPath = path?.replace('.answers', '');
          if (!isCorrectAnswerValid && errorPath)
            errors.push(
              new Yup.ValidationError(
                t('CoursesManagement.Errors.Exam.correctAnswerRequired'),
                {},
                `${errorPath}.correct_answer`
              )
            );
          if ((duplicateAnswers ?? []).length > 1) {
            duplicateAnswers.forEach((index) => {
              errors.push(
                new Yup.ValidationError(
                  t('CoursesManagement.Errors.Exam.answersMustBeUnique'),
                  {},
                  `${path}[${index}].answer`
                )
              );
            });
          }
          if (errors.length) return new Yup.ValidationError(errors);
          return true;
        }
      ),
  });
};

const examSchema = ({ t }: TFunctionProps) => {
  return Yup.object().shape({
    passing_marks: Yup.number()
      .required(t('CoursesManagement.Errors.Exam.passingMarksRequired'))
      .min(1, t('CoursesManagement.Errors.Exam.passingMarkMustBePositive'))
      .max(100, t('CoursesManagement.Errors.Exam.maxPassingMark')),
    questions: Yup.array(questionSchema({ t }))
      .required()
      .test(
        'is-unique-question',
        t('CoursesManagement.Errors.Exam.questionsMustBeUnique'),
        (values, { path }) => {
          const duplicateQuestions = findIndicesOfSameQuestion(values ?? []);

          if ((duplicateQuestions ?? []).length > 1) {
            const errors = duplicateQuestions.map((index) => {
              return new Yup.ValidationError(
                t('CoursesManagement.Errors.Exam.questionsMustBeUnique'),
                {},
                `${path}[${index}].question`
              );
            });
            return new Yup.ValidationError(errors);
          }
          return true;
        }
      ),
  });
};

export const CourseTemplateSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    course_image: Yup.string()
      .trim()
      .required(t('CoursesManagement.Errors.Course.image')),
    course: courseSchema(),
    lesson: Yup.array().of(lessonSchema()).required(),
    exam: Yup.object().when('course.has_exam', {
      is: (val: boolean) => val,
      then: () => examSchema({ t }),
    }),
  });
};
