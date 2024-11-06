import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Button from 'components/Button/Button';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import { FieldArray, FieldArrayRenderProps } from 'formik';
import { useQueryGetFunction } from 'hooks/useQuery';
import { CreateProduct } from 'modules/Quotes/components/CreateProduct';
import { ProductTypeEnum, QuoteStatusEnum } from 'modules/Quotes/constants';
import {
  DeleteProductArray,
  Product,
  QuoteProductProps,
} from 'modules/Quotes/types';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SetFieldValue } from 'types/common';

const RejectReasonField = (
  rejectReason: (value: string) => string,
  rejectData: DeleteProductArray
) => {
  const { t } = useTranslation();
  const handleReason = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val !== undefined) {
      rejectReason(val);
    }
  };
  return (
    <div className="text-left mt-5">
      <label className="text-sm text-black leading-4 inline-block mb-2">
        {t('CompanyManager.trackCourse.rejectModal.rejectReasonTitle')}
      </label>
      <textarea
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleReason(e)}
        rows={5}
        className="text-area bg-gray-200/20"
      />
      {rejectData?.delete_reason === '' ? (
        <span className="error-message">
          {t('CoursesManagement.Errors.Course.rejectReason')}
        </span>
      ) : (
        ''
      )}
    </div>
  );
};
const QuoteProductForm = ({
  values,
  setFieldValue,
  setFieldTouched,
  t,
  deleteModal,
  setDeleteProductArray,
  deleteProductArray,
  calculateTotalPrice,
  vatTypeOption,
  updateLoading,
}: QuoteProductProps) => {
  const [defaultCodesNames, setDefaultCodesNames] = useState<Option[]>([]);
  const [defaultCourseNames, setDefaultCourseNames] = useState<Option[]>([]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [closeAll, setCloseAll] = useState(false);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const [rejectData, setRejectData] = useState<DeleteProductArray>();
  const { response: codesResponse, isLoading } = useQueryGetFunction('/codes', {
    option: {
      includeOthers: true,
      view: true,
    },
    sort: '-id',
  });
  useEffect(() => {
    if (codesResponse?.data?.data?.length > 0) {
      const newData = codesResponse?.data?.data.map(
        (dat: { code: string; id: string }) => ({
          label: dat.code,
          value: dat.id,
        })
      );
      const courseData = codesResponse?.data?.data
        .map(
          (dat: {
            course_title: string;
            id: number;
            title: string;
            price?: string;
            code?: string;
          }) => {
            const matchingProduct = values.product.find(
              (product: { code_id: number }) => product.code_id === dat.id
            );
            const label = matchingProduct
              ? matchingProduct.title
              : dat.course_title ?? dat.title ?? dat.code;
            const value = matchingProduct
              ? matchingProduct.title
              : dat.course_title ?? dat.title ?? dat.code;
            return {
              label,
              value,
            };
          }
        )
        .filter(
          (course: { label: string; value: string }) =>
            course.label !== null && course.value !== undefined
        );
      setDefaultCodesNames(newData);
      setDefaultCourseNames(courseData);
    }
  }, [codesResponse, values.product]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setCloseAll(true);
    setActiveId(event.active.id as string);
  }, []);

  useEffect(() => {
    if (closeAll === true)
      for (let i = 0; i < values.product.length; i++) {
        setFieldValue(`product[${i}].isOpen`, true);
      }
  }, [closeAll]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent, setFieldValue: SetFieldValue, products: Product[]) => {
      const { active, over } = event;
      setCloseAll(false);
      if (active.id !== over?.id) {
        const oldIndex = products.findIndex(
          (item: Product) => item.product_sequence === active.id
        );
        const newIndex = products.findIndex(
          (item: Product) => item.product_sequence === over?.id
        );
        const newProducts = [...products];
        const [draggedItem] = newProducts.splice(oldIndex, 1);
        newProducts.splice(newIndex, 0, draggedItem);
        setFieldValue('product', newProducts);
      }

      setActiveId(null);
    },
    []
  );
  const handleAddProduct = (
    arrayHelpers: FieldArrayRenderProps,
    product_type = ProductTypeEnum.product
  ): void => {
    const newIndex = arrayHelpers.form.values.product.length;
    if (product_type === ProductTypeEnum.product) {
      arrayHelpers.push({
        code_id: '',
        description: '',
        units: 1,
        discount: '',
        product_total_amount: '',
        product_total: '',
        product_total_vat_amount: '',
        title: '',
        vat_number: '',
        price: '',
        quote_type: '',
        product_type,
        product_sequence: newIndex + 1,
        isOpen: false,
        vat_type_id: '',
        vat_type: '',
        vat_primary_id: values?.quote?.vat_primary_id,
      });
    } else {
      arrayHelpers.push({
        description: '',
        product_type,
        product_sequence: newIndex + 1,
        isOpen: false,
      });
    }
    arrayHelpers.form.values.product.forEach((item: Product, index: number) => {
      item.product_sequence = index + 1;
    });
  };
  const onDelete = (value: string) => {
    const temp = {
      id: rejectData?.id,
      delete_reason: value,
      deleteIndex: rejectData?.deleteIndex,
    };
    setRejectData(temp as DeleteProductArray);
    return value;
  };
  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={(event) => handleDragEnd(event, setFieldValue, values.product)}
      >
        <div className="bg-primaryLight rounded-xl my-5">
          <div className="px-7 pb-8 flex flex-col gap-5 w-full">
            <FieldArray
              name="product"
              render={(productArrayHelpers) => {
                const quoteProducts = values.product.map(
                  (data: Product) => data.product_sequence
                );
                return (
                  <>
                    <SortableContext
                      items={quoteProducts as unknown as UniqueIdentifier[]}
                      strategy={verticalListSortingStrategy}
                    >
                      {quoteProducts?.map((productId: number, index: number) => {
                        const totalPrice = values.product?.[index]?.price ?? 0;
                        const totalUnits = values.product?.[index]?.units ?? 0;
                        const totalDiscount = values.product?.[index]?.discount ?? 0;

                        const totalAmount = calculateTotalPrice(
                          totalPrice * totalUnits,
                          totalDiscount
                        );
                        const isTotalAmountValid = !Number.isNaN(totalAmount);

                        values.product[index].product_total = isTotalAmountValid
                          ? (
                              totalAmount +
                              (values.product[index]?.product_vat_total || 0)
                            ).toFixed(2)
                          : 0;

                        values.product[index].product_vat_total =
                          parseFloat(
                            (
                              (Number(totalAmount) *
                                Number(values.product[index].vat_type)) /
                              100
                            ).toFixed(2)
                          ) || 0;

                        values.product[index].quote_type = values?.quote.quote_type;
                        return (
                          <div key={`quote_product_${index + 1}`}>
                            {index === 0 ? (
                              <div
                                className="flex flex-col "
                                key={`product_${index + 1}`}
                              >
                                <div className="flex flex-wrap justify-between py-7 items-center">
                                  <p className="text-xl leading-6 font-semibold text-dark">
                                    {t('Quote.company.product.label')}
                                  </p>
                                  {values.quote.status !==
                                    QuoteStatusEnum.approved && (
                                    <div className="flex gap-4">
                                      <Button
                                        variants="primary"
                                        onClickHandler={() => {
                                          handleAddProduct(
                                            productArrayHelpers,
                                            ProductTypeEnum.product
                                          );
                                        }}
                                        className="gap-1 h-10"
                                      >
                                        <Image
                                          iconName="plusSquareIcon"
                                          iconClassName="w-4 h-4"
                                        />
                                        {t('Quote.product.productTitle')}
                                      </Button>
                                      <Button
                                        variants="secondary"
                                        onClickHandler={() => {
                                          handleAddProduct(
                                            productArrayHelpers,
                                            ProductTypeEnum.description
                                          );
                                        }}
                                        className="gap-1 h-10"
                                      >
                                        <Image
                                          iconName="plusSquareIcon"
                                          iconClassName="w-4 h-4"
                                        />
                                        {t('Quote.company.product.addTextareaTitle')}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              ''
                            )}
                            <CreateProduct
                              values={values}
                              defaultCodesNames={defaultCodesNames}
                              defaultCourseNames={defaultCourseNames}
                              setFieldTouched={setFieldTouched}
                              setFieldValue={setFieldValue}
                              setRejectData={setRejectData}
                              deleteModal={deleteModal}
                              isLoading={isLoading}
                              updateLoading={updateLoading}
                              t={t}
                              codesResponse={codesResponse}
                              index={index}
                              productArrayHelpers={productArrayHelpers}
                              key={productId}
                              id={productId}
                              product={values.product.find(
                                (p: Product) => p.product_sequence === productId
                              )}
                              closeAll={closeAll}
                              vatTypeOption={vatTypeOption}
                            />
                          </div>
                        );
                      })}
                    </SortableContext>
                    <DragOverlay>
                      {activeId ? (
                        <CreateProduct
                          values={values}
                          defaultCodesNames={defaultCodesNames}
                          defaultCourseNames={defaultCourseNames}
                          setFieldTouched={setFieldTouched}
                          setFieldValue={setFieldValue}
                          setRejectData={setRejectData}
                          deleteModal={deleteModal}
                          index={activeId !== null ? Number(activeId) - 1 : 0}
                          isLoading={isLoading}
                          t={t}
                          product={values.product.find(
                            (p: Product) => p.product_sequence === activeId
                          )}
                          codesResponse={codesResponse}
                          productArrayHelpers={productArrayHelpers}
                          id={activeId !== null ? Number(activeId) - 1 : 0}
                          closeAll={closeAll}
                          vatTypeOption={vatTypeOption}
                        />
                      ) : null}
                    </DragOverlay>
                  </>
                );
              }}
            />
            <div className="flex items-center text-xs gap-2 bg-red-500/10 border border-solid border-red-500 w-fit px-3 py-2 pb-2.5 rounded">
              <span className="error-message">
                {t('Quote.note.title')}: {t('Quote.note.description')}
              </span>
            </div>
          </div>
        </div>
      </DndContext>
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={t('ClientManagers.managersButtons.deleteText', {
            ManagerName: 'product',
          })}
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          deleteTitle={t('Button.deleteTitle')}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          confirmButtonFunction={() => {
            const newProducts = values.product.filter(
              (_: unknown, index: number) => index !== rejectData?.deleteIndex
            );
            if (rejectData?.delete_reason) {
              setDeleteProductArray([
                ...deleteProductArray,
                { id: rejectData?.id, delete_reason: rejectData?.delete_reason },
              ]);
              setFieldValue('product', newProducts);
              deleteModal.closeModal();
            } else {
              setRejectData?.((prev) => ({ ...prev, delete_reason: '' }));
            }
          }}
          cancelButtonFunction={() => {
            deleteModal.closeModal();
          }}
          optionalComponent={() =>
            RejectReasonField(onDelete, rejectData as DeleteProductArray)
          }
        />
      )}
    </div>
  );
};

export default QuoteProductForm;
