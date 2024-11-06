import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { useTranslation } from 'react-i18next';

import { Modal } from 'components/Modal/Modal';

import TextArea from 'components/FormElement/TextArea';
import { useAxiosPost } from 'hooks/useAxios';
import { courseProposedDateAction } from 'modules/CompanyManager/constants';
import { RejectModalProps } from 'modules/CompanyManager/types';
import { useRef } from 'react';
import { ModalProps } from 'types/common';

export const RejectModal = ({
  modal,
  courseSlug,
  setReloadData,
}: {
  modal: ModalProps;
  courseSlug?: string;
  setReloadData?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const [companyManagerCreateApi, { isLoading: creatingClientLoading }] =
    useAxiosPost();
  const formikRef = useRef<FormikProps<FormikValues>>();

  const initialValues: RejectModalProps = {
    rejectReason: '',
  };

  const OnSubmit = async (rejectData: FormikValues) => {
    if (rejectData) {
      const response = await companyManagerCreateApi(
        `/course/action/proposed-date/${courseSlug}`,
        {
          action: courseProposedDateAction.reject,
          rejectReason: rejectData.rejectReason,
        }
      );
      if (!response.error) {
        modal.closeModal();
        setReloadData?.((prev) => !prev);
      }
    }
  };

  const handleSubmitRef = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };

  return (
    <Modal
      headerTitle={t('CompanyManager.trackCourse.rejectModal.title')}
      modal={modal}
      showFooter
      footerButtonTitle={t('Button.cancelButton')}
      footerSubmit={handleSubmitRef}
      closeOnOutsideClick
      isSubmitLoading={creatingClientLoading}
      footerSubmitButtonTitle={t(
        'CompanyManager.trackCourse.rejectModal.acceptTitle'
      )}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(values) => OnSubmit(values)}
        innerRef={formikRef as React.Ref<FormikProps<FormikValues>>}
      >
        {() => (
          <Form className="grid lg:grid-cols-2 gap-4">
            <TextArea
              parentClass="col-span-2"
              name="rejectReason"
              label={t('CompanyManager.trackCourse.rejectModal.rejectReason')}
              rows={4}
              placeholder={t(
                'CompanyManager.trackCourse.rejectModal.rejectReasonPlaceholder'
              )}
            />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
