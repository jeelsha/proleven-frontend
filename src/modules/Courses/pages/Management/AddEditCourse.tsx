// ** Components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import AddEditForm from 'modules/Courses/components/Management/AddEditForm';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** Utils **
import _ from 'lodash';
import { capitalizeFirstCharacter } from 'utils';

// ** Helpers **
import { createEmptyCourseInitialValues } from 'modules/Courses/helper';
import { sortLanguages } from 'modules/Courses/helper/CourseTemplateHelper';
import { getEmptyResource } from 'modules/Courses/helper/ResourceHelper';

// ** Types **
import {
  Answer,
  CourseInitialValues,
  CourseResponse,
  Exam,
  IAllLanguages,
  InitFormType,
  Lesson,
  LessonResponse,
  Notes,
  Question,
  Session,
  Topic,
} from 'modules/Courses/types';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { useTitle } from 'hooks/useTitle';
import { CourseModeEnum, CourseType } from 'modules/Courses/Constants';

const initForm = (sortedLanguages: IAllLanguages[]) => {
  const formData: { [key: string]: CourseInitialValues } = {};

  sortedLanguages.forEach((lang) => {
    formData[lang.name] = createEmptyCourseInitialValues();
  });
  return formData;
};

const AddEditCourse = () => {
  const currentURL = new URL(window.location.href);
  const courseSlug = currentURL.searchParams.get('slug');
  const templateId = currentURL.searchParams.get('template');
  const { defaultLanguage, allLanguages } = useSelector(useLanguage);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const updateTitle = useTitle();
  const sortedLanguages = [...(allLanguages ?? [])].sort(sortLanguages);

  const [activeLanguage, setActiveLanguage] = useState(0);
  const [initialValues, setInitialValues] = useState<InitFormType>(
    initForm(sortedLanguages)
  );

  const [formLanguage, setFormLanguage] = useState<string>(defaultLanguage);
  const [objToPass, setObjToPass] = useState<{ [key: string]: unknown }>({});

  useEffect(() => {
    if (!_.isEmpty(state)) {
      setObjToPass({
        [!_.isEmpty(state) && state.comingFromCoursePipeline && 'course_cardId']:
          !_.isEmpty(state) && state.comingFromCoursePipeline && state.course_cardId,
        activeTab: state?.activeTab,
      });
    }
  }, [state]);

  const [getCourseApi, { isSuccess: getCourseSuccess }] = useAxiosGet();
  const [getTemplateBySlug, { isSuccess: getTemplateSuccess }] = useAxiosGet();

  const emptyResource = getEmptyResource();

  const processCourseItem = (
    item: CourseResponse,
    newFormData: {
      [key: string]: CourseInitialValues;
    }
  ) => {
    let courseData = {} as CourseInitialValues;
    sortedLanguages.forEach((lang) => {
      const main_resources =
        (item?.main_resources ?? []).length > 0
          ? item?.main_resources
          : [...emptyResource];
      const optional_resources =
        (item?.optional_resources ?? []).length > 0
          ? item?.optional_resources
          : [...emptyResource];
      const main_trainers =
        (item?.main_trainers ?? []).length > 0 ? item?.main_trainers : [];
      const optional_trainers =
        (item?.optional_trainers ?? []).length > 0 ? item?.optional_trainers : [];
      if (item.language === lang.name) {
        courseData = {
          ...courseData,
          course_image: item.image,
          course: {
            ...courseData.course,
            isErrorInResource: false,
            isErrorInTrainer: false,
            isErrorInRoom: false,
            project_id: null,
            ...Object.keys(item)
              .filter((key) => !['lessons', 'exam', 'course_notes'].includes(key))
              .reduce((acc, key) => {
                (acc as CourseResponse)[key] = item[key];
                return acc;
              }, {}),
            course_notes: mapCourseNoteFields(item),
            main_resources,
            optional_resources,
            main_trainers,
            optional_trainers,
            academy_id: item?.academy_id ?? 0,
            survey_qr: item?.survey_qr ?? null,
            survey_url: item?.survey_url ?? null,
            progressive_number: item?.progressive_number ?? null,
          },
          lesson: item.lessons.map((lesson) =>
            mapLessonFields(lesson, item?.is_external_certificate)
          ),
          exam: mapExamFields(item.exam?.[0]),
        };
        newFormData[lang.name] = courseData;
      }
    });
  };

  const fetchCourse = async () => {
    const { data, error } = await getCourseApi('/course', {
      params: { allLanguage: true, getByParentSlug: courseSlug, sort: 'id' },
    });
    if (error) navigate('/course-management');
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      const newFormData: { [key: string]: CourseInitialValues } = {};
      data.data.forEach((item: CourseResponse) => {
        processCourseItem(item, newFormData);
      });
      setInitialValues(newFormData);
    }
  };

  const mapCourseNoteFields = (course: CourseResponse): Array<Notes> => {
    if (!course?.course_notes?.length)
      return [
        {
          content: '',
        },
      ];
    return course?.course_notes?.map((note) => ({
      id: note.id,
      course_id: note.course_id,
      parent_table_id: note.parent_table_id,
      slug: note.slug,
      content: note.content,
    }));
  };

  const mapLessonFields = (
    lesson: LessonResponse,
    is_external_certificate?: boolean
  ) => {
    return {
      id: lesson.id,
      created_by: lesson.created_by,
      title: lesson.title,
      mode: lesson.mode,
      conference_provider: lesson.conference_provider,
      calendar_provider: lesson.calendar_provider,
      client_meeting_link: lesson.client_meeting_link,
      language: lesson.language,
      parent_table_id: lesson.parent_table_id,
      slug: lesson.slug,
      date: lesson.date,
      address_map_link: lesson.address_map_link,
      place_address: lesson.place_address,
      course_id: lesson.course_id,
      location: lesson.location,
      longitude: lesson.longitude,
      latitude: lesson.latitude,
      session: (lesson.lesson_sessions ?? []).map(mapLessonSessionFields),
      topics: mapLessonTopics(lesson.topics ?? [], is_external_certificate),
    };
  };

  const mapLessonTopics = (
    topics: Array<Topic>,
    is_external_certificate?: boolean
  ) => {
    if (!topics?.length) return [{ topic: '', is_external_certificate }];
    return topics?.map((topic) => ({
      id: topic?.id,
      course_id: topic?.course_id,
      lesson_id: topic?.lesson_id,
      topic: topic?.topic,
      language: topic?.language,
      parent_table_id: topic?.parent_table_id,
      slug: topic?.slug,
    }));
  };

  const mapLessonSessionFields = (sessionItem: Session) => ({
    id: sessionItem.id,
    lesson_id: sessionItem.lesson_id,
    session_conference_provider: sessionItem.session_conference_provider,
    session_calendar_provider: sessionItem.session_calendar_provider,
    client_meeting_link: sessionItem.client_meeting_link,
    start_time: sessionItem.start_time,
    end_time: sessionItem.end_time,
    course_id: sessionItem.course_id,
    provider_meeting_link: sessionItem.provider_meeting_link,
    provider_meeting_event_id: sessionItem.provider_meeting_event_id,
    provider_start_meeting_link: sessionItem.provider_start_meeting_link,
    provider_meeting_id: sessionItem.provider_meeting_id,
    provider_meeting_additional_data: sessionItem.provider_meeting_additional_data,
    provider_meeting_request_uid: sessionItem.provider_meeting_request_uid,
    provider_event_uid: sessionItem.provider_event_uid,
    provider_event_id: sessionItem.provider_event_id,
    provider_event_additional_data: sessionItem.provider_event_additional_data,
    conference_change_key: sessionItem.conference_change_key,
    calendar_change_key: sessionItem.calendar_change_key,
    assigned_to: sessionItem.assigned_to,
    created_by: sessionItem.created_by,
    slug: sessionItem.slug,
    parent_table_id: sessionItem.parent_table_id,
    mode: sessionItem?.mode ?? CourseModeEnum.InPerson,
  });

  const mapExamFields = (exam: Exam) => ({
    id: exam?.id,
    duration: exam?.duration,
    course_id: exam?.course_id,
    language: exam?.language,
    parent_table_id: exam?.parent_table_id,
    slug: exam?.slug,
    passing_marks: exam?.passing_marks,
    questions: (exam?.questions ?? []).map(mapQuestionFields),
  });

  const mapQuestionFields = (questionItem: Question) => ({
    id: questionItem.id,
    question: questionItem.question,
    marks: questionItem.marks,
    exam_id: questionItem.exam_id,
    course_id: questionItem.course_id,
    slug: questionItem.slug,
    language: questionItem.language,
    parent_table_id: questionItem.parent_table_id,
    created_by: questionItem.created_by,
    correct_answer: questionItem.answers?.find((answer) => answer.is_correct)
      ?.answer,
    answers: (questionItem.answers ?? []).map(mapAnswerFields),
  });

  const mapAnswerFields = (answerItem: Answer) => ({
    id: answerItem.id,
    slug: answerItem.slug,
    answer: answerItem.answer,
    is_correct: answerItem.is_correct,
    question_id: answerItem.question_id,
    course_id: answerItem.course_id,
    language: answerItem.language,
    parent_table_id: answerItem.parent_table_id,
    created_by: answerItem.created_by,
  });

  const fetchTemplate = async () => {
    const { data, error } = await getTemplateBySlug('/course/template/dropdown', {
      params: { getByParentSlug: templateId },
      headers: { 'accept-custom-language ': sortedLanguages[0].name },
    });
    if (error) navigate('/course-management');
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      const templateData = data?.data?.[0];
      let newFormData = {} as CourseInitialValues;
      newFormData = {
        ...newFormData,
        course_image: templateData.course.image,

        course: {
          ...newFormData.course,
          is_template: false,
          course_template_id: templateData.course.id,
          title: templateData.course.title,
          has_exam: templateData.course.has_exam,
          code_id: templateData.course.code_id,
          project_id: null,
          survey_template_id: templateData.course.survey_template_id,
          code: templateData.course.code,
          validity: templateData.course.validity,
          need_digital_attendance_sheet:
            templateData.course.need_digital_attendance_sheet,
          founded: templateData.course.founded,
          funded_by: templateData.course.funded_by,
          price: templateData.course.price,
          category_id: templateData.course.category_id,
          sub_category_id: templateData.course.sub_category_id,
          start_date: undefined,
          end_date: undefined,
          type: CourseType.Academy,
          main_trainers: [],
          optional_trainers: [],
          main_resources: templateData.course?.main_resources,
          optional_resources:
            (templateData.course?.optional_resources ?? []).length > 0
              ? templateData.course?.optional_resources
              : [...emptyResource],
          main_rooms: templateData.course?.main_rooms,
          optional_rooms: templateData.course?.optional_rooms,
          isErrorInResource: false,
          isErrorInTrainer: false,
          isErrorInRoom: false,
          certificate_template_id: templateData.course?.certificate_template_id,
          certificate_title: templateData.course?.certificate_title,
          academy_id: templateData.course?.academy_id ?? 0,
          survey_qr: templateData.course?.survey_qr ?? null,
          survey_url: templateData.course?.survey_url ?? null,
          progressive_number: templateData.course?.progressive_number ?? null,
          max_attendee_applicable: templateData.course?.max_attendee_applicable,
          maximum_participate_allowed:
            templateData.course?.maximum_participate_allowed,
          course_notes: templateData.course.course_notes?.length
            ? templateData.course.course_notes?.map((noteItem: Notes) => {
                return {
                  content: noteItem.content,
                };
              })
            : [
                {
                  content: '',
                },
              ],
        },

        lesson: templateData.lesson.map((lessonItem: Lesson) => {
          return {
            title: lessonItem.title,
            mode: lessonItem.mode,
            conference_provider: lessonItem.conference_provider,
            client_meeting_link: lessonItem.client_meeting_link,
            date: undefined,
            location:
              lessonItem.location ??
              'Via del Lavoro, 71, 40033 Casalecchio di Reno BO, Italy',
            longitude: lessonItem.longitude,
            latitude: lessonItem.latitude,
            session: lessonItem.session?.map((sessionItem) => {
              return {
                start_time: sessionItem.start_time,
                end_time: sessionItem.end_time,
                assigned_to: undefined,
                mode: sessionItem?.mode ?? CourseModeEnum.InPerson,
                session_conference_provider: sessionItem.session_conference_provider,
              };
            }),
            topics: mapTopics(
              lessonItem?.topics ?? [],
              templateData?.is_external_certificate
            ),
          };
        }),

        ...(templateData.exam
          ? {
              exam: {
                duration: templateData.exam.duration,
                passing_marks: templateData.exam.passing_marks,
                questions: templateData.exam.questions?.map((queItem: Question) => {
                  return {
                    question: queItem.question,
                    marks: queItem.marks,
                    correct_answer: queItem.answers?.find(
                      (answer) => answer.is_correct
                    )?.answer,
                    answers: queItem.answers?.map((ansItem) => {
                      if (ansItem.is_correct)
                        queItem.correct_answer = ansItem.answer;
                      return {
                        answer: ansItem.answer,
                        is_correct: ansItem.is_correct,
                      };
                    }),
                  };
                }),
              },
            }
          : {}),
      };
      setInitialValues((prev) => ({ ...prev, italian: { ...newFormData } }));
    }
  };

  const mapTopics = (topics: Array<Topic>, is_external_certificate?: boolean) => {
    if (!topics?.length) return [{ topic: '', is_external_certificate }];
    return topics?.map((t) => ({ topic: t.topic }));
  };
  const getClassNames = (index: number, activeLanguage: number) => {
    if (index === activeLanguage) return 'bg-primary text-white';
    if (index > activeLanguage) return 'bg-white text-primary';
    return 'bg-primary text-white';
  };

  useEffect(() => {
    if (courseSlug) fetchCourse();
  }, [courseSlug]);

  useEffect(() => {
    if (templateId) fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message = 'Are you sure you want to leave the site';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const headerTitle = courseSlug
    ? t('CoursesManagement.updateCourse')
    : t('CoursesManagement.createCourse');

  updateTitle(headerTitle);

  return (
    <>
      <PageHeader
        small
        text={headerTitle}
        url={
          !_.isEmpty(state) && state.comingFromCoursePipeline
            ? PRIVATE_NAVIGATION.coursePipeline.view.path
            : PRIVATE_NAVIGATION.coursesManagement.courseManagement.path
        }
        passState={objToPass}
      />

      {getCourseSuccess || getTemplateSuccess ? (
        <CustomCard>
          <>
            <div className="py-10 border-b border-solid border-borderColor">
              <ul className="flex items-center gap-28 justify-center mx-auto new-design-steps">
                {sortedLanguages.map((lang, index) => {
                  return (
                    <li
                      key={lang.id}
                      className="relative group z-1 justify-center items-center flex flex-col"
                    >
                      <label className="text-primary text-sm leading-4 block mb-3.5">
                        {capitalizeFirstCharacter(lang.name)}
                      </label>

                      <Button
                        className={`border border-solid border-primary ${getClassNames(
                          index,
                          activeLanguage
                        )} current-form`}
                      >
                        {index >= activeLanguage ? (
                          <>{index + 1}</>
                        ) : (
                          <Image iconClassName="w-6 h-6" iconName="checkIcon" />
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <AddEditForm
              formData={initialValues}
              setInitialValues={setInitialValues}
              formLanguage={formLanguage}
              setFormLanguage={setFormLanguage}
              activeLanguage={activeLanguage}
              setActiveLanguage={setActiveLanguage}
              isUpdate={!!courseSlug}
            />
          </>
        </CustomCard>
      ) : (
        <div className="relative w-full h-14 flex items-center justify-center">
          <Image loaderType="SiteLoader" />
        </div>
      )}
    </>
  );
};

export default AddEditCourse;
