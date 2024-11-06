import { format } from 'date-fns';
import { TFunctionProps } from 'modules/Courses/types';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

// interface CourseDates {
//   lesson: LessonDate[];
// }

// interface LessonDate {
//   date?: Date;
//   title?: string;
//   mode?: string;
// }

interface DuplicateDatesIndices {
  courseIndex: number;
  lessonIndex: number;
}

const LessonSchema = ({ t }: TFunctionProps) => {
  return Yup.object().shape({
    date: Yup.date().required(t('CourseBundle.dateRequired')),
  });
};

const OtherDataSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    main_trainers: Yup.array()
      .of(Yup.object())
      .required(t('CoursesManagement.CreateCourse.mainTrainer'))
      .min(1, t('CoursesManagement.CreateCourse.mainTrainer')),

    main_resources: Yup.array(),
    optional_resources: Yup.array(),
    main_rooms: Yup.array(Yup.number())
      .required(t('CourseBundle.trainer.roomRequired'))
      .min(1, t('CourseBundle.trainer.roomRequired')),

    optional_rooms: Yup.array().when('optional_trainers', {
      is: (val: Array<number>) => {
        return val?.length > 0;
      },
      then: () => {
        return Yup.array()
          .of(Yup.number())
          .required(t('CoursesManagement.CreateCourse.optionalRoom'))
          .min(1, t('CoursesManagement.CreateCourse.optionalRoom'))
          .test(
            'invalid-optional-rooms',
            t('CoursesManagement.CreateCourse.appropriateOptionalRoom'),
            (optional_rooms, context) => {
              const optional_trainers = context.parent.optional_trainers ?? [];
              return (optional_rooms ?? []).length === optional_trainers.length;
            }
          );
      },
    }),
    isErrorInResource: Yup.boolean()
      .required()
      .oneOf([false], t('CoursesManagement.Errors.Course.resourcesNotAvailable')),
    isErrorInTrainer: Yup.boolean()
      .required()
      .oneOf([false], t('CoursesManagement.Errors.Course.trainerNotAvailable')),
    isErrorInRoom: Yup.boolean()
      .required()
      .oneOf([false], t('CoursesManagement.Errors.Course.roomNotAvailable')),
  });
};

const BundleSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    title: Yup.string().required(t('CourseBundle.titleRequired')),
    start_date: Yup.string().required(t('CourseBundle.startDateRequired')),
    end_date: Yup.string().required(t('CourseBundle.endDateRequired')),
    academy_id: Yup.number().required(t('Quote.company.validation.academyRequired')),
  });
};

export const CourseBundleSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    courses: Yup.array()
      .of(
        Yup.object().shape({
          lesson: Yup.array(LessonSchema({ t })).required(),
        })
      )
      .required()
      .test('is-unique-date', 'Each date should be unique', (courses, { path }) => {
        let errors: Yup.ValidationError[] = [];
        courses.forEach((course, courseIndex) => {
          const dateMap = new Map();
          const duplicateIndices: DuplicateDatesIndices[] = [];
          course.lesson.forEach((lesson, lessonIndex) => {
            if (lesson.date) {
              const dateString = format(new Date(lesson?.date), 'dd/MM/yyyy');
              const indexPair = { courseIndex, lessonIndex };

              if (dateMap.has(dateString)) {
                duplicateIndices.push(dateMap.get(dateString));
                duplicateIndices.push(indexPair);
              } else {
                dateMap.set(dateString, indexPair);
              }
            }
          });
          if ((duplicateIndices ?? []).length > 1) {
            errors = duplicateIndices.map(({ courseIndex, lessonIndex }) => {
              return new Yup.ValidationError(
                t('CourseBundle.dateMustBeUnique'),
                {},
                `${path}[${courseIndex}].lesson[${lessonIndex}].date`
              );
            });
          }
        });
        return new Yup.ValidationError(errors);
      }),
    bundle: BundleSchema().required(),
    other: OtherDataSchema().required(),
  });
};

export const NoteSchema = () => {
  const { t } = useTranslation();
  return Yup.object().shape({
    note: Yup.string().required(t('noteRequired')),
  });
};

// const getDuplicateDateIndices = (courseDates: CourseDates[]) => {
//   courseDates.forEach((course, courseIndex) => {
//     const dateMap = new Map();
//     const duplicateIndices: DuplicateDatesIndices[] = [];
//     course.lesson.forEach((lesson, lessonIndex) => {
//       if (lesson.date) {
//         const dateString = format(new Date(lesson?.date), 'dd/MM/yyyy');
//         const indexPair = { courseIndex, lessonIndex };

//         if (dateMap.has(dateString)) {
//           duplicateIndices.push(dateMap.get(dateString));
//           duplicateIndices.push(indexPair);
//         } else {
//           dateMap.set(dateString, indexPair);
//         }
//       }
//     });
//     if ((duplicateIndices ?? []).length > 1) {
//       const errors = duplicateIndices.map(({ courseIndex, lessonIndex }) => {
//         return new Yup.ValidationError(
//           t('CourseBundle.dateMustBeUnique'),
//           {},
//           `${path}[${courseIndex}].lesson[${lessonIndex}].date`
//         );
//       });
//       return new Yup.ValidationError(errors);
//     }
//   });
// };
