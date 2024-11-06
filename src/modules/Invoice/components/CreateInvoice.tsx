import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Checkbox from 'components/FormElement/CheckBox';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { Option } from 'components/FormElement/types';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { format, parseISO } from 'date-fns';
import { Form, Formik, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { OrderDetails } from 'modules/Invoice/constants';
import { InvoiceValidationSchema } from 'modules/Invoice/validation';
import { InvoiceStatus } from 'modules/QuoteProducts/constants';
import { Product } from 'modules/Quotes/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, getCurrencySymbol } from 'utils';

const CreateInvoice = () => {
  const { t } = useTranslation();
  const [productDataGet] = useAxiosGet();
  const [invoiceData, { isLoading: isAddLoading }] = useAxiosPost();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { companyDataId, orderId } = useParams();
  const [companyId, setCompanyId] = useState('');
  const [orderData, setOrderData] = useState<OrderDetails[]>();
  const productsEmptyModal = useModal();
  const [selectedProducts, setSelectedProducts] = useState<string[] | undefined>([]);
  const initialValues = {
    company_id: Number(companyDataId) || '',
    order_id: orderId ? [Number(orderId)] : [],
    invoice_date: '',
  };

  const OnSubmit = async (values: FormikValues) => {
    if (selectedProducts?.length === 0) {
      productsEmptyModal.openModal();
      return;
    }
    const orderIds = Array.from(new Set(values.order_id));
    const orderProducts = orderData?.filter((item: OrderDetails) =>
      orderIds.includes(item.id)
    );
    const quoteProducts = orderProducts?.map((item) => {
      const { quoteProduct } = item.quotes;
      const filteredMainChild = quoteProduct.map((product) => ({
        units: product.units,
        price: product.price,
        discount: product.discount,
        product_total_amount: product.product_total_amount,
        quote_id: product.quote_id,
        code_id: product.code_id,
        id: product.id,
        company_id: values.company_id,
        project_id: item.project_id,
        main_child: Array.isArray(product.main_child)
          ? product.main_child.filter((child) =>
              selectedProducts?.includes(child.id as string)
            )
          : [],
      }));
      return filteredMainChild;
    });
    const orderDetails = orderProducts?.map((item, index: number) => {
      return {
        ...item,
        product: quoteProducts?.[index],
        quotes: undefined,
        project: undefined,
        payment_terms: undefined,
      };
    });
    const updatedData = {
      invoice_date: values.invoice_date ? values.invoice_date : new Date(),
      payment_term: orderData?.[0]?.payment_terms?.id,
      orderData: orderDetails,
    };
    const formsData = new FormData();
    let stringValue = '';
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value instanceof File) {
        formsData.append(key, value);
      } else {
        if (value !== undefined) {
          if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
          } else {
            stringValue = String(value);
          }
        }

        formsData.append(key, stringValue);
      }
    });

    const response = await invoiceData(`/invoice/add`, formsData);
    if (!response.error) {
      navigate('/invoice');
    }
  };
  const { response: companiesList } = useQueryGetFunction('/companies/dropdown');
  const { response: ordersList } = useQueryGetFunction('/order/dropdown', {
    option: { company_id: companyId || initialValues.company_id },
  });
  const getProductData = async (id?: string) => {
    const response = await productDataGet(`invoice/product`, {
      params: {
        company_id: companyId || initialValues.company_id,
        order_id: id || orderId,
      },
    });
    setOrderData(response.data);
  };
  const handleCheckboxChange = (productId: string | undefined) => {
    if (productId !== undefined) {
      if (selectedProducts?.includes(productId)) {
        setSelectedProducts(
          selectedProducts?.filter((id: string) => id !== productId)
        );
      } else {
        setSelectedProducts([...(selectedProducts || []), productId]);
      }
    }
  };
  const handleOrderChange = (
    val: Option | Option[],
    type: string | undefined,
    fieldName: string,
    values: FormikValues
  ) => {
    if (((val as Option[]) ?? []).length === 0) {
      return [];
    }
    const currentIds: Array<number> = values[fieldName] || [];
    const updatedIds =
      type === 'Removed'
        ? currentIds.filter((item) => item !== (val as Option[])[0].value)
        : [...currentIds, ...(val as Option[]).map((opt) => opt.value)];
    getProductData(Array.from(new Set(updatedIds)).join(','));
    return updatedIds;
  };

  const statusRender = (item: Product) => {
    const getStatusClass = () => {
      switch (item.invoice_status) {
        case InvoiceStatus.Invoiced:
          return 'completed';
        case InvoiceStatus.Completed:
          return 'completed';
        case InvoiceStatus.NotCompleted:
          return 'pending';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item.invoice_status}
        variants={getStatusClass()}
        className={` ${statusClasses ?? ''}`}
      />
    );
  };
  useEffect(() => {
    getProductData();
  }, []);

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={InvoiceValidationSchema()}
        onSubmit={OnSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <PageHeader
              small
              text={t('createInvoiceTitle')}
              url={
                state?.isFromInvoice
                  ? PRIVATE_NAVIGATION.invoice.view.path
                  : PRIVATE_NAVIGATION.order.list.path
              }
            />
            <CustomCard minimal>
              <>
                <div className="flex flex-wrap mb-3 gap-y-4">
                  <ReactSelect
                    parentClass="xl:col-span-2 px-3"
                    name="company_id"
                    options={companiesList?.data}
                    placeholder={t('Quote.company.title')}
                    label={t('ProjectManagement.CustomCardModal.Button.company')}
                    isCompulsory
                    onChange={(selectedOption) => {
                      setCompanyId((selectedOption as Option)?.value as string);
                      setFieldValue('company_id', (selectedOption as Option)?.value);
                    }}
                  />
                  <ReactSelect
                    parentClass="xl:col-span-2 px-3"
                    name="order_id"
                    options={ordersList?.data ?? []}
                    placeholder={t('selectOrderTitle')}
                    label={t('ordersTitle')}
                    isMulti
                    isCompulsory
                    onChange={(value, type) => {
                      setFieldValue(
                        'order_id',
                        handleOrderChange(
                          value as Option | Option[],
                          type,
                          'order_id',
                          values
                        )
                      );
                    }}
                  />
                  <DatePicker
                    name="invoice_date"
                    label={t('Quote.company.detail.dateTitle')}
                    icon
                    selectedDate={
                      values.invoice_date
                        ? new Date(values.invoice_date)
                        : new Date()
                    }
                    onChange={(date) => {
                      if (setFieldValue)
                        setFieldValue(`invoice_date`, format(date, 'yyyy-MM-dd'));
                    }}
                    placeholder={t('Quote.company.detail.datePlaceholder')}
                    minDate={
                      orderData?.[0]?.invoice_date &&
                      new Date(orderData?.[0]?.invoice_date)
                    }
                    maxDate={new Date()}
                    parentClass="px-3"
                  />
                </div>
                <div>
                  {Array.isArray(orderData) &&
                    orderData?.length > 0 &&
                    orderData.map((data, index) => {
                      return (
                        <div key={`order_details_${index + 1}`}>
                          <p className="bg-primary text-white px-2 py-2 rounded-t-md">
                            {data.order_number}
                          </p>
                          <div className="bg-white p-4 pt-0">
                            <div className="border-t border-solid border-borderColor pt-5 flex flex-col gap-5">
                              {Array.isArray(data.quotes.quoteProduct) &&
                                data.quotes.quoteProduct.length > 0 &&
                                data.quotes.quoteProduct.map(
                                  (product, index: number) => {
                                    return (
                                      <div key={`product_details_${index + 1}`}>
                                        {Array.isArray(product?.main_child) &&
                                          product?.main_child.length > 0 &&
                                          product?.main_child.map(
                                            (courses, index) => (
                                              <div key={`product_${index + 1}`}>
                                                <div className="flex bg-primaryLight  rounded-lg shadow-md p-5 px-0 mb-6">
                                                  {courses.invoice_status !==
                                                    InvoiceStatus.Invoiced && (
                                                    <div className="w-16">
                                                      <Checkbox
                                                        check={selectedProducts?.includes(
                                                          courses.id ?? ''
                                                        )}
                                                        onChange={() =>
                                                          courses.id &&
                                                          handleCheckboxChange(
                                                            courses.id
                                                          )
                                                        }
                                                        parentClass="my-0 justify-center"
                                                      />
                                                    </div>
                                                  )}
                                                  <div className="max-w-[calc(100%_-_64px)] flex-1 grid gap-5 lg:grid-cols-2 xl:grid-cols-4 w-full">
                                                    <div className="flex flex-col gap-y-2 px-5">
                                                      {statusRender(
                                                        courses as Product
                                                      )}
                                                      <p className="text-lg font-semibold">
                                                        {product.title}
                                                      </p>
                                                      {product?.description && (
                                                        <p
                                                          className="text-sm"
                                                          dangerouslySetInnerHTML={{
                                                            __html:
                                                              product?.description,
                                                          }}
                                                        />
                                                      )}
                                                    </div>

                                                    <div className="px-5">
                                                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                        {t(
                                                          'Quote.company.product.productCode'
                                                        )}
                                                      </span>
                                                      <p className="text-sm text-dark font-semibold">
                                                        {product?.codes?.code ?? '-'}
                                                      </p>
                                                    </div>

                                                    <div className="px-5">
                                                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                        {t(
                                                          'Auth.RegisterCompany.vatType'
                                                        )}
                                                      </span>
                                                      <p className="text-sm text-dark font-semibold">
                                                        {`${product?.vat_type} %` ??
                                                          '-'}
                                                      </p>
                                                    </div>

                                                    <div className="px-5">
                                                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                        {t(
                                                          'Quote.company.product.netProductAmountTitle'
                                                        )}
                                                      </span>
                                                      <p className="text-sm text-dark font-semibold">
                                                        {product?.price ? (
                                                          <span>
                                                            {getCurrencySymbol(
                                                              'EUR'
                                                            )}
                                                            &nbsp;
                                                            {formatCurrency(
                                                              Number(product?.price),
                                                              'EUR'
                                                            )}
                                                          </span>
                                                        ) : (
                                                          <span>-</span>
                                                        )}
                                                      </p>
                                                    </div>
                                                    <div className="px-5">
                                                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                        {t(
                                                          'invoice.product.vat.title'
                                                        )}
                                                      </span>
                                                      <p className="text-sm text-dark font-semibold">
                                                        {product?.product_total_vat_amount ? (
                                                          <span>
                                                            {getCurrencySymbol(
                                                              'EUR'
                                                            )}
                                                            &nbsp;
                                                            {formatCurrency(
                                                              Number(
                                                                product?.product_total_vat_amount
                                                              ),
                                                              'EUR'
                                                            )}
                                                          </span>
                                                        ) : (
                                                          <span>-</span>
                                                        )}
                                                      </p>
                                                    </div>
                                                    <div className="px-5">
                                                      <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                        {t(
                                                          'Quote.company.product.totalProductAmountTitle'
                                                        )}
                                                      </span>
                                                      <p className="text-sm text-dark font-semibold">
                                                        {product?.product_total_vat_amount ||
                                                        product?.price ? (
                                                          <span>
                                                            {getCurrencySymbol(
                                                              'EUR'
                                                            )}
                                                            &nbsp;
                                                            {formatCurrency(
                                                              Number(
                                                                product?.product_total_vat_amount
                                                              ) +
                                                                Number(
                                                                  product?.price
                                                                ),
                                                              'EUR'
                                                            )}
                                                          </span>
                                                        ) : (
                                                          <span>-</span>
                                                        )}
                                                      </p>
                                                    </div>
                                                    {product?.codes?.courses?.[index]
                                                      ?.start_date && (
                                                      <div className="px-5">
                                                        <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                          {t(
                                                            'ClientManagement.courseListing.startDate'
                                                          )}
                                                        </span>

                                                        <p className="text-sm text-dark font-semibold">
                                                          {format(
                                                            parseISO(
                                                              product?.codes
                                                                ?.courses?.[index]
                                                                ?.start_date
                                                            ),
                                                            REACT_APP_DATE_FORMAT as string
                                                          )}
                                                        </p>
                                                      </div>
                                                    )}
                                                    {product?.codes?.courses?.[index]
                                                      ?.end_date && (
                                                      <div className="px-5">
                                                        <span className="block text-sm text-dark/50 mb-1 font-medium">
                                                          {t(
                                                            'ClientManagement.courseListing.endDate'
                                                          )}
                                                        </span>
                                                        <p className="text-sm text-dark font-semibold">
                                                          {format(
                                                            parseISO(
                                                              product?.codes
                                                                ?.courses?.[index]
                                                                ?.end_date
                                                            ),
                                                            REACT_APP_DATE_FORMAT as string
                                                          )}
                                                        </p>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                      </div>
                                    );
                                  }
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <Button
                    className={`min-w-[90px] ${
                      isAddLoading ? 'disabled:opacity-50 pointer-events-none' : ''
                    }`}
                    disabled={isAddLoading}
                    isLoading={isAddLoading}
                    variants="primary"
                    type="submit"
                  >
                    {t('addFooterTitle')}
                  </Button>
                </div>
              </>
            </CustomCard>
          </Form>
        )}
      </Formik>
      {productsEmptyModal.isOpen && (
        <ConfirmationPopup
          modal={productsEmptyModal}
          bodyText={t('invoice.products.validationErrorMessage')}
          variants="primary"
          popUpType="warning"
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            productsEmptyModal.closeModal();
          }}
        />
      )}
    </>
  );
};
export default CreateInvoice;
