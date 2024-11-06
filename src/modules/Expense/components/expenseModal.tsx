import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { Option } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';
import { Form, Formik } from 'formik';
import { useAxiosGet, useAxiosPut } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ModalProps } from 'types/common';
import * as Yup from 'yup';
import { ExpenseProps, ExpenseUpdateProps, TrainerOrderProps } from '../types';

type ExpenseModalType = {
  modal: ModalProps;
  data?: ExpenseProps;
  reFetchExpense: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      {
        data?: ExpenseProps;
        error?: string;
      },
      Error
    >
  >;
};

function ExpenseModal({ modal, data, reFetchExpense }: ExpenseModalType) {
  const [trainerOrder, setTrainerOrder] = useState<Option[]>([]);
  const [toggleSpace, setToggleSpace] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [getTrainerOrder] = useAxiosGet();
  const [expenseDataUpdate] = useAxiosPut();
  const [paymentDate, setPaymentDate] = useState<Date>(
    data?.is_marked_date ? new Date(data?.is_marked_date) : new Date()
  );

  useEffect(() => {
    async function TrainerOrder() {
      const { data } = await getTrainerOrder('/order/trainer');
      const trainerOption = data?.data?.map((trainer: TrainerOrderProps) => {
        return {
          label: trainer?.order_number,
          value: trainer?.id,
        };
      });
      setTrainerOrder(trainerOption);
    }
    TrainerOrder();
  }, []);
  const initialValues: ExpenseUpdateProps = {
    invoice_number: data?.invoice_number ? data?.invoice_number : '',
    trainerOrder: data?.trainer_order_id ? data?.trainer_order_id : null,
  };
  const ValidationSchema = () => {
    if (data?.role_type === 'trainers') {
      return Yup.object().shape({
        trainerOrder: Yup.number().required('This field is required'),
        invoice_number: Yup.string().required('This Invoice No. is required'),
      });
    }
    return Yup.object();
  };

  const OnSubmit = async (orderData: ExpenseUpdateProps) => {
    if (orderData) {
      const formData = new FormData();
      Object.entries(orderData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append(
        'documentId',
        data?.fatture_expense_id as unknown as string | Blob
      );
      formData.append('payment_date', paymentDate as unknown as string | Blob);
      await expenseDataUpdate('/expense/status', formData);
      reFetchExpense();
      navigate('/expense');
      modal.closeModal();
    }
  };
  return (
    <Modal
      modal={modal}
      headerTitle={t('Tooltip.MarkAsPaid')}
      setDataClear={() => navigate('/expense')}
      width={`${
        data?.role_type === 'trainers' ? 'max-w-[600px]' : 'max-w-[350px]'
      } `}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ValidationSchema()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {data?.role_type === 'trainers' ? (
          <Form>
            <ReactSelect
              name="trainerOrder"
              label={t('Payments.Expenses.selectTrainerOrder')}
              placeholder={t('Payments.Expenses.selectTrainerOrder')}
              options={trainerOrder || []}
              isCompulsory
            />

            <div className="mt-4">
              <InputField
                type="text"
                name="invoice_number"
                label={t('invoiceNo')}
                isCompulsory
              />
            </div>

            <div onClick={() => setToggleSpace(true)} className="mt-4">
              <DatePicker
                label={t('invoicePaymentDate')}
                selectedDate={paymentDate}
                onChange={(date) => {
                  if (date) {
                    setPaymentDate(date);
                  }
                }}
              />
            </div>
            {toggleSpace ? <div className="h-[320px]" /> : ''}

            <div className="flex gap-3 flex-wrap mt-5">
              <Button
                type="submit"
                className="flex items-center justify-center text-xs leading-5 gap-1 min-w-28"
                variants="primary"
              >
                {t('InvoiceFilter.paid')}
              </Button>
              <Button
                type="button"
                className="flex items-center justify-center text-xs leading-5 gap-1 min-w-28"
                variants="primary"
                onClickHandler={() => modal.closeModal()}
              >
                {t('EmailTemplate.cancel')}
              </Button>
            </div>
          </Form>
        ) : (
          <Form>
            <div className="text-center">
              <p className="text-xl font-semibold">{t('Button.deleteTitle')}</p>
              <div className="flex gap-3 mt-8 justify-center">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center text-xs leading-5 gap-1 min-w-28"
                  variants="primary"
                >
                  {t('InvoiceFilter.paid')}
                </Button>
                <Button
                  type="button"
                  className="w-full flex items-center justify-center text-xs leading-5 gap-1 min-w-28"
                  variants="primary"
                  onClickHandler={() => modal.closeModal()}
                >
                  {t('EmailTemplate.cancel')}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default ExpenseModal;
