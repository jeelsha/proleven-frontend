// ** Components **
import DatePicker from 'components/FormElement/datePicker';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';

// ** Hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// ** Constants **
import { TrainerSelected } from 'modules/Courses/Constants';

// ** Types **
import { Option } from 'components/FormElement/types';
import { IAcademy, SetFieldValue } from 'modules/Courses/types';
import {
  CourseBundleInterface,
  CourseData,
} from 'modules/Courses/types/TemplateBundle';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';

// ** date-fns **
import { addDays, differenceInDays, parseISO } from 'date-fns';

// ** Helper **
import {
  giveTimeSlotString,
  resetTimeToMidnight,
} from 'modules/Courses/helper/CourseCommon';

type CoursesDataProps = {
  values: CourseBundleInterface;
  courses: Array<CourseData> | undefined;
  setLessonDates: React.Dispatch<React.SetStateAction<Array<string>>>;
  lessonTrainers: Array<Trainer[]>;
  setLessonTrainers: React.Dispatch<React.SetStateAction<Array<Trainer[]>>>;
  setFieldValue: SetFieldValue;
  isLoading?: boolean;
  bundleSlug?: string | null;
  setTrainerTimeSlot?: React.Dispatch<React.SetStateAction<Array<string>>>;
};
const CoursesData = ({
  values,
  courses,
  lessonTrainers,
  setLessonDates,
  setLessonTrainers,
  setFieldValue,
  isLoading,
  bundleSlug,
  setTrainerTimeSlot,
}: CoursesDataProps) => {
  const { t } = useTranslation();

  // ** APIs **
  const [getTrainers, { isLoading: isTrainerLoading }] = useAxiosGet();
  // ** Academy dropdown
  const { response: academies, isLoading: academyLoading } = useQueryGetFunction(
    '/academy',
    { option: { dropdownParent: true } }
  );

  // ** CONSTs
  const {
    courses: coursesData,
    bundle: { start_date, end_date, academy_id, title },
    other: { main_trainers, optional_trainers },
  } = values;
  const mainTrainerSet = new Set((main_trainers ?? []).map((t) => t.assigned_to));
  const optionalTrainerSet = new Set(
    (optional_trainers ?? []).map((t) => t.assigned_to)
  );

  const handleTimeSlot = (
    dates: string,
    courseIndex: number,
    lessonIndex: number
  ) => {
    const timeSlots: string[] = values?.courses?.flatMap((c, cIndex) =>
      c?.lesson?.flatMap((l, lIndex) =>
        l?.session?.map((s) => {
          if (lIndex === lessonIndex && cIndex === courseIndex) {
            if (s?.start_time && s?.end_time) {
              getDateWiseTrainer(
                dates,
                c?.course?.slug,
                lIndex,
                giveTimeSlotString(dates, s?.start_time, s?.end_time)
              );
              return giveTimeSlotString(dates, s?.start_time, s?.end_time);
            }
          }
          return giveTimeSlotString(l?.date, s?.start_time, s?.end_time);
        })
      )
    );

    setTrainerTimeSlot?.(timeSlots);
  };

  const academyList: Option[] = [];
  const academyAddresses: Array<Record<string, string | number>> = [];
  if (Array.isArray(academies?.data?.data) && academies?.data?.data.length > 0) {
    academies?.data?.data.forEach((academy: IAcademy) => {
      academyAddresses.push({
        academy_id: academy.id,
        academy_address: academy.location ?? '',
      });
      academyList.push({ label: academy.name, value: academy.id });
    });
  }

  const isFormLoading = isLoading || isTrainerLoading || academyLoading;
  const getRemainingTrainerList = (index: number) => {
    const currentTrainerList = lessonTrainers?.[index];
    return (currentTrainerList ?? [])
      .filter(
        (trainer) =>
          !mainTrainerSet.has(trainer.id) && !optionalTrainerSet.has(trainer.id)
      )
      .map((t) => ({ label: t.name, value: t.id }));
  };

  const getDateWiseTrainer = async (
    dates: string,
    course_slug: string,
    index: number,
    currentTimeSlot?: string
  ) => {
    const { data, error } = await getTrainers('/trainer/with-filters', {
      params: {
        course_bundle_slug: bundleSlug,
        course_slug,
        dates,
        view: true,
        timeSlot: currentTimeSlot,
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

  const handleAcademyChange = (val: string | number) => {
    if (setFieldValue) {
      const foundAddress = academyAddresses.find(
        (address) => address.academy_id === val
      );
      const updatedCourses = values?.courses?.map((course) => ({
        ...course,
        lesson: course?.lesson?.map((lesson) => ({
          ...lesson,
          location: foundAddress?.academy_address?.toString(),
        })),
      }));
      setFieldValue('courses', updatedCourses);
      setFieldValue(`bundle.academy_id`, val);
    }
  };

  const handleDateChange = (
    courseIndex: number,
    lessonIndex: number,
    date: Date
  ) => {
    if (!setFieldValue) return;
    if (!date) {
      setFieldValue(`courses[${courseIndex}].lesson[${lessonIndex}].date`, null);
      return;
    }
    const currentDate = resetTimeToMidnight(date).toISOString();
    const isDateChanged =
      currentDate !== values?.courses?.[courseIndex]?.lesson?.[lessonIndex]?.date;
    setFieldValue(
      `courses[${courseIndex}].lesson[${lessonIndex}].date`,
      currentDate
    );
    handleTimeSlot(currentDate, courseIndex, lessonIndex);

    const datesArray = (values?.courses ?? []).flatMap((course, ci) => {
      return (course?.lesson ?? []).map((lesson, li) => {
        if (ci === courseIndex && li === lessonIndex) {
          return currentDate;
        }
        return lesson?.date;
      });
    });

    if (isDateChanged) setLessonDates?.(datesArray);
  };

  const handleSessionChange = (
    courseIndex: number,
    lessonIndex: number,
    sessionIndex: number,
    startTime: string,
    endTime: string
  ) => {
    if (!setFieldValue) return;

    if (!startTime) {
      setFieldValue(
        `courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].start_time`,
        null
      );
      return;
    }
    if (!endTime) {
      setFieldValue(
        `courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].end_time`,
        null
      );
      return;
    }

    const isStartChanged =
      startTime !==
      values?.courses?.[courseIndex]?.lesson?.[lessonIndex]?.session?.[sessionIndex]
        ?.start_time;

    const isEndChanged =
      endTime !==
      values?.courses?.[courseIndex]?.lesson?.[lessonIndex]?.session?.[sessionIndex]
        ?.end_time;

    const lesson = coursesData?.[courseIndex]?.lesson?.[lessonIndex];

    setFieldValue(
      `courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].start_time`,
      startTime
    );

    setFieldValue(
      `courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].end_time`,
      endTime
    );

    const timeSlot = (values?.courses ?? []).flatMap((c, ci) => {
      return (c?.lesson ?? []).flatMap((l, li) =>
        (l?.session ?? []).map((s, si) => {
          if (
            li === lessonIndex &&
            ci === courseIndex &&
            si === sessionIndex &&
            l?.date
          ) {
            return giveTimeSlotString(l?.date, startTime, endTime);
          }

          return giveTimeSlotString(l?.date, s?.start_time, s?.end_time);
        })
      );
    });

    if ((isStartChanged || isEndChanged) && lesson?.date)
      setTrainerTimeSlot?.(timeSlot);

    const session =
      coursesData?.[courseIndex]?.lesson?.[lessonIndex]?.session?.[sessionIndex];
    if (lesson?.date) {
      getDateWiseTrainer(
        coursesData?.[courseIndex].lesson[lessonIndex].date,
        coursesData?.[courseIndex]?.course?.slug,
        lessonIndex,
        giveTimeSlotString(lesson?.date, session?.start_time, session?.end_time)
      );
    }
  };

  const renderSession = (
    courseIndex: number,
    lessonIndex: number,
    sessionIndex: number,
    sessionStartTime?: Date,
    sessionEndTime?: Date
  ) => {
    return (
      <div
        className="border border-solid border-borderColor rounded-xl bg-white p-4"
        key={`session_${sessionIndex + 1}`}
      >
        <p className="text-base font-medium mb-2">
          {t('CoursesManagement.CreateCourse.session')}
          {sessionIndex + 1}
        </p>

        <DatePicker
          startDateName={`courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].start_time`}
          endDateName={`courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].end_time`}
          parentClass="flex-[1_0_0%]"
          label={t('CoursesManagement.CreateCourse.lessonTime')}
          isCompulsory
          range
          selectedDate={sessionStartTime ?? null}
          endingDate={sessionEndTime ?? null}
          onRangeChange={(startDate, endDate) => {
            const endTime =
              startDate > endDate
                ? new Date(startDate.getTime() + 60 * 60 * 1000)
                : endDate;
            handleSessionChange(
              courseIndex,
              lessonIndex,
              sessionIndex,
              startDate.toISOString(),
              endTime.toISOString()
            );
          }}
          isTimePicker
          showTimeSelectOnly
          startDatePlaceholder={t('CoursesManagement.CreateCourse.startTime')}
          endDatePlaceholder={t('CoursesManagement.CreateCourse.endTime')}
          dateFormat="h:mm aa"
          startDateMinTime={new Date(new Date().setHours(0, 0, 0))}
          endDateMinTime={
            sessionStartTime
              ? new Date(sessionStartTime.getTime() + 1 * 60 * 60 * 1000)
              : undefined
          }
          endDateMaxTime={new Date(new Date().setHours(23, 59, 59))}
          isLoading={isFormLoading}
        />

        <ReactSelect
          className="bg-white rounded-lg"
          parentClass="w-full"
          name={`courses[${courseIndex}].lesson[${lessonIndex}].session[${sessionIndex}].assigned_to`}
          options={getRemainingTrainerList(lessonIndex)}
          label={t('CourseBundle.trainer.extraTrainer')}
          placeholder={t('CourseBundle.trainer.selectExtraTrainer')}
          isClearable
          isLoading={isFormLoading}
        />
      </div>
    );
  };

  useEffect(() => {
    (coursesData ?? []).forEach((c, ci) =>
      c.lesson?.forEach((l, i) => {
        if (l.date) {
          l?.session?.forEach((s) => {
            getDateWiseTrainer(
              l.date,
              coursesData?.[ci]?.course?.slug,
              i,
              giveTimeSlotString(l?.date, s?.start_time, s?.end_time)
            );
          });
        }
      })
    );
  }, [coursesData?.length]);
  return (
    <>
      {/* *************************   DATE   ************************* */}
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Title"
          name="bundle.title"
          placeholder={t('CourseBundle.title')}
          value={title}
          type="text"
          onChange={(e) => {
            setFieldValue('bundle.title', (e.target as HTMLInputElement).value);
          }}
          isCompulsory
          isLoading={isLoading}
        />
        <DatePicker
          name="bundle.start_date"
          placeholder={t('CourseBundle.selectStartDate')}
          label={t('CourseBundle.startDate')}
          isCompulsory
          icon
          selectedDate={start_date ? parseISO(start_date) : null}
          onChange={(date) => {
            if (!setFieldValue) return;
            const startDate = start_date ? parseISO(start_date) : undefined;
            const endDate = end_date ? parseISO(end_date) : undefined;

            const courseStartDate = date
              ? resetTimeToMidnight(date).toISOString()
              : null;
            setFieldValue('bundle.start_date', courseStartDate);
            if (startDate && endDate && date > endDate) {
              const daysToAdd = Math.max(differenceInDays(endDate, startDate), 1);
              const newDate = addDays(date, daysToAdd);
              setFieldValue(
                'bundle.end_date',
                resetTimeToMidnight(newDate).toISOString()
              );
            }
          }}
          minDate={new Date()}
          isLoading={isLoading}
        />
        <DatePicker
          name="bundle.end_date"
          placeholder={t('CourseBundle.selectEndDate')}
          label={t('CourseBundle.endDate')}
          isCompulsory
          icon
          selectedDate={end_date ? parseISO(end_date) : null}
          onChange={(date) =>
            setFieldValue(
              'bundle.end_date',
              date ? resetTimeToMidnight(date).toISOString() : null
            )
          }
          minDate={start_date ? parseISO(start_date) : undefined}
          isLoading={isLoading}
        />
        <ReactSelect
          parentClass="flex-[1_0_0%]"
          className="bg-white rounded-lg"
          isMulti={false}
          name="bundle.academy_id"
          options={academyList}
          label={t('CoursesManagement.CreateCourse.academy')}
          placeholder={t('CoursesManagement.CreateCourse.selectAcademy')}
          selectedValue={academy_id ?? undefined}
          onChange={(value) => handleAcademyChange((value as Option)?.value)}
          isLoading={isFormLoading}
          isCompulsory
        />
      </div>
      {/* *************************   DATE   ************************* */}

      {(courses ?? []).map((course, courseIndex) => {
        return (
          <div
            key={course.id}
            className="bg-primaryLight p-5 rounded-lg flex flex-col gap-4 mt-4"
          >
            <p className="text-lg leading-6 font-semibold">
              {course?.title} [ {course?.code} ]
            </p>

            {(course?.lessons ?? []).map((lessonItem, lessonIndex) => (
              <div
                className="flex flex-col gap-y-4 border border-solid border-borderColor p-4 rounded-xl bg-white"
                key={`lesson_${lessonIndex + 1}`}
              >
                <div className="flex flex-col">
                  <p className="text-base font-medium mb-2">
                    {t('CourseBundle.lesson')} {lessonIndex + 1}
                  </p>
                  <DatePicker
                    name={`courses[${courseIndex}].lesson[${lessonIndex}].date`}
                    label={t('CoursesManagement.CreateCourse.date')}
                    placeholder={t('CourseBundle.selectDate')}
                    isCompulsory
                    icon
                    selectedDate={
                      values?.courses?.[courseIndex]?.lesson?.[lessonIndex]?.date
                        ? parseISO(
                            values?.courses?.[courseIndex]?.lesson?.[lessonIndex]
                              ?.date
                          )
                        : undefined
                    }
                    onChange={(date) =>
                      handleDateChange(courseIndex, lessonIndex, date)
                    }
                    minDate={
                      values.bundle.start_date
                        ? parseISO(values.bundle.start_date)
                        : undefined
                    }
                    maxDate={
                      values.bundle.end_date
                        ? parseISO(values.bundle.end_date)
                        : undefined
                    }
                    disabled={!(!!start_date && !!end_date)}
                    isLoading={isFormLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {lessonItem.lesson_sessions.map((_sessionItem, sessionIndex) => {
                    const sessionStartTime =
                      values?.courses?.[courseIndex]?.lesson?.[lessonIndex]
                        ?.session?.[sessionIndex]?.start_time;
                    const sessionEndTime =
                      values?.courses?.[courseIndex]?.lesson?.[lessonIndex]
                        ?.session?.[sessionIndex]?.end_time;
                    return renderSession(
                      courseIndex,
                      lessonIndex,
                      sessionIndex,
                      sessionStartTime ? parseISO(sessionStartTime) : undefined,
                      sessionEndTime ? parseISO(sessionEndTime) : undefined
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

export default CoursesData;
