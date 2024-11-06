// ** Components **
import ReactSelect from 'components/FormElement/ReactSelect';
import { Modal } from 'components/Modal/Modal';
import ResourcesInfo from '../ResourcesInfo';

// ** External Libraries **
import { Form, Formik, FormikProps } from 'formik';

// ** Hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Types **
import { Option } from 'components/FormElement/types';
import { ICourseResource } from 'modules/Courses/types';
import {
  AddTrainerModalProps,
  CourseRooms,
} from 'modules/Courses/types/TrainersAndRooms';

type FormType = {
  course: PayLoadType;
};

type PayLoadType = {
  main_rooms?: Array<number>;
  optional_rooms?: Array<number>;
  main_resources?: Array<ICourseResource>;
  optional_resources?: Array<ICourseResource>;
};

const AddRoomResource = ({
  modal,
  mainModal,
  selectedCourse,
  refetch,
}: AddTrainerModalProps) => {
  const { t } = useTranslation();

  // ** States
  const [roomsData, setRoomsData] = useState<Array<CourseRooms>>([]);

  // ** CONSTs
  const {
    main_resources,
    optional_resources,
    main_rooms,
    optional_rooms,
    lessons,
    slug,
  } = selectedCourse || {};
  const dates = (lessons ?? [])
    .filter((lesson) => lesson?.date)
    .map((lesson) => lesson?.date);

  const optionalRoomList = (roomsData ?? []).filter(
    (room) => !main_rooms?.some((r) => r === room.id)
  );
  const mainRoomList = (roomsData ?? []).filter(
    (room) => !optional_rooms?.some((r) => r === room.id)
  );
  const allAssignedRooms = [...(main_rooms ?? []), ...(optional_rooms ?? [])];

  const initialValues: FormType = {
    course: {
      main_rooms: main_rooms ?? [],
      optional_rooms: optional_rooms ?? [],
      main_resources,
      optional_resources,
    },
  };
  const formikRef = useRef<FormikProps<FormType>>();

  // ** APIs
  const [getRooms, { isSuccess }] = useAxiosGet();
  const [addRoomResource, { isLoading: submittingForm }] = useAxiosPost();
  const timeSlot: string[] = [];
  selectedCourse?.lessons.forEach((lesson) => {
    lesson.lesson_sessions.forEach((ls) => {
      if (ls.start_time && ls.end_time) {
        timeSlot.push(
          `${lesson?.date?.toString().split('T')[0]} ${
            ls.start_time.split('T')[1].split('.')[0]
          }=${lesson?.date?.toString().split('T')[0]} ${
            ls.end_time.split('T')[1].split('.')[0]
          }`
        );
      }
    });
  });
  const getDateWiseRoom = async () => {
    const { data, error } = await getRooms('/course/available/rooms', {
      params: {
        course_slug: slug,
        dates: (dates ?? []).filter((i) => i).join(','),
        ...(allAssignedRooms?.length > 0
          ? {
              allAssignedRooms: allAssignedRooms.join(','),
            }
          : {}),
        timeSlot: timeSlot.toString(),
        view: true,
      },
    });
    if (!error && Array.isArray(data?.data)) setRoomsData(data?.data);
  };

  const filterRooms = (rooms: Array<CourseRooms>): Array<Option> =>
    rooms.map((r) => ({ label: r.title, value: r.id }));

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  const onSubmit = async (values: FormType) => {
    const { course } = values;
    const payLoad: Partial<PayLoadType> = {};
    if (course.main_rooms && course.main_rooms.length > 0)
      payLoad.main_rooms = course.main_rooms;

    if (course.optional_rooms && course.optional_rooms.length > 0)
      payLoad.optional_rooms = course.optional_rooms;

    if (
      course.main_resources &&
      course.main_resources.filter((r) => r.resource_id).length > 0
    )
      payLoad.main_resources = course.main_resources
        .filter((r) => r.resource_id)
        .map(({ resource_id, quantity }) => ({ resource_id, quantity }));

    if (
      course.optional_resources &&
      course.optional_resources.filter((r) => r.resource_id).length > 0
    )
      payLoad.optional_resources = course.optional_resources
        .filter((r) => r.resource_id)
        .map(({ resource_id, quantity }) => ({ resource_id, quantity }));

    const { error } = await addRoomResource(
      `/course/add-room-resources/${selectedCourse?.slug}`,
      { ...payLoad, timeSlot: timeSlot.toString() }
    );
    if (!error) {
      refetch?.();
      modal.closeModal();
      mainModal.closeModal();
    }
  };
  useEffect(() => {
    if ((dates ?? []).length > 0) getDateWiseRoom();
  }, []);
  return (
    <Modal
      headerTitle={t('CoursesManagement.Resources.addResources')}
      modal={modal}
      closeOnOutsideClick={false}
      closeOnEscape={false}
      showFooter
      footerSubmit={handleSubmitRef}
      cancelClick={modal.closeModal}
      footerSubmitButtonTitle={t('Button.submit')}
      footerButtonTitle={t('Button.cancelButton')}
      isSubmitLoading={submittingForm}
      modalClassName="!px-7"
    >
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => onSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormType>>}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              {isSuccess ? (
                <div className="grid gap-4">
                  <ResourcesInfo
                    main_resources={values?.course?.main_resources ?? []}
                    optional_resources={values?.course?.optional_resources ?? []}
                    setFieldValue={setFieldValue}
                    parentObjectName="course"
                    dates={dates}
                    lessonTime={timeSlot}
                    course_slug={slug}
                    isErrorRequired={false}
                    isOptionalRequired
                  />

                  <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full bg-primaryLight rounded-xl px-9 pb-8 pt-5">
                    <ReactSelect
                      className="bg-white rounded-lg"
                      name="course.main_rooms"
                      label={t('CourseBundle.trainer.room')}
                      options={filterRooms(mainRoomList ?? []) ?? []}
                      placeholder={t('CourseBundle.trainer.selectRoom')}
                      isMulti
                      disabled={submittingForm}
                    />

                    <ReactSelect
                      className="bg-white rounded-lg"
                      name="course.optional_rooms"
                      label={t('CourseBundle.trainer.optionalRoom')}
                      options={filterRooms(optionalRoomList ?? []) ?? []}
                      placeholder={t('CourseBundle.trainer.selectOptionalRoom')}
                      isClearable
                      isMulti
                      disabled={submittingForm}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full pb-8 pt-5">
                  <div className="lazy w-full h-[168px] my-4" />
                  <div className="lazy w-full h-[168px] my-4" />
                  <div className="lazy w-full h-[168px] my-4" />
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AddRoomResource;
