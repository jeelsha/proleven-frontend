import Button from 'components/Button/Button';
import Image from 'components/Image';
import 'modules/Client/styles/index.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardDetails } from '../../../../components/Card/CardDetails';
import { ClientCompanyManager, CompanyManagerData } from './types';
import _ from 'lodash';
import { useAxiosGet } from 'hooks/useAxios';
import { Option } from 'components/FormElement/types';
import { IProvince } from 'modules/Client/types';

interface Props {
  companyInfo: undefined | CompanyManagerData;
}

export const CompanyDetails = ({ companyInfo }: Props) => {

  const [openIndex, setOpenIndex] = useState(0);
  const [clientGetApi] = useAxiosGet();
  const [vatTypeOption, setVatTypeOption] = useState<Option[]>([]);
  const [listProvince, setListProvince] = useState<IProvince[]>([])
  const [paymentTerms, setPaymentTerms] = useState<Option[]>([]);


  useEffect(() => {
    CallApi()
  }, [])

  async function CallApi() {
    const { data, error } = await clientGetApi('/invoice/vat-type');
    if (!error && data) {
      const vatOptions = data?.map(
        (item: { description: string; id: number; value: number }) => {
          return {
            label:
              item.description === '' ? `${String(item.value)} %` : item.description,
            value: item.id,
          };
        }
      );
      setVatTypeOption(vatOptions);
    }
    const paymentTerms = await clientGetApi(`/paymentterms`, {
      params: { dropdown: true, label: 'name', sort: 'id', companyDropdown: true },
    });
    if (paymentTerms.data) {
      setPaymentTerms(paymentTerms.data);
    }
  }

  useEffect(() => {
    const loadJson = async () => {
      try {
        const response = await import('../../../../province/province.json');
        setListProvince((response.default as IProvince[]));
      } catch (error) {
        console.error("Error loading JSON data:", error);
      }
    };

    loadJson();
  }, []);


  const handleManagerClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    event.stopPropagation();
    setOpenIndex(index === openIndex ? -1 : index);
  };
  const handleOuterDivClick = (index: number) => {
    setOpenIndex(index);
  };
  function getValuePurchaseOrder(data: string) {
    if (data === 'true') {
      return t('confirmationChoices.yesOption');
    }
    return t('confirmationChoices.noOption');
  }
  const { t } = useTranslation();

  return (
    <div className="viewCard">
      {Array.isArray(companyInfo?.company_manager) &&
        companyInfo?.company_manager &&
        companyInfo?.company_manager?.length > 0 && (
          <span className="text-lg block text-primary font-semibold">
            {t('ClientManagement.viewClientDetails.companyDetailsTitle')}
          </span>
        )}
      <div className="w-full">
        <div className="flex flex-wrap justify-between gap-y-3.5 flex-col">
          {Array.isArray(companyInfo?.company_manager) &&
            companyInfo?.company_manager &&
            companyInfo?.company_manager?.length > 0 &&
            companyInfo?.company_manager?.map(
              (singleCompany: ClientCompanyManager, index: number) => {
                const province = !_.isEmpty(listProvince) ? listProvince.find((item) => item.countryName.toLowerCase() === singleCompany?.company?.country?.toLowerCase() && item.shortCode === singleCompany?.company?.address_province)?.region : ''
                const vatType = !_.isEmpty(vatTypeOption) ? vatTypeOption.find((item) => item.value === singleCompany?.company?.vat_type)?.label : ''
                const payment = !_.isEmpty(paymentTerms) ? paymentTerms.find((item) => item.value === singleCompany?.company?.payment_term_id)?.label : ''

                let companyEmail;
                if (!_.isEmpty(singleCompany?.company?.accounting_emails)) {
                  if (typeof singleCompany?.company?.accounting_emails[0] === 'string') {
                    const parsedData = JSON.parse((singleCompany.company.accounting_emails as unknown as string))
                    companyEmail = _.isArray(parsedData) ? parsedData[0].email : parsedData
                  }
                  else {
                    companyEmail = _.isArray(singleCompany?.company?.accounting_emails) ? singleCompany?.company?.accounting_emails[0].email : (singleCompany?.company?.accounting_emails as unknown as string)
                  }
                }
                return (
                  <div
                    key={`index_manager${index + 1}`}
                    className={`${companyInfo?.company_manager &&
                      companyInfo?.company_manager.length > 0
                      ? 'transition py-3.5 px-4 rounded-xl bg-authBG/50'
                      : ''
                      }  `}
                  >
                    {companyInfo?.company_manager &&
                      companyInfo?.company_manager.length > 0 && (
                        <Button
                          className={`flex justify-between items-center cursor-pointer w-full ${openIndex === index ? 'mb-10' : ''
                            }`}
                          onClickHandler={() => handleOuterDivClick(index)}
                        >
                          <p className="text-lg leading-6 text-dark font-medium">
                            {singleCompany?.company?.name}
                          </p>
                          <Button
                            className="w-7 h-7 cursor-pointer rounded-full border-2 p-1 border-solid border-primary text-primary"
                            onClickHandler={(event) =>
                              handleManagerClick(
                                event as unknown as React.MouseEvent<
                                  HTMLDivElement,
                                  MouseEvent
                                >,
                                index
                              )
                            }
                          >
                            <Image
                              iconName="chevronLeft"
                              iconClassName={`w-full h-full stroke-[3] ${openIndex === index
                                ? 'rotate-90'
                                : '-rotate-90 translate-y-px'
                                }`}
                            />
                          </Button>
                        </Button>
                      )}
                    <div
                      className={`flex flex-wrap gap-x-8 gap-y-5 transition-all ${openIndex === index ? '' : 'hidden'
                        }`}
                    >
                      <div className=" w-full h-[180px] overflow-hidden rounded-xl">
                        <Image
                          src={singleCompany?.company?.logo ?? '/images/no-image.png'}
                          imgClassName="w-full max-w-[180px] h-full object-cover !object-contain"
                          alt={t(
                            'ClientManagement.viewClientDetails.companyLogoAltText'
                          )}
                          serverPath
                        />
                      </div>
                      <CardDetails
                        label={t('ClientManagement.viewClientDetails.sdiCodeTitle')}
                        value={singleCompany?.company?.sdi_code}
                        className="!justify-start !gap-3 !items-start"
                      />
                      <CardDetails
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.codiceFiscale'
                        )}
                        value={singleCompany?.company?.codice_fiscale}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        label={t('ClientManagement.viewClientDetails.atecoCodeTitle')}
                        value={singleCompany?.company?.ateco_code}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.companyContact'
                        )}
                        value={singleCompany?.company?.telephone}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.zipcode'
                        )}
                        value={singleCompany?.company?.zip}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        label={t('ClientManagement.clientForm.fieldInfos.vatNumber')}
                        value={singleCompany?.company?.vat_number}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        label={t('ClientManagement.clientForm.fieldInfos.vatType')}
                        value={vatType}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        label={t(
                          'ClientManagement.viewClientDetails.accountingEmailTitle'
                        )}
                        value={companyEmail}
                        className="!justify-start !gap-3 !items-start"
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t('ClientManagement.clientForm.fieldInfos.companyAddress')}
                        value={singleCompany?.company?.address1}
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t('ClientManagement.clientForm.fieldInfos.companyAddress2')}
                        value={singleCompany?.company?.address2 as string}
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t('ClientManagement.clientForm.fieldInfos.country')}
                        value={singleCompany?.company?.country}
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t('ClientManagement.clientForm.fieldInfos.province')}
                        value={province ?? singleCompany?.company?.address_province}
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t('Auth.RegisterCommon.city')}
                        value={province ?? singleCompany?.company?.city}
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.companyDescription'
                        )}
                        value={singleCompany?.company?.description ?? '-'}
                      />

                      <CardDetails
                        className="!justify-start !gap-3 !items-start"
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.paymentTerm'
                        )}
                        value={payment ?? '-'}


                      />

                      <CardDetails
                        label={t(
                          'ClientManagement.viewClientDetails.companyinvoiceTitle'
                        )}
                        value={getValuePurchaseOrder(
                          String(singleCompany?.company?.is_invoice)
                        )}
                        className="!justify-start !gap-3 !items-start"
                        isInvoice
                      />
                    </div>
                  </div>
                )
              }
            )}
        </div>
      </div>
    </div>
  );
};
