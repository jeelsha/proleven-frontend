// ** Components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import CoursesData from 'modules/Courses/components/CourseBundle/CoursesData';
import TrainerInfo from 'modules/Courses/components/CourseBundle/TrainerInfo';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** Formik **
import { Form, Formik } from 'formik';

// ** Hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// ** Types **
import { ICourseResource } from 'modules/Courses/types';
import {
  CourseBundleInterface,
  CoursesSchema,
  SavedCourseBundle,
} from 'modules/Courses/types/TemplateBundle';
import { Trainer } from 'modules/Courses/types/TrainersAndRooms';

// ** Validation schema **
import { CourseBundleSchema } from 'modules/Courses/validation/CourseBundleSchema';

// ** Helper
import {
  giveTimeSlotString,
  mergeDateAndTime,
  resetTimeToMidnight,
} from 'modules/Courses/helper/CourseCommon';

// ** date-fns
import { parseISO } from 'date-fns';

// ** Styles
import 'modules/Courses/style/index.css';

const emptyResource = [
  { resource_id: '', quantity: '' },
] as unknown as ICourseResource[];

const convertToCourseBundleInterface = (
  savedCourseBundle: SavedCourseBundle
): CourseBundleInterface => {
  return {
    courses: savedCourseBundle.courses.map((courseData) => ({
      course: {
        slug: courseData.slug,
        start_date: '',
        end_date: '',
        academy_id: courseData?.academy_id,
      },
      lesson: courseData.lessons.map((lesson) => ({
        date: lesson.date,
        location: lesson.location ?? '',
        session: lesson.lesson_sessions.map((lessonSession) => ({
          slug: lessonSession.slug,
          assigned_to: lessonSession.assigned_to,
          start_time: lessonSession.start_time,
          end_time: lessonSession.end_time,
        })),
        slug: lesson.slug,
      })),
    })),
    bundle: {
      id: savedCourseBundle.id,
      slug: savedCourseBundle.slug,
      title: savedCourseBundle.title,
      start_date: savedCourseBundle?.start_date ?? null,
      end_date: savedCourseBundle?.end_date ?? null,
      academy_id: savedCourseBundle?.academy_id ?? null,
    },
    other: {
      main_resources: (savedCourseBundle.main_resources ?? []).length
        ? savedCourseBundle.main_resources.map((item) => ({
            ...(item as unknown as ICourseResource),
          }))
        : emptyResource,
      optional_trainers: savedCourseBundle.optional_trainers,
      main_rooms: savedCourseBundle.main_rooms,
      optional_rooms: savedCourseBundle.optional_rooms,
      main_trainers: savedCourseBundle.main_trainers,
      optional_resources: (savedCourseBundle.optional_resources ?? []).length
        ? savedCourseBundle.optional_resources.map((item) => ({
            ...(item as unknown as ICourseResource),
          }))
        : emptyResource,
      isErrorInResource: false,
      isErrorInRoom: false,
      isErrorInTrainer: false,
    },
  };
};

const extractLessonDates = (courses: Array<CoursesSchema>): Array<string> => {
  return (courses ?? []).flatMap(
    (course) =>
      (course?.lesson ?? []).reduce((dates: Array<string>, lesson) => {
        dates.push(lesson?.date ?? '');
        return dates;
      }, []) || []
  );
};
const extractTimeSlot = (courses: Array<CoursesSchema>) => {
  return courses?.flatMap((c) =>
    c?.lesson?.flatMap((l) =>
      l?.session?.map((s) => giveTimeSlotString(l?.date, s?.start_time, s?.end_time))
    )
  );
};
const AddCourseBundle = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentURL = new URL(window.location.href);
  const bundleSlug = currentURL.searchParams.get('bundle');

  // ** States
  const [coursesData, setCoursesData] = useState<SavedCourseBundle>();
  const [initialValues, setInitialValues] = useState<CourseBundleInterface>({
    courses: [],
    bundle: {
      start_date: null,
      end_date: null,
      title: '',
      academy_id: null,
    },
    other: {
      main_resources: emptyResource,
      optional_trainers: [],
      main_rooms: [],
      optional_rooms: [],
      main_trainers: [],
      optional_resources: emptyResource,
    },
  });
  const [lessonDates, setLessonDates] = useState<string[]>(() =>
    extractLessonDates(initialValues?.courses)
  );
  const [trainerTimeSlot, setTrainerTimeSlot] = useState<Array<string>>(() =>
    extractTimeSlot(initialValues?.courses)
  );
  const [lessonTrainers, setLessonTrainers] = useState<Array<Trainer[]>>([]);
  // ** APIs
  const [getCourseApi, { isLoading: isLoadingCourse }] = useAxiosGet();
  const [addCourseBundle, { isLoading }] = useAxiosPost();

  const fetchCourses = async () => {
    const { data } = await getCourseApi('/course/bundle/used', {
      params: { bundle_slug: bundleSlug, editView: true },
    });
    setCoursesData(data?.data?.[0]);
  };

  const initialData = coursesData
    ? convertToCourseBundleInterface(coursesData)
    : initialValues;

  const processCourse = (
    coursesItem: CoursesSchema,
    index: number,
    academy_id: number | null
  ) => {
    const dates = (coursesItem?.lesson ?? []).map((lesson) => parseISO(lesson.date));
    const startDate = dates.reduce(
      (minDate, currentDate) => (currentDate < minDate ? currentDate : minDate),
      dates[0]
    );
    const endDate = dates.reduce(
      (maxDate, currentDate) => (currentDate > maxDate ? currentDate : maxDate),
      dates[0]
    );

    return {
      ...coursesItem,
      course: {
        slug: coursesData?.courses?.[index]?.slug,
        start_date: resetTimeToMidnight(startDate)?.toISOString(),
        end_date: resetTimeToMidnight(endDate)?.toISOString(),
        academy_id,
      },
      lesson: (coursesItem.lesson ?? []).map((lessonItem, lessonIndex) => {
        return {
          ...lessonItem,
          slug: coursesData?.courses?.[index]?.lessons?.[lessonIndex]?.slug,
          session: (lessonItem.session ?? []).map((sessionItem, sessionIndex) => {
            return {
              ...sessionItem,
              start_time: mergeDateAndTime(
                lessonItem?.date,
                sessionItem?.start_time
              ),
              end_time: mergeDateAndTime(lessonItem?.date, sessionItem?.end_time),
              slug: coursesData?.courses?.[index]?.lessons?.[lessonIndex]
                ?.lesson_sessions?.[sessionIndex]?.slug,
            };
          }),
        };
      }),
    };
  };

  const onSubmit = async (values: CourseBundleInterface) => {
    if (values) {
      const updatedValues = {
        bundle: {
          ...values.bundle,
          id: coursesData?.id,
          slug: coursesData?.slug,
        },
        other: {
          ...values.other,
          main_rooms: values.other.main_rooms || [],
          optional_rooms: values.other.optional_rooms || [],
          main_resources: values.other.main_resources
            ?.filter((r) => r.resource_id)
            .map(({ resource_id, quantity }) => ({
              resource_id,
              quantity,
            })),
          optional_resources: values.other.optional_resources
            ?.filter((r) => r.resource_id)
            .map(({ resource_id, quantity }) => ({
              resource_id,
              quantity,
            })),
        },
        courses: values.courses.map((course, ind) =>
          processCourse(course, ind, values?.bundle?.academy_id)
        ),
      };
      delete updatedValues.other.isErrorInResource;
      delete updatedValues.other.isErrorInRoom;
      delete updatedValues.other.isErrorInTrainer;
      const { error } = await addCourseBundle('/course/bundle/set', updatedValues);
      if (!error) navigate(PRIVATE_NAVIGATION.coursesManagement.courseBundle.path);
    }
  };

  // ** useEffects
  useEffect(() => {
    if (bundleSlug) fetchCourses();
  }, [bundleSlug]);

  useEffect(() => {
    if (coursesData) {
      setLessonDates(() => extractLessonDates(initialData?.courses));
      setInitialValues(initialData);
      setTrainerTimeSlot(() => extractTimeSlot(initialData?.courses));
    }
  }, [coursesData]);

  return (
    <>
      <PageHeader
        text={t('CourseBundle.create')}
        url={PRIVATE_NAVIGATION.coursesManagement.courseBundle.path}
        small
      />

      <CustomCard minimal>
        <>
          <div className="mb-6">
            <p className="text-lg leading-6 font-bold">{coursesData?.title}</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,_minmax(170px,_115px))] gap-3 mb-10">
            {(coursesData?.courses ?? []).map((item) => (
              <div
                key={item.id}
                className="bg-black/10 h-[115px] rounded-lg overflow-hidden"
              >
                <Image
                  src={item.image}
                  imgClassName="w-full h-full object-cover"
                  width={170}
                  height={115}
                  serverPath
                />
              </div>
            ))}
          </div>

          <Formik
            initialValues={initialValues}
            onSubmit={(values) => onSubmit(values)}
            enableReinitialize
            validationSchema={CourseBundleSchema()}
          >
            {({ values, setFieldValue }) => {
              return (
                <Form className="">
                  <hr className="my-10 border-b border-solid border-borderColor" />
                  <div className="">
                    <p className="text-lg leading-6 font-bold mb-6">
                      {t('CourseBundle.courseDetails')}
                    </p>
                    <CoursesData
                      values={values}
                      courses={coursesData?.courses}
                      lessonTrainers={lessonTrainers}
                      setLessonDates={setLessonDates}
                      setTrainerTimeSlot={setTrainerTimeSlot}
                      setLessonTrainers={setLessonTrainers}
                      setFieldValue={setFieldValue}
                      isLoading={isLoadingCourse}
                      bundleSlug={bundleSlug}
                    />
                    <TrainerInfo
                      values={values}
                      setFieldValue={setFieldValue}
                      isLoading={isLoadingCourse}
                      lessonDates={lessonDates}
                      timeSlots={trainerTimeSlot}
                      // bundleSlug={bundleSlug}
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-10">
                    <Button
                      className="min-w-[90px]"
                      variants="whiteBordered"
                      onClickHandler={() => {
                        navigate(-1);
                      }}
                    >
                      {t('Button.cancelButton')}
                    </Button>
                    <Button
                      isLoading={isLoading}
                      variants="primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {t('Button.submit')}
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </>
      </CustomCard>
    </>
  );
};

export default AddCourseBundle;
