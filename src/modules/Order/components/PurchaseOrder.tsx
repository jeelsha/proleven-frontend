import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { format } from 'date-fns';
import {
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikValues,
} from 'formik';
import { useAxiosDelete, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useState } from 'react';
import { ComponentProps, PurchaseOrderProps } from '../types';
import { REACT_APP_DATE_FORMAT } from 'config';

const ClientPurchaseOrder = ({
  purchaseOrder,
  orderId,
  t,
  getOrderData,
  clientPurchaseOrder,
  paymentTermId,
}: ComponentProps) => {
  const [purchaseOrderApi] = useAxiosPost();
  const [purchaseOrderDeleteApi] = useAxiosDelete();
  const deleteModal = useModal();
  const [deleteProduct, setDeleteProduct] = useState('');
  const { response: paymentTermResponse } = useQueryGetFunction('/paymentterms', {
    option: {
      dropdown: true,
      label: 'name',
      companyDropdown: true,
    },
  });

  const initialValues = {
    payment_term_name: Number(paymentTermId),
    purchaseOrder:
      clientPurchaseOrder && clientPurchaseOrder?.length > 0
        ? clientPurchaseOrder.map((order: PurchaseOrderProps) => ({
          order_number: order.order_number || '',
          del: order.del || '',
          cig: order.cig || '',
          cup: order.cup || '',
          description: order.description || '',
          slug: order.slug,
        }))
        : [
          {
            order_number: '',
            del: '',
            cig: '',
            cup: '',
            description: '',
          },
        ],
  };
  const OnSubmit = async (values: FormikValues) => {
    const formsData = new FormData();
    const updatedOrder = values.purchaseOrder
      .map((obj: PurchaseOrderProps) => ({
        ...obj,
        payment_term_name: paymentTermId,
        order_id: orderId,
      }))
      .filter((obj: PurchaseOrderProps) => {
        const fieldsToExclude: Array<keyof PurchaseOrderProps> = [
          'payment_term_name',
          'order_id',
        ];
        const emptyFields = Object.keys(obj)
          .filter(
            (key) => !fieldsToExclude.includes(key as keyof PurchaseOrderProps)
          )
          .filter((key) => obj[key as keyof PurchaseOrderProps] === '');
        return emptyFields.length < Object.keys(obj).length - fieldsToExclude.length;
      });
    const updatedValues = { purchaseOrder: updatedOrder };
    Object.entries(updatedValues).forEach(([key, value]) => {
      formsData.append(key, value);
    });
    const { data } = await purchaseOrderApi(
      `client-purchase-order/add`,
      updatedValues
    );
    if (getOrderData && data) {
      getOrderData();
    }
  };

  const handleAddProduct = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({
      order_number: '',
      del: '',
      cig: '',
      cup: '',
      description: '',
    });
  };

  const onDelete = async () => {
    await purchaseOrderDeleteApi(`/client-purchase-order/delete/${deleteProduct}`);
    if (getOrderData) {
      getOrderData();
    }
    deleteModal?.closeModal();
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values, { setFieldValue }) => {
          OnSubmit(values);
          setFieldValue(
            'purchaseOrder',
            values.purchaseOrder.filter((data) => {
              return Object.values(data).map((item) => item !== '');
            })
          );
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="grid lg:grid-cols-1 gap-4 mt-4">
            <CustomCard minimal>
              <>
                <p className="text-3xl font-semibold">
                  {t('clientPurchaseOrderTitle')}
                </p>
                {purchaseOrder && (
                  <div className="text-base font-medium text-dark/50 mt-4">
                    {t('orderReminderTitle')}
                    <strong className="ml-3 text-dark">
                      {purchaseOrder
                        ? format(new Date(purchaseOrder), (REACT_APP_DATE_FORMAT as string))
                        : '-'}
                    </strong>
                  </div>
                )}
                <div>
                  <div className="mt-4">
                    <ReactSelect
                      name="payment_term_name"
                      options={paymentTermResponse?.data}
                      placeholder={t(
                        'ClientManagement.clientForm.fieldInfos.paymentTermPlaceHolder'
                      )}
                      disabled
                      isCompulsory
                      label={t('ClientManagement.clientForm.fieldInfos.paymentTerm')}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <FieldArray
                    name="purchaseOrder"
                    render={(productArrayHelpers) => (
                      <>
                        {values?.purchaseOrder?.map(
                          (purchaseOrder: PurchaseOrderProps, index: number) => {
                            return (
                              <div key={`purchase_order_${index + 1}`}>
                                <div className="flex gap-4">
                                  <InputField
                                    name={`purchaseOrder[${index}].order_number`}
                                    value={purchaseOrder.order_number}
                                    placeholder={t('orderNumberTitle')}
                                  />
                                  <DatePicker
                                    name={`purchaseOrder[${index}].del`}
                                    icon
                                    selectedDate={
                                      purchaseOrder.del
                                        ? new Date(purchaseOrder.del)
                                        : null
                                    }
                                    onChange={(date) => {
                                      if (setFieldValue)
                                        setFieldValue(
                                          `purchaseOrder[${index}].del`,
                                          format(date, 'yyyy-MM-dd')
                                        );
                                    }}
                                    placeholder={t('delTitle')}
                                    minDate={new Date()}
                                    parentClass="w-full"
                                  />
                                  <InputField
                                    name={`purchaseOrder[${index}].cig`}
                                    value={purchaseOrder.cig}
                                    placeholder={t('cigTitle')}
                                  />
                                  <InputField
                                    name={`purchaseOrder[${index}].cup`}
                                    value={purchaseOrder.cup}
                                    placeholder={t('cupTitle')}
                                  />
                                  <InputField
                                    name={`purchaseOrder[${index}].description`}
                                    value={purchaseOrder.description}
                                    placeholder="description"
                                  />
                                  {values?.purchaseOrder?.length > 1 ? (
                                    <Button
                                      variants="dangerBorder"
                                      className="w-[46px] shrink-0 h-[46px] !p-2 inline-block mb-0.5"
                                      onClickHandler={() => {
                                        if (purchaseOrder.slug) {
                                          deleteModal.openModal();
                                          setDeleteProduct(purchaseOrder.slug);
                                        } else {
                                          productArrayHelpers.remove(index);
                                        }
                                      }}
                                    >
                                      <Image
                                        iconName="deleteIcon"
                                        iconClassName="w-5 h-5"
                                      />
                                    </Button>
                                  ) : (
                                    ''
                                  )}
                                  {index === 0 ? (
                                    <div
                                      className="flex flex-col "
                                      key={`product_${index + 1}`}
                                    >
                                      <div className="flex flex-wrap justify-between  items-center">
                                        <Button
                                          variants="primary"
                                          onClickHandler={() =>
                                            handleAddProduct(productArrayHelpers)
                                          }
                                          className="gap-1 h-[46px]"
                                        >
                                          <Image
                                            iconName="plusIcon"
                                            iconClassName="w-4 h-4"
                                          />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    ''
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </>
                    )}
                  />
                </div>
                <Button
                  className="min-w-[90px] mt-4"
                  variants="primary"
                  type="submit"
                >
                  {t('Button.submit')}
                </Button>
              </>
            </CustomCard>
          </Form>
        )}
      </Formik>
      <ConfirmationPopup
        modal={deleteModal}
        bodyText={t('purchaseOrderDelete')}
        variants="primary"
        deleteTitle={t('Button.deleteTitle')}
        confirmButtonText={t('Button.deleteButton')}
        confirmButtonFunction={onDelete}
        confirmButtonVariant="primary"
        cancelButtonText={t('Button.cancelButton')}
        cancelButtonFunction={() => {
          deleteModal.closeModal();
        }}
      />
    </>
  );
};

export default ClientPurchaseOrder;
