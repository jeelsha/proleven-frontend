import CustomCard from 'components/Card';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { REACT_APP_DATE_FORMAT } from 'config';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
  getCitiesJson,
  getCountriesJson,
  getStateJson,
} from 'redux-toolkit/slices/countryJsonSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { convertLocationIdToName } from 'utils';
import { AcademyTypeEnum } from '../constants';
import { QuoteProps } from '../types';

export const QuoteData = ({
  quoteData,
  t,
  companyData,
  order_number,
  invoiceDate,
  invoice_number,
  statusRenderData,
  LastPODate,
  lastPODatePresent,
  orderDate,
}: QuoteProps) => {
  const allRoles = useSelector(getRoles);
  const countries = useSelector(getCountriesJson);
  const states = useSelector(getStateJson);
  const cities = useSelector(getCitiesJson);
  const paramsData = useLocation();
  const currentRole = allRoles.find((role) => role.name === ROLES.SalesRep);
  const { response: salesRepResponse } = useQueryGetFunction('/users', {
    option: {
      dropdown: true,
      label: 'full_name',
    },
    role: currentRole?.id.toString(),
  });
  const AccountMail = () => {
    if (
      typeof companyData?.accounting_emails === 'string' &&
      (companyData?.accounting_emails as string).startsWith('[') &&
      (companyData?.accounting_emails as string).endsWith(']')
    ) {
      const companyEmail = JSON.parse(companyData?.accounting_emails ?? '');
      return (
        companyEmail.map((item: { email: string }) => item?.email).join(', ') ?? '-'
      );
    }
    if (typeof companyData?.accounting_emails === 'object') {
      return (
        companyData?.accounting_emails
          ?.map((item: { email: string }) => item?.email)
          .join(', ') ?? '-'
      );
    }
    return companyData?.accounting_emails ?? '-';
  };
  const CompanyDetails = [
    {
      label: t('ClientManagement.viewClientDetails.registrationNumberTitle'),
      value: companyData?.registration_number ?? '-',
    },
    {
      label: t('ClientManagement.viewClientDetails.atecoCodeTitle'),
      value: companyData?.ateco_code ?? '-',
    },
    {
      label: t('Quote.company.detail.telephoneTitle'),
      value: companyData?.telephone,
    },
    {
      label: t('ClientManagement.viewClientDetails.vatNumberTitle'),
      value: companyData?.vat_number ?? '-',
    },
    {
      label: t('ClientManagement.viewClientDetails.accountingEmailTitle'),
      value: AccountMail(),
    },
    {
      label: t('UserProfile.viewProfile.addressLabel'),
      value: companyData?.address1 ?? '-',
    },
    {
      label: t('UserProfile.viewProfile.address2Label'),
      value: companyData?.address2 ?? '-',
    },
    {
      label: t('UserProfile.viewProfile.cityLabel'),
      value:
        (companyData?.city &&
          convertLocationIdToName(
            'city',
            companyData?.city,
            countries,
            states,
            cities
          )) ??
        '-',
    },
    {
      label: t('UserProfile.viewProfile.countryLabel'),
      value:
        (companyData?.country &&
          convertLocationIdToName(
            'country',
            companyData?.country,
            countries,
            states,
            cities
          )) ??
        '-',
    },
    {
      label: t('Quote.company.detail.capTitle'),
      value: companyData?.zip ?? '-',
    },
  ];
  const QuoteDetails = [
    {
      label: t('Auth.Login.email'),
      value: quoteData?.destination_email,
    },
    {
      label: t('Quote.company.detail.codiceFiscaleTitle'),
      value: quoteData?.codice_fiscale,
    },
    {
      label: t('Quote.company.detail.telephoneTitle'),
      value: quoteData?.destination_telephone,
    },
    {
      label: t('Quote.company.detail.mobileTitle'),
      value: quoteData?.destination_mobile_number,
    },
    {
      label: t('Calendar.eventDetails.addressTitle'),
      value: quoteData?.company?.address1,
    },
    {
      label: t('Quote.company.detail.cityTitle'),
      value: quoteData?.company?.city,
    },
    {
      label: t('Quote.company.destination.provinceTitle'),
      value: quoteData?.destination_province,
    },
    {
      label: t('Quote.company.detail.nationTitle'),
      value: quoteData?.company?.country,
    },
    {
      label: t('Quote.company.detail.capTitle'),
      value: quoteData?.company?.zip,
    },
    {
      label: t('Quote.company.detail.paymentMethodTitle'),
      value: quoteData?.payment_method,
    },
    {
      label: t('issuedBy'),
      value: quoteData
        ? quoteData?.academy === AcademyTypeEnum.prolevenSRI
          ? 'Proleven S.r.l.'
          : 'Proleven Gmbh'
        : '-',
    },
  ];

  const DestinationDetails = [
    {
      label: t('Quote.company.destination.label'),
      value:
        quoteData?.is_destination_goods === false
          ? t('confirmationChoices.noOption')
          : t('confirmationChoices.yesOption'),
    },
    {
      label: t('Calendar.eventDetails.addressTitle'),
      value: quoteData?.address,
    },
    {
      label: t('Quote.company.detail.capTitle'),
      value: quoteData?.cap_number,
    },
    {
      label: t('Auth.Login.email'),
      value: quoteData?.email,
    },
    {
      label: t('Quote.company.detail.nationTitle'),
      value: quoteData?.country,
    },
    {
      label: t('Quote.company.detail.cityTitle'),
      value: quoteData?.city,
    },
    {
      label: t('Quote.company.detail.mobileTitle'),
      value: quoteData?.destination_mobile_number,
    },
    {
      label: t('Quote.company.destination.provinceTitle'),
      value: quoteData?.province,
    },
  ];

  const renderDetails = (details: Option[]) => {
    return details?.map((data, index: number) => {
      if (data?.value !== null && data?.value !== '') {
        return (
          <div
            className="px-5 py-2.5 bg-primaryLight rounded-10px"
            key={`order_quote_${index + 1}`}
          >
            <span className="block text-sm text-dark/50 mb-1 font-medium">
              {data?.label}
            </span>
            <p className="text-sm text-dark font-semibold">{data?.value ?? '-'}</p>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <>
      <div className="w-full sticky -top-6 z-1 mb-30px">
        <CustomCard minimal cardClass="">
          <div className="flex gap-3 justify-between">
            <div className="w-full">
              <div className="flex items-center sticky top-0 bg-white">
                <div className="h-24 w-[169px] rounded-md">
                  <Image
                    src={companyData?.logo ?? '/images/no-image.png'}
                    imgClassName="block w-full h-full rounded-md"
                    serverPath
                  />
                </div>
                <div className="ps-6 w-[calc(100%_-_168px)]">
                  <span className="text-2xl 1200:text-3xl font-bold mb-4 block">
                    {quoteData?.company?.name ?? companyData?.name}
                  </span>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-1">
                      {invoice_number && (
                        <>
                          <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                            <span className="text-sm text-dark/50 gap-2">
                              {t('invoiceNo')}
                            </span>
                            <strong className="text-dark">{invoice_number}</strong>
                          </div>
                        </>
                      )}
                      <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                        <span className="text-sm text-dark/50">
                          {t('orderNumberTitle')}
                        </span>
                        <strong className="text-dark flex m-[-2px]">
                          {typeof order_number === 'string'
                            ? order_number
                            : order_number?.map((data, index) => (
                                <Link
                                  to={`${PRIVATE_NAVIGATION.order.list.path}/view/${data?.slug}`}
                                  target="_blank"
                                  key={data?.slug}
                                >
                                  <div className="max-w-[220px] hover:underline decoration-blue">
                                    <p>
                                      {data?.order_number ?? '-'}
                                      {order_number.length !== index + 1 ? (
                                        <span className="mr-1">,</span>
                                      ) : (
                                        ''
                                      )}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                        </strong>
                      </div>
                      <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                        <span className="text-sm text-dark/50">
                          {t('Quote.columnsTitle.quoteNumber')}
                        </span>
                        <strong className="text-dark flex m-[-2px]">
                          {quoteData?.quote_number}
                        </strong>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      <ul className="flex flex-wrap gap-x-5 gap-y-2">
                        {quoteData?.company?.vat_number && (
                          <li className="text-base font-medium text-dark/50">
                            {t('Quote.company.detail.vatTitle')}
                            <strong className="ml-3 text-dark">
                              {companyData?.vat_number}
                            </strong>
                          </li>
                        )}
                        <li className="text-base font-medium text-dark/50">
                          {t('Quote.company.detail.codeDestTitle')}
                          <strong className="ml-3 text-dark">
                            {quoteData?.company?.sdi_code ?? companyData?.sdi_code}
                          </strong>
                        </li>
                      </ul>
                      <ul className="flex flex-wrap gap-5">
                        {quoteData?.sales_rep_id && (
                          <li className="text-base font-medium text-dark/50">
                            {t('Quote.company.detail.salesRepTitle')}
                            <strong className="ml-3 text-dark">
                              {
                                salesRepResponse?.data?.find(
                                  (item: { label: string; value: string }) =>
                                    item.value === quoteData?.sales_rep_id
                                )?.label
                              }
                            </strong>
                          </li>
                        )}
                        <li className="text-base font-medium text-dark/50">
                          {t('Quote.company.detail.dateTitle')}
                          <strong className="ml-3 text-dark">
                            {invoiceDate
                              ? format(
                                  new Date(invoiceDate),
                                  REACT_APP_DATE_FORMAT as string
                                )
                              : quoteData?.date
                              ? format(
                                  new Date(quoteData?.date),
                                  REACT_APP_DATE_FORMAT as string
                                )
                              : orderDate
                              ? format(
                                  new Date(orderDate),
                                  REACT_APP_DATE_FORMAT as string
                                )
                              : '-'}
                          </strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-end flex-col">
              <div>{statusRenderData}</div>
              {lastPODatePresent && (
                <div className="mt-3 flex items-end flex-col">
                  <p className="text-md text-dark font-semibold w-[133px] ">
                    {t('orderReminderHeaderTitle')}
                  </p>
                  <p>{LastPODate}</p>
                </div>
              )}
            </div>
          </div>
        </CustomCard>
      </div>
      {!paramsData?.pathname?.includes('invoice') && (
        <div className="flex flex-wrap -mx-2.5">
          <div
            className={`px-2.5 flex flex-col gap-y-4 ${
              quoteData ? 'w-7/12' : 'w-full'
            }`}
          >
            <CustomCard minimal title={t('Expense.companyDetail')}>
              <div className="py-2">
                <div className="grid grid-cols-2 2xl:grid-cols-3 gap-2.5">
                  {quoteData
                    ? renderDetails(QuoteDetails as unknown as Option[])
                    : renderDetails(CompanyDetails)}
                </div>
              </div>
            </CustomCard>
          </div>
          {quoteData && (
            <div className="px-2.5 1200:w-5/12 w-full">
              <CustomCard
                cardClass="h-full"
                minimal
                title={
                  quoteData?.destination_goods
                    ? quoteData?.destination_goods
                    : quoteData?.company?.name
                }
              >
                <div className="grid grid-cols-2 gap-2.5">
                  {renderDetails(DestinationDetails as Option[])}
                </div>
              </CustomCard>
            </div>
          )}
        </div>
      )}
    </>
  );
};
