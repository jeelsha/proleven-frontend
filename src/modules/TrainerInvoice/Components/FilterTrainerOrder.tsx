import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { ObjectOption, Option } from 'components/FormElement/types';
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
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { FilterInvoiceProps, trainerOrderFilterDateType } from '../types';

const FilterTrainerOrder = ({
  setFilterModal,
  setInvoiceFilters,
  t,
  invoiceFilters,
}: FilterInvoiceProps) => {
  const [formValue, setFormValue] = useState<trainerOrderFilterDateType>({
    startDueDate: '',
    endDueDate: '',
    payment_mode: '',
  });

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
  const customCheck =
    invoiceFilters?.payment_mode === 'Custom'
      ? invoiceFilters?.payment_mode === 'Custom'
      : false;
  const [customPicker, setCustomPicker] = useState<boolean>(customCheck);

  const paymentOptions: Option[] = [
    { value: 'This month', label: t('filterThisMonth') },
    { value: 'Previous month', label: t('filterPreviousMonth') },
    { value: 'This year', label: t('filterThisYear') },
    { value: 'Last year', label: t('filterLastYear') },
    { value: 'Custom', label: t('Payment.Custom') },
  ];

  useEffect(() => {
    if (invoiceFilters) {
      setFormValue(invoiceFilters);
    }
  }, [invoiceFilters]);

  const handleSubmit = () => {
    const result = isBefore(
      new Date(filterDateData?.startDate),
      new Date(filterDateData?.endDate)
    );
    if (_.isEmpty(filterDateData?.startDate) || result) {
      setInvoiceFilters({
        ...formValue,
        filterDate: { ...filterDateData },
        payment_mode: formValue?.payment_mode,
      });
      setFilterModal(false);
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

  return (
    <Formik initialValues={formValue} onSubmit={handleSubmit}>
      {() => {
        return (
          <Form>
            <div>
              {/* <p className="text-sm leading-5 font-semibold">{t('orderStatus')}</p> */}
              <div className="flex flex-col gap-y-3 mt-4">
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
                    payment_mode: '',
                    // salesRep: []
                  });
                  setFormValue({
                    invoiceStatus: [],
                    startDueDate: '',
                    endDueDate: '',
                    payment_mode: '',
                    salesRep: [],
                  });
                  setFilterDate({
                    startDate: '',
                    endDate: '',
                  });
                  setFilterModal(false);
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

export default FilterTrainerOrder;
