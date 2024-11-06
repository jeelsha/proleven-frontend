import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import StatusLabel from 'components/StatusLabel';
import { ProductTypeEnum } from 'modules/Quotes/constants';
import { useLocation } from 'react-router-dom';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { ProductData, ProductProps } from '../types';

export const ProductDetails = ({
  productData,
  t,
  quoteData,
  checkData = true,
}: ProductProps) => {
  const paramsData = useLocation();
  const getTotalVatAmount = (data: ProductData) => {
    let vat_amount = 0;
    // if (!paramsData?.pathname?.includes('invoice')) {
    const price = Number(data?.price || 0);
    const vat_type = data?.vat_type > 0 ? Number(data?.vat_type || 0) / 100 : 0;
    const units = Number(data?.units ?? 0);
    const total_vat = Number(data?.product_total_vat_amount ?? 0);
    if (quoteData?.total_amount_without_tax) {
      const tax = price * vat_type * units;
      vat_amount = tax;
    } else {
      vat_amount = total_vat * units;
    }
    // }
    // else {
    //   const credit_price = data?.credit_note
    //     ? data?.credit_note[0]?.credit_price
    //     : 0;

    //   const price =
    //     credit_price > 0
    //       ? Number(data?.price || 0) - Number(credit_price)
    //       : Number(data?.price || 0);
    //   const vat_type = data?.vat_type > 0 ? Number(data?.vat_type || 0) / 100 : 0;
    //   const units = Number(data?.units ?? 0);
    //   const total_vat = Number(data?.product_total_vat_amount ?? 0);
    //   if (quoteData?.total_amount_without_tax) {
    //     const tax = price * vat_type * units;
    //     vat_amount = tax;
    //   } else {
    //     vat_amount = credit_price > 0 ? price * vat_type * units : total_vat * units;
    //   }
    // }

    return vat_amount?.toFixed(2);
  };
  const getTotalProductAmount = (data: ProductData) => {
    let vat_amount = 0;
    // if (!paramsData?.pathname?.includes('invoice')) {
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
      const amount = total_amount * units;
      vat_amount = vat + amount;
    }
    // } else {
    //   const credit_price = data.credit_note ? data?.credit_note[0]?.credit_price : 0;
    //   const price =
    //     credit_price > 0
    //       ? Number(data?.price || 0) - Number(credit_price)
    //       : Number(data?.price || 0);
    //   const vat_type = data?.vat_type !== 0 ? Number(data?.vat_type || 0) / 100 : 1;
    //   const units = Number(data?.units ?? 0);
    //   const total_vat = Number(data?.product_total_vat_amount ?? 0);
    //   const total_amount = Number(data?.product_total_amount);
    //   const tax = price * vat_type * units;
    //   if (quoteData?.total_amount_without_tax) {
    //     const amount = price * units;
    //     vat_amount = tax + amount;
    //   } else {
    //     const vat = credit_price > 0 ? price * vat_type * units : total_vat * units;
    //     const amount = credit_price > 0 ? price * units : total_amount * units;
    //     vat_amount = vat + amount;
    //   }
    // }
    return vat_amount?.toFixed(2);
  };

  const getTotalNetAmount = (data: ProductData) => {
    let totalAmt = 0;
    // if (!paramsData?.pathname?.includes('invoice')) {
    const price = Number(data?.price);
    const units = Number(data?.units ?? 0);
    const discount = data?.discount ? Number(data?.discount) / 100 : 1;
    const amount = price * units;
    totalAmt = data?.discount ? amount - amount * discount : price * units;
    // } else {
    //   const credit_price = data.credit_note ? data?.credit_note[0]?.credit_price : 0;
    //   const price = Number(data?.price);
    //   const units = Number(data?.units ?? 0);
    //   const discount = data?.discount ? Number(data?.discount) / 100 : 1;
    //   const amount = price * units;
    //   totalAmt = data?.discount
    //     ? credit_price > 0
    //       ? amount - amount * discount - credit_price
    //       : amount - amount * discount
    //     : credit_price > 0
    //     ? price * units - credit_price
    //     : price * units;
    // }

    return totalAmt;
  };

  return (
    <div className="mt-30px">
      <CustomCard minimal title={t('Quote.company.product.label')}>
        <>
          <div className="border-t border-solid border-borderColor pt-5 flex flex-col gap-5">
            {Array.isArray(productData) &&
              productData.length > 0 &&
              productData.map((data, index) =>
                data?.product_type !== 'description' ? (
                  <div className="" key={`product_details_${index + 1}`}>
                    <p className="text-xl font-semibold text-dark mb-4">
                      {t('Quote.product.productTitle')} {index + 1}
                    </p>

                    <div className="bg-primaryLight px-8 py-7 rounded-10px">
                      <div className="flex flex-wrap gap-y-5">
                        <div className="flex flex-col gap-y-2 1200:max-w-[500px] 1200:pr-3 max-w-[1200px]">
                          <div className="flex flex-wrap gap-2">
                            <StatusLabel
                              text={data?.invoice_status}
                              variants="completed"
                            />
                          </div>
                          <p className="text-lg font-semibold">{data.title}</p>
                          <p
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: data.description }}
                          />
                        </div>
                        <div className=" ms-auto 1200:max-w-[calc(100%_-_500px)] max-w-[calc(100%_-_0px)] w-full flex flex-col gap-y-6">
                          <div className="flex flex-wrap gap-y-4 w-full justify-end">
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Quote.company.product.unitsTitle')}
                              </span>
                              <p className="text-sm text-dark font-semibold">
                                {data.units ?? 0}
                              </p>
                            </div>
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Quote.company.product.priceTitle')}
                              </span>
                              <p className="text-sm text-dark font-semibold">
                                {getCurrencySymbol(quoteData?.currency)}{' '}
                                {formatCurrency(
                                  Number(data.price),
                                  quoteData?.currency
                                ) ?? 0}
                              </p>
                            </div>
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Auth.RegisterCompany.vatType')}
                              </span>
                              <p className="text-sm text-dark font-semibold">
                                {data.vat_type ?? '-'}
                                {data?.vat_type ? '%' : ''}
                              </p>
                            </div>
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Quote.company.product.discountTitle')}
                              </span>
                              <p className="text-sm text-dark font-semibold">
                                {data.discount ?? 0}
                                {data?.discount ? '%' : ''}
                              </p>
                            </div>
                            {/* {paramsData?.pathname?.includes('invoice') && (
                              <div className="md:w-1/2 991:w-1/3 1600:w-1/5">
                                <span className="block text-sm text-dark/50 mb-1 font-medium">
                                  {t('Quote.company.product.creditNote')}
                                </span>
                                <p className="text-sm text-dark font-semibold">
                                  - {getCurrencySymbol(quoteData?.currency)}
                                  {formatCurrency(
                                    Number(
                                      data?.credit_note
                                        ? data?.credit_note[0]?.credit_price
                                        : 0 || 0
                                    ),
                                    quoteData?.currency
                                  ) ?? 0}
                                </p>
                              </div>
                            )} */}
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Quote.company.product.netProductAmountTitle')}
                              </span>
                              <p className="block text-sm text-dark font-semibold">
                                {data?.product_total_amount
                                  ? `${getCurrencySymbol(
                                      quoteData?.currency
                                    )} ${formatCurrency(
                                      Number(getTotalNetAmount(data as ProductData)),
                                      quoteData?.currency
                                    )}`
                                  : '-'}
                              </p>
                            </div>
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Quote.company.product.totalVatAmount')}
                              </span>
                              <p className="text-sm text-dark font-semibold">
                                {getCurrencySymbol(quoteData?.currency)}{' '}
                                {formatCurrency(
                                  Number(getTotalVatAmount(data as ProductData)),
                                  quoteData?.currency
                                )}
                              </p>
                            </div>
                            <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                              <span className="block text-sm text-dark/50 mb-1 font-medium">
                                {t('Quote.company.product.totalProductAmountTitle')}
                              </span>
                              <span className="text-sm text-dark font-semibold block">
                                {getCurrencySymbol(quoteData?.currency)}{' '}
                                {formatCurrency(
                                  Number(getTotalProductAmount(data as ProductData)),
                                  quoteData?.currency
                                )}
                              </span>
                            </div>
                          </div>
                          {checkData &&
                            data?.product_type === ProductTypeEnum.product && (
                              <div className="w-full flex flex-wrap gap-y-4 justify-end">
                                <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                                  <span className="block text-sm text-dark/50 mb-1 font-medium">
                                    {t('orderRemaining')}
                                  </span>
                                  <p className="text-sm text-dark font-semibold">
                                    {data?.count?.notCompleted ?? 0}
                                  </p>
                                </div>
                                <div className="md:w-1/2 991:w-1/3 1600:w-1/5 ">
                                  <span className="block text-sm text-dark/50 mb-1 font-medium">
                                    {t('orderCompleted')}
                                  </span>
                                  <p className="text-sm text-dark font-semibold">
                                    {data?.count?.completed ?? 0}
                                  </p>
                                </div>
                              </div>
                            )}
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
                )
              )}
          </div>
          <div className="mt-30px">
            <div className="flex flex-wrap gap-16 justify-end text-right">
              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.totalDiscountTitle')}
                </span>
                <p className="text-[20px] text-dark font-semibold">
                  {quoteData?.total_discount ?? 0}
                  {quoteData?.total_discount ? '%' : ''}
                </p>
              </div>

              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.totalVatAmount')}
                </span>
                <p className="text-[20px] text-dark font-semibold">
                  {getCurrencySymbol(quoteData?.currency)}{' '}
                  {Number.isNaN(quoteData?.total_vat_amount)
                    ? '-'
                    : formatCurrency(
                        Number(quoteData?.total_vat_amount),
                        quoteData?.currency
                      )}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.netTotalProductAmountTitle')}
                </span>
                <p className="text-2xl text-dark font-semibold">
                  {`${getCurrencySymbol(quoteData?.currency)} ${
                    quoteData?.total_amount_without_tax
                      ? paramsData?.pathname?.includes('invoice')
                        ? formatCurrency(
                            Number(quoteData?.total_amount),
                            quoteData?.currency
                          )
                        : formatCurrency(
                            Number(quoteData?.total_amount_without_tax),
                            quoteData?.currency
                          )
                      : formatCurrency(
                          Number(quoteData?.total_amount),
                          quoteData?.currency
                        )
                  }`}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="block text-sm text-dark/50 mb-1 font-medium">
                  {t('Quote.company.product.totalProductAmountTitle')}
                </span>
                <p className="text-[20px] text-dark font-semibold">
                  {quoteData?.total_amount
                    ? `${getCurrencySymbol(quoteData?.currency)} ${formatCurrency(
                        Number(
                          quoteData?.total_amount_without_tax
                            ? paramsData?.pathname?.includes('invoice')
                              ? quoteData?.total_amount || 0
                              : quoteData?.total_amount_without_tax
                            : quoteData?.total_amount || 0
                        ) + Number(quoteData?.total_vat_amount || 0),
                        quoteData?.currency
                      )}`
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </>
      </CustomCard>
    </div>
  );
};
