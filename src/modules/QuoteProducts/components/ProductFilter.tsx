import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { ProductStatus, ProductType } from '../constants';
import { FilterProductProps, ProductFilterType } from '../types';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import { useDispatch } from 'react-redux';

const ProductFilter = ({
  setFilterModal,
  setProductFilters,
  t,
  productFilters,
}: FilterProductProps) => {
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState<ProductFilterType>({
    status: [],
    productType: [],
  });

  useEffect(() => {
    if (productFilters) {
      setFormValue(productFilters);
    }
  }, [productFilters]);

  const handleChange = (
    isChecked: boolean,
    item: string,
    type: keyof ProductFilterType
  ) => {
    return setFormValue((prev) => ({
      ...prev,
      [type]: isChecked
        ? [...(prev[type] ?? []), item]
        : ((prev[type] ?? []) as string[]).filter(
            (status: string) => status !== item
          ),
    }));
  };

  const handleSubmit = () => {
    setProductFilters(formValue);
    setFilterModal(false);
    dispatch(currentPageCount({ currentPage: 1 }));
  };

  return (
    <Formik initialValues={formValue} onSubmit={handleSubmit}>
      {() => (
        <Form>
          <div>
            <p className="text-sm leading-5 font-semibold">{t('ProductStatus')}</p>
            <div className="flex flex-col gap-y-3 mt-4">
              {ProductStatus(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.status?.includes(data.value))}
                      check={formValue.status?.includes(data.value)}
                      onChange={(event) =>
                        handleChange(event.target.checked, data.value, 'status')
                      }
                      labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                      id={data.value}
                      name={data.value}
                      text={data.label}
                    />
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm leading-5 font-semibold mt-4">
              {t('productTypeTitle')}
            </p>
            <div className="flex flex-col gap-y-3 mt-4">
              {ProductType(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.productType?.includes(data.value))}
                      check={formValue.productType?.includes(data.value)}
                      onChange={(event) =>
                        handleChange(event.target.checked, data.value, 'productType')
                      }
                      labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                      id={data.value}
                      name={data.value}
                      text={data.label}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col-2 gap-2">
            <Button
              type="submit"
              className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
              variants="primary"
            >
              {t('ProjectManagement.CustomCardModal.Button.apply')}
            </Button>
            <Button
              onClickHandler={() => {
                setProductFilters({
                  status: [],
                  productType: [],
                });
                setFilterModal(false);
                dispatch(currentPageCount({ currentPage: 1 }));
              }}
              className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5"
              variants="primary"
            >
              {t('CompanyManager.courses.clearFiltersTitle')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProductFilter;
