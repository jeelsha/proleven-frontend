// ** Components **
import ReactSelect from 'components/FormElement/ReactSelect';
import { Modal } from 'components/Modal/Modal';
import NoDataFound from 'components/NoDataFound';

// ** Formik
import { Form, Formik, FormikProps } from 'formik';

// ** Hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** Constants **
import { TrainerSelected } from 'modules/Courses/Constants';

// ** Types **
import { Option } from 'components/FormElement/types';
import {
  AddTrainerFormType,
  AddTrainerModalProps,
  Trainer,
  TrainerType,
} from 'modules/Courses/types/TrainersAndRooms';

// ** date-fns **
import { isAfter, parseISO, isEqual, startOfToday } from 'date-fns';

// ** Validation Schemas **
import { AddTrainerSchema } from 'modules/Courses/validation/TemplateBundle';

const AddTrainerModal = ({
  modal,
  mainModal,
  selectedCourse,
  refetch,
}: AddTrainerModalProps) => {
  const { t } = useTranslation();
  // ** APIs
  const [getTrainers, { isLoading }] = useAxiosGet();
  const [postTrainers, { isLoading: submittingForm }] = useAxiosPost();

  const formikRef = useRef<FormikProps<AddTrainerFormType>>();

  // ** States
  const [trainers, setTrainers] = useState<Array<Option>>([]);

  // ** CONSTs
  const {
    lessons,
    courseCategory,
    main_trainers,
    optional_trainers,
    slug: course_slug,
  } = selectedCourse || {};

  const sessionTrainers: Array<number> = [];
  const lesson_session_slug = (lessons ?? []).flatMap((lesson) => {
    const lessonDate = lesson?.date ? parseISO(lesson.date) : null;
    if (
      lessonDate &&
      (isAfter(lessonDate, startOfToday()) || isEqual(lessonDate, startOfToday()))
    ) {
      sessionTrainers.push(
        ...lesson.lesson_sessions.map((session) => session.assigned_to)
      );
      return lesson.lesson_sessions.map((session) => session.slug);
    }
    return [];
  });

  const mainTrainersSet = new Set((main_trainers ?? []).map((t) => t.assigned_to));
  const optionalTrainersSet = new Set(
    (optional_trainers ?? []).map((t) => t.assigned_to)
  );
  const dates = (lessons ?? [])
    .filter((lesson) => lesson?.date)
    .map((lesson) => lesson?.date);

  const initialValues: AddTrainerFormType = {
    trainer: [],
    trainer_type: TrainerType.Optional,
  };

  const allAssignedTrainers = [...mainTrainersSet, ...optionalTrainersSet];
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
  const getDateWiseTrainer = async (datesArray: Array<string>) => {
    const { data, error } = await getTrainers('/trainer/with-filters', {
      params: {
        course_slug,
        dates: datesArray ?? [],
        ...(allAssignedTrainers?.length > 0
          ? {
              allAssignedTrainers: allAssignedTrainers.join(','),
            }
          : {}),
        categorySlug: courseCategory?.slug,
        view: true,
        timeSlot: timeSlot.toString(),
      },
    });

    if (!error && Array.isArray(data))
      setTrainers?.(() =>
        (data as Array<Trainer>)
          .filter(
            (t) =>
              t.selected_status !== TrainerSelected.Unavailable &&
              !allAssignedTrainers.includes(t.id) &&
              !sessionTrainers.includes(t.id)
          )
          .map((t) => ({ label: t.name, value: t.id }))
      );
  };

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  const onSubmit = async (values: AddTrainerFormType) => {
    const { trainer } = values;
    const is_optional = true;
    const payLoad = (trainer ?? []).map((t) => ({
      lesson_session_slug,
      trainer_id: t,
      is_optional,
    }));
    const { error } = await postTrainers(
      `/course/add-trainer/${selectedCourse?.slug}`,
      payLoad
    );
    if (!error) {
      refetch?.();
      modal.closeModal();
      mainModal.closeModal();
    }
  };

  // ** useEffects
  useEffect(() => {
    if ((dates ?? []).length > 0 && lesson_session_slug?.filter(Boolean).length > 0)
      getDateWiseTrainer(dates);
  }, []);

  const renderSelect = () => {
    if (!isLoading && !trainers?.length) {
      return (
        <NoDataFound
          message={t('AddTrainerModal.NoTrainerAvailable')}
          desc={t('AddTrainerModal.NoTrainerDescription')}
        />
      );
    }
    return (
      <ReactSelect
        name="trainer"
        label={t('Calendar.filterTabs.trainersTitle')}
        placeholder={t('CoursesManagement.CreateCourse.selectTrainer')}
        options={[...trainers]}
        isLoading={isLoading}
        isCompulsory
        isMulti
      />
    );
  };

  return (
    <Modal
      headerTitle={t('CoursesManagement.ExtraTrainer.addTrainers')}
      modal={modal}
      closeOnOutsideClick={false}
      closeOnEscape={false}
      footerSubmit={handleSubmitRef}
      cancelClick={modal.closeModal}
      footerSubmitButtonTitle={t('Button.submit')}
      footerButtonTitle={t('Button.cancelButton')}
      isSubmitLoading={submittingForm}
      modalClassName="!px-9"
      width="max-w-[400px]"
      showFooter={!!trainers?.length}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={AddTrainerSchema()}
        onSubmit={(values) => onSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<AddTrainerFormType>>}
      >
        {() => {
          return (
            <Form>
              <div className="flex flex-col gap-4">{renderSelect()}</div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AddTrainerModal;
