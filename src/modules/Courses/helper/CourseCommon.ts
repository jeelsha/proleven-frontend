// ** Hooks **
import { useTranslation } from 'react-i18next';

// ** Yup
import * as Yup from 'yup';

// ** Types **
import { Option } from 'components/FormElement/types';
import {
  Answer,
  Course,
  CourseInitialValues,
  Exam,
  Lesson,
  Notes,
  Question,
  TemplateCourseInitialValues,
} from 'modules/Courses/types';

// ** date-fns
import {
  endOfDay,
  format,
  getHours,
  getMinutes,
  isAfter,
  isEqual,
  isWithinInterval,
  parseISO,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';

// ** Constants **
import { REACT_APP_DATE_FORMAT } from 'config';
import { TFunction } from 'i18next';
import {
  Conference,
  CourseModeEnum,
  CourseType,
  FundedBy,
} from 'modules/Courses/Constants';

interface SessionTime {
  start_time: Date;
  end_time: Date;
}

interface LessonDate {
  date?: Date;
  topics?: { topic?: string | null }[];
  session?: SessionTime[];
  title?: string;
  mode?: string;
}

export const getValidityOptions = (): Option[] => {
  const { t } = useTranslation();
  return [
    {
      label: t('CoursesManagement.CreateCourse.validity.optionsOne'),
      value: 1,
    },
    {
      label: t('CoursesManagement.CreateCourse.validity.optionsTwo'),
      value: 2,
    },
    {
      label: t('CoursesManagement.CreateCourse.validity.optionsThree'),
      value: 3,
    },
    {
      label: t('CoursesManagement.CreateCourse.validity.optionsFour'),
      value: 4,
    },
    {
      label: t('CoursesManagement.CreateCourse.validity.optionsFive'),
      value: 5,
    },
    {
      label: t('CoursesManagement.CreateCourse.validity.noExpiry'),
      value: 0,
    },
  ];
};

export const scrollFormToTop = () => {
  const formElement = document.querySelector('#scrollable-form');
  if (formElement) {
    formElement?.scrollTo?.({ top: 0, left: 0, behavior: 'smooth' });
  }
};

export const findIndicesOfSameQuestion = (questionsArray: Question[]): number[] => {
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

export const findIndicesOfSameAnswer = (
  answersArray: Answer[],
  correctAnswer: string
) => {
  const answerTexts = answersArray.map((answer) => answer.answer);
  const isCorrectAnswerValid = answerTexts.includes(correctAnswer);
  const result: number[] = answersArray.reduce((acc: number[], answer, index) => {
    const currentAnswer = answer.answer;
    const indices = answerTexts.reduce((indicesAcc: number[], text, textIndex) => {
      if (textIndex !== index && text === currentAnswer) {
        return [...indicesAcc, textIndex];
      }
      return indicesAcc;
    }, []);
    return indices.length > 0 ? [...acc, ...indices] : acc;
  }, []);

  return { duplicateAnswers: result, isCorrectAnswerValid };
};

const convertToTodaysDate = (date: Date) => {
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    date?.getHours(),
    date?.getMinutes()
  ).getTime();
};

export const checkTimeOverlap = (sessionArray: SessionTime[]) => {
  const overlappingIndexes: Array<Array<number>> = [];

  for (let i = 0; i < sessionArray.length; i++) {
    for (let j = i + 1; j < sessionArray.length; j++) {
      if (
        sessionArray?.[i]?.start_time &&
        sessionArray?.[i]?.end_time &&
        sessionArray?.[i]?.start_time &&
        sessionArray?.[j]?.end_time
      ) {
        const start1 = convertToTodaysDate(sessionArray[i].start_time);
        const end1 = convertToTodaysDate(sessionArray[i].end_time);
        const start2 = convertToTodaysDate(sessionArray[j].start_time);
        const end2 = convertToTodaysDate(sessionArray[j].end_time);
        if (
          start1 &&
          start2 &&
          end1 &&
          end2 &&
          !(start1 >= end2 || end1 <= start2)
        ) {
          overlappingIndexes.push([i, j]);
        }
      }
    }
  }
  return overlappingIndexes;
};

export const findDuplicateDates = (lessons: LessonDate[]): number[] => {
  const dateIndexMap: Map<string, number[]> = new Map();

  lessons.forEach((lesson, index) => {
    if (lesson?.date) {
      const currentDate = format(
        new Date(lesson?.date),
        REACT_APP_DATE_FORMAT as string
      );
      if (dateIndexMap.has(currentDate)) {
        dateIndexMap.get(currentDate)?.push(index);
      } else {
        dateIndexMap.set(currentDate, [index]);
      }
    }
  });

  const duplicates: number[] = [];
  dateIndexMap.forEach((indexes) => {
    if (indexes.length > 1) {
      duplicates.push(...indexes);
    }
  });

  return duplicates;
};

export const getCourseTypeList = (): Option[] => {
  const { t } = useTranslation();
  const courseTypeList: Option[] = [];
  Object.entries(CourseType).forEach((item) =>
    courseTypeList.push({
      label: t(`CoursesManagement.CourseType.${item[0]}`),
      value: item[1],
    })
  );
  return courseTypeList;
};

export const getLessonModeList = (
  t: TFunction,
  excludeOptions: Array<CourseModeEnum> = []
): Option[] => {
  const lessonModeList: Option[] = Object.entries(CourseModeEnum)
    .filter(([, value]) => !excludeOptions.includes(value))
    .map(([key, value]) => ({
      label: t(
        `CoursesManagement.CourseModeEnum.${key as keyof typeof CourseModeEnum}`
      ),
      value,
    }));
  return lessonModeList;
};

// **** Mapping numbers to corresponding alphabets A to Z ( 1 - A, 2 - B,... ).
export const numbersToLettersArray = Array.from({ length: 4 }, (_, index) =>
  String.fromCharCode('A'.charCodeAt(0) + index)
);

// **** Function to create an empty Exam object
export const createEmptyExam = (): Exam => ({
  course_id: null,
  passing_marks: null,
  questions: [createEmptyQuestion()],
});

export const createEmptyQuestion = (): Question => ({
  question: '',
  marks: null,
  correct_answer: undefined,
  answers: [
    {
      answer: '',
      is_correct: false,
    },
    {
      answer: '',
      is_correct: false,
    },
  ],
});

export const translateFieldValues = (
  initialValues: CourseInitialValues | TemplateCourseInitialValues,
  fieldsToTranslate: string[]
) => {
  const translateValue = (value: object | string): object | string => {
    if (typeof value === 'string') {
      return value.split('').reverse().join('');
    }
    if (typeof value === 'object' && value !== null) {
      return translateObjectValues(value, fieldsToTranslate);
    }
    return value;
  };

  const translateObjectValues = (
    obj: object,
    fieldsToTranslate: string[]
  ): object => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        return [
          key,
          fieldsToTranslate.includes(key) ? translateValue(value) : value,
        ];
      })
    );
  };

  const translateNotesArray = (notes: Notes[]): Notes[] => {
    return notes.map((note) => ({
      ...note,
      content: translateValue(note.content ?? '') as string,
    }));
  };

  const translatedCourse = translateObjectValues(
    initialValues.course,
    fieldsToTranslate
  );
  const translatedCourseNotes = translateNotesArray(
    initialValues.course.course_notes
  );
  const translatedLesson = initialValues.lesson.map((lesson) => {
    const translatedTopics = (lesson?.topics ?? []).map((topic) =>
      translateObjectValues(topic, fieldsToTranslate)
    );
    return translateObjectValues(
      { ...lesson, topics: translatedTopics },
      fieldsToTranslate
    );
  });

  const translateExamValues = (exam: Exam | undefined): Exam | undefined => {
    // translate values for each answer in the questions array
    const translatedQuestions = exam?.questions?.map((question) => {
      const translatedAnswers = question.answers?.map((answer) =>
        translateObjectValues(answer, fieldsToTranslate)
      );
      return translateObjectValues(
        { ...question, answers: translatedAnswers },
        fieldsToTranslate
      );
    });

    // Create a new Exam object with translated values
    return translateObjectValues(
      { ...exam, questions: translatedQuestions },
      fieldsToTranslate
    );
  };

  return {
    course_image: '',
    course: { ...translatedCourse, course_notes: translatedCourseNotes } as Course,
    lesson: translatedLesson as Lesson[],
    exam: translateExamValues(initialValues.exam),
  };
};

export const getFundedBy = (funded_by: string): string => {
  if (funded_by === FundedBy.NAN) {
    return '-';
  }

  return funded_by;
};
/**
 * Resets the time of a given date to midnight (00:00:00.000) in the local timezone
 * and converts it to the ISO 8601 format.
 *
 * @param date - The date to be reset and formatted
 * @returns The ISO 8601 formatted date string with time set to midnight
 */
export const resetTimeToMidnight = (date: Date): Date => {
  let updatedDate = setHours(date, 0);
  updatedDate = setMinutes(updatedDate, 0);
  updatedDate = setSeconds(updatedDate, 0);
  updatedDate = setMilliseconds(updatedDate, 0);

  // Convert the date to the required ISO 8601 format
  const utcDate = new Date(
    updatedDate.getTime() - updatedDate.getTimezoneOffset() * 60000
  );

  return utcDate;
};

/**
 *
 * @param dateString - UTC date in string format
 * @returns Returns true if today's date is same as Given date OR greater than the given date.
 * use this for course START_DATE
 */
export const isTodayGreaterThanOrEqualToGivenDate = (
  dateString: string
): boolean => {
  const today = startOfDay(new Date());
  const givenDate = parseISO(dateString);
  const givenDay = startOfDay(givenDate);

  return isEqual(today, givenDay) || isAfter(today, givenDay);
};

/**
 *
 * @param dateString - UTC date in string format
 * @returns Returns true if today's date is greater than the given date.
 * use this for course END_DATE
 */
export const isTodayGreaterThanGivenDate = (dateString: string): boolean => {
  const today = startOfDay(new Date());
  const givenDate = parseISO(dateString);
  const givenDay = startOfDay(givenDate);

  return isAfter(today, givenDay);
};

/**
 *
 * @param timeString - UTC time in string format
 * @returns Returns true if the current time is greater than the given time.
 */
export const isCurrentTimeGreaterThanGivenTime = (timeString: string): boolean => {
  const currentTime = new Date();
  const givenTime = parseISO(timeString);

  return isEqual(currentTime, givenTime) || isAfter(currentTime, givenTime);
};

export const validateURL = (url?: string | null) => {
  if (!url) return true;
  let newUrl = url;
  const protocolPattern = /^(http|https):\/\//;
  if (!protocolPattern.test(url)) newUrl = `http://${url}`;
  return Yup.string().url('URL is not valid').isValidSync(newUrl);
};

export const mergeDateAndTime = (dateString?: string, timeString?: string) => {
  if (timeString && dateString) {
    const date = parseISO(dateString);
    const time = parseISO(timeString);

    const hours = getHours(time);
    const minutes = getMinutes(time);

    const mergedDate = setMinutes(setHours(date, hours), minutes);
    return mergedDate?.toISOString();
  }
  return dateString;
};

export const formatMeetingLink = (url: string) => {
  const trimmedUrl = url.trim();
  const pattern = /^(http|https):\/\//;
  const finalUrl = pattern.test(trimmedUrl) ? trimmedUrl : `http://${trimmedUrl}`;
  window.open(finalUrl, '_blank', 'noopener,noreferrer');
};

export const setParamsToApi = (type: string) => {
  const urlQuery: URL = new URL(window.location.href);
  const QueryParams = urlQuery.search;
  if (QueryParams) {
    switch (type) {
      case 'courseType':
        return urlQuery.searchParams.getAll('courseType');
      case 'fundedBy':
        return urlQuery.searchParams.getAll('fundedBy');
      case 'courseCategory':
        return urlQuery.searchParams.getAll('courseCategory');
      case 'courseSubCategory':
        return urlQuery.searchParams.getAll('courseSubCategory');
      case 'trainingSpecialist':
        return urlQuery.searchParams.getAll('trainingSpecialist');
      case 'companies':
        return urlQuery.searchParams.getAll('companies');
      case 'filterDate':
        return urlQuery.searchParams
          .getAll('filterDate')
          .map((i) => JSON.parse(i))?.[0];
      default:
        return {};
    }
  }
};

export function isCurrentDateInRange(
  startDateStr: string,
  endDateStr: string
): boolean {
  const startDate = parseISO(startDateStr);
  const endDate = endOfDay(parseISO(endDateStr));
  const currentDate = new Date();
  if (startDate <= endDate) {
    return isWithinInterval(currentDate, { start: startDate, end: endDate });
  }
  return false;
}

export const getCourseModeLabel = (courseMode: string, t: TFunction) => {
  const mode = courseMode;
  const enumKey = Object.keys(CourseModeEnum).find(
    (key) => CourseModeEnum[key as keyof typeof CourseModeEnum] === mode
  );
  if (enumKey) return t(`CoursesManagement.CourseModeEnum.${enumKey}`);
  return '';
};

export const getConferenceProvideIcon = (provider: string) => {
  switch (provider) {
    case Conference.ZOOM:
      return 'zoomIcon';
    case Conference.GOOGLE_CALENDAR:
      return 'googleIcon';
    case Conference.MICROSOFT_CALENDAR:
      return 'teamsIcon';
    default:
      return undefined;
  }
};
export const getAndReplaceConferenceProvideName = (provider: string) => {
  switch (provider) {
    case Conference.ZOOM:
      return 'zoom';
    case Conference.GOOGLE_CALENDAR:
      return 'google calender';
    case Conference.MICROSOFT_CALENDAR:
      return 'microsoft calendar';
    default:
      return '';
  }
};

export const giveTimeSlotString = (
  date?: string,
  startTime?: string,
  endTime?: string
) => {
  if (date) {
    const datePart = date.toString().split('T')[0];
    const startTimePart = startTime?.split('T')[1].split('.')[0];
    const endTimePart = endTime?.split('T')[1].split('.')[0];

    return `${datePart} ${startTimePart} = ${datePart} ${endTimePart}`;
  }
  return '';
};

export const isEmptyHtmlString = (htmlStr: string) => {
  const topicDiv = document.createElement('div');
  topicDiv.innerHTML = htmlStr;
  return !topicDiv.innerText.trim();
};
