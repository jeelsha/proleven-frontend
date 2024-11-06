// ** imports **
import {
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikValues,
} from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import DropZone from 'components/FormElement/DropZoneField';
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import { EnumFileType } from 'components/FormElement/enum';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';

// ** constants **
import { ConfirmationChoices } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

import {
  useAxiosGet,
  useAxiosPatch,
  useAxiosPost,
  useAxiosPut,
} from 'hooks/useAxios';

import 'modules/Client/styles/index.css';

// ** types **
import { Option } from 'components/FormElement/types';
import { CompanyInitialProps, CompanyViewProps } from 'modules/Client/types';

// ** validation **
import CountrySelect from 'components/FormElement/CountryList';
import { ROLES } from 'constants/roleAndPermission.constant';
import _ from 'lodash';
import { RegisterCompanyValidationSchema } from 'modules/Client/validation';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { customRandomNumberGenerator, useDebounce } from 'utils';

// ** redux **
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import SearchComponent from 'components/Table/search';
import { REACT_APP_CERVED_API_KEY } from 'config';
import { useModal } from 'hooks/useModal';
import { ICompanyDataFromAPI } from 'modules/Client/types/companyFromApi';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import CompanyListModal from './CompanyListModal';
import {
  extractBeforeParenthesisAndRemovePeriods,
  extractInsideParenthesis,
  getRegisterInitialValue,
} from './helper';

const AddEditCompany = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [clientCreateApi, { isLoading: isAddLoading }] = useAxiosPost();
  const [clientUpdateApi, { isLoading: isUpdateLoading }] = useAxiosPatch();
  const [clientGetApi, { isLoading: isDataLoading }] = useAxiosGet();
  const [companyDataApi, { isLoading: isCompanyDataLoading }] = useAxiosGet();
  const [paginateData] = useAxiosGet();

  const [updateCodeApi] = useAxiosPut();
  const modalRef = useRef<HTMLDivElement>(null);
  const location = useLocation().state;
  const RoleId = location?.role?.id;
  const companyListModal = useModal();
  const user = useSelector(getCurrentUser);
  const [managersList, setManagersList] = useState<Option[]>([]);
  const [atecoCodeList, setAtecoCodeList] = useState<Option[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<Option[]>([]);
  const [vatTypeOption, setVatTypeOption] = useState<Option[]>([]);
  const [companyData, setCompanyData] = useState<CompanyViewProps>();
  const [search, setSearch] = useState(companyData?.name ?? '');
  const debounceCompany = useDebounce(search, 1000);
  const [dropdownOptions, setDropdownOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option>();
  const [companyDataFromApi, setCompanyDataFromApi] =
    useState<ICompanyDataFromAPI[]>();
  const [updatedDescription, setUpdatedDescription] = useState('');

  useEffect(() => {
    if (debounceCompany?.length > 0) {
      CallFetchCompaniesFromCerved();
    }
  }, [debounceCompany]);

  useEffect(() => {
    CallApi();
  }, []);

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
          setUpdatedDescription(
            selectedFullCompanyData?.dati_attivita?.ateco_infocamere
          );
      }

      setCompanyData((prev) => {
        return {
          ...prev,
          payment_term_id: prev?.payment_term_id
            ? prev.payment_term_id.toString()
            : '',
          telephone: prev?.telephone ? prev?.telephone : '',
          name: selectedFullCompanyData?.dati_anagrafici?.denominazione ?? '',
          country: 'Italy',
          vat_number: selectedFullCompanyData?.dati_anagrafici?.partita_iva ?? '',
          zip: selectedFullCompanyData?.dati_anagrafici?.indirizzo?.cap ?? '',
          address1:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo?.descrizione ?? '',
          description:
            selectedFullCompanyData?.dati_attivita?.company_form?.description ?? '',
          codice_fiscale:
            selectedFullCompanyData?.dati_anagrafici?.codice_fiscale ?? '',
          city:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo
              ?.descrizione_comune ?? '',
          address_province:
            selectedFullCompanyData?.dati_anagrafici?.indirizzo?.provincia ?? '',
          ateco_id: atecoCodeList?.find(
            (data) =>
              extractBeforeParenthesisAndRemovePeriods(data.label) ===
              selectedFullCompanyData?.dati_attivita?.codice_ateco_infocamere
          )?.value as number,
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

  async function CallApi() {
    const response = await clientGetApi(`/managers/get-managers-for-company`, {
      params: { dropdown: true, label: 'full_name', sort: 'id', role: RoleId },
    });
    const paymentTerms = await clientGetApi(`/paymentterms`, {
      params: { dropdown: true, label: 'name', sort: 'id', companyDropdown: true },
    });

    const atecoCodes = await clientGetApi(`/ateco-code`, {
      params: { sort: 'id', view: true },
    });
    if (response?.data) {
      setManagersList(response.data);
    }
    if (paymentTerms.data) {
      setPaymentTerms(paymentTerms.data);
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
      setAtecoCodeList(dataLabel);
    }
    if (slug) {
      const companyResponse = await clientGetApi(`/companies/${slug}`, {
        params: { role: RoleId },
      });
      if (companyResponse) {
        setCompanyData(companyResponse.data);
      }
    }

    const { data, error } = await clientGetApi('/invoice/vat-type');
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
  }

  const loadAtecoOptions = async (page: number) => {
    const obj = {
      page,
      sort: 'id',
    };
    const response = await paginateData(`/ateco-code`, {
      params: { ...obj },
    });

    if (response?.data) {
      return response?.data?.data?.map(
        (option: {
          name: string;
          description: string;
          id: number;
          slug: string;
        }) => ({
          label: `${option?.name.trim()} (${option?.description})`,
          value: option?.id,
          slug: option?.slug,
        })
      );
    }
  };

  const loadManagerOptions = async (page: number) => {
    const obj = {
      page,
      sort: 'id',
      role: RoleId,
    };
    const response = await paginateData(`/managers/get-managers-for-company`, {
      params: { ...obj },
    });

    if (response?.data) {
      return response?.data?.data?.map(
        (option: { full_name: string; id: number }) => ({
          label: option?.full_name,
          value: option?.id,
        })
      );
    }
  };

  const OnSubmit = async (companyData: FormikValues) => {
    if (companyData) {
      const clientData = {
        ...companyData,
        accounting_emails: JSON.stringify(companyData.accounting_emails),
        managers: companyData?.managers?.join(','),
        role: RoleId,
        address_country: companyData.address_country,
        address_city: companyData.address_city,
        is_invoice: companyData?.is_invoice,
        vat_primary_id: !_.isEmpty(vatTypeOption) ? companyData.vat_primary_id : 1,
      };
      const formData = new FormData();
      Object.entries(clientData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const atecoSlug = atecoCodeList.find(
        (atecoItem) => atecoItem.value === companyData?.ateco_id
      )?.slug;
      if (!_.isEmpty(updatedDescription))
        await updateCodeApi('/ateco-code', {
          slug: atecoSlug,
          description: updatedDescription,
        });
      const { error } = slug
        ? await clientUpdateApi(`/companies/${slug}`, formData)
        : await clientCreateApi(`/companies`, formData);
      if (!error) {
        navigate(PRIVATE_NAVIGATION.clientsManagement.company.list.path);
      }
    }
  };

  const renderAccountingEmail = (
    values: CompanyInitialProps,
    accountEmail: FieldArrayRenderProps
  ) =>
    values.accounting_emails.map((email: { email: string }, index: number) => {
      return (
        <div
          key={`accounting_emails_${index + 1}`}
          className="flex items-start w-full gap-3"
        >
          <InputField
            placeholder={t(
              'ClientManagement.clientForm.fieldInfos.emailPlaceHolder'
            )}
            type="text"
            value={email.email}
            label={
              index === 0
                ? t('ClientManagement.clientForm.fieldInfos.accountingEmail')
                : ''
            }
            name={`accounting_emails[${index}].email`}
            isLoading={isDataLoading}
          />
          <div
            className={`flex items-center gap-2 mt-0  ${
              index === 0 ? 'mt-[29px] ' : ''
            }`}
          >
            {typeof values?.accounting_emails?.length === 'number' &&
              index === values.accounting_emails.length - 1 && (
                <Button
                  onClickHandler={() => {
                    accountEmail.push({
                      email: '',
                      isPrimary: false,
                    });
                  }}
                  className="addIconCard min-w-[47px] min-h-[47px]"
                >
                  <Image iconName="plusIcon" />
                </Button>
              )}
            {values?.accounting_emails?.length !== 1 && (
              <Button
                className={` button dangerBorder min-w-[47px] min-h-[47px] !p-2 inline-block`}
                onClickHandler={() => accountEmail.remove(index)}
              >
                <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>
      );
    });

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
    <Formik
      initialValues={getRegisterInitialValue(companyData)}
      validationSchema={RegisterCompanyValidationSchema()}
      onSubmit={OnSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, validateForm, submitForm }) => {
        const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          submitForm();
          const formErrors = await validateForm();
          if (Object.keys(formErrors).length > 0) {
            dispatch(
              setToast({
                variant: 'Error',
                message: t('ToastMessage.InCompleteFormToastMessage'),
                type: 'error',
                id: customRandomNumberGenerator(),
              })
            );
          }
        };
        return (
          <Form>
            <PageHeader
              small
              text={
                slug
                  ? t('ClientManagement.clientForm.editTitle')
                  : t('ClientManagement.clientForm.addTitle')
              }
              url={
                location?.isAddForm
                  ? '/quotes'
                  : PRIVATE_NAVIGATION.clientsManagement.company.list.path
              }
            />
            <CustomCard minimal>
              <>
                <div className="flex flex-wrap -mx-6 xl:mb-0 mb-8 gap-y-6">
                  <div className="w-full xl:w-1/2 px-6 relative">
                    <span className="absolute right-0 top-0 bottom-0 my-auto w-px h-full bg-black/10" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-7 xl:pe-4 2xl:pe-8">
                      <div className="md:col-span-2">
                        <DropZone
                          className="xl:max-w-[330px]"
                          label={t(
                            'ClientManagement.clientForm.fieldInfos.companyLogoText'
                          )}
                          name="company_logo"
                          SubTitle={t(
                            'ClientManagement.clientForm.fieldInfos.dragDropText'
                          )}
                          setValue={setFieldValue}
                          value={values.company_logo}
                          acceptTypes="image/*"
                          fileType={EnumFileType.Image}
                          isLoading={isDataLoading}
                        />
                      </div>

                      <div className="relative z-1 flex-[1_0_0%] " ref={modalRef}>
                        {isDataLoading ? (
                          <div className="lazy h-12" />
                        ) : (
                          <>
                            <p className="text-sm text-dark mb-2">
                              {t('Auth.RegisterCompany.companyName')}
                              <span className="text-red-700">*</span>
                            </p>
                            <SearchComponent
                              placeholder={t('searchPlaceholderCompanyName')}
                              onSearch={(e) => {
                                setSearch(e.target.value);
                                companyListModal.openModal();
                              }}
                              parentClass="min-w-[100%]"
                              name="name"
                              value={!search ? values?.name : search}
                              onClear={() => {
                                setSearch('');
                                setCompanyData({} as CompanyViewProps);
                                setSelectedOption({} as Option);
                                companyListModal.closeModal();
                              }}
                              isSearchIcon={false}
                            />
                          </>
                        )}

                        {companyListModal.isOpen && (
                          <CompanyListModal
                            search={search}
                            dropdownOptions={dropdownOptions}
                            setSelectedOption={setSelectedOption}
                            companyListModal={companyListModal}
                            values={values}
                            setCompanyData={setCompanyData}
                            setSearch={setSearch}
                            loading={isCompanyDataLoading}
                          />
                        )}
                      </div>

                      <PhoneNumberInput
                        isCompulsory
                        placeholder="(603) 555-0123"
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.companyContact'
                        )}
                        name="telephone"
                        isLoading={isDataLoading}
                      />

                      <InputField
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.codiceFiscalePlaceHolder'
                        )}
                        type="text"
                        isCompulsory={
                          values?.address_country?.toLowerCase() === 'italy'
                        }
                        value={values.codice_fiscale}
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.codiceFiscale'
                        )}
                        name="codice_fiscale"
                        isLoading={isDataLoading}
                      />

                      <InputField
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.vatNamePlaceHolder'
                        )}
                        type="text"
                        isCompulsory={
                          values?.address_country?.toLowerCase() === 'italy'
                        }
                        value={values.vat_number}
                        label={t('ClientManagement.clientForm.fieldInfos.vatNumber')}
                        name="vat_number"
                        isLoading={isDataLoading}
                      />

                      <ReactSelect
                        parentClass="w-full"
                        name="vat_primary_id"
                        options={vatTypeOption}
                        selectedValue={values.vat_primary_id}
                        onChange={(selectedOption) => {
                          setFieldValue(
                            `vat_primary_id`,
                            (selectedOption as Option).value
                          );

                          setFieldValue(
                            'vat_type_id',
                            (selectedOption as Option).vat_id
                          );
                          setFieldValue(
                            'vat_type',
                            (selectedOption as Option).vat_value
                          );
                        }}
                        isLoading={isDataLoading}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.vatTypePlaceHolder'
                        )}
                        label={t('ClientManagement.clientForm.fieldInfos.vatType')}
                        isCompulsory
                      />
                      <InputField
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.address1PlaceHolder'
                        )}
                        type="text"
                        value={values.address_l1}
                        isCompulsory
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.companyAddress'
                        )}
                        name="address_l1"
                        isLoading={isDataLoading}
                      />
                      <InputField
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.address2PlaceHolder'
                        )}
                        type="text"
                        value={values.address_l2}
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.companyAddress2'
                        )}
                        name="address_l2"
                        isLoading={isDataLoading}
                      />
                      <CountrySelect
                        className="bg-transparent"
                        parentClass="col-span-2"
                        selectedCountry={values.address_country}
                        name="address_country"
                        label={t('ClientManagement.clientForm.fieldInfos.country')}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.countryPlaceHolder'
                        )}
                        isCompulsory
                        isLoading={isDataLoading}
                      />
                      <InputField
                        label={t('ClientManagement.clientForm.fieldInfos.province')}
                        placeholder={t('Auth.RegisterCommon.provincePlaceHolder')}
                        type="text"
                        isCompulsory
                        name="address_province"
                        isLoading={isDataLoading}
                      />
                      <InputField
                        label={t('Auth.RegisterCommon.city')}
                        placeholder={t('Auth.RegisterCommon.cityPlaceHolder')}
                        type="text"
                        name="address_city"
                        isLoading={isDataLoading}
                      />
                      <InputField
                        placeholder={t('Quote.company.detail.capPlaceholder')}
                        type="text"
                        value={values.address_zip}
                        isCompulsory
                        label={t('Quote.company.detail.capTitle')}
                        name="address_zip"
                        isLoading={isDataLoading}
                      />
                    </div>
                  </div>
                  <div className="w-full xl:w-1/2 px-6">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-7 xl:pe-4 2xl:pe-8">
                      <div className="col-span-2 flex flex-col gap-4">
                        <FieldArray
                          name="accounting_emails"
                          render={(accountEmail) =>
                            renderAccountingEmail(values, accountEmail)
                          }
                        />
                      </div>
                      <ReactSelect
                        isPaginated
                        parentClass="xl:col-span-2"
                        name="ateco_id"
                        loadOptions={loadAtecoOptions}
                        options={atecoCodeList}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.atecoCode'
                        )}
                        selectedValue={values.ateco_id}
                        label={t('Auth.RegisterCompany.atecoCode')}
                        isLoading={isDataLoading}
                      />
                      <InputField
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.sdiPlaceHolder'
                        )}
                        type="text"
                        label={t('ClientManagement.clientForm.fieldInfos.sdiCode')}
                        name="sdi_code"
                        value={values.sdi_code}
                        isLoading={isDataLoading}
                      />
                      <RadioButtonGroup
                        optionWrapper="flex gap-4"
                        name="is_invoice"
                        options={ConfirmationChoices()}
                        isCompulsory
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.purchaseOrder'
                        )}
                        parentClass="radio-group col-span-2"
                        isLoading={isDataLoading}
                      />
                      <TextArea
                        parentClass="xl:col-span-2"
                        rows={5}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.descriptionPlaceHolder'
                        )}
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.companyDescription'
                        )}
                        name="description"
                        isLoading={isDataLoading}
                      />
                      <ReactSelect
                        isPaginated
                        parentClass="xl:col-span-2"
                        loadOptions={loadManagerOptions}
                        name="managers"
                        options={managersList ?? []}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.managerPlaceHolder'
                        )}
                        label={t('ClientManagement.clientForm.fieldInfos.manager')}
                        isMulti
                        isCompulsory
                        isLoading={isDataLoading}
                      />
                      {/* LEFT: condition confirm with BA */}
                      {!isDataLoading && user?.role_name !== ROLES.SalesRep && (
                        <div className="xl:col-span-2">
                          <Link
                            to={
                              PRIVATE_NAVIGATION.clientsManagement.managers.list.path
                            }
                            onClick={() =>
                              localStorage.setItem(
                                'linkState',
                                JSON.stringify({ isModalOpen: true })
                              )
                            }
                            target="_blank"
                            state={{ isModalOpen: true }}
                            className="text-ic_1 text-base inline-block cursor-pointer underline"
                          >
                            {t(
                              'ClientManagement.clientForm.fieldInfos.addManagerLink'
                            )}
                          </Link>
                        </div>
                      )}
                      <ReactSelect
                        parentClass="xl:col-span-2"
                        name="payment_term"
                        options={paymentTerms}
                        placeholder={t(
                          'ClientManagement.clientForm.fieldInfos.paymentTermPlaceHolder'
                        )}
                        label={t(
                          'ClientManagement.clientForm.fieldInfos.paymentTerm'
                        )}
                        isLoading={isDataLoading}
                        isCompulsory
                      />
                    </div>
                    <div />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    className="min-w-[90px]"
                    variants="whiteBordered"
                    onClickHandler={() => {
                      if (location?.isAddForm) {
                        navigate('/quotes');
                      } else {
                        navigate('/clients/company');
                      }
                    }}
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    className={`min-w-[90px] ${
                      isAddLoading || isUpdateLoading
                        ? 'disabled:opacity-50 pointer-events-none'
                        : ''
                    }`}
                    disabled={isAddLoading || isUpdateLoading}
                    isLoading={isAddLoading || isUpdateLoading}
                    variants="primary"
                    onClickHandler={handleSubmit}
                  >
                    {slug ? t('editFooterTitle') : t('addFooterTitle')}
                  </Button>
                </div>
              </>
            </CustomCard>
          </Form>
        );
      }}
    </Formik>
  );
};
export default AddEditCompany;
