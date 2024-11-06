// ** Components **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import DropZone from 'components/FormElement/DropZoneField';
import ResourcesInfo from 'modules/Courses/components/ResourcesInfo';
import CourseInfoTemplate from 'modules/Courses/components/Templates/CourseInfoTemplate';
import LessonInfoTemplate from 'modules/Courses/components/Templates/LessonInfoTemplate';

// ** Enums **
import { EnumFileType } from 'components/FormElement/enum';

// ** Date utilities **
import { parseISO } from 'date-fns';

// ** Formik **
import { Form, Formik, FormikErrors, FormikProps, FormikValues } from 'formik';

// ** Hooks **
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ** Slices
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** Constants **
import {
  ActionNameEnum,
  CourseModeEnum,
  FileAcceptType,
  FundedBy,
} from 'modules/Courses/Constants';

// ** Components specific to Courses module **
import CertificateInfo from 'modules/Courses/components/CertificateInfo';
import ExamInfoTemplate from 'modules/Courses/components/Templates/ExamInfoTemplate';

// ** Helper functions and utilities **
import {
  createEmptyQuestion,
  scrollFormToTop,
} from 'modules/Courses/helper/CourseCommon';
import {
  removeIdFromTemplateCourse,
  setCurrentFormData,
  setNextFormData,
  setSubmitFormData,
  sortLanguages,
  updateInitialValues,
} from 'modules/Courses/helper/CourseTemplateHelper';
import {
  customRandomNumberGenerator,
  getObjectKey,
  shouldDisableField,
} from 'utils';
import { convertDateToUTCISOString } from 'utils/date';

// ** Types **
import {
  InitTemplateCourseType,
  Lesson,
  TemplateCourse,
  TemplateCourseInitialValues,
} from 'modules/Courses/types';

// ** Validation Schema **
import { CourseTemplateSchema } from 'modules/Courses/validation/CourseTemplateSchema';

type TemplateFormType = {
  formData: {
    [key: string]: TemplateCourseInitialValues;
  };
  setInitialValues: React.Dispatch<
    React.SetStateAction<{
      [key: string]: TemplateCourseInitialValues;
    }>
  >;
  activeLanguage: number;
  setActiveLanguage: React.Dispatch<React.SetStateAction<number>>;
  formLanguage: string;
  setFormLanguage: React.Dispatch<React.SetStateAction<string>>;
  isUpdate?: boolean;
};

const CourseTemplateForm = ({
  formData,
  setInitialValues,
  activeLanguage,
  setActiveLanguage,
  formLanguage,
  setFormLanguage,
  isUpdate,
}: TemplateFormType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { defaultLanguage, allLanguages } = useSelector(useLanguage);

  const formikRef = useRef<FormikProps<FormikValues>>();

  const DEFAULT_LANGUAGE = (allLanguages ?? []).find(
    (item) => item.short_name === defaultLanguage
  )?.name;
  const formLanguages = [...(allLanguages ?? [])]
    .sort(sortLanguages)
    ?.map((lang) => lang.name);
  const formLanguagesShortName = [...(allLanguages ?? [])]
    .sort(sortLanguages)
    ?.map((lang) => lang.short_name);

  const currentFormLanguage = formLanguages[activeLanguage] || '';
  const nextFormLanguage = formLanguages[activeLanguage + 1] || '';
  const prevFormLanguage = formLanguages[activeLanguage - 1] || '';
  const fieldsToDelete = [
    'courseCategory',
    'courseSubCategory',
    'creator_role',
    'creator_first_name',
    'creator_last_name',
    'training_specialist',
    'createdByUser',
    'lessonApproval',
    'description',
    'created_at',
    'assigned_to',
    'certificate_pdf_link',
    'course_bundle_id',
    'access',
    'isErrorInResource',
    'end_date',
    'course_resources',
  ];

  const [actionName, setActionName] = useState<string | null>(ActionNameEnum.NEXT);
  const [isMainLoading, setIsMainLoading] = useState<boolean>(false);

  const fieldsToTranslate = [
    'title',
    'question',
    'answer',
    'correct_answer',
    'content',
    'topic',
  ];
  const [callTranslate, { isLoading: isTranslationLoading }] = useAxiosPost();
  const [createCourseApi, { isLoading: addCourseLoader }] = useAxiosPost();
  const [updateCourseApi, { isLoading: updateCourseLoader }] = useAxiosPut();
  const languageChange = (value: string) => {
    const currLang = (allLanguages ?? []).find(
      (item) => item.name === value
    )?.short_name;
    if (currLang) setFormLanguage(currLang);
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
        session.session_conference_provider = sessionValueValidator(
          session?.session_conference_provider
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

  const createFormData = (values: TemplateCourseInitialValues) => {
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
    values: TemplateCourseInitialValues,
    updatedValues: TemplateCourseInitialValues
  ) => {
    if (typeof values.course_image === 'string') {
      delete updatedValues.course_image;
      updatedValues.course.image = values.course_image;
    }
  };
  const removeFieldsFromUpdatedValues = (
    values: TemplateCourseInitialValues,
    updatedValues: TemplateCourseInitialValues
  ) => {
    fieldsToDelete.forEach((field) => {
      if (Object.hasOwn(values.course, field)) {
        delete updatedValues.course[field as keyof TemplateCourse];
      }
    });
    if (!values.course.academy_id || values.course.academy_id === 0)
      delete updatedValues.course.academy_id;
    if (!values.course.has_exam) delete updatedValues.exam;

    if (values.course.description === '') delete updatedValues.course.description;

    if (values.course.reject_reason === '') {
      delete updatedValues.course.reject_reason;
    }
    if (!values?.course?.sub_category_id) {
      updatedValues.course.sub_category_id = null;
    }
    if (values?.course?.is_external_certificate) {
      delete updatedValues.course.certificate_title;
      delete updatedValues.course.certificate_template_id;
    }
  };

  const OnNext = async (values: TemplateCourseInitialValues) => {
    const DEFAULT_LANGUAGE_DATA = DEFAULT_LANGUAGE
      ? formData[DEFAULT_LANGUAGE]
      : null;

    values.course.mode = findMaxEndTime(values.lesson);

    if (String(values.course.founded) === 'false') {
      values.course.funded_by = FundedBy.NAN;
    }
    values.course.language = currentFormLanguage;

    const updatedValues: TemplateCourseInitialValues = updateInitialValues(
      values,
      currentFormLanguage,
      DEFAULT_LANGUAGE,
      DEFAULT_LANGUAGE_DATA
    );
    removeFieldsFromUpdatedValues(values, updatedValues);
    handleImageAndPdfLink(values, updatedValues);

    const apiFunction =
      formData[nextFormLanguage]?.course.id || updatedValues.course.id
        ? updateCourseApi
        : createCourseApi;
    const formsData = createFormData(updatedValues);
    const { data, error } = await apiFunction('/course', formsData);
    if (!error) {
      let translatedValues = updatedValues;
      if (!formData[nextFormLanguage]?.course.id) {
        const { data: translatedData, error: translationError } =
          await callTranslate('/translation', {
            translateObj: values,
            language: formLanguagesShortName[activeLanguage + 1],
            fieldToConvert: fieldsToTranslate,
          });
        if (!translationError) translatedValues = translatedData;
      }

      scrollFormToTop();
      const nextFormData =
        formData[nextFormLanguage]?.course.id || updatedValues.course.id
          ? formData[nextFormLanguage]
          : translatedValues;

      if (nextFormData?.exam && (nextFormData?.exam?.questions ?? []).length <= 0)
        translatedValues = {
          ...translatedValues,
          exam: removeIdFromTemplateCourse(translatedValues)?.exam,
        };
      setInitialValues((prev: InitTemplateCourseType) => ({
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
                  values,
                  formData,
                  data,
                  translatedValues,
                  nextFormLanguage,
                  DEFAULT_LANGUAGE_DATA
                ),
              }
            : {
                ...setNextFormData(
                  removeIdFromTemplateCourse(values),
                  values,
                  formData,
                  data,
                  removeIdFromTemplateCourse(translatedValues),
                  nextFormLanguage,
                  DEFAULT_LANGUAGE_DATA
                ),
              }),
        },
      }));
      languageChange(nextFormLanguage);
      setActiveLanguage(activeLanguage + 1);
    }
  };

  const OnPrev = (values: TemplateCourseInitialValues) => {
    languageChange(prevFormLanguage);
    (formData[prevFormLanguage].exam?.questions ?? []).forEach((question) => {
      question.answers?.forEach((answer) => {
        if (answer.is_correct) question.correct_answer = answer.answer;
      });
    });
    setInitialValues((prev: InitTemplateCourseType) => ({
      ...prev,
      [currentFormLanguage]: { ...values },
    }));
    setActiveLanguage(activeLanguage - 1);
    scrollFormToTop();
  };

  const handleSubmit = async (values: TemplateCourseInitialValues) => {
    const updatedValues: TemplateCourseInitialValues = setSubmitFormData(
      values,
      formData,
      currentFormLanguage,
      prevFormLanguage,
      DEFAULT_LANGUAGE
    );
    handleImageAndPdfLink(values, updatedValues);
    removeFieldsFromUpdatedValues(values, updatedValues);

    const apiFunction = values.course?.id ? updateCourseApi : createCourseApi;
    const formsData = createFormData(updatedValues);
    const { error } = await apiFunction('/course', formsData);
    if (!error) {
      navigate('/course/templates');
    }
  };

  const onSubmit = (values: TemplateCourseInitialValues) => {
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

  const scrollToError = (errors: FormikErrors<TemplateCourseInitialValues>) => {
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

  const getUpdatedValues = (
    values: TemplateCourseInitialValues
  ): TemplateCourseInitialValues => {
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
      validationSchema={CourseTemplateSchema()}
      onSubmit={onSubmit}
      enableReinitialize
      innerRef={
        formikRef as unknown as React.Ref<FormikProps<TemplateCourseInitialValues>>
      }
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
            <div className="flex flex-wrap mt-10 1500:flex-row flex-col">
              <div className="max-w-[420px] w-full">
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
              <div className="1500:max-w-[calc(100%_-_420px)] w-full 1500:ps-7 1500:pt-0 pt-7 ">
                <div className="flex flex-col gap-y-7">
                  <CourseInfoTemplate
                    formLanguage={formLanguage}
                    setIsMainLoading={setIsMainLoading}
                    values={values}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    setFieldValue={setFieldValue}
                    isUpdate={isUpdate}
                    isMainLoading={isMainLoading}
                  />
                  <ResourcesInfo
                    main_resources={values.course?.main_resources ?? []}
                    optional_resources={values.course?.optional_resources ?? []}
                    setFieldValue={setFieldValue}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    isTemplate
                    parentObjectName="course"
                    isLoading={isMainLoading}
                  />

                  <LessonInfoTemplate
                    values={values}
                    setFieldValue={setFieldValue}
                    fieldsToTranslate={fieldsToTranslate}
                    currentLanguage={currentFormLanguage}
                    defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                    setIsMainLoading={setIsMainLoading}
                    isMainLoading={isMainLoading}
                  />

                  <div className="">
                    <label className="text-sm text-black leading-4 inline-block mb-2">
                      {t('CoursesManagement.CreateCourse.other')}
                    </label>
                    <div className="flex gap-4">
                      <Checkbox
                        labelClass="cursor-pointer"
                        name="course.has_exam"
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
                        id="courseExam"
                        disabled={shouldDisableField(
                          'has_exam',
                          fieldsToTranslate,
                          currentFormLanguage,
                          DEFAULT_LANGUAGE ?? ''
                        )}
                        isLoading={isMainLoading}
                      />
                      <Checkbox
                        labelClass="cursor-pointer"
                        name="course.need_digital_attendance_sheet"
                        id="courseDigitalAttendanceSheet"
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
                    <ExamInfoTemplate
                      values={values}
                      fieldsToTranslate={fieldsToTranslate}
                      currentLanguage={currentFormLanguage}
                      defaultLanguage={DEFAULT_LANGUAGE ?? ''}
                      setIsMainLoading={setIsMainLoading}
                      isMainLoading={isMainLoading}
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
                      is_external_certificate={values.course.is_external_certificate}
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
                              scrollToError(errors);
                            }
                          }}
                          disabled={
                            addCourseLoader ||
                            updateCourseLoader ||
                            isMainLoading ||
                            isTranslationLoading
                          }
                          isLoading={
                            addCourseLoader ||
                            isTranslationLoading ||
                            updateCourseLoader
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

export default CourseTemplateForm;
