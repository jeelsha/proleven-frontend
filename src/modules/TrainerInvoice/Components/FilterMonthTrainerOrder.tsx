import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { ObjectOption, Option } from 'components/FormElement/types';
import { format, parse } from 'date-fns';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { FilterMonthProps } from '../types';

const FilterMonthTrainerOrder = ({
  setFilterModal,
  dateValue,
  setDateValue,
  t,
}: FilterMonthProps) => {
  const [formValue, setFormValue] = useState<{ date: string }>({
    date: dateValue
      ? format(new Date(dateValue), 'MMMM')
      : format(new Date(), 'MMMM'),
  });

  const paymentOptions: Option[] = [
    { value: 'january', label: t('Calendar.months.long.january') },
    { value: 'february', label: t('Calendar.months.long.february') },
    { value: 'march', label: t('Calendar.months.long.march') },
    { value: 'april', label: t('Calendar.months.long.april') },
    { value: 'may', label: t('Calendar.months.long.may') },
    { value: 'june', label: t('Calendar.months.long.june') },
    { value: 'july', label: t('Calendar.months.long.july') },
    { value: 'august', label: t('Calendar.months.long.august') },
    { value: 'september', label: t('Calendar.months.long.september') },
    { value: 'october', label: t('Calendar.months.long.october') },
    { value: 'november', label: t('Calendar.months.long.november') },
    { value: 'december', label: t('Calendar.months.long.december') },
  ];

  const handleSubmit = () => {
    const dateString = `1 ${formValue.date} ${new Date().getFullYear()}`;
    const date = parse(dateString, 'd MMMM yyyy', new Date());
    setDateValue(date);
    setFilterModal(false);
  };

  return (
    <Formik initialValues={formValue} onSubmit={handleSubmit}>
      {() => {
        return (
          <Form>
            <div>
              <div className="flex flex-col gap-y-3 mt-4">
                <ReactSelect
                  label={t('Calendar.monthTitle')}
                  name="formValue.payment_mode"
                  options={paymentOptions}
                  onChange={(
                    item: Option | Option[] | ObjectOption | ObjectOption[]
                  ) => {
                    const { value } = item as Option;
                    setFormValue({ date: value as string });
                  }}
                  selectedValue={formValue?.date}
                  // isCompulsory
                />
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
                  setFormValue({
                    date: '',
                  });
                  setDateValue(new Date());
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

export default FilterMonthTrainerOrder;
