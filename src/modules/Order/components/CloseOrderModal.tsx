import Button from 'components/Button/Button';
import TextArea from 'components/FormElement/TextArea';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPut } from 'hooks/useAxios';
import { useTranslation } from 'react-i18next';
import { CloseModalProps } from '../types';
import { OrderValidationSchema } from '../validation/orderValidationSchema';

const CloseOrderModal = ({ modal, data, refetchOrder }: CloseModalProps) => {
  const [orderUpdateApi, { isLoading }] = useAxiosPut();
  const { t } = useTranslation();
  const initialValues = {
    reason: '',
  };
  const OnSubmit = async (values: FormikValues) => {
    const updatedData = {
      slug: data.slug,
      status: 'closed',
      order_type: data.order_type,
      close_order_reason: values.reason,
    };
    const response = await orderUpdateApi(`/order/update`, updatedData);
    if (response.data) {
      modal.closeModal();
      refetchOrder();
    }
  };

  return (
    <Modal width="max-w-[400px]" modal={modal} headerTitle={t('closedOrderTitle')}>
      <div className="text-center">
        <div className="mb-5 w-20 h-20 rounded-full p-6 mx-auto bg-green2/20 text-green2 flex justify-center items-center">
          <Image iconClassName="w-ful h-full" iconName="boxTickIcon" />
        </div>
        <p className="mt-5 mb-6 text-lg left-7  font-medium">
          {t('closeOrderTitle')}
        </p>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={OrderValidationSchema()}
          onSubmit={(values) => OnSubmit(values)}
        >
          {({ values }) => (
            <Form className="grid lg:grid-cols-1 gap-4">
              <TextArea
                isCompulsory
                rows={3}
                placeholder={t('orderReasonPlaceHolder')}
                value={values.reason}
                label={t('orderReasonTitle')}
                name="reason"
                labelClass="!text-left !w-full block"
              />
              <Button
                className={`min-w-[90px] ${
                  isLoading ? 'disabled:opacity-50 pointer-events-none' : ''
                }`}
                variants="primary"
                type="submit"
              >
                {t('Button.saveButton')}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default CloseOrderModal;
