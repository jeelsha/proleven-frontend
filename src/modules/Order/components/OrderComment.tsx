import Button from 'components/Button/Button';
import TextArea from 'components/FormElement/TextArea';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import { ComponentProps } from '../types';

const OrderComment = ({ orderId, t, getOrderData }: ComponentProps) => {
  const [orderCommentPost] = useAxiosPost();
  const initialValues = {
    comment: '',
  };
  const OnSubmit = async (values: FormikValues) => {
    const data = {
      order_id: orderId,
      comment: values.comment,
    };
    const response = await orderCommentPost(`/order-comment/add`, data);
    if (response?.data?.id && getOrderData) {
      getOrderData();
      values.comment = '';
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values }) => (
          <Form className="flex flex-col gap-4">
            <>
              <TextArea
                rows={3}
                placeholder={t('orderCommentTitle')}
                value={values.comment}
                name="comment"
              />
              <Button className="w-fit ml-auto" variants="primary" type="submit">
                {t('SendMail.send')}
              </Button>
            </>
          </Form>
        )}
      </Formik>
    </div>
  );
};
export default OrderComment;
