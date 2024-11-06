// ** Components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import DropZone from 'components/FormElement/DropZoneField';

// ** Date Functions **
import { parseISO, set } from 'date-fns';

// ** Formik **
import { Form, Formik, FormikErrors, FormikProps, FormikValues } from 'formik';

// ** Hooks **
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ** Course Components **
import CertificateInfo from 'modules/Courses/components/CertificateInfo';
import CourseInfo from 'modules/Courses/components/Management/CourseInfo';
import ExamInfo from 'modules/Courses/components/Management/ExamInfo';
import LessonsInfo from 'modules/Courses/components/Management/LessonsInfo';
import RoomsInfo from 'modules/Courses/components/Management/RoomInfo';
import TrainersInfo from 'modules/Courses/components/Management/TrainersInfo';
import ResourcesInfo from 'modules/Courses/components/ResourcesInfo';

// ** Helper Functions **
import _ from 'lodash';
import {
  removeIdFromCourse,
  setCurrentFormData,
  setNextFormData,
  setSubmitFormData,
  updateInitialValues,
} from 'modules/Courses/helper';
import {
  createEmptyQuestion,
  scrollFormToTop,
} from 'modules/Courses/helper/CourseCommon';
import { sortLanguages } from 'modules/Courses/helper/CourseTemplateHelper';
import {
  customRandomNumberGenerator,
  getObjectKey,
  shouldDisableField,
} from 'utils';
import { convertDateToUTCISOString } from 'utils/date';

// ** Types **
import {
  AddEditFormType,
  Course,
  CourseInitialValues,
  InitFormType,
  Lesson,
} from 'modules/Courses/types';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';

// ** Enums **
import { EnumFileType } from 'components/FormElement/enum';

// ** Constants **
import {
  ActionNameEnum,
  CourseModeEnum,
  FileAcceptType,
  FundedBy,
  fieldsToDelete,
  fieldsToTranslate,
} from 'modules/Courses/Constants';

// ** Validation **
import { AddEditCourseSchema } from 'modules/Courses/validation';

// ** Slice **
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

const AddEditForm = ({
  formData,
  setInitialValues,
  activeLanguage,
  setActiveLanguage,
  formLanguage,
  setFormLanguage,
  isUpdate,
}: AddEditFormType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formikRef = useRef<FormikProps<FormikValues>>();

  const dispatch = useDispatch();
  const { defaultLanguage, allLanguages } = useSelector(useLanguage);

  const DEFAULT_LANGUAGE = (allLanguages ?? []).find(
    (item) => item.short_name === defaultLanguage
  )?.name;

  const formLanguages = [...(allLanguages ?? [])]
    .sort(sortLanguages)
    ?.map((lang) => lang.name);
  const formLanguagesShortName = [...(allLanguages ?? [])]
    .sort(sortLanguages)
    ?.map((lang) => lang.short_name);

  const currentFormLanguage = formLanguages?.[activeLanguage] || '';
  const nextFormLanguage = formLanguages?.[activeLanguage + 1] || '';
  const prevFormLanguage = formLanguages?.[activeLanguage - 1] || '';

  const [actionName, setActionName] = useState<string | null>(ActionNameEnum.NEXT);
  const [isMainLoading, setIsMainLoading] = useState<boolean>(false);
  const [lessonDates, setLessonDates] = useState<string[]>(
    () =>
      formData[currentFormLanguage]?.lesson?.reduce((dates: string[], lesson) => {
        if (lesson.date) dates.push(lesson?.date);
        return dates;
      }, []) || []
  );
  const [lessonTime, setLessonTime] = useState<string[]>(() => {
    const timeOfSession: string[] = [];
    formData[currentFormLanguage]?.lesson.forEach((l) => {
      if (!_.isNull(l.session)) {
        l.session.forEach((s) => {
          if (s.start_time && s.end_time) {
            timeOfSession.push(`${s.start_time}=${s.end_time}`);
          }
        });
      }
    });
    return timeOfSession;
  });

  const [lessonTrainers, setLessonTrainers] = useState<Array<Trainer[]>>([]);
  const [locations, setLocations] = useState([
    ...(formData[currentFormLanguage]?.lesson ?? []).map((l) => l.location),
  ]);
  const [callTranslate, { isLoading: isTranslationLoading }] = useAxiosPost();
  const [createCourseApi, { isLoading: addCourseLoader }] = useAxiosPost();
  const [updateCourseApi, { isLoading: updateCourseLoader }] = useAxiosPut();

  const scrollToError = (errors: FormikErrors<CourseInitialValues>) => {
    const keys = getObjectKey(errors);
    if (keys.length > 0) {
      setTimeout(() => {
        if (formikRef.current) {
          formikRef.current.submitForm();
        }
        const parentElement = document.querySelector(
          '.main__cn__wrapper'
        ) as HTMLElement;
        const errorElement = document.querySelector('.error-message') as HTMLElement;

        if (parentElement && errorElement) {
          parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

          const errorPosition = errorElement.getBoundingClientRect();
          const parentPosition = parentElement.getBoundingClientRect();

          const offset = errorPosition.top - parentPosition.top - 200;
          if (
            offset < 0 ||
            offset + errorElement.offsetHeight > parentPosition.height
          ) {
            parentElement.scrollTo({
              top: parentElement.scrollTop + offset,
              behavior: 'smooth',
            });
          }
        }
      }, 0);
    }
  };

  const languageChange = (value: string) => {
    const currLang = (allLanguages ?? []).find(
      (item) => item.name === value
    )?.short_name;
    if (currLang) setFormLanguage(currLang);
  };

  const updateSessionTimes = (lesson: Lesson) => {
    if (!lesson.date) return;
    const originalDate = parseISO(lesson.date);

    const updateTime = (date: string) => {
      const originalTime = parseISO(date ?? '');
      const newTime = set(originalTime, {
        year: originalDate.getFullYear(),
        month: originalDate.getMonth(),
        date: originalDate.getDate(),
      });
      return newTime ? convertDateToUTCISOString(newTime) : date;
    };

    lesson.session.forEach((session) => {
      if (session.start_time) session.start_time = updateTime(session.start_time);
      if (session.end_time) session.end_time = updateTime(session.end_time);
    });
  };

  const lessonValueValidator = (val: string | null) => (val === '' ? null : val);
  const sessionValueValidator = (val: string | null | undefined) =>
    val === '' ? null : val;

  const findMaxEndTime = (lessons: Lesson[]) => {
    lessons.forEach((lesson) => {
      let lessonConferenceProvider: string | null | undefined = null;
      const sessionModes = lesson.session.map((session) => session.mode);
      const uniqueSessionModes = [...new Set(sessionModes)];
      lesson.mode =
        uniqueSessionModes.length === 1
          ? (uniqueSessionModes[0] as CourseModeEnum)
          : CourseModeEnum.Hybrid;

      lesson.language = currentFormLanguage;

      lesson.client_meeting_link = lessonValueValidator(lesson.client_meeting_link);
      lesson.calendar_provider = lessonValueValidator(lesson?.calendar_provider);
      lesson.address_map_link = lessonValueValidator(lesson.address_map_link);
      lesson.conference_provider = lessonValueValidator(lesson.conference_provider);

      if (Object.hasOwn(lesson, 'place_address')) delete lesson.place_address;
      if (Object.hasOwn(lesson, 'assigned_to_status'))
        delete lesson.assigned_to_status;

      if (lesson.mode === CourseModeEnum.InPerson) lesson.conference_provider = null;

      lesson?.session.forEach((session) => {
        session.start_time = session?.start_time
          ? convertDateToUTCISOString(parseISO(session?.start_time))
          : session?.start_time;
        session.end_time = session?.end_time
          ? convertDateToUTCISOString(parseISO(session?.end_time))
          : session?.end_time;
        if (Object.hasOwn(session, 'provider_meeting_event_id')) {
          delete session.provider_meeting_event_id;
        }
        session.client_meeting_link = sessionValueValidator(
          session?.client_meeting_link
        );
        session.session_calendar_provider = sessionValueValidator(
          session?.session_calendar_provider
        );
        session.provider_meeting_link = sessionValueValidator(
          session?.provider_meeting_link
        );
        session.provider_start_meeting_link = sessionValueValidator(
          session?.provider_start_meeting_link
        );
        session.provider_meeting_additional_data = sessionValueValidator(
          session?.provider_meeting_additional_data
        );

        if (session.mode !== CourseModeEnum.InPerson && !lessonConferenceProvider)
          lessonConferenceProvider = session?.session_conference_provider;
      });
      lesson.conference_provider = lessonConferenceProvider;
    });

    const lessonModes = lessons.map((lesson) => lesson.mode);
    const uniqueLessonModes = [...new Set(lessonModes)];
    return uniqueLessonModes.length === 1
      ? (uniqueLessonModes[0] as CourseModeEnum)
      : CourseModeEnum.Hybrid;
  };

  const createFormData = (values: CourseInitialValues) => {
    const formsData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof File) {
        formsData.append(key, value);
      } else {
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : value;
        formsData.append(key, stringValue);
      }
    });
    return formsData;
  };

  const handleImageAndPdfLink = (
    values: CourseInitialValues,
    updatedValues: CourseInitialValues
  ) => {
    if (typeof values.course_image === 'string') {
      delete updatedValues.course_image;
      updatedValues.course.image = values.course_image;
    }

    if (!values.course?.project_id) delete updatedValues.course.project_id;
    if (!values.course?.max_attendee_applicable)
      delete updatedValues.course.maximum_participate_allowed;
    delete updatedValues.course.certificate_pdf_link;
  };

  const removeFieldsFromUpdatedValues = (
    values: CourseInitialValues,
    updatedValues: CourseInitialValues
  ) => {
    fieldsToDelete.forEach((field) => {
      if (Object.hasOwn(values.course, field)) {
        delete updatedValues.course[field as keyof Course];
      }
    });
    if (!values?.course?.sub_category_id) {
      updatedValues.course.sub_category_id = null;
    }
    if (values?.course?.survey_qr === '') updatedValues.course.survey_qr = null;
    if (values?.course?.survey_url === '') updatedValues.course.survey_url = null;
    if (values?.course?.is_external_certificate) {
      delete updatedValues.course.certificate_title;
      delete updatedValues.course.certificate_template_id;
    }
  };

  const checkAndUpdateAcademyId = (
    values: CourseInitialValues,
    updatedValues: CourseInitialValues
  ) => {
    if (!values.course.academy_id || values.course.academy_id === 0) {
      delete updatedValues.course.academy_id;
    }
  };

  const checkAndUpdateExam = (
    values: CourseInitialValues,
    updatedValues: CourseInitialValues
  ) => {
    if (!values.course.has_exam) {
      delete updatedValues.exam;
    }
  };

  const OnNext = async (values: CourseInitialValues) => {
    const DEFAULT_LANGUAGE_DATA = DEFAULT_LANGUAGE
      ? formData[DEFAULT_LANGUAGE]
      : null;
    values.lesson.forEach(updateSessionTimes);
    values.course.mode = findMaxEndTime(values.lesson);

    if (String(values.course.founded) === 'false') {
      values.course.funded_by = FundedBy.NAN;
    }
    values.course.language = currentFormLanguage;

    const updatedValues: CourseInitialValues = updateInitialValues(
      values,
      currentFormLanguage,
      DEFAULT_LANGUAGE,
      DEFAULT_LANGUAGE_DATA
    );
    removeFieldsFromUpdatedValues(values, updatedValues);
    const isUpdate =
      formData[nextFormLanguage]?.course.id ?? updatedValues.course.id;

    checkAndUpdateAcademyId(values, updatedValues);
    checkAndUpdateExam(values, updatedValues);
    handleImageAndPdfLink(values, updatedValues);

    const apiFunction = isUpdate ? updateCourseApi : createCourseApi;
    const formsData = createFormData(updatedValues);
    const { data, error } = await apiFunction('/course', formsData);

    if (error === null || error === undefined) {
      let translatedValues = updatedValues;
      if (!formData[nextFormLanguage]?.course.id) {
        const { data: translatedData, error: translationError } =
          await callTranslate('/translation', {
            translateObj: updatedValues,
            language: formLanguagesShortName[activeLanguage + 1],
            fieldToConvert: fieldsToTranslate,
          });
        if (!translationError) translatedValues = translatedData;
      }

      scrollFormToTop();
      const nextFormData = isUpdate ? formData[nextFormLanguage] : translatedValues;
      if (nextFormData?.exam && (nextFormData?.exam?.questions ?? []).length <= 0)
        translatedValues = {
          ...translatedValues,
          exam: removeIdFromCourse(translatedValues)?.exam,
        };
      setInitialValues((prev: InitFormType) => ({
        ...prev,
        [currentFormLanguage]: setCurrentFormData(
          values,
          updatedValues,
          data,
          currentFormLanguage,
          DEFAULT_LANGUAGE_DATA
        ),
        [nextFormLanguage]: {
          ...(nextFormData
            ? {
                ...setNextFormData(
                  nextFormData,
                  formData[nextFormLanguage],
                  data,
                  translatedValues,
                  nextFormLanguage,
                  DEFAULT_LANGUAGE_DATA
                ),
              }
            : {
                ...setNextFormData(
                  removeIdFromCourse(values), // remove id from every object ,
                  formData[nextFormLanguage],
                  data,
                  removeIdFromCourse(translatedValues),
                  nextFormLanguage,
                  DEFAULT_LANGUAGE_DATA
                ),
              }),

          course_image: values.course_image,
        },
      }));
      languageChange(nextFormLanguage);
      setActiveLanguage(activeLanguage + 1);
    }
  };

  const OnPrev = (values: CourseInitialValues) => {
    languageChange(prevFormLanguage);
    (formData[prevFormLanguage].exam?.questions ?? []).forEach((question) => {
      (question.answers ?? []).forEach((answer) => {
        if (answer.is_correct) question.correct_answer = answer.answer;
      });
    });
    setInitialValues((prev: InitFormType) => ({
      ...prev,
      [currentFormLanguage]: { ...values },
    }));
    setActiveLanguage(activeLanguage - 1);
    scrollFormToTop();
  };

  const handleSubmit = async (values: CourseInitialValues) => {
    const DEFAULT_DATA = DEFAULT_LANGUAGE ? formData[DEFAULT_LANGUAGE] : undefined;
    const updatedValues = setSubmitFormData(
      values,
      DEFAULT_DATA,
      formData[prevFormLanguage],
      currentFormLanguage
    );
    if (!values.course.academy_id || values.course.academy_id === 0)
      delete updatedValues.course.academy_id;
    if (!updatedValues.course.has_exam) delete updatedValues.exam;
    if (values.course.reject_reason === '')
      delete updatedValues.course.reject_reason;
    handleImageAndPdfLink(values, updatedValues);
    removeFieldsFromUpdatedValues(values, updatedValues);

    const apiFunction = values.course?.id ? updateCourseApi : createCourseApi;
    const formsData = createFormData(updatedValues);
    const { error } = await apiFunction('/course', formsData);

    if (!error) {
      // if (!isUpdate) thankYouModal.openModal();else
      navigate('/course-management');
    }
  };

  const onSubmit = (values: CourseInitialValues) => {
    if (values) {
      switch (actionName) {
        case ActionNameEnum.NEXT:
          OnNext(values);
          break;
        case ActionNameEnum.PREV:
          OnPrev(values);
          break;
        case ActionNameEnum.SUBMIT:
          handleSubmit(values);
          break;
        default:
          break;
      }
    }
  };

  const getUpdatedValues = (values: CourseInitialValues): CourseInitialValues => {
    const is_external_certificate = !values?.course?.is_external_certificate;
    return {
      ...values,
      course: {
        ...values?.course,
        is_external_certificate,
      },
      lesson: values?.lesson?.map((lesson) => {
        const newTopics = lesson.topics?.length
          ? [
              ...(lesson.topics ?? []).map((t) => ({
                ...t,
                is_external_certificate,
              })),
            ]
          : [{ topic: '', is_external_certificate }];
        return {
          ...lesson,
          topics: newTopics,
        };
      }),
    };
  };

  return (
    <Formik
      initialValues={formData[currentFormLanguage]}
      validationSchema={AddEditCourseSchema()}
      onSubmit={onSubmit}
      enableReinitialize
      innerRef={formikRef as unknown as React.Ref<FormikProps<CourseInitialValues>>}
    >
      {({
        values,
        setFieldValue,
        isValid,
        errors,
        submitForm,
        setValues,
        setFieldTouched,
      }) => {
        return (
          <Form>
            <div className="flex flex-wrap mt-10">
              <div className="max-w-[420px] w-full test">
                <div className="flex flex-col gap-y-5">
                  <DropZone
                    label={t('CoursesManagement.CreateCourse.uploadThumbnail')}
                    name="course_image"
                    SubTitle={t('Auth.AdditionalInfo.dragDropText')}
                    setValue={setFieldValue}
                    acceptTypes={FileAcceptType[EnumFileType.Image].toString()}
                    value={values.course_image ?? null}
                    fileType={EnumFileType.Image}
                    isCompulsory
                    isLoading={isMainLoading}
                    isDisabled={shouldDisableField(
                      '',
                      fieldsToTranslate,
                      currentFormLanguage,
                      DEFAULT_LANGUAGE ?? ''
                    )}
                  />
                </div>
              </div>
              <div className="1500:max-w-[calc(100%_-_420px)] w-full 1500:ps-7 1500:pt-0 pt-7">
                <div className="flex flex-col gap-y-7">
                  <CourseInfo
                    formLanguage={formLanguage}
                    values={values}
                    setFieldValue={setFieldValue}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    isMainLoading={isMainLoading}
                    setIsMainLoading={setIsMainLoading}
                    setMainFormData={setInitialValues}
                    isUpdate={isUpdate}
                  />
                  <LessonsInfo
                    values={values}
                    setFieldValue={setFieldValue}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    isMainLoading={isMainLoading}
                    setIsMainLoading={setIsMainLoading}
                    isUpdate={isUpdate}
                    setLessonDates={setLessonDates}
                    setLessonTime={setLessonTime}
                    lessonTrainers={lessonTrainers}
                    setLessonTrainers={setLessonTrainers}
                    locations={locations}
                    setLocations={setLocations}
                  />

                  <TrainersInfo
                    values={values}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    dates={lessonDates}
                    lessonTime={lessonTime}
                    setFieldValue={setFieldValue}
                    lessonTrainers={lessonTrainers}
                    isLoading={isMainLoading}
                    locations={locations}
                  />

                  <ResourcesInfo
                    main_resources={values.course?.main_resources ?? []}
                    optional_resources={values.course?.optional_resources ?? []}
                    setFieldValue={setFieldValue}
                    lessonTime={lessonTime}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    parentObjectName="course"
                    course_slug={values?.course?.slug}
                    isOptionalRequired={!!values?.course?.optional_trainers?.length}
                    dates={lessonDates}
                    isLoading={isMainLoading}
                    setIsMainLoading={setIsMainLoading}
                  />

                  <RoomsInfo
                    values={values}
                    dates={lessonDates}
                    lessonTime={lessonTime}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    isLoading={isMainLoading}
                    setIsMainLoading={setIsMainLoading}
                    setFieldValue={setFieldValue}
                  />

                  <div>
                    <label className="text-sm text-black leading-4 inline-block mb-2">
                      {t('CoursesManagement.CreateCourse.other')}
                    </label>
                    <div className="flex gap-4">
                      <Checkbox
                        id="courseExam"
                        name="course.has_exam"
                        labelClass="cursor-pointer"
                        onChange={() => {
                          setFieldValue('course.has_exam', !values.course.has_exam);
                          if (
                            values.exam === undefined ||
                            (values.exam?.questions &&
                              values.exam?.questions?.length <= 0)
                          ) {
                            setFieldValue('exam.questions', [
                              { ...createEmptyQuestion() },
                            ]);
                          }
                        }}
                        check={values.course.has_exam}
                        text={t('CoursesManagement.CreateCourse.exam')}
                        isLoading={isMainLoading}
                        disabled={shouldDisableField(
                          'has_exam',
                          fieldsToTranslate,
                          currentFormLanguage,
                          DEFAULT_LANGUAGE ?? ''
                        )}
                      />
                      <Checkbox
                        id="courseDigitalAttendanceSheet"
                        name="course.need_digital_attendance_sheet"
                        labelClass="cursor-pointer"
                        onChange={() => {
                          setFieldValue(
                            'course.need_digital_attendance_sheet',
                            !values.course.need_digital_attendance_sheet
                          );
                        }}
                        check={values.course.need_digital_attendance_sheet}
                        text={t('CoursesManagement.CreateCourse.attendance')}
                        isLoading={isMainLoading}
                        disabled={shouldDisableField(
                          'need_digital_attendance_sheet',
                          fieldsToTranslate,
                          currentFormLanguage,
                          DEFAULT_LANGUAGE ?? ''
                        )}
                      />

                      <Checkbox
                        labelClass="cursor-pointer"
                        name="course.is_external_certificate"
                        id="isExternalCertificateRequired"
                        onChange={() => {
                          const updatedValues = getUpdatedValues(values);
                          setValues(updatedValues);
                        }}
                        check={values.course.is_external_certificate}
                        text={t(
                          'CoursesManagement.CreateCourse.externalCertificate'
                        )}
                        isLoading={isMainLoading}
                        disabled={shouldDisableField(
                          'is_external_certificate',
                          fieldsToTranslate,
                          currentFormLanguage,
                          DEFAULT_LANGUAGE ?? ''
                        )}
                      />
                    </div>
                  </div>
                  {values.course.has_exam ? (
                    <ExamInfo
                      values={values}
                      fieldsToTranslate={fieldsToTranslate}
                      currentLanguage={currentFormLanguage}
                      defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                      isMainLoading={isMainLoading}
                      setIsMainLoading={setIsMainLoading}
                    />
                  ) : (
                    ''
                  )}
                  {!values.course.is_external_certificate ? (
                    <CertificateInfo
                      lessons={values?.lesson ?? []}
                      fieldsToTranslate={fieldsToTranslate}
                      currentLanguage={currentFormLanguage}
                      defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                      isMainLoading={isMainLoading}
                      certificate_id={values?.course?.certificate_template_id}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                    />
                  ) : (
                    ''
                  )}
                  <div className="flex justify-end gap-4">
                    {activeLanguage > 0 ? (
                      <Button
                        variants="primary"
                        type="submit"
                        className="addButton min-w-[90px]"
                        onClickHandler={() => {
                          setActionName(ActionNameEnum.PREV);
                        }}
                        disabled={addCourseLoader || updateCourseLoader}
                      >
                        {t('CoursesManagement.createCourse.prev')}
                      </Button>
                    ) : (
                      ''
                    )}

                    {activeLanguage < (allLanguages ?? []).length - 1 ? (
                      <div className="flex justify-end gap-4">
                        <Button
                          className="min-w-[90px]"
                          variants="whiteBordered"
                          onClickHandler={() => {
                            navigate(-1);
                          }}
                          disabled={addCourseLoader || updateCourseLoader}
                        >
                          {t('Button.cancelButton')}
                        </Button>
                        <Button
                          variants="primary"
                          type="button"
                          className="addButton"
                          name="next"
                          onClickHandler={async () => {
                            setActionName(ActionNameEnum.NEXT);
                            await submitForm();
                            if (!isValid) {
                              scrollToError(errors);
                              dispatch(
                                setToast({
                                  variant: 'Error',
                                  message: t(
                                    'ToastMessage.InCompleteFormToastMessage'
                                  ),
                                  type: 'error',
                                  id: customRandomNumberGenerator(),
                                })
                              );
                            }
                          }}
                          isLoading={
                            addCourseLoader ||
                            updateCourseLoader ||
                            isTranslationLoading
                          }
                          disabled={
                            addCourseLoader ||
                            updateCourseLoader ||
                            isMainLoading ||
                            isTranslationLoading
                          }
                        >
                          {t('CoursesManagement.createCourse.saveAndNext')}
                        </Button>
                      </div>
                    ) : (
                      ''
                    )}

                    {nextFormLanguage === '' ? (
                      <Button
                        variants="primary"
                        type="button"
                        className="addButton min-w-[90px]"
                        isLoading={
                          addCourseLoader ||
                          updateCourseLoader ||
                          isTranslationLoading
                        }
                        disabled={
                          addCourseLoader ||
                          updateCourseLoader ||
                          isMainLoading ||
                          isTranslationLoading
                        }
                        onClickHandler={async () => {
                          setActionName(ActionNameEnum.SUBMIT);
                          await submitForm();
                          if (!isValid) {
                            scrollToError(errors);
                            dispatch(
                              setToast({
                                variant: 'Error',
                                message: t(
                                  'ToastMessage.InCompleteFormToastMessage'
                                ),
                                type: 'error',
                                id: customRandomNumberGenerator(),
                              })
                            );
                          }
                        }}
                      >
                        {t('Button.submit')}
                      </Button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddEditForm;
