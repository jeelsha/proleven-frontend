import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';

// ** types **
import { Option } from 'components/FormElement/types';
import { RegisterInitialValueType } from 'modules/Auth/pages/Register/types';
import { RegisterComponentProps } from './types';

// ** constant **
import { ConfirmationChoices } from 'constants/common.constant';

// ** validation **
import CountrySelect from 'components/FormElement/CountryList';

import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import SearchComponent from 'components/Table/search';
import { REACT_APP_CERVED_API_KEY } from 'config';
import { useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import _ from 'lodash';
import { RegisterCompanyValidationSchema } from 'modules/Auth/validationSchema';
import CompanyListModal from 'modules/Client/components/Company/CompanyListModal';
import {
  extractBeforeParenthesisAndRemovePeriods,
  extractInsideParenthesis,
} from 'modules/Client/components/Company/helper';
import { ICompanyDataFromAPI } from 'modules/Client/types/companyFromApi';
import { useDebounce } from 'utils';
import { registerInitialValues } from './constants';

// ** redux **

const RegisterCompanyInfo = ({
  setActive,
  currentStep,
  registerInitialValue,
  setRegisterInitialValue,
  search,
  setSearch,
  setUpdatedDescription,
  setAtecoCodeList,
  atecoCodeList,
}: RegisterComponentProps) => {
  const { t } = useTranslation();
  const [callVatType] = useAxiosGet();
  const [clientGetApi] = useAxiosGet();
  const modalRef = useRef<HTMLDivElement>(null);
  const companyListModal = useModal();
  const [vatTypeOption, setVatTypeOption] = useState<Option[]>([]);
  const [companyDataApi, { isLoading: isCompanyDataLoading }] = useAxiosGet();
  const debounceCompany = useDebounce(search ?? '', 1000);
  const [dropdownOptions, setDropdownOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option>();
  const [companyDataFromApi, setCompanyDataFromApi] =
    useState<ICompanyDataFromAPI[]>();
  const getVatType = async () => {
    const { data, error } = await callVatType('/invoice/vat-type');
    const atecoCodes = await clientGetApi(`/ateco-code`, {
      params: { sort: 'id', view: true },
    });

    if (!error && data) {
      const vatOptions = data?.map(
        (item: {
          description: string;
          id: number;
          value: number;
          vat_id: number;
          vat_value: number;
        }) => {
          return {
            label:
              item.description === '' ? `${String(item.value)} %` : item.description,
            value: item.id,
            vat_id: item.vat_id,
            vat_value: item.value,
          };
        }
      );
      setVatTypeOption(vatOptions);
    }
    if (atecoCodes.data) {
      const dataLabel = atecoCodes.data.data.map(
        (item: { name: string; id: string; description: string; slug: string }) => {
          return {
            label: `${item?.name.trim()} (${item?.description})`,
            value: item?.id,
            slug: item?.slug,
          };
        }
      );
      setAtecoCodeList?.(dataLabel);
    }
  };

  useEffect(() => {
    getVatType();
  }, []);

  useEffect(() => {
    if (debounceCompany?.length > 0) {
      CallFetchCompaniesFromCerved();
    }
  }, [debounceCompany]);

  useEffect(() => {
    if (selectedOption && !_.isEmpty(companyDataFromApi)) {
      const selectedFullCompanyData = companyDataFromApi?.find(
        (id) => id?.dati_anagrafici?.id_soggetto === selectedOption?.value
      );
      const oldDescription = atecoCodeList?.find(
        (data) =>
          extractBeforeParenthesisAndRemovePeriods(data.label) ===
          selectedFullCompanyData?.dati_attivita?.codice_ateco_infocamere
      )?.label;
      if (
        oldDescription &&
        extractInsideParenthesis(oldDescription) !==
          selectedFullCompanyData?.dati_attivita?.ateco_infocamere
      ) {
        if (selectedFullCompanyData)
          setUpdatedDescription?.(
            selectedFullCompanyData?.dati_attivita?.ateco_infocamere
          );
      }

      setRegisterInitialValue((prev) => {
        return {
          ...prev,
          payment_term: prev?.payment_term ? prev.payment_term.toString() : '',
          telephone: prev?.telephone ? prev?.telephone : '',
          company_name:
            selectedFullCompanyData?.dati_anagrafici?.denominazione ?? '',
          company_vat_number:
            selectedFullCompanyData?.dati_anagrafici?.partita_iva ?? '',
          company_address_zip:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo?.cap ?? '',
          company_address_l1:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo?.descrizione ?? '',
          company_description:
            selectedFullCompanyData?.dati_attivita?.company_form?.description ?? '',
          codice_fiscale:
            selectedFullCompanyData?.dati_anagrafici?.codice_fiscale ?? '',
          address_province:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo?.provincia ?? '',
          company_address_city:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo
              ?.descrizione_comune ?? '',
          company_ateco_code: atecoCodeList?.find(
            (data) =>
              extractBeforeParenthesisAndRemovePeriods(data.label) ===
              selectedFullCompanyData?.dati_attivita?.codice_ateco_infocamere
          )?.value as string,
        };
      });
    }
  }, [selectedOption]);

  const CallFetchCompaniesFromCerved = async () => {
    const searchResult = debounceCompany;
    const response = await companyDataApi(
      `https://api.cerved.com/cervedApi/v1/entitySearch/live?testoricerca=${searchResult}&filtroricerca=COMPANIES_ONLY&filtroescludicc=true`,
      {
        headers: {
          apiKey: REACT_APP_CERVED_API_KEY,
        },
      },
      false
    );
    if (response?.data) {
      const newOptions = response?.data?.companies?.map(
        (data: ICompanyDataFromAPI) => ({
          label: data?.dati_anagrafici?.denominazione,
          value: data?.dati_anagrafici?.id_soggetto,
        })
      );

      setDropdownOptions(newOptions);

      setCompanyDataFromApi(response?.data?.companies);
    }
  };

  const OnContinue = (data: RegisterInitialValueType) => {
    if (data) {
      setActive((prev) => {
        return {
          ...prev,
          current: currentStep + 1,
          companyInfoForm: { complete: true },
        };
      });
      setRegisterInitialValue(data);
    }
  };

  const renderAccountingEmail = (
    values: RegisterInitialValueType,
    arrayHelpers: FieldArrayRenderProps
  ) =>
    values.company_accounting_emails.map(
      (data: { email: string }, index: number) => {
        return (
          <div className="flex gap-4" key={`company_accounting_emails_${index + 1}`}>
            <InputField
              parentClass="flex-[1_0_0%] max-w-[calc(100%_-_40px)]"
              placeholder={t('Auth.RegisterCompany.companyEmailPlaceHolder')}
              type="text"
              value={data.email}
              label={index === 0 ? t('Auth.RegisterCompany.companyEmail') : ''}
              name={`company_accounting_emails[${index}].email`}
            />
            {values.company_accounting_emails.length === 1 ||
            index === values.company_accounting_emails.length - 1 ? (
              <Button
                className={`${
                  index === 0 ? 'mt-7 ' : ''
                } dynamic-email-btn bg-primary/10 border-primary/50 text-primary`}
                onClickHandler={() => {
                  arrayHelpers.push({
                    email: '',
                    isPrimary: false,
                  });
                }}
              >
                <Image iconName="plusIcon" iconClassName="w-full h-full" />
              </Button>
            ) : (
              <Button
                className={` ${
                  index === 0 ? 'mt-7 ' : ''
                } dynamic-email-btn bg-danger/10 border-danger/50 text-danger`}
                onClickHandler={() => {
                  arrayHelpers.remove(index);
                }}
              >
                <Image iconName="deleteIcon" iconClassName="w-full h-full" />
              </Button>
            )}
          </div>
        );
      }
    );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        companyListModal.closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={registerInitialValue}
        validationSchema={RegisterCompanyValidationSchema()}
        onSubmit={(values) => OnContinue(values)}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={modalRef}>
                <div className="col-span-2 relative">
                  <p className="text-sm text-dark mb-2">
                    {t('Auth.RegisterCompany.companyName')}
                    <span className="text-red-700">*</span>
                  </p>
                  <SearchComponent
                    placeholder={t('searchPlaceholderCompanyName')}
                    onSearch={(e) => {
                      setSearch?.(e.target.value);
                      companyListModal.openModal();
                    }}
                    parentClass="min-w-[100%]"
                    name="company_name"
                    value={!search ? values?.company_name : search}
                    onClear={() => {
                      setSearch?.('');
                      setRegisterInitialValue(registerInitialValues);
                      setSelectedOption({} as Option);
                      companyListModal.closeModal();
                    }}
                    isSearchIcon={false}
                  />
                  {companyListModal.isOpen && (
                    <CompanyListModal
                      isRegister
                      search={search}
                      dropdownOptions={dropdownOptions}
                      setSelectedOption={setSelectedOption}
                      companyListModal={companyListModal}
                      values={values}
                      setCompanyData={setRegisterInitialValue}
                      setSearch={
                        setSearch ??
                        (() => {
                          //
                        })
                      }
                      loading={isCompanyDataLoading}
                    />
                  )}
                </div>
                <PhoneNumberInput
                  isCompulsory
                  placeholder="(603) 555-0123"
                  label={t('ClientManagement.clientForm.fieldInfos.companyContact')}
                  name="telephone"
                />
                <InputField
                  placeholder={t('Auth.RegisterCompany.codiceFiscalePlaceHolder')}
                  type="text"
                  isCompulsory={
                    values?.company_address_country?.toLowerCase() === 'italy'
                  }
                  value={values.codice_fiscale}
                  label={t('Auth.RegisterCompany.codiceFiscale')}
                  name="codice_fiscale"
                />
                <InputField
                  parentClass="md:col-span-2"
                  placeholder="e.g. AB123456"
                  type="text"
                  isCompulsory={
                    values?.company_address_country?.toLowerCase() === 'italy'
                  }
                  value={values.company_vat_number}
                  label={t('Auth.RegisterCompany.vatNumber')}
                  name="company_vat_number"
                />

                <ReactSelect
                  parentClass="md:col-span-2 z-[9] relative "
                  name="vat_primary_id"
                  options={vatTypeOption}
                  selectedValue={values.vat_primary_id}
                  onChange={(selectedOption) => {
                    setFieldValue(
                      `vat_primary_id`,
                      (selectedOption as Option).value
                    );
                    setFieldValue('vat_type_id', (selectedOption as Option).vat_id);
                    setFieldValue('vat_type', (selectedOption as Option).vat_value);
                  }}
                  placeholder={t('Auth.RegisterCompany.vatTypePlaceHolder')}
                  label={t('Auth.RegisterCompany.vatType')}
                  isCompulsory
                />
                <InputField
                  parentClass="md:col-span-2"
                  placeholder={t('Auth.RegisterCompany.companyAddress1PlaceHolder')}
                  type="text"
                  value={values.company_address_l1}
                  isCompulsory
                  label={t('Auth.RegisterCompany.companyAddress')}
                  name="company_address_l1"
                />
                <InputField
                  parentClass="md:col-span-2"
                  placeholder={t('Auth.RegisterCompany.companyAddress2PlaceHolder')}
                  type="text"
                  value={values.company_address_l2}
                  label={t('Auth.RegisterCompany.companyAddress2')}
                  name="company_address_l2"
                />
                <CountrySelect
                  selectedCountry={values.company_address_country}
                  name="company_address_country"
                  label={t('Auth.RegisterCommon.country')}
                  placeholder={t('Auth.RegisterCommon.countryPlaceHolder')}
                  parentClass="md:col-span-2"
                  className="bg-transparent"
                  isCompulsory
                />

                <InputField
                  name="address_province"
                  label={t('Auth.RegisterCommon.province')}
                  placeholder={t('Auth.RegisterCommon.provincePlaceHolder')}
                  type="text"
                  value={values.address_province}
                  isCompulsory
                />
                <InputField
                  name="company_address_city"
                  type="text"
                  label={t('Auth.RegisterCommon.city')}
                  placeholder={t('Auth.RegisterCommon.cityPlaceHolder')}
                  value={values.company_address_city}
                  isCompulsory
                />
                <InputField
                  placeholder={t('Auth.RegisterCompany.companyZipPlaceHolder')}
                  type="text"
                  value={values.company_address_zip}
                  isCompulsory
                  label={t('Auth.RegisterCompany.zipcode')}
                  name="company_address_zip"
                />
                <div className="md:col-span-2 flex flex-col gap-y-4">
                  <FieldArray
                    name="company_accounting_emails"
                    render={(arrayHelpers) =>
                      renderAccountingEmail(values, arrayHelpers)
                    }
                  />
                </div>
                <ReactSelect
                  parentClass="xl:col-span-2"
                  name="company_ateco_code"
                  options={atecoCodeList}
                  placeholder={t('ClientManagement.clientForm.fieldInfos.atecoCode')}
                  selectedValue={values.company_ateco_code}
                  label={t('Auth.RegisterCompany.atecoCode')}
                />
                <InputField
                  placeholder="e.g. IT01365"
                  type="text"
                  value={values.company_sdi_code}
                  label={t('Auth.RegisterCompany.sdiCode')}
                  name="company_sdi_code"
                />
                <RadioButtonGroup
                  optionWrapper="flex gap-4"
                  name="company_is_invoice"
                  options={ConfirmationChoices()}
                  isCompulsory
                  label={t('Auth.RegisterCompany.purchaseOrder')}
                  parentClass="radio-group col-span-2"
                />
              </div>
              <div className="my-5 text-center">
                <Button
                  variants="primary"
                  type="submit"
                  className="w-full mx-auto min-w-[150px] justify-center"
                  value={t('Auth.RegisterCommon.continueButtonText')}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default RegisterCompanyInfo;
