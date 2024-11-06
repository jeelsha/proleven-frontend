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

// ** Course Constants **
import {
  Conference,
  CourseModeEnum,
  TrainerSelected,
} from 'modules/Courses/Constants';
import { LessonModeEnum } from 'modules/Courses/pages/Attendance/types';

// ** Common Functions **
import { renderSessionConferenceButtons } from 'modules/Courses/components/Common';
import { createEmptyLesson, createEmptySession } from 'modules/Courses/helper';
import {
  getLessonModeList,
  resetTimeToMidnight,
} from 'modules/Courses/helper/CourseCommon';

// ** Types **
import { Option } from 'components/FormElement/types';
import {
  CourseInitialValues,
  CourseSubComponentProps,
  LatLngType,
} from 'modules/Courses/types';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Utils **
import _ from 'lodash';
import { shouldDisableField } from 'utils';

const LessonsInfo = ({
  values,
  setFieldValue,
  currentLanguage,
  defaultLanguage,
  fieldsToTranslate,
  isMainLoading,
  isUpdate,
  setLessonDates,
  setLessonTime,
  setIsMainLoading,
  lessonTrainers,
  setLessonTrainers,
  locations,
  setLocations,
}: CourseSubComponentProps) => {
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

  // ** APIs **
  const [getTrainers, { isLoading }] = useAxiosGet();

  // ** CONSTs
  const {
    category_id: categorySlug,
    main_trainers = [],
    optional_trainers = [],
    start_date,
    end_date,
  } = values?.course || {};
  const currentURL = new URL(window.location.href);
  const course_slug = currentURL.searchParams.get('slug');
  const [timeSlot, setTimeSlot] = useState<string[]>(() => {
    const timeOfSession: string[] = [];
    values.lesson.forEach((l) => {
      if (!_.isNull(l.session)) {
        l.session.forEach((s) => {
          if (s.start_time && s.end_time) {
            timeOfSession.push(
              `${l?.date?.toString().split('T')[0]} ${
                s.start_time.split('T')[1].split('.')[0]
              }=${l?.date?.toString().split('T')[0]} ${
                s.end_time.split('T')[1].split('.')[0]
              }`
            );
          }
        });
      }
    });
    return timeOfSession;
  });
  const mainTrainerSet = new Set((main_trainers ?? []).map((t) => t.assigned_to));
  const optionalTrainerSet = new Set(
    (optional_trainers ?? []).map((t) => t.assigned_to)
  );

  const getRemainingTrainerList = (index: number): Array<Option> => {
    const currentTrainerList = lessonTrainers?.[index];
    return (currentTrainerList ?? [])
      .filter(
        (trainer) =>
          !mainTrainerSet.has(trainer.id) && !optionalTrainerSet.has(trainer.id)
      )
      .map((t) => ({ label: t.name, value: t.id }));
  };

  const getDateWiseTrainer = async (dates: string, index: number) => {
    const { data, error } = await getTrainers('/trainer/with-filters', {
      params: {
        course_slug,
        dates,
        categorySlug,
        view: true,
        timeSlot: timeSlot.toString(),
      },
    });
    if (!error && Array.isArray(data))
      setLessonTrainers?.((prev) => {
        const prevArray = [...prev];
        prevArray[index] = (data as Array<Trainer>).filter(
          (t) => t.selected_status !== TrainerSelected.Unavailable
        );
        return prevArray;
      });
  };

  const handleAddLesson = (arrayHelpers: FieldArrayRenderProps) => {
    arrayHelpers.push({
      ...createEmptyLesson(),
    });
  };

  const handleAddSession = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({ ...createEmptySession() });
  };
  const [lessonDateTime, setLessonDateTime] = useState<Date | string>();
  const onDateChange = (index: number, date: Date) => {
    if (!setFieldValue) return;
    if (!date) {
      setFieldValue(`lesson[${index}].date`, null);
      return;
    }
    const currentDate = resetTimeToMidnight(date).toISOString();
    const isDateChanged = currentDate !== values?.lesson?.[index]?.date;
    setLessonDateTime(currentDate);
    setSessionTime(currentDate);
    // getDateWiseTrainer(currentDate, index);
    setFieldValue(`lesson[${index}].date`, currentDate);
    if (isUpdate) {
      values?.lesson?.[index]?.session?.forEach((_, ind) => {
        setFieldValue(`lesson[${index}].session[${ind}].assigned_to`, null);
      });
    }
    const datesArray = values?.lesson?.map((item, i) =>
      i === index ? currentDate : item?.date ?? ''
    );

    if (isDateChanged) setLessonDates?.(datesArray);
  };
  const [sessionTimeChangeState, setSessionTimeChangeState] = useState<string>('');
  function setSessionTime(currentDate: Date | string) {
    const timeOfSession: string[] = [];
    values.lesson.forEach((l) => {
      if (!_.isNull(l.session)) {
        l.session.forEach((s) => {
          if (s.start_time && s.end_time) {
            timeOfSession.push(
              `${currentDate?.toString().split('T')[0]} ${
                s.start_time.split('T')[1].split('.')[0]
              }=${currentDate?.toString().split('T')[0]} ${
                s.end_time.split('T')[1].split('.')[0]
              }`
            );
          }
        });
      }
    });
    setTimeSlot(timeOfSession);
    setLessonTime?.(timeOfSession);
  }
  useEffect(() => {
    const timeOfSession: string[] = [];
    values.lesson.forEach((l) => {
      if (!_.isNull(l.session)) {
        l.session.forEach((s) => {
          const sessionTime = lessonDateTime || l?.date;
          if (s.start_time && s.end_time) {
            timeOfSession.push(
              `${sessionTime?.toString().split('T')[0]} ${
                s.start_time.split('T')[1].split('.')[0]
              }=${sessionTime?.toString().split('T')[0]} ${
                s.end_time.split('T')[1].split('.')[0]
              }`
            );
          }
        });
      }
    });
    setTimeSlot(timeOfSession);
    setLessonTime?.(timeOfSession);
  }, [sessionTimeChangeState]);

  const handleRemoveLesson = (
    arrayHelpers: FieldArrayRenderProps,
    index: number,
    lessonDate: string | null | undefined
  ) => {
    if (lessonDate) {
      setLessonDates?.((prev) => [
        ...prev.slice(0, index),
        ...prev.slice(index + 1),
      ]);
    }
    setLatLng((prev) => {
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
    arrayHelpers.remove(index);
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
    values: CourseInitialValues,
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
        {values?.lesson?.[index].session?.map((item, ind) => {
          const startTime = item.start_time ? parseISO(item.start_time) : null;
          const endTime = item.end_time ? parseISO(item.end_time) : null;

          return (
            <div
              key={`session_${ind + 1}`}
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
                  if (!_.isUndefined(endDate) && !_.isUndefined(startDate)) {
                    setSessionTimeChangeState(
                      endDate.toISOString() + startDate.toISOString()
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

              <ReactSelect
                className="bg-white rounded-lg"
                parentClass="w-full mt-2.5"
                name={`lesson[${index}].session[${ind}].assigned_to`}
                options={getRemainingTrainerList(index)}
                label={t('CoursesManagement.CreateCourse.lessonTrainer')}
                placeholder={t('CoursesManagement.CreateCourse.trainerPlaceHolder')}
                disabled={isDisabled('assigned_to')}
                isLoading={isMainLoading}
                isClearable
              />
            </div>
          );
        })}
      </>
    );
  };

  useEffect(() => {
    setIsMainLoading?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const newLocations = values?.lesson?.map((l) => l.location);
    if (!_.isEqual(locations, newLocations))
      setLocations?.(values?.lesson?.map((l) => l.location));
  }, [values?.lesson]);

  useEffect(() => {
    const uniqueLocations = [...new Set(locations)];
    if (uniqueLocations.length !== 1) setFieldValue?.('course.academy_id', 0);
  }, [locations]);

  useEffect(() => {
    (values?.lesson ?? []).forEach((l, i) => {
      if (l.date) getDateWiseTrainer(l.date, i);
    });
  }, [lessonDateTime]);

  useEffect(() => {
    values?.lesson?.forEach((_, i) => {
      setFieldValue?.(`lesson[${i}].latitude`, latLng?.[i]?.lat?.toString());
      setFieldValue?.(`lesson[${i}].longitude`, latLng?.[i]?.lng?.toString());
    });
  }, [latLng]);

  return (
    <div className="bg-primaryLight rounded-xl relative">
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
              <CustomCard cardClass="!shadow-none border border-solid border-borderColor">
                <>
                  {(values?.lesson ?? []).map((lesson, index) => {
                    const isAllVideoConference = (lesson.session ?? []).every(
                      (s) => s.mode === LessonModeEnum.VideoConference
                    );
                    return (
                      <div
                        className="flex flex-wrap border-b border-solid border-borderColor pb-6 mb-7 last:border-none last:pb-0 last:mb-0 lg:flex-row flex-col-reverse"
                        key={`lesson_${index + 1}`}
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
                            <div className="p-5 rounded-lg bg-primaryLight flex flex-col gap-y-2.5 border border-solid border-borderColor">
                              <DatePicker
                                name={`lesson[${index}].date`}
                                label={t('CoursesManagement.CreateCourse.date')}
                                isCompulsory
                                icon
                                selectedDate={
                                  lesson?.date ? parseISO(lesson.date) : null
                                }
                                onChange={(date) => onDateChange(index, date)}
                                placeholder={t(
                                  'CoursesManagement.CreateCourse.datePlaceHolder'
                                )}
                                isLoading={isMainLoading}
                                minDate={
                                  start_date ? parseISO(start_date) : undefined
                                }
                                maxDate={end_date ? parseISO(end_date) : undefined}
                                disabled={
                                  !start_date || !end_date || isDisabled('date')
                                }
                              />
                            </div>

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
                                  handleRemoveLesson(
                                    arrayHelpers,
                                    index,
                                    lesson?.date
                                  )
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
                              render={(sessionArrayHelpers) =>
                                renderSession(values, sessionArrayHelpers, index)
                              }
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

export default LessonsInfo;
