// ** Components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import CourseTemplateForm from 'modules/Courses/components/Templates/TemplateForm';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** Helper Functions **
import {
  createCourseTemplateInitialValues,
  sortLanguages,
} from 'modules/Courses/helper/CourseTemplateHelper';
import { getEmptyResource } from 'modules/Courses/helper/ResourceHelper';
import { capitalizeFirstCharacter } from 'utils';

// ** Types **
import { CourseModeEnum } from 'modules/Courses/Constants';
import {
  Answer,
  CourseResponse,
  Exam,
  IAllLanguages,
  InitTemplateCourseType,
  LessonResponse,
  Notes,
  Question,
  Session,
  TemplateCourseInitialValues,
  Topic,
} from 'modules/Courses/types';

const initForm = (sortedLanguages: IAllLanguages[]) => {
  const formData: { [key: string]: TemplateCourseInitialValues } = {};

  sortedLanguages.forEach((lang) => {
    formData[lang.name] = createCourseTemplateInitialValues();
  });
  return formData;
};
const AddEditTemplate = () => {
  const currentURL = new URL(window.location.href);
  const { state } = useLocation();
  const courseSlug = currentURL.searchParams.get('slug');
  const { defaultLanguage, allLanguages } = useSelector(useLanguage);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sortedLanguages = [...(allLanguages ?? [])].sort(sortLanguages);
  const [activeLanguage, setActiveLanguage] = useState(0);
  const [initialValues, setInitialValues] = useState<InitTemplateCourseType>(
    initForm(sortedLanguages)
  );
  const [formLanguage, setFormLanguage] = useState<string>(defaultLanguage);

  const [getCourseApi, { isSuccess }] = useAxiosGet();

  const processCourseItem = (
    item: CourseResponse,
    newFormData: {
      [key: string]: TemplateCourseInitialValues;
    }
  ) => {
    let courseData = {} as TemplateCourseInitialValues;
    sortedLanguages.forEach((lang) => {
      if (item.language === lang.name) {
        const main_resources =
          (item?.main_resources ?? []).length > 0
            ? item?.main_resources
            : [...getEmptyResource()];
        const optional_resources =
          (item?.optional_resources ?? []).length > 0
            ? item?.optional_resources
            : [...getEmptyResource()];
        courseData = {
          ...courseData,
          course_image: item.image,
          course: {
            ...courseData.course,
            ...Object.keys(item)
              .filter((key) => !['lessons', 'exam', 'course_notes'].includes(key))
              .reduce((acc, key) => {
                (acc as CourseResponse)[key] = item[key];
                return acc;
              }, {}),
            course_notes: mapCourseNoteFields(item),
            main_resources,
            optional_resources,
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
    const { data, error } = await getCourseApi('/course/template', {
      params: { allLanguage: true, getByParentSlug: courseSlug, sort: 'id' },
    });
    if (error) navigate('/course/templates');
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      const newFormData: { [key: string]: TemplateCourseInitialValues } = {};
      data.data.forEach((item: CourseResponse) =>
        processCourseItem(item, newFormData)
      );
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
  ) => ({
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
    location:
      lesson.location ?? 'Via del Lavoro, 71, 40033 Casalecchio di Reno BO, Italy',
    longitude: lesson.longitude,
    latitude: lesson.latitude,
    session: (lesson.lesson_sessions ?? []).map(mapLessonSessionFields),
    topics: mapLessonTopics(lesson.topics ?? [], is_external_certificate),
  });

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

  const mapLessonSessionFields = (sessionItem: Session) => {
    return {
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
      created_by: sessionItem.created_by,
      slug: sessionItem.slug,
      parent_table_id: sessionItem.parent_table_id,
      mode: sessionItem.mode ?? CourseModeEnum.InPerson,
    };
  };

  const mapExamFields = (exam: Exam): Exam | undefined => ({
    id: exam?.id,
    duration: exam?.duration,
    course_id: exam?.course_id,
    language: exam?.language,
    parent_table_id: exam?.parent_table_id,
    slug: exam?.slug,
    qr_string: exam?.qr_string,
    url: exam?.url,
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

  useEffect(() => {
    if (courseSlug) fetchCourse();
  }, [courseSlug]);

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
    ? t('CoursesManagement.Templates.updateTemplate')
    : t('CoursesManagement.Templates.createTemplate');
  return (
    <>
      <PageHeader
        small
        text={headerTitle}
        url={PRIVATE_NAVIGATION.coursesManagement.courseTemplates.path}
        passState={state}
      />
      {courseSlug && !isSuccess ? (
        <div className="relative w-full h-14 flex items-center justify-center">
          <Image loaderType="SiteLoader" />
        </div>
      ) : (
        <CustomCard>
          <>
            <div className="py-10 border-b border-solid border-borderColor">
              <ul className="flex items-center gap-28 justify-center mx-auto">
                {sortedLanguages.map((lang, index) => {
                  return (
                    <li
                      key={lang.id}
                      className="relative group z-1 justify-center items-center flex flex-col"
                    >
                      <Button
                        className={`${
                          index === activeLanguage
                            ? 'bg-primary text-white border border-solid border-primary'
                            : 'bg-white text-navText border border-solid border-navText '
                        } current-form`}
                      >
                        {index + 1}
                      </Button>
                      <label
                        className={`${
                          index === activeLanguage ? 'text-primary' : 'text-navText'
                        } text-sm leading-4 block mt-3.5`}
                      >
                        {capitalizeFirstCharacter(lang.name)}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            <CourseTemplateForm
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
      )}
    </>
  );
};

export default AddEditTemplate;
