import InputField from 'components/FormElement/InputField';
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import _ from 'lodash';
import { containsOnlyDigits } from '../constants';
import { CompanyProps } from '../types';

const QuoteCompanyForm = ({
  t,
  values,
  companyLoading,
  vatTypeLoading,
  companyVatTypeOption,
  cities,
}: CompanyProps) => {
  const cityName = containsOnlyDigits(values?.company?.city)
    ? cities.cities.find((data) => data.id === values?.company?.city)?.name
    : null;
  return (
    <div className="flex flex-col gap-4 mb-5">
      <div className="grid xl:grid-cols-12 gap-4">
        <InputField
          name="company.company_name"
          label={t('Quote.company.detail.nameTitle')}
          value={values?.company?.name}
          isDisabled
          parentClass="col-span-12"
          isLoading={companyLoading}
        />
        {values?.company?.codice_fiscale && (
          <InputField
            parentClass="col-span-12 1200:col-span-6 1400:col-span-3"
            name="quote.codice_fiscale"
            placeholder={t('Quote.company.detail.codiceFiscalePlaceholder')}
            label={t('Quote.company.detail.codiceFiscaleTitle')}
            value={values?.company?.codice_fiscale}
            isDisabled
            isLoading={companyLoading}
          />
        )}
        {values?.company?.vat_number && (
          <InputField
            parentClass="col-span-12 1200:col-span-6 1400:col-span-3"
            name="company.vat_number"
            label={t('Quote.company.detail.vatTitle')}
            value={values?.company?.vat_number}
            isLoading={companyLoading}
            isDisabled
          />
        )}
        {values?.company?.sdi_code && (
          <InputField
            name="company.sdi_code"
            parentClass="col-span-12 1200:col-span-6 1400:col-span-3"
            label={t('ClientManagers.viewClientDetails.sdiCodeTitle')}
            value={values?.company?.sdi_code}
            isDisabled
            isLoading={companyLoading}
          />
        )}
        <ReactSelect
          parentClass="col-span-12 1200:col-span-6 1400:col-span-3"
          name="quote.vat_primary_id"
          options={companyVatTypeOption}
          placeholder={t(
            'ClientManagement.clientForm.fieldInfos.vatTypePlaceHolder'
          )}
          label={t('ClientManagement.clientForm.fieldInfos.vatType')}
          isCompulsory
          disabled
          isLoading={vatTypeLoading}
        />
        {values?.company?.telephone && (
          <InputField
            parentClass="col-span-12 1200:col-span-6 1400:col-span-4"
            name="company.telephone"
            placeholder={t('Quote.company.detail.telephonePlaceholder')}
            label={t('Quote.company.detail.telephoneTitle')}
            value={values?.company?.telephone}
            isDisabled
            isLoading={companyLoading}
          />
        )}
        <PhoneNumberInput
          parentClass="col-span-12 1200:col-span-6 1400:col-span-4"
          name="quote.destination_mobile_number"
          placeholder={t('Quote.company.detail.mobilePlaceholder')}
          label={t('Quote.company.detail.mobileTitle')}
          isLoading={companyLoading}
        />
        <InputField
          parentClass="col-span-12 1200:col-span-6 1400:col-span-4"
          name="quote.destination_email"
          placeholder={t('Quote.company.detail.emailPlaceholder')}
          label={t('Quote.company.detail.emailTitle')}
          value={values.quote.destination_email}
          isLoading={companyLoading}
        />
        {values?.company?.address1 && (
          <TextArea
            parentClass="col-span-12 1400:col-span-5"
            name="company.address1"
            label={t('Quote.company.detail.addressTitle')}
            rows={5}
            disabled
            isLoading={companyLoading}
          />
        )}
        <div className="col-span-12 1400:col-span-7">
          <div className=" flex flex-wrap gap-y-4 -mx-2">
            {values?.company?.zip && (
              <InputField
                parentClass="w-full 991:col-span-8 1400:max-w-[120px] px-2"
                name="quote.destination_cap"
                placeholder={t('Quote.company.detail.capPlaceholder')}
                label={t('Quote.company.detail.capTitle')}
                value={values?.company?.zip}
                isLoading={companyLoading}
                isCompulsory
                isDisabled
              />
            )}
            {values.quote.destination_province && (
              <InputField
                parentClass="w-full 992:w-1/2 1200:max-w-[200px] px-2"
                name="quote.destination_province"
                placeholder={t('Quote.company.detail.provincePlaceholder')}
                label={t('Quote.company.detail.provinceTitle')}
                isCompulsory
                isLoading={companyLoading}
                value={values.quote.destination_province}
                isDisabled
              />
            )}

            {values?.company?.city && (
              <InputField
                parentClass="w-full 992:w-1/2 1200:flex-1 px-2"
                name="company.city"
                label={t('Auth.RegisterCommon.city')}
                value={_.isNull(cityName) ? values.company.city : cityName}
                isLoading={companyLoading}
                isDisabled
              />
            )}
            {values?.company?.country && (
              <InputField
                parentClass="w-full 992:w-1/2 1200:w-auto 1200:flex-1 px-2"
                name="company.country"
                label={t('Quote.company.detail.nationTitle')}
                value={values?.company?.country}
                isLoading={companyLoading}
                isDisabled
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteCompanyForm;
