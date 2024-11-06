import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { ObjectOption, Option } from 'components/FormElement/types';
import { ROLES } from 'constants/roleAndPermission.constant';
import {
  endOfMonth,
  endOfYear,
  isBefore,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { Form, Formik } from 'formik';
import { useAxiosGet } from 'hooks/useAxios';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import {
  ClientPOType,
  FundedByType,
  IssuedBy,
  OrderRoleType,
  OrderStatus,
  PONeededType,
  SdiCode,
} from '../constants';
import { FilterOrderProps, OrderFilters } from '../types';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

const FilterOrder = ({
  setFilterModal,
  setOrderFilters,
  t,
  orderFilters,
}: FilterOrderProps) => {
  const [formValue, setFormValue] = useState<OrderFilters>({
    orderStatus: [],
    orderType: [],
    orderRoleType: [],
    purchaseOrderType: [],
    clientOrderType: [],
    fundedByType: [],
    sdiCode: [],
    issuedBy: [],
    payment_mode: orderFilters?.payment_mode ? orderFilters?.payment_mode : '',
    companies: orderFilters?.companies ?? [],
  });
  const [getAllCompanies] = useAxiosGet();
  const dispatch = useDispatch();
  const { language } = useSelector(useLanguage);
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);
  const [filterDateData, setFilterDate] = useState<{
    startDate: string | Date;
    endDate: string | Date;
  }>({
    startDate: orderFilters?.filterDate?.startDate
      ? orderFilters?.filterDate?.startDate
      : '',
    endDate: orderFilters?.filterDate?.endDate
      ? orderFilters?.filterDate?.endDate
      : '',
  });
  const customCheck =
    orderFilters?.payment_mode === 'Custom'
      ? orderFilters?.payment_mode === 'Custom'
      : false;
  const [customPicker, setCustomPicker] = useState<boolean>(customCheck);
  const [companies, setCompanies] = useState<Array<Option>>([]);

  const paymentOptions: Option[] = [
    { value: 'This month', label: t('filterThisMonth') },
    { value: 'Previous month', label: t('filterPreviousMonth') },
    { value: 'This year', label: t('filterThisYear') },
    { value: 'Last year', label: t('filterLastYear') },
    { value: 'Custom', label: t('Payment.Custom') },
  ];
  useEffect(() => {
    if (orderFilters) {
      setFormValue(orderFilters);
    }
  }, [orderFilters]);

  const fetchAllCompanies = async () => {
    const { data } = await getAllCompanies('/companies', {
      params: {
        dropdown: true,
        label: 'name',
        value: 'id',
        role: currentRole?.id,
      },
    });
    setCompanies(data);
  };

  useEffect(() => {
    fetchAllCompanies();
  }, [language]);

  const handleChange = (
    isChecked: boolean,
    item: string,
    type: keyof OrderFilters
  ) => {
    if (type !== 'payment_mode') {
      setFormValue((prev) => ({
        ...prev,
        [type]: isChecked
          ? [...prev[type], item]
          : prev[type].filter((status) => status !== item),
      }));
    }
  };

  const handleSubmit = () => {
    const result = isBefore(
      new Date(filterDateData?.startDate),
      new Date(filterDateData?.endDate)
    );
    if (_.isEmpty(filterDateData?.startDate) || result) {
      setOrderFilters({
        ...formValue,
        filterDate: { ...filterDateData },
        payment_mode: formValue?.payment_mode,
      });
      setFilterModal(false);
      dispatch(currentPageCount({ currentPage: 1 }));
    }
  };
  const handleDate = (item: Option) => {
    let filterDate = {
      startDate: new Date(),
      endDate: new Date(),
    };
    setCustomPicker(false);
    if (item.value === 'This month') {
      filterDate = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
    } else if (item.value === 'Previous month') {
      const monthSub = subMonths(new Date(), 1);

      filterDate = {
        startDate: startOfMonth(monthSub),
        endDate: endOfMonth(monthSub),
      };
    } else if (item.value === 'This year') {
      filterDate = {
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      };
    } else if (item.value === 'Last year') {
      const yearSub = subYears(new Date(), 1);

      filterDate = {
        startDate: startOfYear(yearSub),
        endDate: endOfYear(yearSub),
      };
    } else {
      filterDate = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
      setCustomPicker(true);
    }
    setFilterDate({ ...filterDate });
  };
  const handleCompanyChange = (data: string) => {
    if (
      formValue.companies &&
      formValue.companies.length > 0 &&
      formValue.companies.includes(data)
    ) {
      const formData = formValue?.companies.filter((company) => company !== data);
      setFormValue((prev) => ({
        ...prev,
        companies: formData,
      }));
    } else {
      setFormValue((prev) => ({
        ...prev,
        companies: [...(prev.companies ? prev.companies : []), data],
      }));
    }
  };

  return (
    <Formik initialValues={formValue} onSubmit={handleSubmit}>
      {() => (
        <Form>
          <div>
            <p className="text-sm leading-5 font-semibold">{t('orderStatus')}</p>
            <div className="flex flex-col gap-y-3 mt-4">
              {OrderStatus(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.orderStatus.includes(data.value))}
                      check={formValue.orderStatus.includes(data.value)}
                      onChange={(event) =>
                        handleChange(event.target.checked, data.value, 'orderStatus')
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
            {/* <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">
                {t('orderType')}
              </p>
              {OrderType(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.orderStatus.includes(data.value))}
                      check={formValue.orderType.includes(data.value)}
                      onChange={(event) =>
                        handleChange(event.target.checked, data.value, 'orderType')
                      }
                      labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                      id={data.value}
                      name={data.value}
                      text={data.label}
                    />
                  </label>
                </div>
              ))}
            </div> */}
            <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">
                {t('filterOrderRoleType')}
              </p>
              {OrderRoleType(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.orderRoleType.includes(data.value))}
                      check={formValue.orderRoleType.includes(data.value)}
                      onChange={(event) =>
                        handleChange(
                          event.target.checked,
                          data.value,
                          'orderRoleType'
                        )
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

            <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">
                {t('order.PurchaseOrder')}
              </p>
              {PONeededType(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(
                        formValue.purchaseOrderType.includes(data.value)
                      )}
                      check={formValue.purchaseOrderType.includes(data.value)}
                      onChange={(event) =>
                        handleChange(
                          event.target.checked,
                          data.value,
                          'purchaseOrderType'
                        )
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
            <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">
                {t('clientPurchaseOrderHeaderTitle')}
              </p>
              {ClientPOType(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.clientOrderType.includes(data.value))}
                      check={formValue.clientOrderType.includes(data.value)}
                      onChange={(event) =>
                        handleChange(
                          event.target.checked,
                          data.value,
                          'clientOrderType'
                        )
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
            <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">
                {t('CompanyManager.fundedByTitle')}
              </p>
              {FundedByType(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.fundedByType.includes(data.value))}
                      check={formValue.fundedByType.includes(data.value)}
                      onChange={(event) =>
                        handleChange(
                          event.target.checked,
                          data.value,
                          'fundedByType'
                        )
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
            <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">
                {t('Quote.company.detail.codeDestTitle')}
              </p>
              {SdiCode(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.sdiCode.includes(data.value))}
                      check={formValue.sdiCode.includes(data.value)}
                      onChange={(event) =>
                        handleChange(event.target.checked, data.value, 'sdiCode')
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
            <div className="flex flex-col mt-4 gap-y-3 border-t border-solid border-offWhite">
              <p className="text-sm leading-5 font-semibold mt-4">{t('issuedBy')}</p>
              {IssuedBy(t).map((data, index) => (
                <div
                  key={`order${index + 1}`}
                  className="flex w-full gap-3 items-center"
                >
                  <label className="text-sm left-4 text-dark">
                    <Checkbox
                      value={String(formValue.issuedBy.includes(data.value))}
                      check={formValue.issuedBy.includes(data.value)}
                      onChange={(event) =>
                        handleChange(event.target.checked, data.value, 'issuedBy')
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
          <div className="flex flex-col gap-y-3 mt-4">
            <ReactSelect
              options={companies || []}
              // parentClass="filter-category-selector"
              placeholder={t('Exam.companyTitle')}
              selectedValue={formValue?.companies}
              label={t('CoursesManagement.CourseCategory.courseCompanies')}
              onChange={(val) => {
                const values = val as Option[];
                handleCompanyChange(
                  (values ?? [])[values.length - 1]?.value?.toString()
                );
              }}
              isMulti
            />
          </div>
          <div className="mt-4">
            <ReactSelect
              label={t('Calendar.createEvent.date')}
              name="formValue.payment_mode"
              options={paymentOptions}
              onChange={(
                item: Option | Option[] | ObjectOption | ObjectOption[]
              ) => {
                const { value } = item as Option;
                handleDate(item as Option);
                setFormValue({ ...formValue, payment_mode: value as string });
              }}
              selectedValue={formValue?.payment_mode}
              // isCompulsory
            />
          </div>
          {customPicker && (
            <>
              <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite mb-3">
                {t('Calendar.createEvent.date')}
              </p>
              <DatePicker
                isClearable
                parentClass="flex-[1_0_0%]"
                labelClass="font-semibold rounded-md truncate flex-[1_0_0%] capitalize"
                range
                selectedDate={
                  filterDateData?.startDate
                    ? new Date(filterDateData?.startDate ?? '')
                    : null
                }
                endingDate={
                  filterDateData?.endDate ? new Date(filterDateData?.endDate) : null
                }
                onRangeChange={(startDate, endDate) => {
                  setFilterDate({ startDate, endDate });
                }}
                dateFormat="dd/MM/yyyy"
                type="date"
                endDatePlaceholder={t('CompanyManager.courses.endDatePlaceholder')}
                startDatePlaceholder={t(
                  'CompanyManager.courses.startDatePlaceholder'
                )}
              />
            </>
          )}
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
                setFormValue({
                  orderStatus: [],
                  orderType: [],
                  orderRoleType: [],
                  purchaseOrderType: [],
                  clientOrderType: [],
                  fundedByType: [],
                  payment_mode: '',
                  companies: [],
                  sdiCode: [],
                  issuedBy: [],
                });
                setOrderFilters({
                  orderType: [],
                  orderStatus: [],
                  orderRoleType: [],
                  purchaseOrderType: [],
                  clientOrderType: [],
                  fundedByType: [],
                  sdiCode: [],
                  filterDate: {
                    startDate: '',
                    endDate: '',
                  },
                  payment_mode: '',
                  companies: [],
                  issuedBy: [],
                });
                setFilterDate({
                  startDate: '',
                  endDate: '',
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

export default FilterOrder;
