// ** imports **
import { FieldArray, Form, Formik, FormikValues } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import InputField from 'components/FormElement/InputField';
import PageHeader from 'components/PageHeader/PageHeader';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';

import 'modules/Client/styles/index.css';

// ** types **
import { format } from 'date-fns';
import {
  InvoiceProductProps,
  OrderStatusType,
  ProductData,
  ProductProps,
} from 'modules/CreditNotes/types';

import { CompanyDataProps, QuoteDataProps } from '../Order/types';

// ** validation **
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { useTitle } from 'hooks/useTitle';
import _ from 'lodash';
import { creditNoteValidation } from 'modules/CreditNotes/validation';
import { QuoteData } from 'modules/Order/components/QuoteData';
import { ProductTypeEnum } from 'modules/Quotes/constants';
import { useEffect, useState } from 'react';
import { formatCurrency, getCurrencySymbol } from 'utils';

// ** redux **

const AddCreditNote = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { slug } = useParams();
  const [creditNoteCreateApi, { isLoading: isAddLoading }] = useAxiosPost();
  const [getInvoiceDataApi] = useAxiosGet();

  const [invoiceData, setInvoiceData] = useState([] as InvoiceProductProps);

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('creditNoteDetailTitle'));

  const initialData = !_.isNull(invoiceData?.invoice_product?.[0]?.quotes)
    ? (invoiceData?.invoice_product ?? []).map((data) => {
        return {
          credit_price: data?.product?.credit_note
            ? data?.product?.credit_note.length > 0
              ? data?.product?.credit_note[0]?.credit_price
              : ''
            : '',
          description: data?.product?.credit_note
            ? data?.product?.credit_note.length > 0
              ? data?.product?.credit_note[0]?.description
              : ''
            : '',
        };
      })
    : (invoiceData?.course?.participate ?? []).map((data) => {
        return {
          credit_price: !_.isUndefined(data?.credit_price) ? data?.credit_price : '',
          description: !_.isUndefined(data?.credit_description)
            ? data?.credit_description
            : '',
        };
      });

  const initialValues = {
    creditNotes: initialData,
  };

  const getInvoiceData = async () => {
    const response = await getInvoiceDataApi(`/invoice`, { params: { slug } });
    let invoiceProduct = response?.data;
    if (!_.isNull(response?.data?.invoice_product?.[0]?.quotes)) {
      const filterData = response?.data?.invoice_product?.filter(
        (data: ProductProps) => {
          return data?.product?.product_type === ProductTypeEnum.description
            ? data?.product?.price > 0
            : data;
        }
      );
      invoiceProduct = { ...response?.data, invoice_product: filterData };
    }
    setInvoiceData(invoiceProduct);
  };

  useEffect(() => {
    getInvoiceData();
  }, []);

  const OnSubmit = async (companyData: FormikValues) => {
    const updatedData = {
      invoice_product: invoiceData?.invoice_product
        ?.map((data: ProductProps, index: number) => {
          return {
            ...(data.course ? { course_id: data.course.id } : {}),
            order_id: data.order_id,
            company_id: data?.company?.id,
            product_id: data?.product?.id,
            price: data?.product?.price,
            credit_price: companyData.creditNotes[index]?.credit_price,
            invoice_id: data?.invoice_id,
            payment_term_id: data.payment_term_id,
            description: companyData.creditNotes[index]?.description,
            qty: data?.product?.units,
          };
        })
        .filter((data) => Number(data?.credit_price) > 0),
    };
    const formsData = new FormData();
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value instanceof File) {
        formsData.append(key, value);
      } else {
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : value;
        formsData.append(key, stringValue as string);
      }
    });
    const response = await creditNoteCreateApi(`/credit-notes/add/`, formsData);
    if (_.isEmpty(response.error)) {
      navigate(PRIVATE_NAVIGATION.creditNotes.list.path);
    }
  };
  const invoiceProductPrices =
    invoiceData?.invoice_product?.map((product) => {
      const price = product?.product?.price ?? 0;
      const discount = product?.product?.discount ?? 0;
      const discountedPrice = price - price * (discount / 100);
      return product?.order?.type === OrderStatusType.Academic
        ? invoiceData?.price
          ? Number(invoiceData?.course?.total_amount)
          : discountedPrice
          ? Math.round(discountedPrice)
          : invoiceData?.course?.total_amount
          ? Number(invoiceData?.course?.total_amount)
          : 0
        : Math.round(discountedPrice);
    }) || [];

  const getTotalNetAmount = (data: ProductData) => {
    const credit_price = data?.credit_note[0]?.credit_price
      ? data?.credit_note[0]?.credit_price
      : 0;
    const price = Number(data?.price);
    const units = Number(data?.units ?? 0);
    const discount = data?.discount ? Number(data?.discount) / 100 : 1;
    const totalAmt = data?.discount
      ? credit_price > 0
        ? price - price * units * discount - credit_price
        : price - price * units * discount
      : credit_price > 0
      ? price * units - credit_price
      : price * units;

    return totalAmt;
  };

  const getTotalVatAmount = (data: ProductData) => {
    const credit_price = data?.credit_note[0]?.credit_price
      ? data?.credit_note[0]?.credit_price
      : 0;

    let vat_amount = 0;
    const price =
      credit_price > 0
        ? Number(data?.price || 0) - Number(credit_price)
        : Number(data?.price || 0);
    const vat_type = data?.vat_type > 0 ? Number(data?.vat_type || 0) / 100 : 0;
    const units = Number(data?.units ?? 0);
    const total_vat = Number(data?.product_total_vat_amount ?? 0);
    if (data?.quotes?.total_amount_without_tax) {
      const tax = price * vat_type * units;
      vat_amount = tax;
    } else {
      vat_amount = credit_price > 0 ? price * vat_type * units : total_vat * units;
    }

    return vat_amount?.toFixed(2);
  };
  const getTotalProductAmount = (data: ProductData) => {
    const credit_price = data?.credit_note[0]?.credit_price
      ? data?.credit_note[0]?.credit_price
      : 0;
    let vat_amount = 0;
    const price =
      credit_price > 0
        ? Number(data?.price || 0) - Number(credit_price)
        : Number(data?.price || 0);
    const vat_type = data?.vat_type !== 0 ? Number(data?.vat_type || 0) / 100 : 1;
    const units = Number(data?.units ?? 0);
    const total_vat = Number(data?.product_total_vat_amount ?? 0);
    const total_amount = Number(data?.product_total_amount);
    const tax = price * vat_type * units;
    if (data?.quotes?.total_amount_without_tax) {
      const amount = price * units;
      vat_amount = tax + amount;
    } else {
      const vat = credit_price > 0 ? price * vat_type * units : total_vat * units;
      const amount = credit_price > 0 ? price * units : total_amount * units;
      vat_amount = vat + amount;
    }
    return vat_amount?.toFixed(2);
  };

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={creditNoteValidation(invoiceProductPrices)}
        onSubmit={OnSubmit}
      >
        {({ values }) => {
          return (
            <Form>
              <PageHeader small text={t('addCreditNote')} url="/credit-notes" />
              <QuoteData
                quoteData={invoiceData?.quotes as unknown as QuoteDataProps}
                companyData={invoiceData?.company as unknown as CompanyDataProps}
                order_number={invoiceData?.order_number as unknown as string}
                invoice_number={invoiceData?.invoice_number as unknown as string}
                invoiceDate={invoiceData?.invoice_date as unknown as Date}
                t={t}
              />
              <CustomCard minimal>
                <>
                  <div className="-mx-6">
                    <FieldArray
                      name="creditNotes"
                      render={() => {
                        return (
                          <div className="p-6 mb-4 gap-4">
                            {(!_.isNull(invoiceData?.invoice_product?.[0]?.quotes)
                              ? invoiceData?.invoice_product
                              : invoiceData?.course?.participate
                            )?.map((invoice_product, index) => (
                              <div
                                className="w-full gap-4 grid bg-siteBG rounded-xl p-6 mb-6 last:mb-0"
                                key={`invoice_${index + 1}`}
                              >
                                <p className="text-xl font-semibold text-dark mb-4">
                                  {t('Quote.product.productTitle')} {index + 1}
                                </p>
                                {!_.isNull(
                                  invoiceData?.invoice_product?.[0]?.quotes
                                ) ? (
                                  <div className="bg-primaryLight px-8 py-7 rounded-10px border border-solid border-gray-200">
                                    <div className="flex items-center gap-10">
                                      <div className="flex flex-col gap-y-2 max-w-[350px]">
                                        <div className="flex flex-wrap gap-2">
                                          <StatusLabel
                                            text={
                                              invoice_product?.product
                                                ?.invoice_status
                                            }
                                            variants="completed"
                                          />
                                        </div>
                                        <p className="text-lg font-semibold">
                                          {invoice_product?.product?.title}
                                        </p>
                                        {invoice_product?.product?.description && (
                                          <p
                                            className="text-sm"
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                invoice_product?.product
                                                  ?.description,
                                            }}
                                          />
                                        )}
                                      </div>
                                      <div className="w-full">
                                        <div className="flex justify-between flex-wrap gap-4">
                                          <div className="min-w-[140px]">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t('Quote.company.product.unitsTitle')}
                                            </span>
                                            <p className="text-sm text-dark font-semibold">
                                              {invoice_product?.product?.units ?? 0}
                                            </p>
                                          </div>
                                          <div className="min-w-[140px]">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t('Quote.company.product.priceTitle')}
                                            </span>
                                            <p className="text-sm text-dark font-semibold">
                                              {getCurrencySymbol(
                                                invoice_product?.quotes?.currency
                                              )}{' '}
                                              {formatCurrency(
                                                Number(
                                                  invoice_product?.product?.price
                                                ),
                                                invoice_product?.quotes?.currency
                                              ) ?? 0}
                                            </p>
                                          </div>
                                          <div className="min-w-[140px] ">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t('Auth.RegisterCompany.vatType')}
                                            </span>
                                            <p className="text-sm text-dark font-semibold">
                                              {invoice_product?.company?.vat_type ??
                                                '-'}
                                              %
                                            </p>
                                          </div>
                                          <div className="min-w-[140px] ">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t(
                                                'Quote.company.product.discountTitle'
                                              )}
                                            </span>
                                            <p className="text-sm text-dark font-semibold">
                                              {invoice_product?.product?.discount ??
                                                0}
                                              %
                                            </p>
                                          </div>
                                          <div className="min-w-[140px]">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t('Quote.company.product.creditNote')}
                                            </span>
                                            <p className="text-sm text-dark font-semibold">
                                              -{' '}
                                              {getCurrencySymbol(
                                                invoice_product?.quotes?.currency
                                              )}{' '}
                                              {formatCurrency(
                                                Number(
                                                  invoice_product?.product
                                                    ?.credit_note
                                                    ? invoice_product?.product
                                                        ?.credit_note[0]
                                                        ?.credit_price
                                                    : 0 || 0
                                                ),
                                                invoice_product?.quotes?.currency
                                              ) ?? 0}
                                            </p>
                                          </div>
                                          <div className="max-w-[150px]">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t(
                                                'Quote.company.product.netProductAmountTitle'
                                              )}
                                            </span>
                                            <p className="block text-xl text-dark font-semibold">
                                              {invoice_product?.product
                                                ?.product_total_amount
                                                ? `${getCurrencySymbol(
                                                    invoice_product?.quotes?.currency
                                                  )} ${formatCurrency(
                                                    Number(
                                                      getTotalNetAmount(
                                                        invoice_product?.product as unknown as ProductData
                                                      )
                                                    ),
                                                    invoice_product?.quotes?.currency
                                                  )}`
                                                : '-'}
                                            </p>
                                          </div>
                                          <div className="min-w-[140px] ">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t(
                                                'Quote.company.product.totalVatAmount'
                                              )}
                                            </span>
                                            <p className="text-sm text-dark font-semibold">
                                              {getCurrencySymbol(
                                                invoice_product?.quotes?.currency
                                              )}{' '}
                                              {formatCurrency(
                                                Number(
                                                  getTotalVatAmount(
                                                    invoice_product?.product as unknown as ProductData
                                                  )
                                                ),
                                                invoice_product?.quotes?.currency
                                              )}
                                            </p>
                                          </div>
                                          <div className="min-w-[140px] ">
                                            <span className="block text-sm text-dark/50 mb-1 font-medium">
                                              {t(
                                                'Quote.company.product.totalProductAmountTitle'
                                              )}
                                            </span>
                                            <span className="text-sm text-dark font-semibold">
                                              {getCurrencySymbol(
                                                invoice_product?.quotes?.currency
                                              )}{' '}
                                              {formatCurrency(
                                                Number(
                                                  getTotalProductAmount(
                                                    invoice_product?.product as unknown as ProductData
                                                  )
                                                ),
                                                invoice_product?.quotes?.currency
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-xl font-semibold text-dark mb-4">
                                      {t('CoursesManagement.CreateCourse.course')}
                                    </p>

                                    <div className="bg-primaryLight px-8 py-7 rounded-10px border border-solid border-gray-200">
                                      <div className="grid gap-3 mb-2">
                                        <StatusLabel
                                          text="Invoiced"
                                          variants="completed"
                                        />
                                        <p className="text-lg font-semibold">
                                          {invoice_product?.title}
                                        </p>
                                        <p
                                          className="text-sm"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              invoice_product?.description as string,
                                          }}
                                        />
                                      </div>

                                      <div className="grid gap-5 grid-cols-4 bg-white rounded-lg shadow-md p-5 px-0 mb-6">
                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t('Quote.company.product.productCode')}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {invoice_product?.code}
                                          </p>
                                        </div>

                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'ClientManagement.courseListing.category'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {invoice_product?.courseCategory?.name}
                                          </p>
                                        </div>

                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t('Auth.RegisterCompany.vatType')}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {invoice_product?.company?.vat_type}%
                                          </p>
                                        </div>

                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'Quote.company.product.priceParticipateTitle'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            €{invoice_product?.price}
                                          </p>
                                        </div>

                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t('trainer.totalParticipate')}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {
                                              invoice_product?.company
                                                ?.course_participates?.length
                                            }
                                          </p>
                                        </div>

                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'ClientManagement.courseListing.startDate'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {invoice_product?.start_date &&
                                              format(
                                                new Date(
                                                  invoice_product?.start_date
                                                ),
                                                REACT_APP_DATE_FORMAT as string
                                              )}
                                          </p>
                                        </div>

                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'ClientManagement.courseListing.endDate'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {invoice_product?.end_date &&
                                              format(
                                                new Date(invoice_product?.end_date),
                                                REACT_APP_DATE_FORMAT as string
                                              )}
                                          </p>
                                        </div>
                                        <div className="min-w-[140px]">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t('Quote.company.product.creditNote')}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            - {getCurrencySymbol()}{' '}
                                            {formatCurrency(
                                              Number(
                                                invoice_product?.credit_price || 0
                                              )
                                            ) ?? 0}
                                          </p>
                                        </div>
                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'Quote.company.product.totalVatAmount'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {getCurrencySymbol()}{' '}
                                            {formatCurrency(
                                              Number(
                                                invoiceData?.course?.total_vat_amount
                                              )
                                            ) ?? 0}
                                          </p>
                                        </div>
                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'Quote.company.product.netTotalProductAmountTitle'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {getCurrencySymbol()}{' '}
                                            {formatCurrency(
                                              Number(
                                                invoiceData?.course?.total_amount
                                              )
                                            ) ?? 0}
                                          </p>
                                        </div>
                                        <div className="px-5">
                                          <span className="block text-sm text-dark/50 mb-1 font-medium">
                                            {t(
                                              'Quote.company.product.totalProductAmountTitle'
                                            )}
                                          </span>
                                          <p className="text-sm text-dark font-semibold">
                                            {getCurrencySymbol()}{' '}
                                            {formatCurrency(
                                              Number(
                                                invoiceData?.course?.total_vat_amount
                                              ) +
                                                Number(
                                                  invoiceData?.course?.total_amount
                                                )
                                            ) ?? 0}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-4 gap-5">
                                        {invoice_product?.company?.course_participates?.map(
                                          (data, index: number) => {
                                            return (
                                              <div
                                                className="grid gap-1 bg-white rounded-lg shadow-md p-5"
                                                key={`participate)_${index + 1}`}
                                              >
                                                <p className="text-sm text-dark font-semibold">
                                                  <span className="inline-block mr-2 text-sm text-dark/50 mb-1 font-medium">
                                                    {t(
                                                      'UserProfile.settings.firstName'
                                                    )}{' '}
                                                    :
                                                  </span>
                                                  {data?.first_name}
                                                </p>

                                                <p className="text-sm text-dark font-semibold">
                                                  <span className="inline-block mr-2 text-sm text-dark/50 mb-1 font-medium">
                                                    {t(
                                                      'UserProfile.settings.lastName'
                                                    )}{' '}
                                                    :
                                                  </span>
                                                  {data?.last_name}
                                                </p>

                                                <p className="text-sm text-dark font-semibold">
                                                  <span className="inline-block mr-2 text-sm text-dark/50 mb-1 font-medium">
                                                    {t('Codes.code')} :
                                                  </span>
                                                  {data?.code}
                                                </p>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}

                                <div className="grid grid-cols-2 gap-x-3 gap-y-7">
                                  <InputField
                                    parentClass=""
                                    placeholder={t(
                                      'CoursesManagement.CreateCourse.pricePlaceHolder'
                                    )}
                                    type="text"
                                    isCompulsory
                                    value={values?.creditNotes[index]?.credit_price}
                                    label={t('CoursesManagement.CreateCourse.price')}
                                    name={`creditNotes[${index}].credit_price`}
                                  />
                                  <InputField
                                    parentClass=""
                                    type="text"
                                    isCompulsory
                                    placeholder={t(
                                      'Quote.company.product.descriptionPlaceholder'
                                    )}
                                    label={t(
                                      'EmailTemplate.emailTempTableDescription'
                                    )}
                                    name={`creditNotes[${index}].description`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-4">
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
          );
        }}
      </Formik>
    </div>
  );
};
export default AddCreditNote;
