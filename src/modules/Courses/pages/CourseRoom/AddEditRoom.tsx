// **components**
import InputField from 'components/FormElement/InputField';
import { Modal } from 'components/Modal/Modal';

// **libraries**
import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { RoomValidationSchema } from 'modules/Courses/validation/RoomValidation';

// **types
import { roomProps } from 'modules/SendMail/types';

// **validation and constants**

// **hooks**
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const AddEditRoom = ({
  modal,
  data,
  setRefresh,
  setData,
  refetch,
}: roomProps) => {
  const { t } = useTranslation();
  const formikRef = useRef<FormikProps<FormikValues>>();
  const [createRoom] = useAxiosPost();
  const [updateRoom] = useAxiosPut();

  const [initialVal, setInitialVal] = useState({
    title: '',
    maximum_participate: '',
  });

  useEffect(() => {
    setInitialVal({
      title: data?.title ?? '',
      maximum_participate: data?.maximum_participate ?? '',
    });
  }, []);

  const OnSubmit = async (values: FormikValues) => {
    const formData = new FormData();
    Object.keys(values).forEach((item) => {
      if (values[item]) {
        formData.append(`${item}`, values[item]);
      }
    });

    if (data?.slug) {
      formData.append('slug', data.slug);
    }
    const url = '/room';
    const { error } = data
      ? await updateRoom(url, formData)
      : await createRoom(url, formData);

    if (!error) {
      modal.closeModal();
      setData?.(null);
      refetch?.();
    }

    if (setRefresh) setRefresh((prev) => !prev);
  };
  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  return (
    <Modal
      setDataClear={setData}
      modal={modal}
      showFooter
      footerSubmit={handleSubmitRef}
      footerSubmitButtonTitle={
        data ? t('UserManagement.edit') : t('AccountSetting.AddButton')
      }
      footerButtonTitle={t('Button.cancelButton')}
      headerTitle={data ? t('room.update') : t('room.create')}
      modalClassName="!px-7"
      width="max-w-[400px]"
    >
      <Formik
        initialValues={initialVal}
        enableReinitialize
        validationSchema={RoomValidationSchema()}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {({ values }) => (
          <div className=" w-full">
            <Form className="flex flex-col gap-4">
              <InputField
                isCompulsory
                label={t('Calendar.createEvent.topic')}
                placeholder={t('Calendar.createEvent.topicPlaceholder')}
                type="text"
                value={values.title}
                name="title"
              />
              <InputField
                isCompulsory
                label={t('CoursesManagement.CreateCourse.maxParticipants')}
                placeholder={t('MaximumParticipant.placeholder')}
                type="number"
                value={values.maximum_participate}
                name="maximum_participate"
              />
            </Form>
          </div>
        )}
      </Formik>
    </Modal>
  );
};
