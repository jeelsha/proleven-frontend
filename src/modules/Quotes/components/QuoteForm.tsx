import Button from 'components/Button/Button';
import CityDropdown from 'components/FormElement/CityList';
import CountrySelect from 'components/FormElement/CountryList';
import DropZone from 'components/FormElement/DropZoneField';
import InputField from 'components/FormElement/InputField';
import PhoneNumberInput from 'components/FormElement/PhoneNumberInput';
import ProvinceDropDown from 'components/FormElement/ProvinceList';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import TextArea from 'components/FormElement/TextArea';
import DatePicker from 'components/FormElement/datePicker';
import { EnumFileType } from 'components/FormElement/enum';
import { Option, fileInputEnum } from 'components/FormElement/types';
import Image from 'components/Image';
import { ConfirmationChoices, FundedByChoices } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import CurrencyList from 'currency-list';
import { format } from 'date-fns';
import { Form, Formik, FormikErrors, FormikProps, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import _ from 'lodash';
import 'modules/Client/styles/index.css';
import {
  AcademyType,
  Currencies,
  FileAcceptType,
  QuoteType,
  removeEmptyStrings,
} from 'modules/Quotes/constants';
import {
  AddEditFormType,
  Attachment,
  DeleteProductArray,
  QuoteInitialProps,
  SalesRepOptions,
} from 'modules/Quotes/types';
import { QuoteValidationSchema } from 'modules/Quotes/validation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import {
  getCitiesJson,
  getCountriesJson,
  getStateJson,
} from 'redux-toolkit/slices/countryJsonSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import {
  customRandomNumberGenerator,
  formatCurrency,
  getCurrencySymbol,
  getObjectKey,
} from 'utils';
import QuoteCompanyForm from './QuoteCompanyForm';
import QuoteProductForm from './QuoteProductForm';

const QuoteForm = ({
  formData,
  setInitialValues,
  slug,
  updateQuoteLoading,
  isClone,
  setIssuedBy,
  issuedBy,
}: AddEditFormType) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companySlug } = useParams();
  const allRoles = useSelector(getRoles);
  const user = useSelector(getCurrentUser);
  const states = useSelector(getStateJson);
  const cities = useSelector(getCitiesJson);
  const countries = useSelector(getCountriesJson);

  const formikRef = useRef<FormikProps<FormikValues>>();

  const deleteModal = useModal();

  const dispatch = useDispatch();

  const currentRole = allRoles.find((role) => role.name === ROLES.SalesRep);
  const [quoteCreateApi, { isLoading: isAddLoading }] = useAxiosPost();
  const [quoteUpdateApi, { isLoading: isUpdateLoading }] = useAxiosPut();
  const [quoteGetApi, { isLoading: vatTypeLoading }] = useAxiosGet();
  const [vatTypeOption, setVatTypeOption] = useState<Option[]>([]);
  const [companyVatTypeOption, setCompanyVatTypeOption] = useState<Option[]>([]);
  const [getQuoteApi, { isLoading: companyLoading }] = useAxiosGet();
  const [deleteProductArray, setDeleteProductArray] = useState<DeleteProductArray[]>(
    []
  );
  const AttachmentFileType = (
    [EnumFileType.Document] as unknown as keyof typeof FileAcceptType
  ).toString();
  const [currencyList, setCurrencyList] = useState([] as Option[]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message = 'Are you sure you want to leave the site';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    CallApi();
    const currencyList = Currencies?.map((data) => {
      const tempCurrency = CurrencyList.get(data);
      return { label: tempCurrency.code, value: tempCurrency.code };
    });
    setCurrencyList(currencyList);
  }, []);

  async function CallApi() {
    if (!slug) {
      const response = await getQuoteApi(`/companies/${companySlug}`, {
        params: { role: currentRole?.id.toString() },
      });

      setInitialValues({
        ...formData,
        company: response?.data,
        quote: {
          ...formData.quote,
          sales_rep_id: response?.data?.sales_rep?.id,
          vat_primary_id: Number(response?.data?.vat_primary_id),
          vat_type_id: Number(response?.data?.vat_type_id),
          vat_type: Number(response?.data?.vat_type),
          destination_province: response?.data?.address_province,
          payment_term_id: Number(response?.data?.payment_term_id),
        },
        product: formData.product.map((data) => ({
          ...data,
          vat_primary_id: Number(response?.data?.vat_primary_id),
        })),
      });
    }
  }
  const { response: salesRepResponse, isLoading: salesRepLoader } =
    useQueryGetFunction('/users', {
      option: {
        dropdown: true,
        label: 'full_name',
        company_id: formData?.company?.id ? formData?.company?.id : null,
      },
      role: currentRole?.id.toString(),
    });

  const { response: paymentTermResponse, isLoading: paymentTermLoader } =
    useQueryGetFunction('/paymentterms', {
      option: {
        dropdown: true,
        label: 'name',
        companyDropdown: true,
      },
      role: currentRole?.id.toString(),
    });

  const calculateTotalPrice = (
    price: number | string,
    discount: number | string
  ): number => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!discount) {
      return parseFloat(numericPrice?.toFixed(2));
    }
    const numericDiscount =
      typeof discount === 'string' ? parseFloat(discount) : discount;
    const discountedPrice = numericPrice - numericPrice * (numericDiscount / 100);
    return parseFloat(discountedPrice?.toFixed(2));
  };

  const OnSubmit = async (values: QuoteInitialProps) => {
    delete values.quote.currency_symbol;
    values.quote.payment_term = values.quote.payment_term_id;
    values.product.forEach((product, index) => {
      const totalProductAmount = calculateTotalPrice(
        product.price,
        product.discount
      );

      product.product_total_amount = !_.isNaN(totalProductAmount)
        ? totalProductAmount
        : 0;
      product.product_total_vat_amount = totalProductAmount
        ? parseFloat(
            ((totalProductAmount * (product.vat_type as number)) / 100).toFixed(2)
          )
        : 0;
      product.product_sequence = index + 1;
      product.vat_primary_id =
        product.vat_primary_id === ''
          ? values.quote.vat_primary_id
          : product.vat_primary_id;
      product.vat_type =
        product.vat_type === '' ? values.quote.vat_type : product.vat_type;
      product.vat_type_id =
        product.vat_type_id === '' ? values.quote.vat_type_id : product.vat_type_id;
      delete product?.quote_type;
      delete product?.isOpen;
      delete product?.product_total;
      delete product?.product_vat_total;
      if (!slug) {
        delete product?.id;
      }
      return product;
    });
    if (slug) {
      values.product.forEach((product) => {
        if (!product.quote_id && values.quote.id) {
          product.quote_id = values.quote.id;
        }
      });

      if (values.attachment && values.attachment.length > 0) {
        values.attachment = values.attachment
          .map((attachmentData) => ({
            id: attachmentData.id,
            quote_id: attachmentData.quote_id,
            attachment_type: attachmentData.attachment_type,
            attachment: attachmentData.attachment,
          }))
          .filter((attachmentData) => {
            const isInternal = values?.internal_attachment?.includes(
              attachmentData.attachment
            );
            const isClient = values?.client_attachment?.includes(
              attachmentData.attachment
            );
            return (
              isInternal || (attachmentData.attachment_type === 'client' && isClient)
            );
          });
      }
    }

    const updatedValues: QuoteInitialProps = {
      product: values.product,
      quote: {
        ...values.quote,
        company_id: values?.company?.id,
      },
    };

    if (slug && !isClone) {
      updatedValues.attachment = values.attachment;
    }

    if (values.deleteProduct && values.deleteProduct.length > 0) {
      updatedValues.deleteProduct = deleteProductArray;
    }

    removeEmptyStrings(updatedValues);

    const formsData = new FormData();
    Object.entries(updatedValues).forEach(([key, value]) => {
      if (key !== 'internal_attachment') {
        formsData.append(key, JSON.stringify(value));
      }
    });

    const appendAttachments = (
      attachmentType: string,
      attachmentArray: (string | Attachment)[]
    ) => {
      attachmentArray
        ?.filter((item) => typeof item !== 'string')
        .forEach((item) => {
          formsData.append(attachmentType, item as unknown as Blob);
        });
    };

    if (values.internal_attachment) {
      appendAttachments('internal_attachment', values.internal_attachment);
    }

    if (values.client_attachment) {
      appendAttachments('client_attachment', values.client_attachment);
    }

    const { error, data } =
      isClone || !slug
        ? await quoteCreateApi('/quotes', formsData)
        : await quoteUpdateApi('/quotes', formsData);

    if (!error && data) {
      navigate(PRIVATE_NAVIGATION.quotes.list.path);
    }
  };

  useEffect(() => {
    if (user?.role_name === ROLES.SalesRep) {
      formData.quote.sales_rep_id = user.id as string;
    }
  }, []);

  const FindStateId = (e?: string) => {
    const findStateId = states.states.find(
      (state: { id: string; name: string; country_id: string }) =>
        state.name.toLowerCase() === e?.toLowerCase()
    )?.id;

    return findStateId;
  };
  useEffect(() => {
    vatTypeApi();
  }, [issuedBy]);

  useEffect(() => {
    companyVatTypeApi();
  }, []);

  useEffect(() => {
    const selectedSalesRep = (salesRepResponse?.data ?? []).find(
      (item: SalesRepOptions) => item?.isSelected
    );
    if (selectedSalesRep?.value && !formData?.quote?.sales_rep_id)
      setInitialValues((prev) => ({
        ...prev,
        quote: {
          ...prev.quote,
          sales_rep_id: selectedSalesRep?.value,
        },
      }));
  }, [salesRepResponse]);

  async function companyVatTypeApi() {
    const { data, error } = await quoteGetApi(`/invoice/vat-type`);
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
      setCompanyVatTypeOption(vatOptions);
    }
  }

  async function vatTypeApi() {
    const { data, error } = await quoteGetApi(`/invoice/vat-type?type=${issuedBy}`);
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

  const scrollToError = (errors: FormikErrors<QuoteInitialProps>) => {
    const keys = getObjectKey(errors);
    if (keys.length > 0) {
      setTimeout(() => {
        if (formikRef.current) {
          formikRef.current.submitForm();
        }
        const errorElement = document.querySelector('.error-message') as HTMLElement;
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
    }
  };

  return (
    <Formik
      initialValues={formData}
      validationSchema={QuoteValidationSchema()}
      onSubmit={OnSubmit}
      enableReinitialize
      innerRef={formikRef as unknown as React.Ref<FormikProps<QuoteInitialProps>>}
    >
      {({ values, setFieldValue, setFieldTouched, errors, validateForm }) => {
        values.quote.total_amount = values?.product
          ?.filter((product) => product?.product_type !== 'description')
          ?.reduce((sum, product) => {
            const totalAmount = product.discount
              ? (Number(product?.price) -
                  Number(product?.price) * (Number(product?.discount) / 100)) *
                Number(product?.units)
              : Number(product.price) * Number(product.units);

            return sum + (Number.isNaN(totalAmount) ? 0 : totalAmount);
          }, 0);

        if (values?.quote?.total_discount) {
          values.quote.total_amount = calculateTotalPrice(
            values.quote.total_amount,
            values.quote.total_discount
          );
        }

        const totalVatAmount =
          values?.product
            ?.filter((product) => product?.product_type !== 'description')
            ?.reduce((sum, product) => {
              const vatAmount = product?.product_vat_total;
              const vatAmountNumber = Number(vatAmount);

              const totalDiscount = Number(values?.quote?.total_discount) || 0;

              const discountMultiplier = totalDiscount ? 1 - totalDiscount / 100 : 1;

              const discountedVatAmount = Number.isNaN(vatAmountNumber)
                ? 0
                : vatAmountNumber * discountMultiplier;

              return sum + discountedVatAmount;
            }, 0) || 0;

        values.quote.total_vat_amount = totalVatAmount;

        const companyLogoSrc = values?.company?.logo ?? '/images/no-image.png';
        return (
          <Form>
            <div className="p-5 xl:p-[40px]">
              <div className="flex flex-wrap w-full gap-y-9">
                <div className="w-[250px]">
                  <label className="text-[15px] font-medium text-black leading-4 inline-block mb-[18px]">
                    {t('Quote.company.detail.logo')}
                  </label>

                  <div className="rounded-[4px] p-[5px] h-[155px] overflow-hidden border border-[#70708C]/0.27 flex items-center justify-center">
                    <Image
                      src={companyLogoSrc}
                      imgClassName="w-auto h-auto object-contain max-w-full max-h-full"
                      serverPath
                    />
                  </div>
                </div>
                <div className="1200:w-[calc(100%_-_250px)] 1400:ps-[56px] 1200:ps-[36px] w-full">
                  <QuoteCompanyForm
                    t={t}
                    values={values}
                    countries={countries}
                    cities={cities}
                    setFieldValue={setFieldValue}
                    companyLoading={companyLoading || updateQuoteLoading}
                    vatTypeLoading={vatTypeLoading}
                    companyVatTypeOption={companyVatTypeOption}
                  />
                  {/* ***************** */}
                  <div className="mt-10 pt-10 border-t border-solid border-dark/20">
                    <div className="flex flex-wrap -mx-6 gap-y-4">
                      <RadioButtonGroup
                        optionWrapper="flex gap-4 mt-4"
                        name="quote.academy"
                        options={AcademyType()}
                        label={t('issuedBy')}
                        parentClass="radio-group px-6 w-1/2 1400:w-auto"
                        isCompulsory
                        isDisabled={!!slug}
                        onChange={(e) => {
                          const academyValue = e.target.value;
                          setFieldValue('quote.academy', academyValue);
                          setIssuedBy(academyValue);
                          values.product.forEach((_, index: number) => {
                            setFieldValue(`product[${index}].vat_primary_id`, '');
                            setFieldValue(`product[${index}].vat_type_id`, '');
                            setFieldValue(`product[${index}].vat_type`, '');
                          });
                        }}
                      />
                      {currencyList?.length > 0 && (
                        <ReactSelect
                          parentClass=" px-6 w-1/2 1400:w-auto 1200:max-w-full 1400:max-w-[150px]"
                          className="w-full"
                          name="quote.currency"
                          options={currencyList}
                          label={t('Quote.company.detail.currencyTitle')}
                          placeholder={t('Quote.company.detail.currencyPlaceholder')}
                          onChange={(selectedOption) => {
                            const selectedValue = (selectedOption as Option)?.value;
                            setFieldValue(`quote.currency`, selectedValue);
                            const currencyList = Currencies?.map((data) => {
                              const tempCurrency = CurrencyList.get(data);
                              if (tempCurrency.code === selectedValue) {
                                return tempCurrency;
                              }
                              return null;
                            }).filter((data) => data !== null);
                            setFieldValue(
                              `quote.currency_symbol`,
                              currencyList?.[0]?.symbol_native
                            );
                          }}
                          isCompulsory
                        />
                      )}
                      <RadioButtonGroup
                        optionWrapper="flex gap-4 mt-4"
                        name="quote.quote_type"
                        options={QuoteType()}
                        isCompulsory
                        label={t('ClientManagement.clientForm.fieldInfos.quoteType')}
                        parentClass="radio-group px-6 w-1/2 1400:w-auto"
                      />
                      <DatePicker
                        parentClass="px-6 w-1/2 1400:w-auto 1200:max-w-full 1400:max-w-[200px] [&_.input-icon]:right-9"
                        name="quote.date"
                        label={t('Quote.company.detail.dateTitle')}
                        isCompulsory
                        icon
                        selectedDate={
                          values.quote.date ? new Date(values.quote.date) : null
                        }
                        isLoading={companyLoading}
                        onChange={(date) => {
                          if (setFieldValue)
                            setFieldValue(`quote.date`, format(date, 'yyyy-MM-dd'));
                        }}
                        placeholder={t('Quote.company.detail.datePlaceholder')}
                        minDate={new Date()}
                      />
                      {slug && !isClone && (
                        <InputField
                          parentClass="px-6 w-1/2 1400:w-auto 1200:max-w-full 1400:max-w-[240px]"
                          name="quote.quote_number"
                          label={t('Quote.quote.detail.quoteNumTitle')}
                          value={values?.quote?.quote_number}
                          isLoading={companyLoading}
                          isCompulsory
                          isDisabled
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap -mx-4 mt-4 gap-y-5">
                      {paymentTermResponse?.data?.length > 0 && (
                        <ReactSelect
                          parentClass="px-4 w-full 1200:w-1/2"
                          name="quote.payment_term_id"
                          options={paymentTermResponse?.data}
                          placeholder={t(
                            'ClientManagement.clientForm.fieldInfos.paymentTermPlaceHolder'
                          )}
                          label={t(
                            'ClientManagement.clientForm.fieldInfos.paymentTerm'
                          )}
                          isLoading={paymentTermLoader}
                          isCompulsory
                        />
                      )}
                      {salesRepResponse?.data && (
                        <ReactSelect
                          parentClass="px-4 w-full 1200:w-1/2"
                          className="w-full"
                          name="quote.sales_rep_id"
                          options={salesRepResponse?.data}
                          label={t('Quote.company.detail.salesRepTitle')}
                          placeholder={t('Quote.company.detail.salesRepPlaceholder')}
                          isCompulsory
                          disabled={user?.role_name === ROLES.SalesRep}
                          isLoading={salesRepLoader}
                        />
                      )}

                      <RadioButtonGroup
                        optionWrapper="flex gap-4"
                        name="quote.funded_by"
                        options={FundedByChoices()}
                        label={t('Quote.company.detail.fundedBy')}
                        parentClass="radio-group px-4 w-full 1200:w-1/2"
                      />

                      <RadioButtonGroup
                        optionWrapper="flex gap-4"
                        name="quote.is_destination_goods"
                        options={ConfirmationChoices()}
                        label={t('Quote.company.destination.label')}
                        parentClass="radio-group px-4 w-full 1200:w-1/2"
                      />
                    </div>
                  </div>

                  <div className="mt-[32px]">
                    <div className="flex flex-col gap-4 mb-5">
                      {String(values.quote.is_destination_goods) === 'true' && (
                        <div className="flex flex-col gap-4 mb-5">
                          <InputField
                            name="quote.destination_goods"
                            isCompulsory
                            value={values.quote.destination_goods}
                            placeholder={t(
                              'Quote.company.destination.namePlaceholder'
                            )}
                            label={t('Quote.company.destination.nameTitle')}
                            isLoading={isUpdateLoading}
                          />
                          <div className="grid xl:grid-cols-2 gap-4">
                            <InputField
                              name="quote.address"
                              value={values.quote.address}
                              placeholder={t(
                                'Quote.company.destination.addressPlaceholder'
                              )}
                              label={t('Quote.company.destination.addressTitle')}
                              isCompulsory
                              isLoading={isUpdateLoading}
                            />

                            <InputField
                              name="quote.cap_number"
                              value={values.quote.cap_number}
                              placeholder={t(
                                'Quote.company.destination.capPlaceholder'
                              )}
                              isCompulsory
                              label={t('Quote.company.destination.capTitle')}
                              isLoading={isUpdateLoading}
                            />
                          </div>
                          <div className="grid xl:grid-cols-3 gap-4">
                            <CountrySelect
                              selectedCountry={values.quote.country}
                              name="quote.country"
                              label={t('Quote.company.destination.nationTitle')}
                              placeholder={t(
                                'Quote.company.destination.nationPlaceholder'
                              )}
                              isCompulsory
                              className="bg-transparent"
                              isLoading={isUpdateLoading}
                            />
                            <ProvinceDropDown
                              name="quote.province"
                              label={t(
                                'ClientManagement.clientForm.fieldInfos.province'
                              )}
                              placeholder={t(
                                'Auth.RegisterCommon.provincePlaceHolder'
                              )}
                              selectedState={values.quote.province}
                              selectedCountry={values.quote.country}
                              className="bg-transparent"
                              isLoading={isUpdateLoading}
                            />
                            <CityDropdown
                              selectedCity={values.quote.city}
                              name="quote.city"
                              cities={cities.cities}
                              label={t('Quote.company.destination.cityTitle')}
                              placeholder={t(
                                'Quote.company.destination.cityPlaceholder'
                              )}
                              selectedState={FindStateId(values.quote.province)}
                              isCompulsory
                              isCityByCountry={false}
                            />
                          </div>
                          <div className="grid xl:grid-cols-3 gap-4">
                            <InputField
                              placeholder={t(
                                'Quote.company.destination.emailPlaceholder'
                              )}
                              value={values.quote.email}
                              label={t('Quote.company.destination.emailTitle')}
                              name="quote.email"
                              isCompulsory
                              isLoading={isUpdateLoading}
                            />
                            <PhoneNumberInput
                              placeholder={t(
                                'Quote.company.destination.telephonePlaceholder'
                              )}
                              label={t('Quote.company.destination.telephoneTitle')}
                              name="quote.telephone"
                              isCompulsory
                              isLoading={isUpdateLoading}
                            />
                            <PhoneNumberInput
                              placeholder={t(
                                'Quote.company.destination.mobilePlaceholder'
                              )}
                              label={t('Quote.company.destination.mobileTitle')}
                              name="quote.mobile_number"
                              isCompulsory
                              isLoading={isUpdateLoading}
                            />
                          </div>
                        </div>
                      )}
                      <QuoteProductForm
                        values={values}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                        t={t}
                        setDeleteProductArray={setDeleteProductArray}
                        deleteProductArray={deleteProductArray}
                        deleteModal={deleteModal}
                        calculateTotalPrice={calculateTotalPrice}
                        formData={formData}
                        vatTypeOption={vatTypeOption}
                        updateLoading={isUpdateLoading}
                      />
                      <div className="grid xl:grid-cols-2 gap-x-5 mt-3 w-full test-dd">
                        <DropZone
                          label={t(
                            'Quote.company.destination.internalAttachmentTitle'
                          )}
                          name="internal_attachment"
                          Title={t('browseDocument')}
                          SubTitle={t('Quote.fileSubTitle', { fileSize: '25MB' })}
                          setValue={setFieldValue}
                          acceptTypes={AttachmentFileType}
                          value={values.internal_attachment ?? null}
                          variant={fileInputEnum.FileInputXLS}
                          isMulti
                          isLoading={isUpdateLoading}
                        />
                        <DropZone
                          label={t(
                            'Quote.company.destination.clientAttachmentTitle'
                          )}
                          name="client_attachment"
                          Title={t('browseDocument')}
                          SubTitle={t('Quote.fileSubTitle', { fileSize: '25MB' })}
                          setValue={setFieldValue}
                          acceptTypes="application/pdf"
                          value={values.client_attachment ?? null}
                          variant={fileInputEnum.FileInputXLS}
                          isMulti
                          isLoading={isUpdateLoading}
                        />
                      </div>
                      <div className="flex flex-wrap -mx-2 gap-y-4">
                        <TextArea
                          parentClass=" w-full 1400:w-1/2 px-2"
                          name="quote.comments"
                          label="Comments"
                          rows={4}
                          isLoading={companyLoading}
                        />
                        <div className="1400:w-1/2 w-full px-2 grid grid-cols-2 gap-4 mb-5">
                          <InputField
                            name="quote.total_discount"
                            type="number"
                            value={values.quote.total_discount}
                            placeholder={t(
                              'Quote.company.product.totalDiscountPlaceholder'
                            )}
                            min={0}
                            isLoading={isUpdateLoading}
                            label={t('Quote.company.product.totalDiscountTitle')}
                          />
                          <div>
                            <p>
                              {t('Quote.company.product.totalProductAmountTitle')}
                            </p>
                            <p>
                              {values.quote.total_amount?.toFixed(2)
                                ? `${getCurrencySymbol(
                                    values.quote.currency
                                  )} ${formatCurrency(
                                    values.quote.total_amount,
                                    values.quote.currency
                                  )}`
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p>{t('Quote.company.product.totalVatAmount')}</p>
                            <p>
                              {getCurrencySymbol(values.quote.currency)}{' '}
                              {Number.isNaN(values.quote.total_vat_amount)
                                ? '-'
                                : formatCurrency(
                                    values.quote.total_vat_amount,
                                    values.quote.currency
                                  )}
                            </p>
                          </div>
                          <div>
                            <p>{t('Quote.company.product.totalPriceTitle')}</p>
                            <p>
                              {getCurrencySymbol(values.quote.currency)}{' '}
                              {Number.isNaN(values.quote.total_amount)
                                ? '-'
                                : formatCurrency(
                                    values.quote.total_amount +
                                      values.quote.total_vat_amount,
                                    values.quote.currency
                                  )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-4">
                      <Button
                        className="min-w-[90px]"
                        variants="whiteBordered"
                        onClickHandler={() => {
                          navigate(-1);
                        }}
                      >
                        {t('Button.cancelButton')}
                      </Button>
                      <Button
                        variants="primary"
                        type="submit"
                        className="min-w-[90px]"
                        isLoading={isAddLoading || isUpdateLoading}
                        disabled={isAddLoading || isUpdateLoading}
                        onClickHandler={async () => {
                          const formErrors = await validateForm();
                          if (!_.isEmpty(formErrors)) {
                            scrollToError(formErrors);
                            dispatch(
                              setToast({
                                variant: 'Error',
                                message: `${t('ToastMessage.quoteFieldErrors')}`,
                                type: 'error',
                                id: customRandomNumberGenerator(),
                              })
                            );
                          }
                          if (errors?.product && errors?.product?.length > 0) {
                            for (let i = 0; i < errors?.product?.length; i++) {
                              setFieldValue(`product[${i}].isOpen`, false);
                            }
                          }
                        }}
                      >
                        {isClone || !slug
                          ? t('addFooterTitle')
                          : t('editFooterTitle')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
export default QuoteForm;
