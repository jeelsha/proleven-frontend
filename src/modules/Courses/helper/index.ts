// ** Types **
import { IAccess } from 'modules/Courses/pages/CourseViewDetail/types';
import {
  Answer,
  Course,
  CourseInitialValues,
  Exam,
  Lesson,
  Notes,
  Question,
  Session,
  Topic,
} from 'modules/Courses/types';

// ** Constants **
import { CourseModeEnum, CourseStatus, CourseType } from 'modules/Courses/Constants';

// ** Common Functions **
import { createEmptyExam } from 'modules/Courses/helper/CourseCommon';

// **** Function to create an empty Course object
export const createEmptyCourse = (): Course => ({
  title: CourseType.Academy,
  course_notes: [
    {
      content: '',
    },
  ],
  academy_id: 0,
  project_id: null,
  survey_template_id: null,
  type: '',
  // duration: null,
  code: '',
  code_id: null,
  is_template: false,
  start_date: '',
  end_date: '',
  has_exam: false,
  need_digital_attendance_sheet: false,
  founded: false,
  funded_by: '',
  reject_reason: '',
  price: null,
  course_template_id: null,
  category_id: null,
  cloned_course_id: null,
  sub_category_id: null,
  language: '',
  parent_table_id: null,
  assigned_to: null,
  validity: null,
  main_resources: [],
  optional_resources: [],
  main_rooms: null,
  optional_rooms: null,
  main_trainers: [],
  optional_trainers: [],
  isErrorInResource: false,
  certificate_template_id: null,
  certificate_title: null,
  mode: null,
  is_external_certificate: false,
  progressive_number: null,
});

// **** Function to create an empty Lesson object
export const createEmptyLesson = (): Lesson => ({
  session: [
    {
      start_time: '',
      end_time: '',
      client_meeting_link: '',
      assigned_to: null,
      mode: CourseModeEnum.InPerson,
    },
  ],

  title: '',
  mode: CourseModeEnum.InPerson,
  calendar_provider: '',
  conference_provider: '',
  client_meeting_link: '',
  language: '',
  parent_table_id: null,
  date: '',
  address_map_link: '',
  place_address: '',
  location: 'Via del Lavoro, 71, 40033 Casalecchio di Reno BO, Italy',
  course_id: null,
  topics: [
    {
      topic: '',
    },
  ],
});

// **** Function to create an empty Session object
export const createEmptySession = (): Session => ({
  start_time: '',
  end_time: '',
  client_meeting_link: '',
  assigned_to: null,
  mode: CourseModeEnum.InPerson,
});

// **** Function to create empty CourseInitialValues
export const createEmptyCourseInitialValues = (): CourseInitialValues => ({
  course_image: '',
  course: createEmptyCourse(),
  lesson: [createEmptyLesson()],
  exam: createEmptyExam(),
});

/**
 * Adds a property to an object only if the value is defined (not null or undefined).
 *
 * @param  obj - The object to which the property should be added.
 * @param  key - The key of the property.
 * @param value - The value of the property.
 * @returns - The updated object with the added property.
 */
export const addPropertyIfDefined = (
  obj: object,
  key: string,
  value: string | number | null | undefined
) => {
  return value !== null && value !== undefined ? { [key]: value, ...obj } : obj;
};

/**
 * changing values On 'NEXT' click
 * @param values - values from the Form
 * @param currentFormLanguage - Language of the form being filled in
 * @param DEFAULT_LANGUAGE  - Default language of platform (from Redux)
 * @param DEFAULT_LANGUAGE_DATA - Default data of Form (Italian)
 * @returns
 */
export const updateInitialValues = (
  values: CourseInitialValues,
  currentFormLanguage: string,
  DEFAULT_LANGUAGE: string | undefined,
  DEFAULT_LANGUAGE_DATA: CourseInitialValues | null
): CourseInitialValues => {
  const updateCourse = (): Course => ({
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
    course_notes: values.course.course_notes
      .filter((item) => item?.content)
      .map((item, ind) => ({
        ...item,
        ...(currentFormLanguage !== DEFAULT_LANGUAGE &&
        DEFAULT_LANGUAGE_DATA?.course?.id
          ? {
              id: item.id,
              slug: DEFAULT_LANGUAGE_DATA.course.course_notes?.[ind]?.slug,
              parent_table_id:
                DEFAULT_LANGUAGE_DATA?.course?.course_notes?.[ind]?.id,
            }
          : {}),
      })),
    ...(currentFormLanguage !== DEFAULT_LANGUAGE && DEFAULT_LANGUAGE_DATA?.course?.id
      ? {
          parent_table_id: DEFAULT_LANGUAGE_DATA.course.id,
          slug: DEFAULT_LANGUAGE_DATA.course.slug,
        }
      : {}),
  });
  const updateTopic = (
    topicItem: Topic,
    lesson_id: number | undefined,
    index: number,
    ind: number
  ): Topic => {
    delete topicItem.created_by;
    delete topicItem.updated_by;
    delete topicItem.deleted_by;
    delete topicItem.deleted_at;
    delete topicItem.updated_at;
    delete topicItem.created_at;
    delete topicItem.is_external_certificate;

    return {
      ...topicItem,
      lesson_id,
      course_id: values?.course?.id,
      ...(currentFormLanguage === DEFAULT_LANGUAGE ? { id: topicItem?.id } : {}),
      ...(currentFormLanguage !== DEFAULT_LANGUAGE &&
      DEFAULT_LANGUAGE_DATA?.course?.id
        ? {
            parent_table_id:
              DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.topics?.[ind]?.id,
            slug: DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.topics?.[ind]?.slug,
          }
        : {}),
    };
  };
  const updateSession = (
    sessionItem: Session,
    lesson_id: number | undefined,
    index: number,
    ind: number
  ): Session => {
    const { conference_change_key, calendar_change_key, ...rest } = sessionItem;
    delete rest.assigned_to_status;
    return {
      ...rest,
      lesson_id,
      course_id: values?.course?.id,
      ...(currentFormLanguage === DEFAULT_LANGUAGE ? { id: sessionItem?.id } : {}),
      ...addPropertyIfDefined({}, 'conference_change_key', conference_change_key),
      ...addPropertyIfDefined({}, 'calendar_change_key', calendar_change_key),
      ...(currentFormLanguage !== DEFAULT_LANGUAGE &&
      DEFAULT_LANGUAGE_DATA?.course?.id
        ? {
            parent_table_id:
              DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.session?.[ind]?.id,
            slug: DEFAULT_LANGUAGE_DATA?.lesson?.[index]?.session?.[ind]?.slug,
          }
        : {}),
    };
  };
  const updateLesson = (lessonItem: Lesson, index: number): Lesson => {
    if (values?.course?.is_external_certificate) delete lessonItem.topics;
    return {
      ...lessonItem,
      language: currentFormLanguage,
      ...(currentFormLanguage !== DEFAULT_LANGUAGE &&
      DEFAULT_LANGUAGE_DATA?.course?.id
        ? {
            parent_table_id: DEFAULT_LANGUAGE_DATA.lesson?.[index]?.id,
            slug: DEFAULT_LANGUAGE_DATA.lesson?.[index]?.slug,
          }
        : {}),
      session: (lessonItem.session ?? []).map((sessionItem, ind) =>
        updateSession(sessionItem, lessonItem?.id, index, ind)
      ),
      topics: (lessonItem.topics ?? []).map((topicItem, ind) =>
        updateTopic(topicItem, lessonItem?.id, index, ind)
      ),
    };
  };
  const updateAnswers = (
    answer: Answer,
    index: number,
    ind: number,
    correct_answer: string | undefined
  ) => ({
    ...answer,
    language: currentFormLanguage,
    ...(currentFormLanguage !== DEFAULT_LANGUAGE && DEFAULT_LANGUAGE_DATA?.course?.id
      ? {
          parent_table_id:
            DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.answers?.[ind]?.id,
          slug: DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.answers?.[ind]?.slug,
        }
      : {}),
    is_correct: answer.answer === correct_answer,
  });
  const updateQuestion = (que: Question, index: number): Question => {
    const { correct_answer, ...restQuestion } = que;
    return {
      ...restQuestion,
      language: currentFormLanguage,
      ...(currentFormLanguage !== DEFAULT_LANGUAGE &&
      DEFAULT_LANGUAGE_DATA?.course?.id
        ? {
            parent_table_id: DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.id,
            slug: DEFAULT_LANGUAGE_DATA.exam?.questions?.[index]?.slug,
          }
        : {}),
      answers: restQuestion.answers?.map(
        ({ survey_question_id: _, ...answer }, ind) =>
          updateAnswers(answer, index, ind, correct_answer)
      ),
    };
  };
  const updateExam = (): Exam => ({
    ...values.exam,
    language: currentFormLanguage,
    ...(currentFormLanguage !== DEFAULT_LANGUAGE && DEFAULT_LANGUAGE_DATA?.course?.id
      ? {
          parent_table_id: DEFAULT_LANGUAGE_DATA.exam?.id,
          slug: DEFAULT_LANGUAGE_DATA.exam?.slug,
        }
      : {}),
    questions: (values.exam?.questions ?? []).map((que, index) =>
      updateQuestion(que, index)
    ),
  });

  return {
    ...values,
    course: updateCourse(),
    lesson: values.lesson.map((lessonItem, index) =>
      updateLesson(lessonItem, index)
    ),
    exam: updateExam(),
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
  values: CourseInitialValues,
  updatedValues: CourseInitialValues,
  data: CourseInitialValues,
  currentFormLanguage: string,
  DEFAULT_LANGUAGE_DATA: CourseInitialValues | null
): CourseInitialValues => {
  const updateCourse = (
    course: Course,
    courseData: Course | undefined,
    language: string,
    defaultData: CourseInitialValues | null,
    updatedValues: CourseInitialValues
  ): Course => {
    return {
      ...course,
      id: courseData?.id,
      language,
      slug: defaultData?.course.slug ?? courseData?.slug,
      survey_qr: courseData?.survey_qr,
      progressive_number: courseData?.progressive_number,
      survey_url: courseData?.survey_url,
      course_notes: updateCourseNotes(
        course.course_notes,
        courseData?.course_notes,
        defaultData,
        updatedValues?.course?.id ?? courseData?.id
      ),
    };
  };

  const updateCourseNotes = (
    courseNotes: Notes[],
    courseNotesData: Notes[] | undefined,
    defaultData: CourseInitialValues | null,
    courseId: number | undefined
  ): Notes[] => {
    return courseNotes.map((item, index) => ({
      ...item,
      id: courseNotesData?.[index]?.id,
      course_id: courseId,
      slug:
        defaultData?.course?.course_notes?.[index]?.slug ??
        courseNotesData?.[index]?.slug,
    }));
  };

  const updateExam = (
    exam: Exam | undefined,
    examData: Exam | undefined,
    language: string,
    defaultData: CourseInitialValues | null,
    courseId: number | undefined
  ): Exam | undefined => {
    return {
      ...exam,
      id: examData?.id,
      qr_string: examData?.qr_string,
      url: examData?.url,
      language,
      course_id: defaultData?.course?.id ?? courseId,
      slug: examData?.slug,
      questions: updateQuestions(
        exam?.questions,
        examData?.questions,
        language,
        defaultData,
        courseId,
        examData?.id
      ),
    };
  };

  const updateQuestions = (
    questions: Question[] | undefined,
    questionsData: Question[] | undefined,
    language: string,
    defaultData: CourseInitialValues | null,
    courseId: number | undefined,
    examId: number | undefined
  ): Question[] | undefined => {
    return (questionsData ?? []).map((item, index) => {
      return {
        ...item,
        ...(item?.id
          ? {
              ...defaultData?.exam?.questions?.find((q) => q.id === item.id),
              question: questionsData?.[index].question,
              correct_answer: questions?.[index]?.correct_answer,
            }
          : {
              id: questionsData?.[index]?.id,
              slug: questionsData?.[index]?.slug,
            }),
        language,
        course_id: courseId,
        exam_id: examId,
        answers: updateAnswers(
          item,
          language,
          defaultData,
          courseId,
          questions?.[index]?.correct_answer,
          questions?.[index]?.answers
        ),
      };
    });
  };

  const updateAnswers = (
    question: Question | undefined,
    language: string,
    defaultData: CourseInitialValues | null,
    courseId: number | undefined,
    correct_answer: string | undefined,
    valAnswer: Answer[] | undefined
  ) => {
    return question?.answers?.map(({ survey_question_id: _, ...ans }, ind) => {
      return {
        ...ans,
        ...(ans.id
          ? {
              ...defaultData?.exam?.questions
                ?.find((q) => q.id === question.id)
                ?.answers?.find((a) => a.id === ans.id),
              answer: valAnswer?.[ind]?.answer,
            }
          : {
              id: question?.answers?.[ind]?.id,
              slug: question?.answers?.[ind]?.slug,
            }),
        language,
        course_id: courseId,
        is_correct: ans.answer === correct_answer,
      };
    });
  };

  const updateLessonArray = (
    lessonsData: Lesson[] | undefined,
    language: string,
    courseId: number | undefined,
    defaultData: CourseInitialValues | null,
    valLessons: Lesson[] | undefined
  ): Lesson[] => {
    return (lessonsData ?? []).map((item, index) => ({
      ...item,
      ...(item?.id
        ? {
            ...defaultData?.lesson?.find((l) => l.id === item?.id),
            client_meeting_link: item.client_meeting_link,
            mode: valLessons?.[index].mode ?? item.mode,
            date: valLessons?.[index].date,
            title: valLessons?.[index].title,
            conference_provider: valLessons?.[index].conference_provider ?? null,
          }
        : {
            id: lessonsData?.[index]?.id,
            slug: lessonsData?.[index]?.slug,
          }),
      language,
      // slug: lessonsData?.[index]?.slug,
      course_id: courseId,
      session: updateSessionArray(
        lessonsData?.[index]?.session,
        lessonsData?.[index]?.id,
        courseId,
        defaultData?.lesson?.[index]?.session,
        valLessons?.[index]?.session
      ),
      topics: updateTopicArray(
        lessonsData?.[index]?.topics,
        lessonsData?.[index]?.id,
        courseId,
        defaultData?.lesson?.[index]?.topics
      ),
    }));
  };

  const updateTopicArray = (
    topicsData: Topic[] | undefined,
    lesson_id: number | undefined,
    courseId: number | undefined,
    defaultTopicData: Topic[] | undefined
  ): Topic[] => {
    return (topicsData ?? []).map((t, ind) => ({
      ...t,
      ...(t?.id
        ? {
            ...defaultTopicData?.find((topicItem) => topicItem.id === t.id),
            topic: t.topic,
          }
        : {
            id: topicsData?.[ind]?.id,
            slug: topicsData?.[ind]?.slug,
          }),
      lesson_id,
      course_id: courseId,
    }));
  };

  const updateSessionArray = (
    sessionsData: Session[] | undefined,
    lesson_id: number | undefined,
    courseId: number | undefined,
    defaultSessionData: Session[] | undefined,
    valSession: Session[] | undefined
  ): Session[] => {
    return (sessionsData ?? []).map((s, ind) => ({
      ...s,
      ...(s.id
        ? {
            ...defaultSessionData?.find((sessionItem) => sessionItem.id === s.id),
            start_time: valSession?.[ind]?.start_time,
            end_time: valSession?.[ind]?.end_time,
          }
        : {
            id: sessionsData?.[ind]?.id,
            slug: sessionsData?.[ind]?.slug,
          }),
      // id: sessionsData?.[ind]?.id,
      lesson_id,
      course_id: courseId,
      // slug: defaultSessionData?.[ind]?.slug ?? s?.slug,
    }));
  };
  return {
    ...values,
    course_image: values.course_image,
    course: updateCourse(
      values.course,
      data?.course,
      currentFormLanguage,
      DEFAULT_LANGUAGE_DATA,
      updatedValues
    ),
    exam: updateExam(
      values.exam,
      data?.exam,
      currentFormLanguage,
      DEFAULT_LANGUAGE_DATA,
      data?.course?.id
    ),
    lesson: updateLessonArray(
      data?.lesson,
      currentFormLanguage,
      data?.course?.id,
      DEFAULT_LANGUAGE_DATA,
      values?.lesson
    ),
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
  nextFormData: CourseInitialValues,
  nextLangformData: CourseInitialValues,
  data: CourseInitialValues,
  translatedValues: CourseInitialValues,
  nextFormLanguage: string,
  DEFAULT_LANGUAGE_DATA: CourseInitialValues | null
): CourseInitialValues => {
  const updateNotes = (
    nextLangCourse: Course,
    DEFAULT_COURSE: Course | undefined,
    dataCourse: Course,
    translatedCourse: Course
  ): Notes[] => {
    return translatedCourse.course_notes.map((item, index) => {
      return {
        ...item,
        ...(item.id
          ? {
              id: nextLangCourse?.course_notes?.find(
                (note) => note.parent_table_id === item.id
              )?.id,
              content: nextLangCourse?.course_notes?.find(
                (note) => note.parent_table_id === item.id
              )?.content,
            }
          : { content: item.content }),
        slug: dataCourse?.course_notes?.[index]?.slug,
        parent_table_id:
          DEFAULT_COURSE?.course_notes?.[index]?.id ??
          dataCourse?.course_notes?.[index]?.id,
      };
    });
  };
  const updateCourse = (
    course: Course,
    nextLangCourse: Course,
    DEFAULT_COURSE: Course | undefined,
    dataCourse: Course,
    translatedCourse: Course
  ): Course => {
    return {
      ...course,
      id: nextLangCourse?.id,
      language: nextFormLanguage,
      parent_table_id: DEFAULT_COURSE?.id ?? dataCourse?.id,
      slug: dataCourse?.slug,
      has_exam: translatedCourse.has_exam,
      code_id: translatedCourse.code_id,
      academy_id: translatedCourse.academy_id,
      project_id: translatedCourse.project_id,
      founded: translatedValues.course.founded,
      funded_by: translatedValues.course.funded_by,
      survey_template_id: translatedValues.course.survey_template_id,
      need_digital_attendance_sheet:
        translatedValues.course.need_digital_attendance_sheet,
      category_id: translatedValues.course.category_id,
      sub_category_id: translatedValues.course.sub_category_id,
      code: translatedValues.course.code,
      validity: translatedValues.course.validity,
      // duration: translatedValues.course.duration,
      price: translatedValues.course.price,
      main_trainers: translatedValues.course.main_trainers,
      optional_trainers: translatedValues.course.optional_trainers,
      main_resources: translatedValues.course.main_resources,
      optional_resources: translatedValues.course.optional_resources,
      main_rooms: translatedValues.course.main_rooms,
      optional_rooms: translatedValues.course.optional_rooms,
      start_date: translatedValues.course.start_date,
      end_date: translatedValues.course.end_date,
      certificate_template_id: translatedValues.course?.certificate_template_id,
      certificate_title: translatedValues.course?.certificate_title,
      mode: translatedValues.course?.mode,
      is_external_certificate: translatedCourse.is_external_certificate,
      survey_qr: dataCourse?.survey_qr,
      progressive_number: dataCourse?.progressive_number,
      survey_url: dataCourse?.survey_url,
      maximum_participate_allowed: dataCourse?.maximum_participate_allowed,
      max_attendee_applicable: dataCourse?.max_attendee_applicable,
      course_notes: updateNotes(
        nextLangCourse,
        DEFAULT_COURSE,
        dataCourse,
        translatedCourse
      ),
    };
  };
  const updatedSession = (
    translatedLesson: Lesson,
    nextLangLesson: Lesson[],
    dataLesson: Lesson | undefined,
    courseId: number | undefined,
    DEFAULT_SESSION: Session[] | undefined,
    dataSession: Session[]
  ) => {
    return translatedLesson?.session?.map((s, i) => {
      return {
        ...s,
        ...(s.id
          ? {
              ...s,
              id: nextLangLesson
                ?.find((l) => l.parent_table_id === translatedLesson?.id)
                ?.session?.find((a) => a.parent_table_id === s.id)?.id,
              parent_table_id:
                DEFAULT_SESSION?.find((a) => a.parent_table_id === s.id)?.id ??
                dataSession?.[i]?.id,
              slug: nextLangLesson
                ?.find((l) => l.parent_table_id === translatedLesson?.id)
                ?.session?.find((a) => a.parent_table_id === s.id)?.slug,
            }
          : {
              ...translatedLesson?.session?.[i],
              id: undefined,
              parent_table_id: dataSession?.[i]?.id,
              slug: dataSession?.[i]?.slug,
            }),
        // id: nextLangLesson?.[i]?.id,
        lesson_id: dataLesson?.id,
        course_id: courseId,
        // parent_table_id: DEFAULT_SESSION?.[i]?.id ?? dataSession?.[i]?.id,
        // slug: DEFAULT_SESSION?.[i]?.slug ?? dataSession?.[i]?.slug,
      };
    });
  };
  const updateTopics = (
    translatedLesson: Lesson,
    nextLangLesson: Lesson[],
    dataLesson: Lesson | undefined,
    courseId: number | undefined,
    DEFAULT_TOPICS: Topic[] | undefined,
    dataTopics: Topic[]
  ) => {
    return (translatedLesson?.topics ?? []).map((t, i) => {
      return {
        ...t,
        ...(t?.id
          ? {
              ...t,
              id: nextLangLesson
                ?.find((l) => l.parent_table_id === translatedLesson?.id)
                ?.topics?.find((a) => a.parent_table_id === t.id)?.id,
              parent_table_id:
                DEFAULT_TOPICS?.find((a) => a.parent_table_id === t.id)?.id ??
                dataTopics?.[i]?.id,
              slug:
                nextLangLesson
                  ?.find((l) => l.parent_table_id === translatedLesson?.id)
                  ?.topics?.find((a) => a.parent_table_id === t.id)?.slug ??
                dataTopics?.[i]?.slug,
            }
          : {
              ...translatedLesson?.topics?.[i],
              id: undefined,
              parent_table_id: dataTopics?.[i]?.id,
              slug: dataTopics?.[i]?.slug,
            }),
        lesson_id: dataLesson?.id,
        course_id: courseId,
      };
    });
  };
  const updateLesson = (
    nextLangLesson: Lesson[],
    DEFAULT_LESSON: Lesson[] | undefined,
    courseId: number | undefined,
    translatedLesson: Lesson[],
    dataLesson: Lesson[]
  ): Lesson[] => {
    return translatedLesson?.map((item, index) => {
      return {
        ...item,
        ...(item.id
          ? {
              id: nextLangLesson?.find(
                (lessonItem) => lessonItem.parent_table_id === item.id
              )?.id,
              title: nextLangLesson?.find(
                (lessonItem) => lessonItem.parent_table_id === item.id
              )?.title,
              place_address: nextLangLesson?.find(
                (lessonItem) => lessonItem.parent_table_id === item.id
              )?.place_address,
              parent_table_id:
                DEFAULT_LESSON?.find((q) => q.parent_table_id === item.id)?.id ??
                dataLesson?.[index]?.id,
              slug: nextLangLesson?.find((q) => q.parent_table_id === item.id)?.slug,
            }
          : {
              title: item.title,
              place_address: item.place_address,
              slug: dataLesson?.[index]?.slug,
              parent_table_id:
                DEFAULT_LESSON?.[index]?.id ?? data?.lesson?.[index]?.id,
            }),
        // slug: DEFAULT_LESSON?.[index]?.slug ?? data?.lesson?.[index].slug,
        // id: nextLangLesson?.[index]?.id,
        course_id: courseId,
        language: nextFormLanguage,
        session: updatedSession(
          item,
          nextLangLesson,
          dataLesson?.[index],
          courseId,
          DEFAULT_LESSON?.[index]?.session,
          dataLesson?.[index]?.session
        ),
        topics: updateTopics(
          item,
          nextLangLesson,
          dataLesson?.[index],
          courseId,
          DEFAULT_LESSON?.[index]?.topics,
          dataLesson?.[index]?.topics ?? []
        ),
      };
    });
  };
  const updateAnswers = (
    translatedQuestion: Question | undefined,
    nextLangQuestions: Question[] | undefined,
    dataQuestion: Question | undefined,
    DEFAULT_ANSWERS: Answer[] | undefined,
    questionId: number | undefined,
    correct_answer?: string
  ) => {
    return (translatedQuestion?.answers ?? []).map(
      ({ survey_question_id: _, ...ans }, ind) => {
        return {
          ...ans,
          ...(ans.id
            ? {
                id: nextLangQuestions
                  ?.find((q) => q.parent_table_id === translatedQuestion?.id)
                  ?.answers?.find((a) => a.parent_table_id === ans.id)?.id,

                answer: nextLangQuestions
                  ?.find((q) => q.parent_table_id === translatedQuestion?.id)
                  ?.answers?.find((a) => a.parent_table_id === ans.id)?.answer,

                slug: nextLangQuestions
                  ?.find((q) => q.parent_table_id === translatedQuestion?.id)
                  ?.answers?.find((a) => a.parent_table_id === ans.id)?.slug,

                parent_table_id:
                  DEFAULT_ANSWERS?.find((a) => a.parent_table_id === ans.id)?.id ??
                  dataQuestion?.answers?.[ind]?.id,
              }
            : {
                answer: translatedQuestion?.answers?.[ind]?.answer,
                parent_table_id: dataQuestion?.answers?.[ind]?.id,
                slug: dataQuestion?.answers?.[ind]?.slug,
              }),
          question_id: questionId ?? dataQuestion?.id,
          is_correct: ans.answer === correct_answer,
          course_id: data?.course?.id,
          // slug: dataQuestion?.answers?.[ind]?.slug,
          language: nextFormLanguage,
        };
      }
    );
  };
  const updateQuestion = (
    translatedExam: Exam | undefined,
    nextLangExam: Exam | undefined,
    dataExam: Exam | undefined,
    DEFAULT_EXAM: Exam | undefined
  ): Question[] | undefined => {
    return (translatedExam?.questions ?? []).map((item, index) => {
      return {
        ...item,
        ...(item.id
          ? {
              id: nextLangExam?.questions?.find((q) => q.parent_table_id === item.id)
                ?.id,
              question: nextLangExam?.questions?.find(
                (q) => q.parent_table_id === item.id
              )?.question,

              parent_table_id:
                DEFAULT_EXAM?.questions?.find((q) => q.parent_table_id === item.id)
                  ?.id ?? dataExam?.questions?.[index]?.id,

              slug: nextLangExam?.questions?.find(
                (q) => q.parent_table_id === item.id
              )?.slug,
            }
          : {
              question: item.question,
              parent_table_id: dataExam?.questions?.[index]?.id,
              slug: dataExam?.questions?.[index]?.slug,
            }),
        correct_answer: item?.answers?.find((a) => a.is_correct)?.answer,
        language: nextFormLanguage,
        answers: updateAnswers(
          item,
          nextLangExam?.questions,
          dataExam?.questions?.[index],
          DEFAULT_EXAM?.questions?.[index]?.answers,
          item.id,
          DEFAULT_EXAM?.questions?.[index]?.correct_answer
        ),
      };
    });
  };
  const updatedExam = (
    exam: Exam | undefined,
    nextLangExam: Exam | undefined,
    DEFAULT_EXAM: Exam | undefined,
    dataExam: Exam | undefined,
    translatedExam: Exam | undefined
  ): Exam | undefined => {
    return {
      ...exam,
      id: nextLangExam?.id,
      slug: dataExam?.slug,
      parent_table_id: DEFAULT_EXAM?.id ?? dataExam?.id,
      language: nextFormLanguage,
      qr_string: dataExam?.qr_string,
      url: dataExam?.url,
      passing_marks: translatedExam?.passing_marks,
      questions: updateQuestion(
        translatedExam,
        nextLangExam,
        dataExam,
        DEFAULT_EXAM
      ),
    };
  };
  return {
    ...nextFormData,
    course: updateCourse(
      nextFormData?.course,
      nextLangformData?.course,
      DEFAULT_LANGUAGE_DATA?.course,
      data?.course,
      translatedValues?.course
    ),
    lesson: updateLesson(
      nextFormData?.lesson,
      DEFAULT_LANGUAGE_DATA?.lesson,
      data.course.id,
      translatedValues.lesson,
      data.lesson
    ),
    exam: updatedExam(
      nextFormData?.exam,
      nextLangformData?.exam,
      DEFAULT_LANGUAGE_DATA?.exam,
      data?.exam,
      translatedValues?.exam
    ),
  };
};

export const setSubmitFormData = (
  values: CourseInitialValues,
  DEFAULT_DATA: CourseInitialValues | undefined,
  prevFormData: CourseInitialValues,
  currentFormLanguage: string
): CourseInitialValues => {
  const updateNotes = (
    course: Course,
    DEFAULT_COURSE: Course | undefined
  ): Notes[] => {
    return course.course_notes
      .filter((item) => item?.content)
      .map((item, ind) => ({
        ...item,
        language: currentFormLanguage,
        parent_table_id: DEFAULT_COURSE?.course_notes?.[ind]?.id,
        course_id: course.course_notes?.[ind]?.course_id ?? values.course.id,
      }));
  };
  const updateCourse = (
    course: Course,
    DEFAULT_COURSE: Course | undefined,
    prevCourseData: Course
  ): Course => {
    return {
      ...course,
      status: CourseStatus.draft,
      main_resources: course.main_resources
        .map(({ resource_id, quantity }) => ({
          resource_id,
          quantity,
        }))
        .filter((r) => r.resource_id),
      optional_resources: course.optional_resources
        .map(({ resource_id, quantity }) => ({
          resource_id,
          quantity,
        }))
        .filter((r) => r.resource_id),
      language: currentFormLanguage,
      slug: prevCourseData?.id ? prevCourseData?.slug : course.slug,
      course_notes: updateNotes(course, DEFAULT_COURSE),
    };
  };

  const updateSessions = (
    sessions: Session[],
    prevSessionData: Session[],
    prevCourseData: Course,
    lessonId: number | undefined
  ) => {
    return (sessions ?? []).map((sessionItem, ind) => {
      const {
        conference_change_key,
        calendar_change_key,
        provider_meeting_event_id,
        ...rest
      } = sessionItem;
      delete rest.assigned_to_status;
      delete rest.created_at;
      delete rest.deleted_at;
      delete rest.updated_at;
      return {
        ...rest,
        course_id: prevCourseData?.id ?? values.course.id,
        lesson_id: lessonId,
        parent_table_id: prevSessionData?.[ind]?.id ?? sessions?.[ind]?.id,
        ...addPropertyIfDefined({}, 'conference_change_key', conference_change_key),
        ...addPropertyIfDefined(
          {},
          'provider_meeting_event_id',
          provider_meeting_event_id
        ),
        ...addPropertyIfDefined({}, 'calendar_change_key', calendar_change_key),
      };
    });
  };
  const updateTopics = (
    topics: Topic[],
    prevTopicData: Topic[],
    prevCourseData: Course,
    lessonId: number | undefined
  ) => {
    return (topics ?? []).map((topicItem, ind) => {
      delete topicItem.created_by;
      delete topicItem.updated_by;
      delete topicItem.deleted_by;
      delete topicItem.deleted_at;
      delete topicItem.updated_at;
      delete topicItem.created_at;
      delete topicItem.is_external_certificate;
      return {
        ...topicItem,
        course_id: prevCourseData?.id ?? values.course.id,
        lesson_id: lessonId,
        parent_table_id: prevTopicData?.[ind]?.id ?? topics?.[ind]?.id,
      };
    });
  };
  const updateLesson = (
    lessons: Lesson[],
    prevLessonsData: Lesson[],
    prevCourseData: Course
  ): Lesson[] => {
    return lessons.map((lessonItem, index) => {
      delete lessonItem.created_at;
      delete lessonItem.deleted_at;
      delete lessonItem.updated_at;
      if (Object.hasOwn(lessonItem, 'place_address'))
        delete lessonItem.place_address;
      return {
        ...lessonItem,
        parent_table_id: prevLessonsData?.[index]?.id ?? values.lesson?.[index]?.id,
        // slug: prevCourseData?.id ? prevLessonsData?.[index]?.slug : lessonItem?.slug,
        course_id: values.lesson?.[index]?.course_id ?? values.course.id,
        session: updateSessions(
          lessonItem.session,
          prevLessonsData?.[index]?.session,
          prevCourseData,
          lessonItem.id
        ),
        topics: updateTopics(
          lessonItem?.topics ?? [],
          prevLessonsData?.[index]?.topics ?? [],
          prevCourseData,
          lessonItem.id
        ),
      };
    });
  };

  const updateAnswers = (
    answers: Answer[] | undefined,
    // prevAnswerData: Answer[] | undefined,
    // prevCourseId: number | undefined,
    correct_answer: string | undefined
  ) => {
    return (answers ?? []).map(({ survey_question_id: _, ...ans }, index) => {
      delete ans.created_at;
      delete ans.deleted_at;
      delete ans.updated_at;
      return {
        ...ans,
        is_correct: correct_answer === ans.answer,
        course_id: answers?.[index]?.course_id ?? values.course.id,
        // slug: prevCourseId ? prevAnswerData?.[index]?.slug : answers?.[index]?.slug,
      };
    });
  };

  const updateQuestions = (
    questions: Question[] | undefined,
    // prevQuestions: Question[] | undefined,
    prevExamId: number | undefined
    // prevCourseId: number | undefined
  ) => {
    return (questions ?? []).map((que, ind) => {
      const { correct_answer, ...restQuestion } = que;
      delete restQuestion.created_at;
      delete restQuestion.deleted_at;
      delete restQuestion.updated_at;
      return {
        ...restQuestion,
        exam_id: prevExamId,
        course_id: questions?.[ind]?.course_id ?? values.course.id,
        // slug: prevCourseId ? prevQuestions?.[ind]?.slug : questions?.[ind]?.slug,
        answers: updateAnswers(
          que.answers,
          // prevQuestions?.[ind]?.answers,
          // prevCourseId,
          correct_answer
        ),
      };
    });
  };

  const updateExam = (
    exam: Exam | undefined,
    prevExamData: Exam | undefined,
    prevCourseId: number | undefined
  ): Exam | undefined => {
    return {
      ...exam,
      slug: prevCourseId ? prevExamData?.slug : exam?.slug,
      course_id: exam?.course_id ?? values.course.id,
      questions: updateQuestions(
        exam?.questions,
        // prevExamData?.questions,
        // prevExamData?.id,
        prevCourseId
      ),
    };
  };
  return {
    ...values,
    course: updateCourse(values.course, DEFAULT_DATA?.course, prevFormData.course),
    lesson: updateLesson(values.lesson, prevFormData.lesson, prevFormData.course),
    exam: updateExam(values.exam, prevFormData.exam, prevFormData.course.id),
  };
};

export const removeIdFromCourse = (
  values: CourseInitialValues
): CourseInitialValues => {
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
      topics: (lessonItem?.topics ?? []).map((topic) => ({
        ...topic,
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

export const accessFunc = (accessArray: IAccess[], userId?: string) => {
  if ((accessArray ?? []).length > 0) {
    const permission: IAccess | undefined = accessArray.find(
      (userAccess) => userAccess?.user_id === Number(userId)
    );
    return permission;
  }
};

export const checkIsNotVideoConference = (
  sessions: Array<
    | {
        mode: string;
        start_time: Date;
        end_time: Date;
      }
    | undefined
  >
) => sessions?.some((session) => session?.mode !== CourseModeEnum.VideoConference);
