import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import InputField from 'components/FormElement/InputField';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik';
import { useAxiosPost } from 'hooks/useAxios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import * as Yup from 'yup';
import {
  PaymentTermsProps,
  paymentDue,
  paymentMode,
  paymentModeOptions,
} from '../types';

type propsType = {
  modal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  reFetchPaymentTerms: (options?: RefetchOptions | undefined) => Promise<
    QueryObserverResult<
      {
        data?: PaymentTermsProps;
        error?: string;
      },
      Error
    >
  >;
};

const AddPaymentTermsModel = ({ modal, reFetchPaymentTerms }: propsType) => {
  const { t } = useTranslation();
  const [addPaymentTerms] = useAxiosPost();
  const [checkValidate, setCheckValidate] = useState(false);
  const [checkValidateDay, setCheckValidateDay] = useState(false);
  const { allLanguages } = useSelector(useLanguage);

  const paymentOptions: Option[] = [
    { value: paymentMode?.WIRE_TRANSFER, label: paymentMode?.WIRE_TRANSFER },
    { value: paymentMode?.BANCOMAT, label: paymentMode?.BANCOMAT },
  ];

  const OnSubmit = async (data: PaymentTermsProps) => {
    if (data) {
      if (data?.payment_due === paymentDue.CUSTOM) {
        let dayCheck = false;
        if (data.custom.length > 1) {
          const checkDayValidation = data?.custom?.some((item, index) => {
            return index > 0 ? data?.custom[index - 1]?.days > item?.days : false;
          });
          if (checkDayValidation) {
            setCheckValidateDay(true);
            dayCheck = true;
          }
        }
        const checkPercentageValidation = data?.custom
          ?.map((item) => Number(item.payment_percentage))
          .reduce((total, item) => {
            return total + item;
          });

        if (checkPercentageValidation !== 100) {
          setCheckValidate(true);
        } else {
          setCheckValidate(false);
        }

        if (dayCheck || checkPercentageValidation !== 100) {
          return;
        }
      }
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'custom') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await addPaymentTerms('paymentterms/add', formData);

      if (!response.error) {
        modal.closeModal();
        reFetchPaymentTerms();
      }
    }
  };

  const initialValues: PaymentTermsProps | string = {
    payment_mode: paymentMode.WIRE_TRANSFER,
    payment_due: paymentDue?.IMMEDIATE,
    days: 0,
    due_days: 0,
    // custom_due_days: 0,
    payment_percentage: 0,
    end_of_month: false,
    custom: [
      { days: 0, payment_percentage: 0, end_of_month: false, custom_due_days: 0 },
    ],
  };

  const fieldObject: { name: string; key: string; label: string }[] = [];

  (allLanguages ?? []).forEach((lang) => {
    // ** Adding name attribute for all other optional languages
    fieldObject.push({
      key: lang.short_name,
      name: `name_${lang.name}`,
      label: lang.name,
    });

    // ** adding all languages field to initialvalue object
    if (initialValues) {
      (initialValues as any)[`name_${lang.name}`] = '';
    }
  });

  const ValidationSchema = () => {
    return Yup.object().shape({
      name_english: Yup.string().required(t('Payment.validation.name')),
      name_italian: Yup.string().required(t('Payment.validation.name')),
      payment_due: Yup.string().required(t('Payment.validation.due')),
      days: Yup.number().when('payment_due', {
        is: (value: string) => value === 'Custom',
        then: () => Yup.number().required(t('Payment.validation.custom.days')),
        otherwise: () => Yup.number().notRequired(),
      }),
      payment_percentage: Yup.number().when('payment_due', {
        is: (value: string) => value === 'Custom',
        then: () => Yup.number().required(t('Payment.validation.custom.percentage')),
        otherwise: () => Yup.number().notRequired(),
      }),
      custom: Yup.array().of(
        Yup.object().shape({
          days: Yup.number().required(t('Payment.validation.custom.days')),
          payment_percentage: Yup.number().required(
            t('Payment.validation.custom.percentage')
          ),
        })
      ),
    });
  };

  const handleAddCustomData = (arrayHelpers: FieldArrayRenderProps) => {
    arrayHelpers.push({
      days: 0,
      payment_percentage: 0,
      end_of_month: false,
      custom_due_days: 0,
    });
  };

  return (
    <Modal
      modal={modal}
      closeOnOutsideClick
      width="!max-w-[900px]"
      headerTitle={t('Payment.add')}
    >
      <div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={ValidationSchema()}
          onSubmit={(values) => OnSubmit(values)}
        >
          {({ values, setFieldValue }) => {
            return (
              <Form className="flex flex-col gap-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {fieldObject.map((language, index) => {
                    return (
                      <InputField
                        key={`Payment_${index + 1}`}
                        isCompulsory
                        placeholder={t('Payment.name')}
                        type="text"
                        label={`${t('Payment.name')} ( ${language.label} )`}
                        name={language.name}
                      />
                    );
                  })}
                </div>
                <ReactSelect
                  label={t('ClientManagement.viewClientDetails.paymentMode')}
                  name="payment_mode"
                  options={paymentOptions}
                  isCompulsory
                />
                <div className="flex items-center">
                  <RadioButtonGroup
                    isCompulsory
                    optionWrapper="flex flex-col gap-y-4"
                    label={t('Payment.due')}
                    name="payment_due"
                    options={paymentModeOptions()}
                  />
                  {values?.payment_due === paymentDue.DUE && (
                    <div className="flex items-center mt-8">
                      <InputField
                        parentClass="!w-[70px]"
                        type="number"
                        isCompulsory
                        value={values?.due_days}
                        name="due_days"
                      />
                      <span className="inline-block text-sm font-normal ms-2">
                        {t('Payment.due.days')}
                      </span>
                    </div>
                  )}
                </div>
                {values?.payment_due === paymentDue.CUSTOM && (
                  <FieldArray
                    name="custom"
                    render={(arrayHelpers) => (
                      <>
                        {values.custom?.map((customValue, index) => {
                          return (
                            <div
                              key={`CUSTOM_${index + 1}`}
                              className="flex items-center w-full"
                            >
                              <div className="bg-primaryLight rounded-xl p-5 w-full">
                                <div className="flex gap-5 w-full">
                                  <InputField
                                    parentClass="!w-[200px]"
                                    type="number"
                                    isCompulsory
                                    value={customValue?.days}
                                    label={t('Payment.days')}
                                    name={`custom[${index}].days`}
                                  />
                                  <InputField
                                    parentClass="flex-[1_0_0%]"
                                    type="text"
                                    isCompulsory
                                    value={customValue?.payment_percentage}
                                    label={t('Payment.percentage')}
                                    name={`custom[${index}].payment_percentage`}
                                  />
                                  <Checkbox
                                    name={`custom[${index}].end_of_month`}
                                    onChange={() => {
                                      setFieldValue(
                                        `custom[${index}].end_of_month`,
                                        !customValue?.end_of_month
                                      );
                                    }}
                                    check={customValue?.end_of_month}
                                    text={t('payment.endOfMonth')}
                                    labelClass="text-primary !text-base transition-all"
                                    parentClass="mt-10"
                                  />
                                  {index === values.custom.length - 1 ? (
                                    <Button
                                      // disabled={isDisabled('')}
                                      onClickHandler={() =>
                                        handleAddCustomData(arrayHelpers)
                                      }
                                      className="cursor-pointer mt-30px w-10 h-10 bg-primary rounded-lg text-white flex justify-center items-center"
                                    >
                                      <Image iconName="plusIcon" />
                                    </Button>
                                  ) : (
                                    ''
                                  )}
                                  {values.custom.length !== 1 && (
                                    <Button
                                      // disabled={isDisabled('')}
                                      className="button dangerBorder mt-30px w-10 h-10 !p-2 inline-block"
                                      onClickHandler={() =>
                                        arrayHelpers.remove(index)
                                      }
                                    >
                                      <Image
                                        iconName="deleteIcon"
                                        iconClassName="w-6 h-6"
                                      />
                                    </Button>
                                  )}
                                </div>
                                {checkValidateDay &&
                                  values?.custom?.length > 0 &&
                                  values?.custom[index - 1]?.days >=
                                    customValue?.days && (
                                    <span className="error-message">
                                      Please Enter Day Is Greater Than Previous Day
                                    </span>
                                  )}
                                {customValue?.end_of_month && (
                                  <div className="flex items-center gap-2 mt-4">
                                    <span className="inline-block text-sm font-normal">
                                      {t('payment.afterEndOfMonth')}
                                    </span>
                                    <InputField
                                      parentClass="!w-[70px]"
                                      type="number"
                                      isCompulsory
                                      value={customValue?.custom_due_days}
                                      name={`custom[${index}].custom_due_days`}
                                    />
                                    <span className="inline-block text-sm font-normal">
                                      {t('Payment.days')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  />
                )}
                {checkValidate && (
                  <span className="error-message">
                    Please Enter total Percentage equal to 100%
                  </span>
                )}
                <div className="flex my-4 w-full gap-2 justify-end col-span-2">
                  <Button
                    className="min-w-[150px] justify-center"
                    variants="whiteBordered"
                    onClickHandler={() => {
                      modal.closeModal();
                    }}
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <Button
                    variants="primary"
                    className="min-w-[150px] justify-center"
                    type="submit"
                    value={t('Codes.add')}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default AddPaymentTermsModel;
