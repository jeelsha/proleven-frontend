import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { ObjectOption, Option } from 'components/FormElement/types';
import { REACT_APP_DATE_FORMAT } from 'config';
import { DateFilterOption } from 'constants/dateFilterOption.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import {
  endOfMonth,
  endOfYear,
  format,
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
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import { dateFilterOption, handleDateFilter } from 'utils/dateFilterDropDown';
import { InvoiceStatus } from '../constants/filterConstant';
import { FilterInvoiceProps, InvoiceFilterDateType } from '../types';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

const FilterInvoice = ({
  setFilterModal,
  setInvoiceFilters,
  t,
  invoiceFilters,
  salesRepResponse,
}: FilterInvoiceProps) => {
  const { language } = useSelector(useLanguage);
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);
  const dispatch = useDispatch();

  const [getAllCompanies] = useAxiosGet();

  const [formValue, setFormValue] = useState<InvoiceFilterDateType>({
    invoiceStatus: [],
    startDueDate: '',
    endDueDate: '',
    payment_mode: '',
    paymentFilterMode: '',
    paymentStartDate: '',
    paymentEndDate: '',
    salesRep: invoiceFilters?.salesRep ?? [],
    companies: invoiceFilters?.companies ?? [],
  });
  const [companies, setCompanies] = useState<Array<Option>>([]);
  const [filterDateData, setFilterDate] = useState<{
    startDate: string | Date;
    endDate: string | Date;
  }>({
    startDate: invoiceFilters?.filterDate?.startDate
      ? invoiceFilters?.filterDate?.startDate
      : '',
    endDate: invoiceFilters?.filterDate?.endDate
      ? invoiceFilters?.filterDate?.endDate
      : '',
  });

  const [dateFilter, setDateFilter] = useState<{
    startDate: Date;
    endDate: Date;
    selectedVal: string | number;
    customPicker: boolean;
  }>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    selectedVal: '',
    customPicker: false,
  });

  const customCheck =
    invoiceFilters?.payment_mode === 'Custom'
      ? invoiceFilters?.payment_mode === 'Custom'
      : false;

  const [customPicker, setCustomPicker] = useState<boolean>(customCheck);
  const user = useSelector(getCurrentUser);

  const paymentOptions: Option[] = [
    { value: 'This month', label: t('filterThisMonth') },
    { value: 'Previous month', label: t('filterPreviousMonth') },
    { value: 'This year', label: t('filterThisYear') },
    { value: 'Last year', label: t('filterLastYear') },
    { value: 'Custom', label: t('Payment.Custom') },
  ];

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

  useEffect(() => {
    if (invoiceFilters) {
      setFormValue(invoiceFilters);
      setDateFilter({
        startDate: invoiceFilters.paymentStartDate as Date,
        endDate: invoiceFilters.paymentEndDate as Date,
        selectedVal: invoiceFilters.paymentFilterMode,
        customPicker: invoiceFilters.paymentFilterMode === 'Custom',
      });
    }
  }, [invoiceFilters]);

  useEffect(() => {
    fetchAllCompanies();
  }, [language]);

  const handleChange = (
    isChecked: boolean,
    item: string,
    type: keyof InvoiceFilterDateType
  ) => {
    if (type !== 'payment_mode') {
      if (type !== 'formValue') {
        return setFormValue((prev) => ({
          ...prev,
          [type]: isChecked
            ? [...((prev[type] as string[]) ?? []), item]
            : ((prev[type] ?? []) as string[]).filter(
                (status: string) => status !== item
              ),
        }));
      }
    }
  };

  const paymentDateFilterFunc = () => {
    const { startDate, endDate, customPicker } = dateFilter;
    const formatDate = (date: Date) => date.toISOString();

    let formattedStartDate: string;
    let formattedEndDate: string;

    if (customPicker) {
      formattedStartDate =
        typeof startDate === 'string'
          ? startDate
          : startDate instanceof Date
          ? formatDate(startDate)
          : '';
      formattedEndDate =
        typeof endDate === 'string'
          ? endDate
          : endDate instanceof Date
          ? formatDate(endDate)
          : '';
    } else {
      const { filterDate } = handleDateFilter({
        value: dateFilter.selectedVal,
      } as Option);
      formattedStartDate =
        typeof filterDate.startDate === 'string'
          ? filterDate.startDate
          : filterDate.startDate instanceof Date
          ? formatDate(filterDate.startDate)
          : '';
      formattedEndDate =
        typeof filterDate.endDate === 'string'
          ? filterDate.endDate
          : filterDate.endDate instanceof Date
          ? formatDate(filterDate.endDate)
          : '';
    }

    return {
      paymentStartDate: formattedStartDate,
      paymentEndDate: formattedEndDate,
      paymentFilterMode: dateFilter.selectedVal,
    };
  };

  const handleSubmit = (data: InvoiceFilterDateType) => {
    const result = isBefore(
      new Date(filterDateData?.startDate),
      new Date(filterDateData?.endDate)
    );

    const paymentDateFilterData = paymentDateFilterFunc();

    if (_.isEmpty(filterDateData?.startDate) || result) {
      setInvoiceFilters({
        ...formValue,
        ...(dateFilter?.startDate
          ? { paymentStartDate: paymentDateFilterData.paymentStartDate }
          : {}),
        ...(dateFilter?.endDate
          ? { paymentEndDate: paymentDateFilterData.paymentEndDate }
          : {}),
        paymentFilterMode: paymentDateFilterData.paymentFilterMode as string,
        filterDate: { ...filterDateData },
        payment_mode: formValue?.payment_mode,
        salesRep: data?.salesRep ? data?.salesRep : [],
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
    if (item.value === DateFilterOption.THIS_MONTH) {
      filterDate = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
    } else if (item.value === DateFilterOption.PREV_MONTH) {
      const monthSub = subMonths(new Date(), 1);
      filterDate = {
        startDate: startOfMonth(monthSub),
        endDate: endOfMonth(monthSub),
      };
    } else if (item.value === DateFilterOption.THIS_YEAR) {
      filterDate = {
        startDate: startOfYear(new Date()),
        endDate: endOfYear(new Date()),
      };
    } else if (item.value === DateFilterOption.LAST_YEAR) {
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

  const handleOnChange = (item: Option) => {
    const { value } = item;
    const { filterDate, customPicker } = handleDateFilter(item);
    setDateFilter({ ...filterDate, selectedVal: value, customPicker });
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
    <Formik initialValues={formValue} onSubmit={handleSubmit} enableReinitialize>
      {() => {
        return (
          <Form>
            <div>
              <p className="text-sm leading-5 font-semibold">{t('orderStatus')}</p>
              <div className="flex flex-col gap-y-3 mt-4">
                {InvoiceStatus(t).map((data, index) => (
                  <div
                    key={`order${index + 1}`}
                    className="flex w-full gap-3 items-center"
                  >
                    <label className="text-sm left-4 text-dark">
                      <Checkbox
                        value={String(formValue.invoiceStatus?.includes(data.value))}
                        check={formValue.invoiceStatus?.includes(data.value)}
                        onChange={(event) =>
                          handleChange(
                            event.target.checked,
                            data.value,
                            'invoiceStatus'
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
                {salesRepResponse && (
                  <ReactSelect
                    parentClass="flex-[1_0_0%]"
                    className="w-full"
                    name="salesRep"
                    options={salesRepResponse}
                    label={t('Quote.company.detail.salesRepTitle')}
                    placeholder={t('Quote.company.detail.salesRepPlaceholder')}
                    // isCompulsory
                    isMulti
                    disabled={user?.role_name === ROLES.SalesRep}
                    // isLoading={salesRepLoader}
                  />
                )}
                <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite mb-3">
                  {t('dueDate')}
                </p>
                <DatePicker
                  isClearable
                  parentClass="flex-[1_0_0%]"
                  labelClass="font-semibold rounded-md truncate flex-[1_0_0%] capitalize"
                  range
                  selectedDate={
                    formValue?.startDueDate
                      ? new Date(formValue?.startDueDate ?? '')
                      : null
                  }
                  endingDate={
                    formValue?.endDueDate ? new Date(formValue?.endDueDate) : null
                  }
                  onRangeChange={(startDueDate, endDueDate) => {
                    setFormValue({
                      ...formValue,
                      startDueDate: startDueDate
                        ? format(startDueDate, 'yyyy-MM-dd')
                        : '',
                      endDueDate: endDueDate ? format(endDueDate, 'yyyy-MM-dd') : '',
                    });
                  }}
                  dateFormat={REACT_APP_DATE_FORMAT as string}
                  type="date"
                  endDatePlaceholder={t('CompanyManager.courses.endDatePlaceholder')}
                  startDatePlaceholder={t(
                    'CompanyManager.courses.startDatePlaceholder'
                  )}
                />
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
                {customPicker && (
                  <>
                    <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite mb-3">
                      {t('invoiceDate')}
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
                        filterDateData?.endDate
                          ? new Date(filterDateData?.endDate)
                          : null
                      }
                      onRangeChange={(startDate, endDate) => {
                        setFilterDate({ startDate, endDate });
                      }}
                      dateFormat={REACT_APP_DATE_FORMAT}
                      type="date"
                      endDatePlaceholder={t(
                        'CompanyManager.courses.endDatePlaceholder'
                      )}
                      startDatePlaceholder={t(
                        'CompanyManager.courses.startDatePlaceholder'
                      )}
                    />
                  </>
                )}

                <div className="flex flex-col gap-y-3 mt-4">
                  <div>
                    <ReactSelect
                      placeholder={t('filterDefaultValue')}
                      label={t('invoicePaymentDate')}
                      options={dateFilterOption(t)}
                      onChange={(item) => {
                        handleOnChange(item as Option);
                      }}
                      selectedValue={dateFilter?.selectedVal}
                    />
                  </div>
                  {dateFilter?.customPicker && (
                    <>
                      <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite mb-3">
                        {t('invoicePaymentDate')}
                      </p>
                      <DatePicker
                        isClearable
                        parentClass="flex-[1_0_0%]"
                        labelClass="font-semibold rounded-md truncate flex-[1_0_0%] capitalize"
                        range
                        selectedDate={
                          dateFilter?.startDate
                            ? new Date(dateFilter?.startDate ?? '')
                            : null
                        }
                        endingDate={
                          dateFilter?.endDate ? new Date(dateFilter?.endDate) : null
                        }
                        onRangeChange={(startDate, endDate) => {
                          setDateFilter({
                            selectedVal: dateFilter?.selectedVal as string,
                            startDate,
                            endDate,
                            customPicker: dateFilter?.customPicker ?? false,
                          });
                        }}
                        dateFormat="dd/MM/yyyy"
                        type="date"
                        endDatePlaceholder={t(
                          'CompanyManager.courses.endDatePlaceholder'
                        )}
                        startDatePlaceholder={t(
                          'CompanyManager.courses.startDatePlaceholder'
                        )}
                      />
                    </>
                  )}
                </div>
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
                  setInvoiceFilters({
                    invoiceStatus: [],
                    startDueDate: '',
                    endDueDate: '',
                    filterDate: {
                      startDate: '',
                      endDate: '',
                    },
                    paymentFilterMode: '',
                    paymentStartDate: '',
                    paymentEndDate: '',
                    payment_mode: '',
                    salesRep: [],
                    companies: [],
                  });
                  setFormValue({
                    invoiceStatus: [],
                    startDueDate: '',
                    endDueDate: '',
                    paymentFilterMode: '',
                    paymentStartDate: '',
                    paymentEndDate: '',
                    payment_mode: '',
                    salesRep: [],
                    companies: [],
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
        );
      }}
    </Formik>
  );
};

export default FilterInvoice;
