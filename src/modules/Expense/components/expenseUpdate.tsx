// ** components **

import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import DatePicker from 'components/FormElement/datePicker';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import { REACT_APP_DATE_FORMAT, REACT_APP_ENCRYPTION_KEY } from 'config';
import { ExpenseType } from 'constants/common.constant';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import { useAxiosGet, useAxiosPut } from 'hooks/useAxios';
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { aesEncrypt } from 'utils/encrypt';
import * as Yup from 'yup';
import {
  ExpenseFilterType,
  ExpenseProps,
  ExpenseUpdateProps,
  PaymentStatusType,
} from '../types';

const ExpenseUpdate = () => {
  const url = new URL(window.location.href);

  // const { currentPage } = useSelector(currentPageSelector);
  const params = useParams();
  const [expenseValue, setExpenseValue] = useState({} as ExpenseProps);

  const [expense] = useAxiosGet();
  const [trainerOrder, setTrainerOrder] = useState<Option[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<{
    order_number?: string;
    trainer_id?: number;
    created_at?: string | Date;
  }>({});
  const [expenseDataUpdate] = useAxiosPut();
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const mainTrainerModal = useToggleDropdown();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const getExpenseData = async () => {
    const expenseData = await expense(`/expense`, {
      params: {
        slug: params?.slug,
      },
    });
    if (expenseData) {
      setExpenseValue(expenseData?.data);
      if (expenseData?.data.payment_date) {
        setPaymentDate(new Date(expenseData?.data.payment_date));
      }
    }
  };

  useEffect(() => {
    getExpenseData();
  }, []);
  const { t } = useTranslation();

  const initialValues: ExpenseUpdateProps = {
    notes: expenseValue?.notes ? expenseValue?.notes : '',
    invoice_number: expenseValue?.invoice_number ? expenseValue?.invoice_number : '',
    trainerOrder: expenseValue?.trainer_order_id
      ? expenseValue?.trainer_order_id
      : null,
    role_type: Object.values(ExpenseFilterType).find(
      (item) => item === expenseValue?.role_type
    ),
    payment_date: paymentDate,
  };
  const ValidationSchema = () => {
    return Yup.object().shape({
      notes: Yup.string().nullable(),
      role_type: Yup.string().required('This field is required'),
      trainerOrder: Yup.number()
        .nullable()
        .when('role_type', {
          is: (val?: string) => val === 'trainers',
          then: () => Yup.number().required('This field is required'),
        }),
      invoice_number: Yup.string(),
      payment_date: Yup.date().required('This field is required'),
    });
  };

  const OnSubmit = async (data: ExpenseUpdateProps) => {
    if (data) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('slug', expenseValue?.slug);
      // formData.append('payment_date', data?.paymentDate as unknown as string | Blob);
      await expenseDataUpdate('/expense/update', formData);
      getExpenseData();
    }
  };
  const MarkAsPaid = async (data: ExpenseUpdateProps) => {
    if (data) {
      const formData = new FormData();
      formData.append('invoice_number', data?.invoice_number as string);
      formData.append(
        'payment_date',
        data?.payment_date as unknown as string | Blob
      );
      if (data.trainerOrder) {
        formData.append('trainerOrder', data.trainerOrder.toString());
      }
      formData.append('documentId', expenseValue?.fatture_expense_id.toString());
      await expenseDataUpdate('/expense/status', formData);
    }
  };
  const selectedData = (order_number: string, trainer_id: number) => {
    setSelectedTrainer({ order_number, trainer_id });
  };
  useEffect(() => {
    async function TrainerOrder() {
      const { data } = await expense('/order/trainer');
      setTrainerOrder(data?.data);
    }
    TrainerOrder();
  }, []);
  useEffect(() => {
    if (expenseValue?.order?.length > 0 && !_.isEmpty(expenseValue)) {
      const trainerData = trainerOrder.find(
        (expense: Option) =>
          expense?.order_number === expenseValue?.order[0]?.order_number
      );

      if (trainerData) {
        setSelectedTrainer(trainerData);
      }
    }
  }, [expenseValue, trainerOrder]);
  return (
    <>
      <PageHeader
        small
        text={t('Expense.title')}
        url={
          url.searchParams.has('isExpense') ? `/expense${url.search}` : '/expense'
        }
      />
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ValidationSchema()}
        onSubmit={(values) => OnSubmit(values)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form className="flex flex-col gap-y-4">
              <div className="w-full pe-5 grid lg:grid-cols-2 gap-4">
                <div className="bg-white shadow-md rounded-[10px] p-5">
                  <span className="text-lg block text-primary font-semibold mb-8">
                    {t('UserProfile.company.title')}
                  </span>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.name')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.name ? expenseValue?.name : '-'}
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.addressStreet')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.address_street
                        ? expenseValue?.address_street
                        : '-'}
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.addressCity')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.address_city ? expenseValue?.address_city : '-'}
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.addressProvince')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.address_province
                        ? expenseValue?.address_province
                        : '-'}
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.country')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.country ? expenseValue?.country : '-'}
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.vatNumber')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.vat_number ? expenseValue?.vat_number : '-'}
                    </p>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.taxCode')}
                    </p>
                    <p className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.tax_code ? expenseValue?.tax_code : '-'}
                    </p>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-[10px] p-5">
                  <span className="text-lg block text-primary font-semibold mb-8">
                    {t('Expense.expenseDetail')}
                  </span>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.notes')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.notes ? expenseValue?.notes : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.amountNet')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {getCurrencySymbol('EUR')}{' '}
                      {expenseValue?.amount_net
                        ? formatCurrency(Number(expenseValue?.amount_net), 'EUR')
                        : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.amountGross')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {getCurrencySymbol('EUR')}{' '}
                      {expenseValue?.amount_gross
                        ? formatCurrency(Number(expenseValue?.amount_gross), 'EUR')
                        : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.expenseType')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.role_type ? expenseValue?.role_type : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.type')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.type ? expenseValue?.type : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.description')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.description ? expenseValue?.description : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.amountDueDiscount')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.amount_due_discount
                        ? expenseValue?.amount_due_discount
                        : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.markedStatus')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.status ? expenseValue?.status : '-'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('Expense.dueDate')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.date &&
                        format(
                          new Date(expenseValue?.date),
                          REACT_APP_DATE_FORMAT as string
                        )}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    <p className="text-sm leading-5 text-grayText block shrink-0 max-w-[50%] w-full">
                      {t('invoiceNo')}
                    </p>
                    <div className="label text-sm leading-5 text-dark font-medium">
                      {expenseValue?.invoice_number
                        ? expenseValue?.invoice_number
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-[10px] py-8 px-5">
                <div className="grid lg:grid-cols-2 gap-4">
                  <TextArea
                    placeholder={t('Expense.notes')}
                    rows={5}
                    label={t('Expense.notes')}
                    name="notes"
                    parentClass="col-span-2"
                  />
                  <ReactSelect
                    parentClass="z-[9] relative "
                    name="role_type"
                    options={ExpenseType}
                    // placeholder={t('Auth.RegisterCompany.vatTypePlaceHolder')}
                    label={t('Expense.selectType')}
                    isCompulsory
                    disabled={!!expenseValue?.trainer_order_id}
                  />
                  {values?.role_type === 'trainers' ? (
                    <>
                      <div
                        ref={mainTrainerModal.dropdownRef}
                        className="relative z-1 flex-[1_0_0%] "
                      >
                        <p className="text-sm text-dark mb-2">
                          {t('Payments.Expenses.selectTrainerOrder')}
                          <span className="text-red-700">*</span>
                        </p>
                        <Button
                          disabled={!!expenseValue?.trainer_order_id}
                          onClickHandler={mainTrainerModal.toggleDropdown}
                          className="border border-borderColor w-full py-3 px-4 bg-white rounded-[10px] mb-2 flex items-center justify-between"
                        >
                          <span className="text-grayText text-sm font-normal ">
                            {t('CoursesManagement.CreateCourse.selectMainTrainers')}
                          </span>
                          <Image
                            iconName="downArrow"
                            iconClassName="w-5 h-5"
                            width={24}
                            height={24}
                          />
                        </Button>
                        {mainTrainerModal.isDropdownOpen ? (
                          <div className="w-full bg-white rounded-lg shadow-lg shadow-black/20 border absolute">
                            <div className="p-3 rounded-b-lg">
                              <div className="flex flex-col gap-y-0.5 max-h-[155px] overflow-auto px-px">
                                {trainerOrder?.map((orderData) => {
                                  const encryptedTrainer =
                                    orderData?.trainer_id &&
                                    aesEncrypt(
                                      orderData?.trainer_id?.toString(),
                                      KEY
                                    );
                                  return (
                                    <label
                                      key={orderData?.order_number}
                                      htmlFor={String(orderData?.trainer_id)}
                                      className="group cursor-pointer flex items-center gap-1 hover:bg-gray-200 py-1 px-2 transition-all rounded-md"
                                    >
                                      <Button
                                        className=""
                                        onClickHandler={() => {
                                          if (
                                            orderData?.order_number &&
                                            orderData?.id
                                          ) {
                                            selectedData(
                                              orderData?.order_number,
                                              orderData?.id
                                            );
                                            setFieldValue(
                                              'trainerOrder',
                                              orderData?.id
                                            );
                                          }
                                          mainTrainerModal.closeDropDown();
                                        }}
                                      >
                                        {orderData?.order_number}
                                      </Button>
                                      <Link
                                        target="_blank"
                                        to={`/current-month-invoice?trainerId=${encryptedTrainer}&date=${orderData?.created_at}`}
                                      >
                                        <Button className="w-5 h-5 bg-transparent p-0.5 text-primary flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-300">
                                          <Image
                                            iconName="arrowRight"
                                            iconClassName=""
                                          />
                                        </Button>
                                      </Link>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                        <div className="flex flex-wrap gap-4 pt-2 relative -z-1">
                          {!_.isEmpty(selectedTrainer) && (
                            <div className="flex items-center gap-x-2.5 py-2.5 px-3 bg-primary/10 rounded-lg">
                              <span className="text-sm text-primary leading-5 inline-block translate-y-px">
                                {selectedTrainer?.order_number}
                              </span>
                              <Button
                                disabled={!!expenseValue?.trainer_order_id}
                                onClickHandler={() => setSelectedTrainer({})}
                                parentClass="h-fit"
                                className="trainer-remove-icon w-4 h-4 select-none rounded-full hover:bg-primary hover:text-white border border-solid border-primary inline-block p-[3px] cursor-pointer active:scale-90 transition-all duration-300"
                              >
                                <Image
                                  iconName="crossIcon"
                                  iconClassName="w-full h-full"
                                />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <InputField
                        type="text"
                        name="invoice_number"
                        label={t('invoiceNo')}
                        isDisabled
                        isCompulsory
                      />
                    </>
                  ) : (
                    ''
                  )}
                  {values?.role_type && (
                    <DatePicker
                      label={t('invoicePaymentDate')}
                      selectedDate={paymentDate}
                      disabled={!!expenseValue?.trainer_order_id}
                      onChange={(date: Date) => {
                        setFieldValue('payment_date', date);
                      }}
                      name="payment_date"
                    />
                  )}
                </div>

                <div className="flex mt-4 w-full gap-2 justify-end col-span-2">
                  {expenseValue?.status === PaymentStatusType.unpaid && (
                    <Button
                      onClickHandler={() => {
                        MarkAsPaid(values);
                      }}
                      variants="primary"
                      className="gap-1 !flex !py-2.5 !px-3.5"
                    >
                      {t('Expense.markPaid')}
                    </Button>
                  )}
                  <Button
                    variants="primary"
                    className="min-w-[150px] justify-center"
                    type="submit"
                    value={t('Expense.save')}
                  />
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default ExpenseUpdate;
