// ** Constants **
import { apiCallConstant } from 'constants/common.constant';
import { IMAGE_SUPPORTED_FORMATS } from 'constants/filesupport.constant';
import { CourseType } from 'modules/Courses/Constants';

// ** Types **
import { TFunctionProps } from 'modules/Courses/types';

// ** Hooks **
import { useTranslation } from 'react-i18next';

// ** Helper **
import { differenceInMilliseconds } from 'date-fns';
import { checkIsNotVideoConference } from 'modules/Courses/helper';
import {
  checkTimeOverlap,
  findDuplicateDates,
  findIndicesOfSameAnswer,
  findIndicesOfSameQuestion,
  isEmptyHtmlString,
  validateURL,
} from 'modules/Courses/helper/CourseCommon';

// ** Yup Validation **
import * as Yup from 'yup';

export const CategoryValidation = () => {
  const { t } = useTranslation();
  const dynamicObject: { [key: string]: Yup.StringSchema<string> } = {};
  Object.values(apiCallConstant).forEach((lang) => {
    dynamicObject[`name_${lang}`] = Yup.string()
      .trim()
      .required(t('CoursesManagement.CourseCategory.Validation.categoryRequired'));
  });
  return Yup.object({
    ...dynamicObject,
    legislation_term: Yup.string().when('is_legislation_included', {
      is: (val: boolean) => val,
      then: () =>
        Yup.string()
          .trim()
          .required(
            t('CoursesManagement.CourseCategory.Validation.legislationTermRequired')
          ),
    }),
    course_category_image: Yup.lazy((value) => {
      if (!value) {
        return Yup.string()
          .trim()
          .required(
            t('CoursesManagement.CourseCategory.AddEditCategory.imageRequired')
          );
      }
      if (typeof value === 'string') {
        return Yup.string().trim();
      }
      return Yup.mixed().test(
        'fileFormat',
        t('CoursesManagement.CourseCategory.AddEditCategory.imageValidation'),
        (file) => {
          if (!file) return true;
          return IMAGE_SUPPORTED_FORMATS.includes((file as File).type);
        }
      );
    }),
  });
};

export const SubCategoryValidation = (is_legislation_included: boolean) => {
  const { t } = useTranslation();
  const dynamicObject: { [key: string]: Yup.StringSchema<string> } = {};
  Object.values(apiCallConstant).forEach((lang) => {
    dynamicObject[`name_${lang}`] = Yup.string()
      .trim()
      .required(
        t('CoursesManagement.CourseCategory.Validation.subCategoryRequired')
      );
  });
  if (is_legislation_included)
    dynamicObject.legislation_term = Yup.string()
      .trim()
      .required(
        t('CoursesManagement.CourseCategory.Validation.legislationTermRequired')
      );

  return Yup.object({
    ...dynamicObject,
    survey_slug: Yup.string().required(
      t('CoursesManagement.CourseCategory.Validation.surveyRequired')
    ),
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

const lessonSchema = () => {
  const { t } = useTranslation();
  return Yup.object()
    .shape({
      session: Yup.array().of(sessionSchema()),
      topics: Yup.array().of(topicsSchema()),
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
      language: Yup.string().trim(),
      date: Yup.date().required(t('CoursesManagement.Errors.Lessons.date')),
      location: Yup.string().nullable(),
    })
    .test('is-valid-time', 'Date must be valid', (val, { path }) => {
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
    type: Yup.string().trim().required(t('CoursesManagement.Errors.Course.type')),
    code: Yup.string().trim().required(t('CoursesManagement.Errors.Course.code')),
    is_template: Yup.boolean().required(
      t('CoursesManagement.Errors.Course.isTemplate')
    ),
    start_date: Yup.date().required(t('CoursesManagement.Errors.Course.startDate')),
    end_date: Yup.date().required(t('CoursesManagement.Errors.Course.endDate')),
    has_exam: Yup.boolean().required(t('CoursesManagement.Errors.Course.hasExam')),
    maximum_participate_allowed: Yup.number()
      .nullable()
      .when('max_attendee_applicable', {
        is: (val: boolean) => val,
        then: () =>
          Yup.number()
            .required(t('CoursesManagement.Errors.Course.maximumParticipateAllowed'))
            .min(1, t('CoursesManagement.Errors.Course.maxParticipantNonNegative')),
      }),
    need_digital_attendance_sheet: Yup.boolean().required(
      t('CoursesManagement.Errors.Course.needDigitalAttendanceSheet')
    ),
    price: Yup.number()
      .nullable()
      .when('type', {
        is: (val: string) => val === CourseType.Academy,
        then: () =>
          Yup.number()
            .required(t('CoursesManagement.Errors.Course.price'))
            .min(0, t('CoursesManagement.Errors.Course.priceNonNegative')),
      }),
    category_id: Yup.number().required(
      t('CoursesManagement.Errors.Course.category')
    ),
    validity: Yup.number().required(t('CoursesManagement.Errors.Course.validity')),
    main_trainers: Yup.array()
      .of(Yup.object())
      .required(t('CoursesManagement.CreateCourse.mainTrainer'))
      .min(1, t('CoursesManagement.CreateCourse.mainTrainer')),
    main_rooms: Yup.array().of(Yup.number()),
    optional_rooms: Yup.array().of(Yup.number()),
    main_resources: Yup.array(),

    optional_resources: Yup.array(),

    survey_template_id: Yup.number().required(
      t('CoursesManagement.Errors.Course.survey')
    ),
    isErrorInResource: Yup.boolean()
      .nullable()
      .oneOf([false], t('CoursesManagement.Errors.Course.resourcesNotAvailable')),
    isErrorInTrainer: Yup.boolean()
      .nullable()
      .oneOf([false], t('CoursesManagement.Errors.Course.trainerNotAvailable')),
    isErrorInRoom: Yup.boolean()
      .nullable()
      .oneOf([false], t('CoursesManagement.Errors.Course.roomNotAvailable')),
    project_id: Yup.number()
      .nullable()
      .when('type', {
        is: (val: string) => val === CourseType.Private,
        then: () =>
          Yup.number().required(t('CoursesManagement.Errors.Course.project')),
      }),
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
            parent?.correct_answer
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
          if (errors?.length) return new Yup.ValidationError(errors);
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

export const AddEditCourseSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    course_image: Yup.string()
      .trim()
      .required(t('CoursesManagement.Errors.Course.image')),
    course: courseSchema(),
    lesson: Yup.array()
      .of(lessonSchema())
      .required()
      .test(
        'is-unique-date',
        'Each date should be unique',
        (lessons, { path, parent }) => {
          const errors: Yup.ValidationError[] = [];
          const {
            main_rooms = [],
            optional_rooms = [],
            optional_trainers = [],
            academy_id,
            type,
            start_date,
            end_date,
          } = parent?.course || {};

          /* ******************** Duplicate Dates Validation ******************** */
          const duplicateDates = findDuplicateDates(lessons ?? []);
          if ((duplicateDates ?? []).length > 1) {
            duplicateDates.forEach((index) => {
              errors.push(
                new Yup.ValidationError(
                  t('CoursesManagement.Errors.Lessons.uniqueDate'),
                  {},
                  `${path}[${index}].date`
                )
              );
            });
          }

          /* ******************** Rooms Validation ******************** */
          const sessions = lessons?.flatMap((lesson, index) => {
            if (lesson?.date < start_date || lesson?.date > end_date) {
              errors.push(
                new Yup.ValidationError(
                  t('CoursesManagement.Errors.Lessons.invalidDate'),
                  {},
                  `${path}[${index}].date`
                )
              );
            }
            return lesson.session;
          });
          const isNotVideoConference = checkIsNotVideoConference(sessions ?? []);

          if (type === 'private' && !academy_id) {
            if (errors?.length) throw new Yup.ValidationError(errors);
            return true;
          }
          if (isNotVideoConference) {
            if (!main_rooms?.length) {
              errors.push(
                new Yup.ValidationError(
                  t('CoursesManagement.CreateCourse.mainRoom'),
                  {},
                  'course.main_rooms'
                )
              );
            }
            if (!optional_rooms?.length && optional_trainers?.length) {
              errors.push(
                new Yup.ValidationError(
                  t('CoursesManagement.CreateCourse.optionalRoom'),
                  {},
                  'course.optional_rooms'
                )
              );
            }
          }

          if (errors?.length) throw new Yup.ValidationError(errors);
          return true;
        }
      ),
    exam: Yup.object().when('course.has_exam', {
      is: (val: boolean) => val,
      then: () => examSchema({ t }),
    }),
  });
};

export const ResourcesValidation = () => {
  const { t } = useTranslation();

  return Yup.object().shape({
    title: Yup.string()
      .trim()
      .required(t('CoursesManagement.Errors.Course.resources')),
    quantity: Yup.number()
      .required(t('CoursesManagement.Errors.Course.quantity'))
      .min(1, t('CoursesManagement.Errors.Exam.quantityMarkMustBePositive')),
  });
};
