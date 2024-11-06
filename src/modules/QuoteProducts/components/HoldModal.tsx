import Button from 'components/Button/Button';
import TextArea from 'components/FormElement/TextArea';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPut } from 'hooks/useAxios';
import { InvoiceStatus } from '../constants';
import { HoldModalProps } from '../types';
import { productValidation } from '../validation';

const HoldModal = ({ modal, t, selectedData, ProductRefetch }: HoldModalProps) => {
  const [updateProductStatus, { isLoading }] = useAxiosPut();

  const OnSubmit = async (values: FormikValues) => {
    const response = await updateProductStatus(`/quotes/product/status`, {
      invoice_status: InvoiceStatus.Hold,
      reason: values.reason,
      id: selectedData.id,
      quote_id: selectedData.quote_id,
      old_status: selectedData.invoice_status,
    });
    if (typeof response.data !== 'string') {
      modal.closeModal();
      ProductRefetch();
    }
  };
  const initialValues = {
    reason: '',
  };
  const handleStatusChange = async () => {
    const response = await updateProductStatus(`/quotes/product/status`, {
      invoice_status: InvoiceStatus.NotCompleted,
      id: selectedData.id,
      old_status: selectedData.invoice_status,
    });
    if (typeof response.data !== 'string') {
      modal.closeModal();
      ProductRefetch();
    }
  };
  return (
    <Modal width="max-w-[400px]" modal={modal}>
      <>
        <div className="text-center">
          <div className="w-20 h-20 bg-primary mx-auto rounded-full flex items-center justify-center text-primary">
            <Image
              iconClassName="w-ful h-full icon-fill-white"
              iconName="accessDeniedIcon"
            />
          </div>
          <p className="mt-5 text-lg left-7 font-medium">
            {selectedData?.invoice_status !== InvoiceStatus.Hold
              ? t('productLogsHoldTitle')
              : t('productLogsResumeTitle')}
          </p>
        </div>
        {selectedData?.invoice_status === InvoiceStatus.NotCompleted ? (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={productValidation(t)}
            onSubmit={(values) => OnSubmit(values)}
          >
            {() => (
              <Form className="grid grid-cols-1 gap-4">
                <div>
                  <TextArea
                    parentClass="lg:col-span-2"
                    rows={5}
                    placeholder={t('writeReason')}
                    label={t('ProjectManagement.ReasonModal.title')}
                    name="reason"
                    isCompulsory
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <Button
                    variants="primaryBordered"
                    className="flex-[1_0_0%] justify-center"
                    onClickHandler={() => {
                      modal.closeModal();
                    }}
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    variants="primary"
                    className=" flex-[1_0_0%] justify-center"
                    isLoading={isLoading}
                    disabled={isLoading}
                    type="submit"
                  >
                    {t('CompanyManager.trackCourse.modal.acceptTitle')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="flex gap-4 mt-8">
            <Button
              variants="primaryBordered"
              className="flex-[1_0_0%] justify-center"
              onClickHandler={() => {
                modal.closeModal();
              }}
            >
              {t('Button.cancelButton')}
            </Button>
            <Button
              variants="primary"
              className=" flex-[1_0_0%] justify-center"
              onClickHandler={handleStatusChange}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('CompanyManager.trackCourse.modal.acceptTitle')}
            </Button>
          </div>
        )}
      </>
    </Modal>
  );
};

export default HoldModal;
