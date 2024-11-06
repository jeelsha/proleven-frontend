import Button from 'components/Button/Button';
import DropZone from 'components/FormElement/DropZoneField';
import { fileInputEnum } from 'components/FormElement/types';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useState } from 'react';
import { ComponentProps } from '../types';

const OrderAttachments = ({
  orderId,
  t,
  getOrderData,
  orderAttachments,
}: ComponentProps) => {
  const [orderAddAttachment] = useAxiosPost();
  const confirmModal = useModal();
  const [formValues, setFormValues] = useState<FormikValues>();
  const initialValues = {
    attachments: orderAttachments?.map((item) => item?.file_path) ?? [],
  };

  const OnSubmit = async (values: FormikValues) => {
    setFormValues(values);
    confirmModal?.openModal();
  };
  const confirmClick = async () => {
    const formsData = new FormData();
    formValues?.attachments
      ?.filter((item: File) => typeof item !== 'string')
      .forEach((item: File) => {
        formsData.append('order_attachment', item as unknown as Blob);
      });
    if (typeof orderId === 'string' || typeof orderId === 'number') {
      formsData.append('order_id', String(orderId));
    }
    await orderAddAttachment('/order-attachment/add', formsData);
    if (getOrderData) {
      getOrderData();
    }
    confirmModal?.closeModal();
  };
  return (
    <div className="flex flex-col gap-5">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values, setFieldValue }) => (
          <Form className="grid lg:grid-cols-1 gap-4">
            <div className="flex flex-col gap-y-5">
              <DropZone
                limit={4}
                fileInputIcon="bulkUpload"
                selectedFileIcon="fileIcon"
                name="attachments"
                Title={t('browseDocument')}
                SubTitle={t('Quote.fileSubTitle', { fileSize: '25MB' })}
                setValue={setFieldValue}
                acceptTypes="application/pdf"
                value={values.attachments ?? null}
                variant={fileInputEnum.FileInputXLS}
                isMulti
              />
              <div className="flex-end">
                <Button
                  className="min-w-[90px] mt-4"
                  variants="primary"
                  type="submit"
                >
                  {t('Button.saveButton')}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
      <ConfirmationPopup
        modal={confirmModal}
        popUpType="success"
        variants="primary"
        confirmButtonText={t('Exam.form.okTitle')}
        deleteTitle={t('purchaseOrderUpdate')}
        cancelButtonText={t('Button.cancelButton')}
        cancelButtonFunction={confirmModal.closeModal}
        confirmButtonFunction={confirmClick}
        confirmButtonVariant="primary"
      />
    </div>
  );
};

export default OrderAttachments;
