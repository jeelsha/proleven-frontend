// ** Constants **
import { CourseModeEnum, CourseStatus } from 'modules/Courses/Constants';

// ** Helper Functions **
import { createEmptyExam } from 'modules/Courses/helper/CourseCommon';

// ** Types **
import {
  InitTemplateCourseType,
  Lesson,
  Question,
  Session,
  TemplateCourse,
  TemplateCourseInitialValues,
} from 'modules/Courses/types';

// ** Slice **
import { AllLanguages } from 'redux-toolkit/slices/languageSlice';

export const createEmptyCourseTemplateInfo = (): TemplateCourse => ({
  is_template: true,
  title: '',
  category_id: null,
  sub_category_id: null,
  survey_template_id: null,
  code: '',
  code_id: null,
  price: null,
  validity: null,
  duration: null,
  has_exam: false,
  need_digital_attendance_sheet: false,
  founded: false,
  funded_by: '',
  course_notes: [
    {
      content: '',
    },
  ],
  image: null,
  language: '',
  parent_table_id: null,
  main_resources: [
    { quantity: '' as unknown as number, resource_id: '' as unknown as number },
  ],
  optional_resources: [],
  certificate_template_id: null,
  certificate_title: '',
  mode: null,
  is_external_certificate: false,
});

export const createEmptySessionTemplateInfo = (): Session => ({
  start_time: '',
  end_time: '',
  mode: CourseModeEnum.InPerson,
});

export const createEmptyLessonTemplateInfo = (): Lesson => ({
  title: '',
  mode: CourseModeEnum.InPerson,
  client_meeting_link: '',
  calendar_provider: null,
  conference_provider: null,
  language: '',
  address_map_link: null,
  place_address: '',
  location: 'Via del Lavoro, 71, 40033 Casalecchio di Reno BO, Italy',
  session: [{ ...createEmptySessionTemplateInfo() }],
  topics: [
    {
      topic: '',
    },
  ],
});

export const createCourseTemplateInitialValues =
  (): TemplateCourseInitialValues => ({
    course_image: '',
    course: createEmptyCourseTemplateInfo(),
    lesson: [createEmptyLessonTemplateInfo()],
    exam: createEmptyExam(),
  });

/**
 * changing values On 'NEXT' click
 * @param values - values from the Form
 * @param currentFormLanguage - Language of the form being filled in
 * @param DEFAULT_LANGUAGE  - Default language of platform (from Redux)
 * @param DEFAULT_LANGUAGE_DATA - Default data of Form (Italian)
 * @returns
 */
export const updateInitialValues = (
  values: TemplateCourseInitialValues,
  currentFormLanguage: string,
  DEFAULT_LANGUAGE: string | undefined,
  DEFAULT_LANGUAGE_DATA: TemplateCourseInitialValues | null
) => {
  return {
    ...values,
    course: {
      ...values.course,
      language: currentFormLanguage,
      main_resources: values.course.main_resources
        .map(({ resource_id, quantity }) => ({
          resource_id,
          quantity,
        }))
        .filter((r) => r.resource_id),
      optional_resources: values.course.optional_resources
        .map(({ resource_id, quantity }) => ({
          resource_id,
          quantity,
        }))
        .filter((r) => r.resource_id),
      course_notes: [
        ...values.course.course_notes
          .filter((item) => item?.content)
          .map((item, ind) => ({
            ...item,
            ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
            currentFormLanguage !== DEFAULT_LANGUAGE
              ? {
                  id: item.id,
                  slug: DEFAULT_LANGUAGE_DATA?.course?.course_notes?.[ind]?.slug,
                  parent_table_id:
                    DEFAULT_LANGUAGE_DATA?.course?.course_notes?.[ind]?.id,
                }
              : {}),
          })),
      ],
      is_template: true,
      ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
      currentFormLanguage !== DEFAULT_LANGUAGE
        ? {
            parent_table_id: DEFAULT_LANGUAGE_DATA?.course?.id,
            slug: DEFAULT_LANGUAGE_DATA?.course.slug,
          }
        : {}),
    },
    lesson: values.lesson.map((lessonItem, index) => {
      if (values?.course?.is_external_certificate) delete lessonItem.topics;
      return {
        ...lessonItem,
        language: currentFormLanguage,
        ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
        currentFormLanguage !== DEFAULT_LANGUAGE
          ? {
              parent_table_id: DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.id,
              slug: DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.slug,
            }
          : {}),
        session: [
          ...(lessonItem.session ?? []).map((sessionItem, ind) => {
            const { conference_change_key, calendar_change_key, ...rest } =
              sessionItem;
            return {
              ...rest,
              conference_provider_id: lessonItem.conference_provider_id,
              calendar_provider_id: lessonItem.conference_provider_id,
              lesson_id: lessonItem?.id,
              course_id: values?.course?.id,
              ...(currentFormLanguage === DEFAULT_LANGUAGE
                ? { id: sessionItem?.id }
                : {}),
              ...(conference_change_key != null ? { conference_change_key } : {}),
              ...(calendar_change_key != null ? { calendar_change_key } : {}),
              ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
              currentFormLanguage !== DEFAULT_LANGUAGE
                ? {
                    parent_table_id:
                      DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.session?.[ind]?.id,
                    slug: DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.session?.[ind]
                      ?.slug,
                  }
                : {}),
            };
          }),
        ],
        topics: [
          ...(lessonItem?.topics ?? []).map((topicItem, ind) => {
            delete topicItem.is_external_certificate;
            return {
              ...topicItem,
              language: currentFormLanguage,
              lesson_id: lessonItem?.id,
              course_id: values?.course?.id,
              ...(currentFormLanguage === DEFAULT_LANGUAGE
                ? { id: topicItem?.id }
                : {}),
              ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
              currentFormLanguage !== DEFAULT_LANGUAGE
                ? {
                    parent_table_id:
                      DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.topics?.[ind]?.id,
                    slug: DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.topics?.[ind]
                      ?.slug,
                  }
                : {}),
            };
          }),
        ],
      };
    }),
    exam: {
      ...values.exam,
      qr_string: DEFAULT_LANGUAGE_DATA?.exam?.qr_string,
      url: DEFAULT_LANGUAGE_DATA?.exam?.url,
      language: currentFormLanguage,
      ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
      currentFormLanguage !== DEFAULT_LANGUAGE
        ? {
            parent_table_id: DEFAULT_LANGUAGE_DATA.exam?.id,
            slug: DEFAULT_LANGUAGE_DATA?.exam?.slug,
          }
        : {}),
      questions: (values.exam?.questions ?? [])?.map((que, index) => {
        const { correct_answer, ...restQuestion } = que;
        return {
          ...restQuestion,
          language: currentFormLanguage,
          ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
          currentFormLanguage !== DEFAULT_LANGUAGE
            ? {
                parent_table_id: DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.id,
                slug: DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.slug,
              }
            : {}),
          answers: restQuestion.answers?.map(
            ({ survey_question_id: _, ...answer }, ind) => ({
              ...answer,
              language: currentFormLanguage,
              ...(DEFAULT_LANGUAGE_DATA?.course?.id &&
              currentFormLanguage !== DEFAULT_LANGUAGE
                ? {
                    parent_table_id:
                      DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.answers?.[ind]
                        .id,
                    slug: DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.answers?.[
                      ind
                    ]?.slug,
                  }
                : {}),
              is_correct: answer.answer === correct_answer,
            })
          ),
        };
      }),
    },
  };
};

/**
 * changing values of currentLanguage data in state (formData)
 * @param values - values from the Form
 * @param updatedValues - updated values with parent_table_id and slug
 * @param data - API response
 * @param currentFormLanguage
 * @param DEFAULT_LANGUAGE_DATA - API response of default form data (Italian)
 * @returns
 */
export const setCurrentFormData = (
  values: TemplateCourseInitialValues,
  updatedValues: TemplateCourseInitialValues,
  data: TemplateCourseInitialValues,
  currentFormLanguage: string,
  DEFAULT_LANGUAGE_DATA: TemplateCourseInitialValues | null
): TemplateCourseInitialValues => {
  return {
    ...values,
    course_image: values.course_image,
    course: {
      ...values.course,
      id: data?.course?.id,
      language: currentFormLanguage,
      slug: DEFAULT_LANGUAGE_DATA?.course.slug ?? data?.course?.slug,
      course_notes: [
        ...values.course.course_notes.map((item, index) => {
          return {
            ...item,
            id: data?.course?.course_notes?.[index]?.id,
            course_id: updatedValues?.course?.id ?? data?.course?.id,
            slug:
              DEFAULT_LANGUAGE_DATA?.course?.course_notes?.[index]?.slug ??
              data?.course?.course_notes?.[index]?.slug,
          };
        }),
      ],
    },
    exam: {
      ...values.exam,
      id: data?.exam?.id,
      language: currentFormLanguage,
      course_id: DEFAULT_LANGUAGE_DATA?.course?.id ?? data?.course?.id,
      qr_string: data?.exam?.qr_string,
      url: data?.exam?.url,
      slug: data?.exam?.slug,
      questions: [
        ...(data?.exam?.questions ?? []).map((item: Question, index: number) => {
          return {
            ...item,
            ...(item?.id
              ? {
                  ...DEFAULT_LANGUAGE_DATA?.exam?.questions?.find(
                    (q) => q.id === item.id
                  ),
                  question: values.exam?.questions?.[index]?.question,
                  correct_answer: values.exam?.questions?.[index]?.correct_answer,
                }
              : {
                  id: data?.exam?.questions?.[index]?.id,
                  slug: data?.exam?.questions?.[index]?.slug,
                }),
            // id: data?.exam?.questions?.[index]?.id,
            // slug:
            //   DEFAULT_LANGUAGE_DATA?.exam?.questions?.[index]?.slug ??
            //   data?.exam?.questions?.[index]?.slug,
            language: currentFormLanguage,
            course_id: data?.course?.id,
            exam_id: data?.exam?.id,
            answers: item.answers?.map(({ survey_question_id: _, ...ans }, ind) => {
              return {
                ...ans,
                ...(ans.id
                  ? {
                      ...DEFAULT_LANGUAGE_DATA?.exam?.questions
                        ?.find((q) => q.id === item.id)
                        ?.answers?.find((a) => a.id === ans.id),
                      answer:
                        values.exam?.questions?.[index]?.answers?.[ind]?.answer,
                    }
                  : {
                      id: item?.answers?.[ind]?.id,
                      slug: item?.answers?.[ind]?.slug,
                    }),
                // id: data?.exam?.questions?.[index]?.answers?.[ind]?.id,
                language: currentFormLanguage,
                is_correct: ans.answer === item.correct_answer,
                course_id: data?.course?.id,
                // slug:
                //   DEFAULT_LANGUAGE_DATA?.exam?.questions?.[index]?.answers?.[
                //     ind
                //   ]?.slug ??
                //   data?.exam?.questions?.[index]?.answers?.[ind]?.slug,
              };
            }),
          };
        }),
      ],
    },
    lesson: [
      ...values.lesson.map((item, index) => {
        return {
          ...item,
          ...(item?.id
            ? {
                ...DEFAULT_LANGUAGE_DATA?.lesson?.find((l) => l.id === item?.id),
                client_meeting_link: item.client_meeting_link,
                mode: item.mode,
                title: item.title,
                conference_provider: item.conference_provider,
              }
            : {
                id: data?.lesson?.[index]?.id,
                slug: data?.lesson?.[index]?.slug,
              }),
          id: data?.lesson?.[index]?.id,
          language: currentFormLanguage,
          // slug: data?.lesson?.[index].slug,
          course_id: data?.course?.id,
          session: [
            ...item.session.map((s, ind) => {
              return {
                ...s,
                ...(s.id
                  ? {
                      ...DEFAULT_LANGUAGE_DATA?.lesson
                        ?.find((l) => l.id === item?.id)
                        ?.session?.find((sessionItem) => sessionItem.id === s.id),
                      start_time: s.start_time,
                      end_time: s.end_time,
                    }
                  : {
                      id: data?.lesson?.[index]?.session?.[ind]?.id,
                      slug: data?.lesson?.[index]?.session?.[ind]?.slug,
                    }),
                lesson_id: data?.lesson?.[index].id,
                course_id: data?.course?.id,
                // slug:
                //   DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.session?.[ind]
                //     ?.slug ?? data?.lesson?.[index]?.session?.[ind]?.slug,
              };
            }),
          ],
          topics: [
            ...(item?.topics ?? []).map((topicItem, ind) => {
              return {
                ...topicItem,
                lesson_id: data?.lesson?.[index].id,
                course_id: data?.course?.id,
                ...(topicItem?.id
                  ? {
                      ...DEFAULT_LANGUAGE_DATA?.lesson
                        ?.find((l) => l.id === item?.id)
                        ?.topics?.find((t) => t.id === topicItem.id),
                    }
                  : {
                      id: data?.lesson?.[index]?.topics?.[ind]?.id,
                      slug: data?.lesson?.[index]?.topics?.[ind]?.slug,
                    }),
              };
            }),
          ],
        };
      }),
    ],
  };
};

/**
 *
 * @param nextFormData - Data to be shown on next language form (Either translated or as it is saved in state)
 * @param nextLangformData - Data stored in formData state as [nextFormLanguage] (formData[nextFormLanguage])
 * @param data - Previous language API response
 * @param translatedValues - Translated data of API response
 * @param nextFormLanguage
 * @param DEFAULT_LANGUAGE_DATA - API response of default form data (Italian)
 * @returns
 */
export const setNextFormData = (
  nextFormData: TemplateCourseInitialValues,
  values: TemplateCourseInitialValues,
  formData: InitTemplateCourseType,
  data: TemplateCourseInitialValues,
  translatedValues: TemplateCourseInitialValues,
  nextFormLanguage: string,
  DEFAULT_LANGUAGE_DATA: TemplateCourseInitialValues | null
): TemplateCourseInitialValues => {
  return {
    ...nextFormData,
    course_image: values.course_image,
    course: {
      ...nextFormData?.course,
      id: formData[nextFormLanguage]?.course?.id,
      language: nextFormLanguage,
      parent_table_id: DEFAULT_LANGUAGE_DATA?.course.id ?? data?.course?.id,
      slug: data?.course?.slug,
      code_id: data?.course?.code_id,
      has_exam: translatedValues.course.has_exam,
      founded: translatedValues.course.founded,
      funded_by: translatedValues.course.funded_by,
      survey_template_id: translatedValues.course.survey_template_id,
      need_digital_attendance_sheet:
        translatedValues.course.need_digital_attendance_sheet,
      category_id: translatedValues.course.category_id,
      sub_category_id: translatedValues.course.sub_category_id,
      code: translatedValues.course.code,
      validity: translatedValues.course.validity,
      duration: translatedValues.course.duration,
      price: translatedValues.course.price,
      certificate_title: translatedValues.course.certificate_title,
      certificate_template_id: translatedValues.course.certificate_template_id,
      main_resources: translatedValues.course.main_resources,
      optional_resources: translatedValues.course.optional_resources,
      is_external_certificate: translatedValues.course.is_external_certificate,
      course_notes: [
        ...translatedValues.course.course_notes.map((item, index) => {
          return {
            ...item,
            ...(item.id
              ? {
                  id: formData[nextFormLanguage]?.course?.course_notes?.find(
                    (note) => note.parent_table_id === item.id
                  )?.id,
                  content: formData[nextFormLanguage]?.course?.course_notes?.find(
                    (note) => note.parent_table_id === item.id
                  )?.content,
                }
              : { content: item.content }),
            slug: data?.course?.course_notes?.[index]?.slug,
            parent_table_id:
              DEFAULT_LANGUAGE_DATA?.course?.course_notes?.[index]?.id ??
              data?.course?.course_notes?.[index]?.id,
          };
        }),
      ],
    },
    exam: {
      ...nextFormData?.exam,
      id: formData[nextFormLanguage]?.exam?.id,
      slug: data?.exam?.slug,
      parent_table_id: DEFAULT_LANGUAGE_DATA?.exam?.id ?? data?.exam?.id,
      language: nextFormLanguage,
      qr_string: data?.exam?.qr_string,
      url: data?.exam?.url,
      passing_marks: data?.exam?.passing_marks,
      questions: [
        ...(translatedValues.exam?.questions ?? []).map((item, index) => {
          return {
            ...item,
            ...(item.id
              ? {
                  id: formData[nextFormLanguage]?.exam?.questions?.find(
                    (q) => q.parent_table_id === item.id
                  )?.id,
                  question: formData[nextFormLanguage]?.exam?.questions?.find(
                    (q) => q.parent_table_id === item.id
                  )?.question,
                  correct_answer: formData[nextFormLanguage]?.exam?.questions?.find(
                    (q) => q.parent_table_id === item.id
                  )?.correct_answer,
                  parent_table_id:
                    DEFAULT_LANGUAGE_DATA?.exam?.questions?.find(
                      (q) => q.parent_table_id === item.id
                    )?.id ?? data?.exam?.questions?.[index]?.id,
                  slug: formData[nextFormLanguage]?.exam?.questions?.find(
                    (q) => q.parent_table_id === item.id
                  )?.slug,
                }
              : {
                  question: item.question,
                  parent_table_id:
                    DEFAULT_LANGUAGE_DATA?.exam?.questions?.[index]?.id ??
                    data?.exam?.questions?.[index]?.id,
                  slug: data?.exam?.questions?.[index]?.slug,
                }),
            language: nextFormLanguage,
            answers: item.answers?.map(({ survey_question_id: _, ...ans }, ind) => {
              return {
                ...ans,
                ...(ans.id
                  ? {
                      id: formData[nextFormLanguage]?.exam?.questions
                        ?.find((q) => q.parent_table_id === item.id)
                        ?.answers?.find((a) => a.parent_table_id === ans.id)?.id,

                      slug: formData[nextFormLanguage]?.exam?.questions
                        ?.find((q) => q.parent_table_id === item.id)
                        ?.answers?.find((a) => a.parent_table_id === ans.id)?.slug,

                      answer: formData[nextFormLanguage]?.exam?.questions
                        ?.find((q) => q.parent_table_id === item.id)
                        ?.answers?.find((a) => a.parent_table_id === ans.id)?.answer,

                      parent_table_id:
                        DEFAULT_LANGUAGE_DATA?.exam?.questions?.[
                          index
                        ].answers?.find((a) => a.parent_table_id === ans.id)?.id ??
                        data?.exam?.questions?.[index]?.answers?.[ind]?.id,
                    }
                  : {
                      answer:
                        translatedValues?.exam?.questions?.[index]?.answers?.[ind]
                          ?.answer,
                      parent_table_id:
                        DEFAULT_LANGUAGE_DATA?.exam?.questions?.[index]?.answers?.[
                          ind
                        ]?.id ?? data?.exam?.questions?.[index]?.answers?.[ind]?.id,
                      slug: data?.exam?.questions?.[index]?.answers?.[ind]?.slug,
                    }),
                question_id:
                  formData[nextFormLanguage]?.exam?.questions?.[index]?.id,
                is_correct:
                  ans.answer === values.exam?.questions?.[index]?.correct_answer,
                course_id: data?.course?.id,
                language: nextFormLanguage,
              };
            }),
          };
        }),
      ],
    },
    lesson: [
      ...(translatedValues?.lesson ?? []).map((item, index) => {
        return {
          ...item,
          ...(item.id
            ? {
                id: nextFormData?.lesson?.find(
                  (lessonItem) => lessonItem.parent_table_id === item.id
                )?.id,
                parent_table_id:
                  DEFAULT_LANGUAGE_DATA?.lesson?.find(
                    (lessonItem) => lessonItem.parent_table_id === item.id
                  )?.id ?? data?.lesson?.[index]?.id,
                title: formData[nextFormLanguage]?.lesson?.find(
                  (lessonItem) => lessonItem.parent_table_id === item.id
                )?.title,
                place_address: nextFormData?.lesson?.find(
                  (lessonItem) => lessonItem.parent_table_id === item.id
                )?.place_address,
                slug: nextFormData?.lesson?.find(
                  (lessonItem) => lessonItem.parent_table_id === item.id
                )?.slug,
              }
            : {
                title: item.title,
                place_address: item.place_address,
                slug: data?.lesson?.[index].slug,
                parent_table_id:
                  DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.id ??
                  data?.lesson?.[index]?.id,
              }),
          course_id: data?.course?.id,
          language: nextFormLanguage,
          session: [
            ...item.session.map((s, i) => {
              return {
                ...s,
                ...(s.id
                  ? {
                      id: nextFormData?.lesson
                        ?.find(
                          (lessonItem) => lessonItem.parent_table_id === item.id
                        )
                        ?.session?.find(
                          (sessionItem) => sessionItem.parent_table_id === s.id
                        )?.id,
                      slug: nextFormData?.lesson
                        ?.find(
                          (lessonItem) => lessonItem.parent_table_id === item.id
                        )
                        ?.session?.find(
                          (sessionItem) => sessionItem.parent_table_id === s.id
                        )?.slug,

                      parent_table_id:
                        DEFAULT_LANGUAGE_DATA?.lesson
                          ?.find(
                            (lessonItem) => lessonItem.parent_table_id === item.id
                          )
                          ?.session?.find(
                            (sessionItem) => sessionItem.parent_table_id === s.id
                          )?.parent_table_id ??
                        data?.lesson?.[index]?.session?.[i]?.id,
                    }
                  : {
                      ...item?.session?.[i],
                      id: undefined,
                      parent_table_id: data?.lesson?.[index]?.session?.[i]?.id,
                      slug: data?.lesson?.[index]?.session?.[i]?.slug,
                    }),
                lesson_id: data?.lesson?.[index]?.id,
                course_id: data?.course?.id,
                language: nextFormLanguage,
              };
            }),
          ],
          topics: [
            ...(item.topics ?? []).map((t, i) => {
              return {
                ...t,
                ...(t?.id
                  ? {
                      id: nextFormData?.lesson
                        ?.find(
                          (lessonItem) => lessonItem.parent_table_id === item.id
                        )
                        ?.topics?.find(
                          (topicsItem) => topicsItem.parent_table_id === t.id
                        )?.id,
                      slug:
                        nextFormData?.lesson
                          ?.find(
                            (lessonItem) => lessonItem.parent_table_id === item.id
                          )
                          ?.topics?.find(
                            (topicsItem) => topicsItem.parent_table_id === t.id
                          )?.slug ?? data?.lesson?.[index]?.topics?.[i]?.slug,

                      parent_table_id:
                        DEFAULT_LANGUAGE_DATA?.lesson
                          ?.find(
                            (lessonItem) => lessonItem.parent_table_id === item.id
                          )
                          ?.topics?.find(
                            (topicsItem) => topicsItem.parent_table_id === t.id
                          )?.parent_table_id ??
                        data?.lesson?.[index]?.topics?.[i]?.id,
                    }
                  : {
                      ...t,
                      id: undefined,
                      parent_table_id: data?.lesson?.[index]?.topics?.[i]?.id,
                      slug: data?.lesson?.[index]?.topics?.[i]?.slug,
                    }),
                lesson_id: data?.lesson?.[index]?.id,
                course_id: data?.course?.id,
                language: nextFormLanguage,
              };
            }),
          ],
        };
      }),
    ],
  };
};

export const setSubmitFormData = (
  values: TemplateCourseInitialValues,
  formData: InitTemplateCourseType,
  currentFormLanguage: string,
  prevFormLanguage: string,
  DEFAULT_LANGUAGE: string | undefined
) => ({
  ...values,
  course: {
    ...values.course,
    is_template: true,
    status: CourseStatus.draft,
    main_resources: values.course.main_resources
      .map(({ resource_id, quantity }) => ({
        resource_id,
        quantity,
      }))
      .filter((r) => r.resource_id),
    optional_resources: values.course.optional_resources
      .map(({ resource_id, quantity }) => ({
        resource_id,
        quantity,
      }))
      .filter((r) => r.resource_id),
    course_notes: [
      ...values.course.course_notes
        .filter((item) => item?.content)
        .map((item, ind) => ({
          ...item,
          slug: DEFAULT_LANGUAGE
            ? formData[DEFAULT_LANGUAGE].course.course_notes?.[ind].slug
            : undefined,
          language: currentFormLanguage,
          parent_table_id: DEFAULT_LANGUAGE
            ? formData[DEFAULT_LANGUAGE]?.course.course_notes?.[ind]?.id
            : undefined,
          course_id: values.course.course_notes[ind].course_id ?? values.course.id,
        })),
    ],
    language: currentFormLanguage,
    slug: formData[prevFormLanguage]?.course?.id
      ? formData[prevFormLanguage]?.course?.slug
      : values.course.slug,
  },
  lesson: values.lesson.map((lessonItem, index) => {
    if (Object.hasOwn(lessonItem, 'place_address')) delete lessonItem.place_address;
    if (values?.course?.is_external_certificate) delete lessonItem?.topics;
    return {
      ...lessonItem,
      parent_table_id:
        formData[prevFormLanguage]?.lesson?.[index]?.id ??
        values.lesson?.[index]?.id,
      slug: formData[prevFormLanguage]?.course?.id
        ? formData[prevFormLanguage]?.lesson?.[index]?.slug
        : values.lesson?.[index]?.slug,
      course_id: values.lesson[index].course_id ?? values.course.id,
      session: [
        ...(lessonItem.session ?? []).map((sessionItem, ind) => {
          const {
            conference_change_key,
            calendar_change_key,
            provider_meeting_event_id,
            ...rest
          } = sessionItem;
          return {
            ...rest,
            slug: formData[prevFormLanguage]?.course?.id
              ? lessonItem.session[ind].slug
              : values.lesson[index].session[ind].slug,
            course_id:
              values.lesson[index].session[ind].course_id ?? values.course.id,
            lesson_id: values.lesson[index].id,
            ...(conference_change_key !== null && conference_change_key !== undefined
              ? { conference_change_key }
              : {}),
            ...(provider_meeting_event_id !== null &&
            provider_meeting_event_id !== undefined
              ? { provider_meeting_event_id }
              : {}),
            ...(calendar_change_key !== null && calendar_change_key !== undefined
              ? { calendar_change_key }
              : {}),
            parent_table_id:
              formData[prevFormLanguage]?.lesson?.[index]?.session?.[ind]?.id ??
              values.lesson?.[index]?.session?.[ind]?.id,
          };
        }),
      ],
      topics: [
        ...(lessonItem.topics ?? []).map((topicsItem, ind) => {
          delete topicsItem.is_external_certificate;
          return {
            ...topicsItem,
            slug: formData[prevFormLanguage]?.course?.id
              ? lessonItem.topics?.[ind].slug
              : values.lesson?.[index].topics?.[ind].slug,
            course_id:
              values.lesson?.[index].topics?.[ind].course_id ?? values.course.id,
            lesson_id: values.lesson?.[index].id,
            parent_table_id:
              formData[prevFormLanguage]?.lesson?.[index]?.topics?.[ind]?.id ??
              values.lesson?.[index]?.topics?.[ind]?.id,
          };
        }),
      ],
    };
  }),
  exam: {
    ...values.exam,
    slug: formData[prevFormLanguage].exam?.course_id
      ? formData[prevFormLanguage]?.exam?.slug
      : values?.exam?.slug,
    course_id: values.exam?.course_id ?? values.course.id,
    qr_string: formData[prevFormLanguage]?.exam?.qr_string,
    url: formData[prevFormLanguage]?.exam?.url,
    questions: (values.exam?.questions ?? [])?.map((que, ind) => {
      delete que.created_at;
      delete que.deleted_at;
      delete que.updated_at;
      const { correct_answer, ...restQuestion } = que;
      return {
        ...restQuestion,
        exam_id: formData[prevFormLanguage]?.exam?.id,
        course_id: values.exam?.questions?.[ind].course_id ?? values.course.id,
        slug: formData[prevFormLanguage]?.course?.id
          ? formData[prevFormLanguage]?.exam?.questions?.[ind]?.slug
          : values?.exam?.questions?.[ind]?.slug,
        parent_table_id:
          formData[prevFormLanguage]?.exam?.questions?.[ind]?.id ??
          values?.exam?.questions?.[ind]?.id,
        answers: (values.exam?.questions ?? [])[ind]?.answers?.map((ans, index) => {
          delete ans.created_at;
          delete ans.deleted_at;
          delete ans.updated_at;
          delete ans.survey_question_id;
          return {
            ...ans,
            is_correct: correct_answer === ans.answer,
            course_id:
              values.exam?.questions?.[ind]?.answers?.[index]?.course_id ??
              values.course.id,
            slug: formData[prevFormLanguage]?.course?.id
              ? formData[prevFormLanguage]?.exam?.questions?.[ind]?.answers?.[index]
                  ?.slug
              : values?.exam?.questions?.[ind].answers?.[index]?.slug,
            parent_table_id:
              formData[prevFormLanguage]?.exam?.questions?.[ind]?.answers?.[index]
                ?.id ?? values?.exam?.questions?.[ind]?.answers?.[index]?.id,
          };
        }),
      };
    }),
  },
});

export const removeIdFromTemplateCourse = (
  values: TemplateCourseInitialValues
): TemplateCourseInitialValues => {
  return {
    ...values,
    course: {
      ...values?.course,
      id: undefined,
      course_notes: (values?.course?.course_notes ?? []).map((note) => ({
        ...note,
        id: undefined,
      })),
    },
    lesson: values?.lesson?.map((lessonItem) => ({
      ...lessonItem,
      id: undefined,
      session: lessonItem?.session?.map((sessionItem) => ({
        ...sessionItem,
        id: undefined,
      })),
    })),
    exam: {
      ...values?.exam,
      id: undefined,
      questions: (values?.exam?.questions ?? []).map((queItem) => ({
        ...queItem,
        id: undefined,
        answers: (queItem?.answers ?? []).map((ansItem) => ({
          ...ansItem,
          id: undefined,
        })),
      })),
    },
  };
};

export const sortLanguages = (a: AllLanguages, b: AllLanguages) => {
  if (a.is_default === b.is_default) {
    return 0;
  }
  return a.is_default ? -1 : 1;
};
