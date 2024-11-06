import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { ProductData } from 'modules/Order/types';
import { FundedBy } from 'modules/Quotes/constants';
import { QuoteResponseValues } from 'modules/Quotes/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getCitiesJson } from 'redux-toolkit/slices/countryJsonSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { getPresignedImageUrl } from 'services/aws.service';
import { formatCurrency, getCurrencySymbol } from 'utils';

const ViewQuote = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();

  const [getQuoteApi] = useAxiosGet();
  const params = useParams();
  const slugValue = params.slug;
  const [quoteData, setQuoteData] = useState<QuoteResponseValues>();
  const [preloadedUrls, setPreloadedUrls] = useState<Record<string, string>>({});
  const allRoles = useSelector(getRoles);
  const cities = useSelector(getCitiesJson);
  const { state } = useLocation();

  updateTitle(quoteData?.company?.name ?? t('Quote.viewDetails'));

  const currentRole = allRoles.find((role) => role.name === ROLES.SalesRep);
  const { response: salesRepResponse } = useQueryGetFunction('/users', {
    option: {
      dropdown: true,
      label: 'full_name',
    },
    role: currentRole?.id.toString(),
  });
  const ViewData = async () => {
    const { data } = await getQuoteApi('/quotes', {
      params: {
        slug: slugValue,
        sort: 'id',
      },
    });
    setQuoteData(data);
  };

  useEffect(() => {
    ViewData();
  }, []);

  useEffect(() => {
    preloadUrls();
  }, [quoteData?.quoteAttachment]);

  const getTotalVatAmount = (data: ProductData) => {
    let vat_amount = 0;
    const price = Number(data?.price || 0);
    const vat_type = data?.vat_type !== 0 ? Number(data?.vat_type || 0) / 100 : 1;
    const units = Number(data?.units ?? 0);
    const total_vat = Number(data?.product_total_vat_amount ?? 0);
    if (quoteData?.total_amount_without_tax) {
      const tax = price * vat_type * units;
      vat_amount = tax;
    } else {
      vat_amount = total_vat * units;
    }
    return `${vat_amount?.toFixed(2)}`;
  };
  const getTotalProductAmount = (data: ProductData) => {
    let vat_amount = 0;
    const price = Number(data?.price || 0);

    const vat_type = data?.vat_type !== 0 ? Number(data?.vat_type || 0) / 100 : 1;

    const units = Number(data?.units ?? 0);

    const total_vat = Number(data?.product_total_vat_amount ?? 0);

    const total_amount = Number(data?.product_total_amount);

    const tax = price * vat_type * units;
    if (quoteData?.total_amount_without_tax) {
      const amount = price * units;
      vat_amount = tax + amount;
    } else {
      const vat = total_vat * units;

      const amount = data?.discount
        ? (price - price * (Number(data?.discount) / 100)) * units
        : total_amount * units;
      console.log('🚀 ~ getTotalProductAmount ~ amount:', amount);
      vat_amount = vat + amount;
    }
    return `${vat_amount?.toFixed(2)}`;
  };
  const QuoteData = [
    {
      label: t('Quote.company.detail.paymentMethodTitle'),
      value: quoteData?.payment_method,
    },

    {
      label: t('UserProfile.viewProfile.addressLabel'),
      value: quoteData?.company?.address1,
    },
    {
      label: t('UserProfile.viewProfile.address2Label'),
      value: quoteData?.company?.address2 ?? '-',
    },
    {
      label: t('Quote.company.detail.capTitle'),
      value: quoteData?.company?.zip,
    },
    {
      label: t('Quote.company.detail.cityTitle'),
      value: cities.cities.find((item) => item.id === quoteData?.company?.city)
        ?.name,
    },
    {
      label: t('Quote.company.detail.provinceTitle'),
      value: quoteData?.company?.address_province ?? '-',
    },
    {
      label: t('Quote.company.detail.nationTitle'),
      value: quoteData?.company?.country,
    },

    {
      label: t('Quote.company.detail.telephoneTitle'),
      value: quoteData?.telephone,
    },
    {
      label: t('Quote.company.detail.mobileTitle'),
      value: quoteData?.mobile_number,
    },
    {
      label: t('CompanyManager.fundedByTitle'),
      value:
        quoteData?.funded_by === FundedBy.ProlevenAcademy
          ? FundedBy['proleven-academy']
          : FundedBy['client-address'],
    },
  ];

  const DestinationAddress = [
    {
      label: 'Name',
      value: quoteData?.destination_goods,
    },
    {
      label: t('Quote.company.detail.emailTitle'),
      value: quoteData?.email,
    },
    {
      label: t('Quote.company.detail.mobileTitle'),
      value: quoteData?.mobile_number,
    },
    {
      label: t('Quote.company.detail.telephoneTitle'),
      value: quoteData?.telephone,
    },
    {
      label: t('Quote.company.detail.addressTitle'),
      value: quoteData?.address,
    },

    {
      label: t('Quote.company.detail.capTitle'),
      value: quoteData?.cap_number,
    },
    {
      label: t('Quote.company.detail.cityTitle'),
      value: cities.cities.find((item) => item.id === quoteData?.city)?.name,
    },
    {
      label: 'Province',
      value: quoteData?.province,
    },
    {
      label: t('Quote.company.detail.nationTitle'),
      value: quoteData?.country,
    },
  ];

  let filteredDestinationAddress = [...DestinationAddress];
  if (quoteData && quoteData?.is_destination_goods === false) {
    filteredDestinationAddress = filteredDestinationAddress.filter(
      (item) =>
        item.label !== t('Quote.company.detail.cityTitle') &&
        item.label !== t('Quote.company.detail.nationTitle') &&
        item.label !== t('Quote.company.detail.addressTitle')
    );
  }
  const renderComp = (docs: { attachment: string }, index: number) => {
    const fileName = docs?.attachment.split('/');
    const extension = fileName[fileName.length - 1].split('.');
    const url = preloadedUrls[docs.attachment];
    return (
      <div
        key={`attachment_${index + 1}`}
        className="flex flex-wrap items-center mb-2"
      >
        <div className="h-auto min-h-[30px] w-16 flex items-center rounded-l-lg justify-center bg-gray-200 border border-solid border-gray-200 font-semibold text-sm text-gray-600">
          {extension[extension.length - 1]}
        </div>
        <div className="w-[calc(100%_-_64px)] px-4 rounded-r-lg  border border-solid border-gray-200 border-l-0 min-h-[30px] flex flex-col items-start justify-center">
          <p className="text-sm text-dark font-medium truncate">
            <Link
              to={url ?? ''}
              target="_blank"
              className="w-24 h-16 overflow-hidden"
            >
              {`${fileName[fileName.length - 1]}`}
            </Link>
          </p>
        </div>
      </div>
    );
  };
  const internalAttachments = quoteData?.quoteAttachment?.filter(
    (data) => data.attachment_type === 'internal'
  );
  const clientAttachments = quoteData?.quoteAttachment?.filter(
    (data) => data.attachment_type === 'client'
  );

  const statusRender = (item: string) => {
    const getStatusClass = () => {
      switch (item) {
        case 'approved':
        case 'pass':
          return 'completed';
        case 'requested':
          return 'pending';
        case 'rejected':
          return 'cancelled';
        default:
          return 'pending';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  // const totalVatAmount = 0;
  let totalQuoteProductAmount = 0;
  let totalNetProductAmount = 0;
  let vatAmountNumber = 0;
  let discountVatAmt = 0;
  let discountTotalAmt = 0;
  const totalDiscountFactor = 1 - (Number(quoteData?.total_discount) || 0) / 100;

  quoteData?.quoteProduct?.forEach((data) => {
    const productData = data as unknown as ProductData;
    vatAmountNumber += Number(getTotalVatAmount(productData));
    const unitPrice = Number(productData?.price || 0);
    const units = Number(productData?.units || 0);
    const discount = Number(productData?.discount || 0) / 100;
    const totalProductAmount = unitPrice * (1 - discount);
    totalQuoteProductAmount += Number(getTotalProductAmount(productData));
    discountVatAmt = vatAmountNumber * totalDiscountFactor;
    totalNetProductAmount += totalProductAmount * units;
  });
  totalNetProductAmount *= 1 - (Number(quoteData?.total_discount) || 0) / 100;

  discountTotalAmt =
    totalQuoteProductAmount * (1 - (Number(quoteData?.total_discount) || 0) / 100);

  const preloadUrls = async () => {
    const urls: Record<string, string> = {};
    const promises = (quoteData?.quoteAttachment ?? []).map(async (item) => {
      const url = await getPresignedImageUrl(
        item.attachment,
        undefined,
        undefined,
        true
      );
      urls[item.attachment] = url;
    });
    await Promise.all(promises);
    setPreloadedUrls(urls);
  };

  return (
    <div>
      <PageHeader
        small
        text={t('Quote.viewDetails')}
        url={state?.fromCourse ? state?.url : PRIVATE_NAVIGATION.quotes.list.path}
        passState={{
          ...state,
          ...(state?.fromCourse ? { corseActiveTab: 'quotes' } : {}),
        }}
      />
      <CustomCard minimal cardClass="w-full sticky -top-6 z-1">
        <div className="flex justify-between">
          <div className="flex gap-x-3">
            <div className="w-[169px] h-[100px] border border-solid border-borderColor rounded-xl overflow-hidden">
              <Image
                src={quoteData?.company?.logo}
                imgClassName="w-full h-full object-cover"
                serverPath
              />
            </div>
            <div className="max-w-[calc(100%_-_169px)]">
              <div className="flex gap-2 flex-col">
                <p className="text-2xl 1200:text-3xl font-bold">
                  {quoteData?.company?.name}
                </p>

                <div className="flex flex-row gap-5">
                  <p>
                    <span className="text-sm text-dark/50 gap-2.5">
                      {t('Quote.columnsTitle.quoteNumber')}:
                    </span>{' '}
                    {quoteData?.quote_number}
                  </p>

                  <p className="">
                    <span className="text-sm text-dark/50 gap-2.5">
                      {t('Quote.company.detail.dateTitle')}:
                    </span>{' '}
                    {quoteData?.date &&
                      format(
                        new Date(quoteData?.date),
                        REACT_APP_DATE_FORMAT as string
                      )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-5 mt-3">
                {quoteData?.company?.vat_number && (
                  <p className="text-sm text-dark/50 flex items-center gap-2.5">
                    <Button className=" inline-block">
                      {t('Quote.company.detail.vatTitle')}:
                    </Button>
                    <Button className="text-base text-dark font-medium inline-block">
                      {quoteData?.company?.vat_number}
                    </Button>
                  </p>
                )}
                {quoteData?.company?.sdi_code && (
                  <p className="text-sm text-dark/50 flex items-center gap-2.5">
                    <Button className=" inline-block">
                      {t('Quote.company.detail.codeDestTitle')}:
                    </Button>
                    <Button className="text-base text-dark font-medium inline-block">
                      {quoteData?.company?.sdi_code}
                    </Button>
                  </p>
                )}
                {quoteData?.company?.codice_fiscale && (
                  <p className="">
                    <span className="text-sm text-dark/50 gap-2.5">
                      {t('Quote.company.detail.codiceFiscaleTitle')}:
                    </span>
                    {quoteData?.company?.codice_fiscale}
                  </p>
                )}
                <p className="text-sm text-dark/50 flex items-center gap-2.5">
                  <Button className=" inline-block">
                    {t('Quote.company.detail.salesRepTitle')}:
                  </Button>
                  <Button className="text-base text-dark font-medium inline-block">
                    {
                      salesRepResponse?.data?.find(
                        (item: { label: string; value: string }) =>
                          item.value === quoteData?.sales_rep_id
                      )?.label
                    }
                  </Button>
                </p>
              </div>
            </div>
          </div>
          <div>{statusRender(quoteData?.status as string)}</div>
        </div>
      </CustomCard>
      <div className="flex flex-wrap -mx-3 mt-5 gap-y-4">
        <div className="1200:w-5/12 w-full  px-3 flex flex-col gap-4">
          <CustomCard minimal>
            <>
              <div
                className={`flex flex-wrap gap-3 mb-5 ${
                  quoteData?.is_destination_goods
                    ? 'border-b border-solid border-black/10 pb-5'
                    : ''
                }`}
              >
                {Array.isArray(QuoteData) &&
                  QuoteData?.map(
                    (data, index) =>
                      data.value && (
                        <div
                          className=" px-5 py-2.5 max-w-[280px]  rounded-10px"
                          key={`quote_${index + 1}`}
                        >
                          <p className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                            {data?.label}
                          </p>
                          <p className="text-sm text-dark font-semibold leading-5">
                            {data?.value}
                          </p>
                        </div>
                      )
                  )}
              </div>
              {quoteData?.is_destination_goods && (
                <>
                  <h3 className="mb-8 font-semibold">
                    {t('quote.view.destinationGoods.title')}
                  </h3>
                  <div className="flex flex-wrap gap-y-5 gap-x-7">
                    {Array.isArray(filteredDestinationAddress) &&
                      filteredDestinationAddress?.map((data, index) => (
                        <div
                          className="flex flex-col gap-1"
                          key={`quote_${index + 1}`}
                        >
                          <p className="text-sm text-dark/50 font-medium">
                            {data?.label}
                          </p>
                          <p className="text-[15px] text-dark font-semibold">
                            {data?.value ?? '-'}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </>
          </CustomCard>
          <CustomCard
            minimal
            title={t('Quote.company.destination.internalAttachmentTitle')}
          >
            {Array.isArray(internalAttachments) && internalAttachments.length > 0 ? (
              <div className="flex flex-wrap gap-y-4 gap-x-4">
                {Array.isArray(internalAttachments) &&
                  internalAttachments.map((data, index) => {
                    return renderComp(data, index);
                  })}
              </div>
            ) : (
              <NoDataFound />
            )}
          </CustomCard>

          <CustomCard
            minimal
            title={t('Quote.company.destination.clientAttachmentTitle')}
          >
            {Array.isArray(clientAttachments) && clientAttachments.length > 0 ? (
              <div className="flex flex-wrap gap-y-4 gap-x-4">
                {Array.isArray(clientAttachments) &&
                  clientAttachments.map((data, index) => {
                    return renderComp(data, index);
                  })}
              </div>
            ) : (
              <NoDataFound />
            )}
          </CustomCard>
          <CustomCard minimal title="Comments">
            <div className="max-h-[250px] overflow-auto text-sm text-dark/70 leading-[1.7]">
              {quoteData?.comments ?? <NoDataFound />}
            </div>
          </CustomCard>
        </div>
        <div className="1200:w-7/12 w-full px-3">
          <CustomCard
            titleClass="text-[25px]"
            minimal
            title={t('Quote.company.product.label')}
          >
            <>
              <div className="flex flex-col gap-5">
                {quoteData?.quoteProduct &&
                  quoteData?.quoteProduct.length > 0 &&
                  quoteData?.quoteProduct?.map((data, index) => {
                    const discountCalc =
                      Number(data?.price) *
                        Number(data?.units) *
                        (1 - Number(data?.discount ?? 0) / 100) ?? 0;
                    const totalProductAmount = data.discount
                      ? discountCalc
                      : Number(data.price ?? 0) * Number(data.units);
                    return data?.product_type !== 'description' ? (
                      <div key={`product_${index + 1}`}>
                        <p className="text-[20px] leading-[1.26] mb-4 text-dark font-bold">
                          {t('Quote.product.productTitle')} {index + 1}
                        </p>
                        <div className="bg-primaryLight py-7 px-5">
                          <p className="font-bold text-lg leading-[1.25] mb-3.5">
                            {data?.title ?? '-'}
                          </p>
                          {data?.codes?.code && (
                            <p className="flex mb-3 leading-[1.25]">
                              <span>
                                {t('CoursesManagement.columnHeader.CourseCode')}
                              </span>{' '}
                              &nbsp;- &nbsp;
                              <span className="font-bold text-md ">
                                {data?.codes?.code}
                              </span>
                            </p>
                          )}
                          <p
                            className="text-sm leading-[1.25] font-medium"
                            dangerouslySetInnerHTML={{ __html: data?.description }}
                          />
                          <div className="flex gap-x-2 mt-5">
                            <div className="w-full max-w-[calc(100%_-_150px)] gap-2 grid grid-cols-1 md:grid-cols-2 1400:grid-cols-4">
                              <div className="flex flex-col">
                                <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                  {t('Quote.company.product.unitsTitle')}
                                </Button>
                                <Button className="text-base text-dark font-semibold">
                                  {data?.units ?? 0}
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                  {t('Quote.company.product.priceTitle')}
                                </Button>
                                <Button className="text-base text-dark font-semibold">
                                  {data?.product_total_amount
                                    ? `${getCurrencySymbol(
                                        quoteData?.currency
                                      )} ${formatCurrency(
                                        Number(data?.price),
                                        quoteData?.currency
                                      )}`
                                    : '-'}
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                  {t('Auth.RegisterCompany.vatType')}
                                </Button>
                                <Button className="text-base text-dark font-semibold">
                                  {data?.vat_type ?? '-'}
                                  {data?.vat_type ? '%' : ''}
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                  {t('Quote.company.product.discountTitle')}
                                </Button>
                                <Button className="text-base text-dark font-semibold">
                                  {data?.discount ?? 0}
                                  {data?.discount ? '%' : ''}
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                  {t('Quote.company.product.totalVatAmount')}
                                </Button>
                                <Button className="text-base text-dark font-semibold">
                                  {getCurrencySymbol(quoteData?.currency)}{' '}
                                  {formatCurrency(
                                    Number(getTotalVatAmount(data as ProductData)),
                                    quoteData?.currency
                                  )}
                                </Button>
                              </div>

                              <div className="flex flex-col">
                                <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                  {t(
                                    'Quote.company.product.totalProductAmountTitle'
                                  )}
                                </Button>
                                <Button className="text-base text-dark font-semibold">
                                  {getCurrencySymbol(quoteData?.currency)}{' '}
                                  {formatCurrency(
                                    Number(
                                      getTotalProductAmount(data as ProductData)
                                    ),
                                    quoteData?.currency
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-col max-w-[150px] ms-auto">
                              <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                                {t('Quote.company.product.netProductAmountTitle')}
                              </Button>
                              <Button className="text-[18px] leading-[1.2] font-bold">
                                {data?.product_total_amount
                                  ? `${getCurrencySymbol(
                                      quoteData?.currency
                                    )} ${formatCurrency(
                                      totalProductAmount,
                                      quoteData?.currency
                                    )}`
                                  : '-'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={`product_${index + 1}`}>
                        <p className="text-[20px] leading-[1.26] mb-4 text-dark font-bold">
                          {t('Quote.product.productTitle')} {index + 1}
                        </p>
                        <div className="bg-primaryLight py-7 px-5">
                          <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                            {t('EmailTemplate.emailTempTableDescription')}
                          </Button>
                          <p
                            className="text-sm leading-[1.25] font-medium"
                            dangerouslySetInnerHTML={{ __html: data?.description }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="flex flex-wrap justify-end gap-4 mt-10">
                <div className="flex flex-col items-end">
                  <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                    {t('Quote.company.product.totalDiscountTitle')}
                  </Button>
                  <Button className="text-[20px] text-dark font-semibold ">
                    {quoteData?.total_discount ?? 0}
                    {quoteData?.total_discount ? '%' : ''}
                  </Button>
                </div>

                <div className="flex flex-col items-end">
                  <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                    {t('Quote.company.product.totalVatAmount')}
                  </Button>
                  <Button className="text-[20px] text-dark font-semibold ">
                    {getCurrencySymbol(quoteData?.currency)}{' '}
                    {Number.isNaN(discountVatAmt)
                      ? '-'
                      : formatCurrency(Number(discountVatAmt), quoteData?.currency)}
                  </Button>
                </div>
                <div className="flex flex-col items-end">
                  <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                    {t('Quote.company.product.netTotalProductAmountTitle')}
                  </Button>
                  <Button className="text-[18px] text-dark font-bold">
                    {getCurrencySymbol(quoteData?.currency)}{' '}
                    {Number.isNaN(totalNetProductAmount)
                      ? '-'
                      : formatCurrency(
                          Number(totalNetProductAmount),
                          quoteData?.currency
                        )}
                  </Button>
                </div>
                <div className="flex flex-col items-end">
                  <Button className="text-sm text-dark/50 mb-2.5 leading-4 font-medium">
                    {t('Quote.company.product.totalProductAmountTitle')}
                  </Button>
                  <Button className="text-[18px] text-dark font-semibold">
                    {getCurrencySymbol(quoteData?.currency)}{' '}
                    {Number.isNaN(discountTotalAmt)
                      ? '-'
                      : formatCurrency(
                          Number(discountTotalAmt),
                          quoteData?.currency
                        )}
                  </Button>
                </div>
              </div>
            </>
          </CustomCard>
        </div>
      </div>
    </div>
  );
};
export default ViewQuote;
