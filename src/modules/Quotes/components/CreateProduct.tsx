import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';
import _ from 'lodash';
import CodeQuotes from 'modules/Quotes/components/CodeQuotes';
import { CreateProductProps, Product } from 'modules/Quotes/types';
import { CSSProperties, useEffect } from 'react';
import { getCurrencySymbol } from 'utils';

export const CreateProduct = ({
  t,
  setFieldValue,
  setFieldTouched,
  values,
  defaultCodesNames,
  defaultCourseNames,
  setRejectData,
  deleteModal,
  codesResponse,
  isLoading,
  product,
  index,
  productArrayHelpers,
  id,
  vatTypeOption,
  updateLoading,
}: CreateProductProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: id as UniqueIdentifier,
    });
  const handleManagerClick = () => {
    setFieldValue(`product[${index}].isOpen`, !product.isOpen);
  };
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const inlineStyles: CSSProperties = {
    opacity: isDragging ? '0.1' : '1',
    transformOrigin: '50% 50%',
    borderRadius: '10px',
    cursor: isDragging ? 'grabbing' : 'pointer',
    backgroundColor: '#ffffff',
    boxShadow: isDragging
      ? 'rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px'
      : 'rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px',
    // transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    ...style,
  };
  const ccc = {
    height: '192px',
  };

  const getCodesOption = (codes: Option[], products: Product[], index: number) => {
    const codesList = codes.filter((option) => {
      return products.every((r) => {
        if (r.code_id === products?.[index]?.code_id) return true;
        return r.code_id !== option.value;
      });
    });
    return codesList;
  };

  const getTitlesOption = (titles: Option[], products: Product[], index: number) => {
    const codesList = titles.filter((option) => {
      return products.every((r) => {
        if (r.title === products?.[index]?.title) return true;
        return r.title !== option.value;
      });
    });
    return codesList;
  };

  const DiscountError = () => {
    let error = '';
    if (Number(product.discount) < 0) {
      error = t('Quote.company.validation.NegativeCheck');
    }
    if (Number(product.discount) > 100) {
      error = t('Quote.company.validation.discountValue', { Discount: 100 });
    }
    return error;
  };

  useEffect(() => {
    if (product.vat_type_id === '') {
      const verifyVat = vatTypeOption?.find(
        (data) => data.value === product.vat_primary_id
      );
      setFieldValue(
        `product[${index}].vat_primary_id`,
        _.isUndefined(verifyVat) ? '' : values.quote.vat_primary_id
      );
      setFieldValue(
        `product[${index}].vat_type_id`,
        _.isUndefined(verifyVat) ? '' : values.quote.vat_type_id
      );
      setFieldValue(
        `product[${index}].vat_type`,
        _.isUndefined(verifyVat) ? '' : values.quote.vat_type
      );
    }
  }, [values.quote.vat_primary_id, values.quote.vat_type_id, values.quote.vat_type]);

  return (
    <div ref={setNodeRef}>
      <CustomCard
        minimal
        cardClass={`!shadow-none `}
        bodyClass="flex flex-col gap-4"
        styles={inlineStyles}
      >
        <>
          <div className="flex justify-between gap-2 items-center">
            <div className="DragHandle w-full flex gap-2 items-center">
              {values?.product?.length !== 1 ? (
                <button {...attributes} {...listeners}>
                  <Image iconName="dragIcon" />
                </button>
              ) : (
                ''
              )}
              <p className="text-xl leading-[0.4] font-semibold">
                {product.title ? (
                  product.title
                ) : (
                  <span>
                    {product.product_type === 'product' ? (
                      <span>
                        {t('Quote.product.productTitle')} &nbsp;
                        {product.product_sequence}
                      </span>
                    ) : (
                      <span>{t('textDescriptionTitle')}</span>
                    )}
                  </span>
                )}
              </p>
            </div>
            <Button
              className="w-7 h-7 cursor-pointer rounded-full border-2 p-1 border-solid bg-gray-200 border-gray-200 text-dark transition-all duration-300"
              onClickHandler={handleManagerClick}
            >
              <Image
                iconName="chevronLeft"
                iconClassName={`w-full h-full stroke-[3] ${
                  product.isOpen ? '-rotate-90 translate-y-px' : 'rotate-90'
                }`}
              />
            </Button>

            {values?.product?.length > 1 ? (
              <Button
                variants="dangerBorder"
                className="w-10 h-10 !p-2 inline-block mb-0.5"
                onClickHandler={() => {
                  if (product?.id !== undefined) {
                    if (values?.deleteProduct && values?.deleteProduct?.length > 0) {
                      setFieldValue('deleteProduct', [
                        ...values.deleteProduct,
                        { productId: product.id },
                      ]);
                    } else {
                      setFieldValue('deleteProduct', [{ productId: product?.id }]);
                    }
                    values?.deleteProduct?.push({
                      id: product?.id,
                    });
                    deleteModal.openModal();
                    setRejectData({
                      id: product?.id,
                      deleteIndex: index,
                    });
                  } else {
                    productArrayHelpers.remove(index);
                  }
                }}
              >
                <Image iconName="deleteIcon" iconClassName="w-5 h-5" />
              </Button>
            ) : (
              ''
            )}
          </div>
          <div className={product.isOpen ? 'hidden' : ''}>
            {values?.product?.[index]?.product_type === 'product' ? (
              <div>
                <div className="grid 1600:grid-cols-2 gap-[30px]">
                  <ReactEditor
                    label={t('Quote.company.product.descriptionTitle')}
                    parentClass="1600:h-unset update-height"
                    name={`product[${index}].description`}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    value={product.description}
                    styles={ccc}
                    // id="company_product_editor"
                  />

                  <div className="flex flex-col gap-[30px]">
                    {defaultCourseNames && defaultCourseNames.length > 0 && (
                      <ReactSelect
                        parentClass="w-full"
                        className="w-full"
                        name={`product[${index}].title`}
                        options={getTitlesOption(
                          defaultCourseNames,
                          values.product,
                          index
                        )}
                        label={t('Quote.company.product.nameTitle')}
                        placeholder={t('Quote.company.product.namePlaceholder')}
                        isInput
                        isLoading={isLoading}
                        isCompulsory
                        onChange={(selectedOption) => {
                          const selectedOptionsArray = Array.isArray(selectedOption)
                            ? selectedOption
                            : [selectedOption];

                          const firstOptionLabel = selectedOptionsArray[0]?.label;
                          const codeData = codesResponse?.data?.data?.find(
                            (data: { course_title: string; title?: string }) =>
                              data.course_title === firstOptionLabel ||
                              data.title === firstOptionLabel
                          );
                          const fieldName = `product[${index}].code_id`;
                          const descriptionFieldName = `product[${index}].description`;
                          const priceField = `product[${index}].price`;
                          setFieldValue(
                            `product[${index}].title`,
                            selectedOptionsArray[0]?.value
                          );
                          if (codeData) {
                            setFieldValue(fieldName, codeData?.id);
                            setFieldValue(
                              descriptionFieldName,
                              codeData?.description
                            );
                            setFieldValue(
                              priceField,
                              codeData?.courses?.[0]?.price ?? codeData?.price ?? ''
                            );
                          }
                        }}
                        disabled={!!product.id}
                      />
                    )}
                    <div className="flex gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        {defaultCodesNames && defaultCodesNames.length > 0 && (
                          <ReactSelect
                            parentClass="w-full"
                            className="w-full"
                            name={`product[${index}].code_id`}
                            options={getCodesOption(
                              defaultCodesNames,
                              values.product,
                              index
                            )}
                            label={t('Quote.company.product.productCode')}
                            placeholder={t(
                              'Quote.company.product.productCodePlaceholder'
                            )}
                            isLoading={isLoading}
                            isCompulsory
                            onChange={(selectedOption) => {
                              const selectedOptionsArray = Array.isArray(
                                selectedOption
                              )
                                ? selectedOption
                                : [selectedOption];
                              const firstOptionLabel =
                                selectedOptionsArray[0]?.label;

                              const codeData = codesResponse?.data?.data?.find(
                                (data: {
                                  code: string;
                                  title?: string;
                                  price?: string;
                                }) => data.code === firstOptionLabel
                              );
                              const fieldName = `product[${index}].title`;
                              const descriptionFieldName = `product[${index}].description`;
                              const priceField = `product[${index}].price`;
                              setFieldValue(
                                `product[${index}].code_id`,
                                selectedOptionsArray[0]?.value
                              );
                              if (codeData) {
                                setFieldValue(
                                  fieldName,
                                  codeData?.course_title || codeData?.title
                                );
                                setFieldValue(
                                  descriptionFieldName,
                                  codeData?.description
                                );
                                setFieldValue(
                                  priceField,
                                  codeData?.courses?.[0]?.price ??
                                    codeData?.price ??
                                    ''
                                );
                              } else {
                                setFieldValue(fieldName, '');
                              }
                            }}
                            disabled={!!product.id}
                          />
                        )}
                        {vatTypeOption && vatTypeOption?.length > 0 && (
                          <ReactSelect
                            parentClass="w-full"
                            name={`product[${index}].vat_primary_id`}
                            options={vatTypeOption}
                            selectedValue={product?.vat_primary_id}
                            onChange={(selectedOption) => {
                              setFieldValue(
                                `product[${index}].vat_primary_id`,
                                (selectedOption as Option).value
                              );
                              setFieldValue(
                                `product[${index}].vat_type`,
                                (selectedOption as Option).vat_value
                              );
                              setFieldValue(
                                `product[${index}].vat_type_id`,
                                (selectedOption as Option).vat_id
                              );
                            }}
                            isLoading={updateLoading}
                            placeholder={t(
                              'ClientManagement.clientForm.fieldInfos.vatTypePlaceHolder'
                            )}
                            label={t(
                              'ClientManagement.clientForm.fieldInfos.vatType'
                            )}
                            isCompulsory
                          />
                        )}
                        <div className="col-span-2 flex gap-4">
                          <div className="max-w-[50px]">
                            <InputField
                              name={`product[${index}].units`}
                              type="number"
                              value={product?.units}
                              label={t('Quote.company.product.unitsTitle')}
                              min={1}
                              isLoading={updateLoading}
                              showError={false}
                            />
                            {product.units > 100 &&
                            product.quote_type === 'private' ? (
                              <span className="error-message col-span-full">
                                {t(
                                  'Quote.product.units.validation.MaxUnitsExceeded'
                                )}
                              </span>
                            ) : (
                              ''
                            )}
                          </div>

                          <InputField
                            parentClass="flex-1"
                            prefix={getCurrencySymbol(values.quote.currency)}
                            placeholder={t('Quote.company.product.pricePlaceholder')}
                            type="number"
                            isCompulsory
                            label={t('Quote.company.product.priceTitle')}
                            name={`product[${index}].price`}
                            isLoading={updateLoading}
                          />

                          <div className="flex-1">
                            <InputField
                              max={100}
                              name={`product[${index}].discount`}
                              type="number"
                              value={product?.discount}
                              isLoading={updateLoading}
                              placeholder={t(
                                'Quote.company.product.discountPlaceholder'
                              )}
                              label={t('Quote.company.product.discountTitle')}
                              showError={false}
                            />
                            {Number(product?.discount) ? (
                              <span className="error-message">
                                {DiscountError()}
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                        <InputField
                          name={`product[${index}].quote_type`}
                          type="string"
                          value={product?.quote_type}
                          parentClass="hidden"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        prefix={getCurrencySymbol(values.quote.currency)}
                        name={`product[${index}].product_vat_total`}
                        value={
                          Number.isNaN(product?.product_vat_total)
                            ? 0
                            : product?.product_vat_total
                        }
                        isLoading={updateLoading}
                        placeholder={t(
                          'Quote.company.product.totalAmountPlaceholder',
                          {
                            currencySymbol: values.quote.currency_symbol,
                          }
                        )}
                        label={t('Quote.company.product.totalVatAmount')}
                        isDisabled
                      />
                      <InputField
                        prefix={getCurrencySymbol(values.quote.currency)}
                        name={`product[${index}].product_total`}
                        value={product?.product_total ?? 0}
                        placeholder={t(
                          'Quote.company.product.totalAmountPlaceholder',
                          {
                            currencySymbol: values.quote.currency_symbol,
                          }
                        )}
                        isLoading={updateLoading}
                        label={t('Quote.company.product.totalAmountTitle')}
                        isDisabled
                      />
                    </div>
                  </div>
                </div>
                {values.product[index].code_id && (
                  <CodeQuotes
                    codeId={values.product[index].code_id}
                    companyId={values?.company?.id}
                    t={t}
                  />
                )}
              </div>
            ) : (
              <ReactEditor
                label={t('Quote.company.product.descriptionTitle')}
                parentClass="h-unset"
                name={`product[${index}].description`}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                value={product.description}
                isCompulsory
                // id="product_editor"
              />
            )}
          </div>
        </>
      </CustomCard>
    </div>
  );
};
