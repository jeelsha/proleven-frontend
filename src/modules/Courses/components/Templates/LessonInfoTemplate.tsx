// ** Components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import Map from 'components/GoogleMap';
import Image from 'components/Image';

// ** date-fns **
import { parseISO } from 'date-fns';

// ** Formik **
import { FieldArray, FieldArrayRenderProps } from 'formik';

// ** Enums **
import { Conference, CourseModeEnum } from 'modules/Courses/Constants';

// ** Helper Functions **
import { renderSessionConferenceButtons } from 'modules/Courses/components/Common';
import { getLessonModeList } from 'modules/Courses/helper/CourseCommon';
import {
  createEmptyLessonTemplateInfo,
  createEmptySessionTemplateInfo,
} from 'modules/Courses/helper/CourseTemplateHelper';

// ** Types **
import { Option } from 'components/FormElement/types';
import { LessonModeEnum } from 'modules/Courses/pages/Attendance/types';
import { LatLngType, TemplateCourseInitialValues } from 'modules/Courses/types';
import { TemplateSubComponentProps } from 'modules/Courses/types/TemplateBundle';

// ** Hooks **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Utils **
import { shouldDisableField } from 'utils';

const LessonInfoTemplate = ({
  values,
  setFieldValue,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  isMainLoading,
}: TemplateSubComponentProps) => {
  const { t } = useTranslation();

  // ** States
  const [isLessonCollapsed, setIsLessonCollapsed] = useState(true);
  const [latLng, setLatLng] = useState<Array<LatLngType>>(
    () =>
      values?.lesson?.reduce((latLngArray: Array<LatLngType>, lesson) => {
        latLngArray.push({
          lat: (lesson?.latitude ? lesson?.latitude : '0') as unknown as number,
          lng: (lesson?.longitude ? lesson?.longitude : '0') as unknown as number,
        });
        return latLngArray;
      }, []) || []
  );

  const handleAddLesson = (arrayHelpers: FieldArrayRenderProps) => {
    arrayHelpers.push({ ...createEmptyLessonTemplateInfo() });
  };

  const handleRemoveLesson = (
    arrayHelpers: FieldArrayRenderProps,
    index: number
  ) => {
    setLatLng((prev) => {
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
    arrayHelpers.remove(index);
  };

  const handleAddSession = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({ ...createEmptySessionTemplateInfo() });
  };

  const setLatLngAtIndex =
    (index: number) => (update: React.SetStateAction<LatLngType>) => {
      setLatLng((prev) => {
        const newLatLng = [...prev];
        const LatLngArray =
          typeof update === 'function' ? update(prev[index]) : update;
        newLatLng[index] = LatLngArray;
        return newLatLng;
      });
    };

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);

  const renderSession = (
    values: TemplateCourseInitialValues,
    sessionArrayHelpers: FieldArrayRenderProps,
    index: number
  ) => {
    return (
      <>
        <div className="flex justify-between mb-2">
          <p className="text-base text-dark font-semibold">
            {t('CoursesManagement.CreateCourse.sessions')}
          </p>
          <Button
            disabled={isDisabled('') || isMainLoading}
            onClickHandler={() => handleAddSession(sessionArrayHelpers)}
            variants="primary"
            className="w-10 h-10 !p-2 inline-block"
          >
            <Image iconClassName="w-full h-full" iconName="plusIcon" />
          </Button>
        </div>
        {(values?.lesson?.[index].session ?? []).map((item, ind) => {
          const startTime = item.start_time ? parseISO(item.start_time) : null;
          const endTime = item.end_time ? parseISO(item.end_time) : null;

          return (
            <div
              key={`Session_${ind + 1}`}
              className="py-5 px-2.5 bg-primaryLight rounded-xl"
            >
              <div className="flex justify-between">
                <p className="font-semibold text-sm text-dark mb-4">
                  {`${t('CoursesManagement.CreateCourse.session')} ${ind + 1}`}
                </p>
                {values.lesson?.[index]?.session?.length > 1 ? (
                  <Button
                    disabled={isDisabled('') || isMainLoading}
                    className="w-5 h-5 text-danger cursor-pointer"
                    onClickHandler={() => sessionArrayHelpers.remove(ind)}
                  >
                    <Image iconName="deleteIcon" iconClassName="w-full h-full" />
                  </Button>
                ) : (
                  ''
                )}
              </div>

              <DatePicker
                startDateName={`lesson[${index}].session[${ind}].start_time`}
                endDateName={`lesson[${index}].session[${ind}].end_time`}
                parentClass="flex-[1_0_0%]"
                label={t('CoursesManagement.CreateCourse.lessonTime')}
                isCompulsory
                range
                selectedDate={startTime}
                endingDate={endTime}
                onRangeChange={(startDate, endDate) => {
                  if (!setFieldValue) return;
                  if (startDate) {
                    setFieldValue(
                      `lesson[${index}].session[${ind}].start_time`,
                      startDate.toISOString()
                    );
                  }
                  if (endDate) {
                    const endTime =
                      startDate > endDate
                        ? new Date(startDate.getTime() + 60 * 60 * 1000)
                        : endDate;
                    setFieldValue(
                      `lesson[${index}].session[${ind}].end_time`,
                      endTime.toISOString()
                    );
                  }
                }}
                isTimePicker
                showTimeSelectOnly
                startDatePlaceholder={t('CoursesManagement.CreateCourse.startTime')}
                endDatePlaceholder={t('CoursesManagement.CreateCourse.endTime')}
                dateFormat="h:mm aa"
                disabled={isDisabled('start_time')}
                startDateMinTime={new Date(new Date().setHours(0, 0, 0))}
                endDateMinTime={
                  startTime
                    ? new Date(startTime.getTime() + 15 * 60 * 1000)
                    : undefined
                }
                endDateMaxTime={new Date(new Date().setHours(23, 59, 59))}
                isLoading={isMainLoading}
              />
              <div className="p-5 rounded-lg bg-primaryLight flex flex-col gap-y-2.5 border border-solid border-borderColor mt-3">
                <ReactSelect
                  className="bg-white rounded-lg"
                  isCompulsory
                  name={`lesson[${index}].session[${ind}].mode`}
                  options={getLessonModeList(
                    t,
                    item?.client_meeting_link ? [CourseModeEnum.InPerson] : []
                  )}
                  label={t('CoursesManagement.CreateCourse.sessionMode')}
                  placeholder={t(
                    'CoursesManagement.CreateCourse.lessonModePlaceHolder'
                  )}
                  onChange={(val) => {
                    setFieldValue?.(
                      `lesson[${index}].session[${ind}].mode`,
                      (val as Option).value
                    );
                    if (!item?.session_conference_provider)
                      setFieldValue?.(
                        `lesson[${index}].session[${ind}].session_conference_provider`,
                        Conference.ZOOM
                      );
                    if ((val as Option).value === CourseModeEnum.InPerson) {
                      setFieldValue?.(
                        `lesson[${index}].session[${ind}].session_conference_provider`,
                        null
                      );
                    }
                  }}
                  disabled={isDisabled('mode')}
                  isLoading={isMainLoading}
                />
                {item.mode === CourseModeEnum.VideoConference ||
                item.mode === CourseModeEnum.Hybrid ? (
                  <div className="flex flex-wrap gap-3">
                    {renderSessionConferenceButtons(
                      item,
                      index,
                      ind,
                      setFieldValue,
                      isDisabled('session_conference_provider') || !!isMainLoading
                    )}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  useEffect(() => {
    values?.lesson?.forEach((_, i) => {
      setFieldValue?.(`lesson[${i}].latitude`, latLng?.[i]?.lat?.toString());
      setFieldValue?.(`lesson[${i}].longitude`, latLng?.[i]?.lng?.toString());
    });
  }, [latLng]);

  return (
    <div className="bg-primaryLight rounded-xl">
      <div className="flex flex-wrap justify-between 1024:px-9 px-4 1024:py-8 py-5">
        <p className="text-xl leading-6 font-semibold text-dark">
          {t('CoursesManagement.CreateCourse.lesson')}
        </p>
        <Button
          onClickHandler={() => setIsLessonCollapsed((prev) => !prev)}
          className={`
            ${isLessonCollapsed ? 'rotate-90' : ''}
            ' w-7 h-7 cursor-pointer rounded-full border border-solid text-primary hover:bg-primary hover:text-white border-primary flex justify-center items-center p-1 transition-all duration-300'`}
        >
          <Image
            iconName="chevronRight"
            iconClassName="w-full h-full stroke-[2px]"
          />
        </Button>
      </div>

      <div
        className={`${
          isLessonCollapsed ? '' : 'hidden'
        } 1024:px-9 px-4 1024:pb-8 pb-5`}
      >
        <FieldArray
          name="lesson"
          render={(arrayHelpers) => (
            <>
              <CustomCard cardClass="!shadow-none  border border-solid border-borderColor">
                <>
                  {(values?.lesson ?? []).map((lesson, index) => {
                    const isAllVideoConference = (lesson.session ?? []).every(
                      (s) => s.mode === LessonModeEnum.VideoConference
                    );
                    return (
                      <div
                        className="flex flex-wrap border-b border-solid border-borderColor pb-6 mb-7 last:border-none last:pb-0 last:mb-0 lg:flex-row flex-col-reverse"
                        key={`Lesson_${index + 1}`}
                      >
                        <div className="w-full lg:max-w-[calc(100%_-_293px)] lg:pe-7 lg:pt-0 pt-7">
                          <div className="flex flex-col gap-y-2.5">
                            <InputField
                              placeholder={t(
                                'CoursesManagement.CreateCourse.lessonNamePlaceHolder'
                              )}
                              type="text"
                              isCompulsory
                              value={lesson.title}
                              label={t('CoursesManagement.CreateCourse.lesson')}
                              name={`lesson[${index}].title`}
                              isDisabled={isDisabled('title')}
                              isLoading={isMainLoading}
                            />

                            <InputField
                              placeholder={t(
                                'CoursesManagement.CreateCourse.lessonLinkPlaceHolder'
                              )}
                              type="text"
                              value={lesson.client_meeting_link ?? ''}
                              label={t('CoursesManagement.CreateCourse.lessonLink')}
                              name={`lesson[${index}].client_meeting_link`}
                              isDisabled={isDisabled('client_meeting_link')}
                              isLoading={isMainLoading}
                              onChange={(e) => {
                                setFieldValue?.(
                                  `lesson[${index}].client_meeting_link`,
                                  e.target.value
                                );
                                if (
                                  e.target.value &&
                                  !lesson?.mode &&
                                  lesson?.mode !== CourseModeEnum.VideoConference
                                ) {
                                  setFieldValue?.(
                                    `lesson[${index}].mode`,
                                    CourseModeEnum.VideoConference
                                  );
                                  if (!lesson?.conference_provider)
                                    setFieldValue?.(
                                      `lesson[${index}].conference_provider`,
                                      Conference.ZOOM
                                    );
                                }
                              }}
                            />

                            {values.lesson[index].mode !==
                              CourseModeEnum.VideoConference && (
                              <>
                                {isMainLoading ? (
                                  <div className="lazy h-12" />
                                ) : (
                                  <Map
                                    isCompulsory={!isAllVideoConference}
                                    key={`Map_${index + 1}`}
                                    setFieldValue={setFieldValue}
                                    setLatLng={setLatLngAtIndex(index)}
                                    name={`lesson[${index}].location`}
                                    center={{
                                      lng: Number(latLng?.[index]?.lng),
                                      lat: Number(latLng?.[index]?.lat),
                                    }}
                                    locationLabel={t(
                                      'Trainer.invoice.trainerLocation'
                                    )}
                                    locationValue={lesson?.location}
                                    isDisabled={
                                      isDisabled('location') || isMainLoading
                                    }
                                  />
                                )}
                              </>
                            )}

                            {values.lesson.length > 1 && (
                              <Button
                                disabled={isDisabled('') || isMainLoading}
                                variants="danger"
                                className="gap-1 mt-5 w-fit"
                                onClickHandler={() =>
                                  handleRemoveLesson(arrayHelpers, index)
                                }
                              >
                                <Image
                                  iconName="deleteIcon"
                                  iconClassName="w-6 h-6"
                                />
                                {t('CoursesManagement.CreateCourse.deleteLesson')}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="w-full lg:max-w-[293px]">
                          <div className="flex flex-col gap-y-2">
                            <FieldArray
                              name={`lesson[${index}].session`}
                              render={(sessionArrayHelpers) => {
                                return renderSession(
                                  values,
                                  sessionArrayHelpers,
                                  index
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              </CustomCard>
              <Button
                disabled={isDisabled('') || isMainLoading}
                className="w-fit gap-1 mt-5"
                variants="primary"
                onClickHandler={() => handleAddLesson(arrayHelpers)}
              >
                <Image iconName="plusSquareIcon" iconClassName="w-4 h-4" />
                {t('CoursesManagement.CreateCourse.addLesson')}
              </Button>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default LessonInfoTemplate;
