import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import DatePicker from 'components/FormElement/datePicker';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { getHours, getMinutes, parseISO, setHours, setMinutes } from 'date-fns';
import { Form, Formik } from 'formik';
import { useQueryGetFunction } from 'hooks/useQuery';
import { resetTimeToMidnight } from 'modules/Courses/helper/CourseCommon';
import { useEffect, useState } from 'react';
import { FilterApplyProps, FilterLogProps } from '../types';

const FilterLog = ({
  setFilterModal,
  setFilterApply,
  t,
  filterApply,
}: FilterLogProps) => {
  const [formValue, setFormValue] = useState<FilterApplyProps>({
    modules: [],
    startDate: filterApply?.startDate ?? '',
    endDate: filterApply?.endDate ?? '',
    start_time: filterApply?.start_time ?? '',
    end_time: filterApply?.end_time ?? '',
  });
  const { response, isLoading: featureLoading } = useQueryGetFunction(
    '/feature/dropdown',
    {
      option: {
        dropdown: true,
        label: 'name',
      },
    }
  );
  useEffect(() => {
    if (filterApply) {
      setFormValue(filterApply);
    }
  }, [filterApply]);

  const handleChange = (isChecked: boolean, item: string) => {
    setFormValue((prev) => ({
      ...prev,
      modules: isChecked
        ? [...(prev?.modules || []), item]
        : prev?.modules?.filter((module: string) => module !== item),
    }));
  };

  const mergeDateTime = (dateString?: string, timeString?: string) => {
    if (timeString && dateString) {
      const date = parseISO(dateString);
      const time = parseISO(timeString);

      const hours = getHours(time);
      const minutes = getMinutes(time);

      const mergedDate = setMinutes(setHours(date, hours), minutes);
      return mergedDate?.toISOString();
    }
    return dateString;
  };

  const handleSubmit = (values: FilterApplyProps) => {
    const { start_time, end_time } = values;
    const { startDate, endDate } = formValue;
    if (start_time || end_time) {
      const newStartDate = mergeDateTime(startDate, start_time);
      const newEndDate = mergeDateTime(endDate, end_time);
      setFilterApply({
        ...formValue,
        startDate: newStartDate,
        endDate: newEndDate,
        ...(end_time ? { end_time: newEndDate } : { end_time: '' }),
        ...(start_time ? { start_time: newStartDate } : { start_time: '' }),
      });
    } else setFilterApply({ ...formValue });
    setFilterModal(false);
  };

  const handleDateChange = (currentTime: string, fieldName: string) => {
    if (currentTime) {
      setFormValue({
        ...formValue,
        [fieldName]: currentTime,
      });
    } else {
      setFormValue({ ...formValue, [fieldName]: '' });
    }
  };

  return (
    <Formik
      initialValues={formValue}
      onSubmit={handleSubmit}
      // validationSchema={SystemValidationSchema(formValue)}
      validate={(values) => {
        const errors = {} as any;

        if (values.start_time && values.start_time !== '' && !values.startDate) {
          errors.startDate = t('CoursesManagement.Errors.Course.startDate');
        } else if (values.startDate) {
          delete errors.startDate;
        }

        if (values.end_time && values.end_time !== '' && !values.endDate) {
          errors.endDate = t('CoursesManagement.Errors.Course.endDate');
        } else if (values.endDate) {
          delete errors.endDate;
        }

        return errors;
      }}
    >
      {({ values, setFieldValue }) => {
        return (
          <Form>
            <div>
              <p className="text-sm leading-5 font-semibold">
                {t('courseFilterModules')}
              </p>
              {featureLoading ? (
                <Image loaderType="Spin" />
              ) : (
                <div className="flex flex-col gap-y-3 mt-4 max-h-[150px] overflow-auto p-1">
                  {response?.data?.map((data: Option, index: number) => (
                    <div
                      key={`order${index + 1}`}
                      className="flex w-full gap-3 items-center"
                    >
                      <label className="text-sm left-4 text-dark">
                        <Checkbox
                          value={
                            formValue?.modules &&
                            String(
                              formValue?.modules.includes(data?.value as string)
                            )
                          }
                          check={formValue?.modules?.includes(data?.value as string)}
                          onChange={(event) =>
                            handleChange(event.target.checked, data?.value as string)
                          }
                          labelClass="roundcate flex-[1_0_0%] capitalize"
                          id={data?.value as string}
                          name={data?.label}
                          text={data?.label.replace(/([a-z])([A-Z])/g, '$1 $2')}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 grid-cols-2 my-5">
                <DatePicker
                  name="startDate"
                  label={t('CoursesManagement.CreateCourse.startDate')}
                  icon
                  selectedDate={
                    values?.startDate ? parseISO(values?.startDate) : null
                  }
                  maxDate={values.endDate ? parseISO(values.endDate) : undefined}
                  onChange={(date) => {
                    if (date) {
                      const newDate = resetTimeToMidnight(date);
                      handleDateChange(newDate.toISOString(), 'startDate');
                      setFieldValue('startDate', newDate.toISOString());
                    }
                  }}
                  placeholder={t(
                    'CoursesManagement.CreateCourse.startDatePlaceHolder'
                  )}
                />
                <DatePicker
                  name="endDate"
                  label={t('CoursesManagement.CreateCourse.endDate')}
                  icon
                  selectedDate={values?.endDate ? parseISO(values?.endDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const newDate = resetTimeToMidnight(date);
                      handleDateChange(newDate.toISOString(), 'endDate');
                      setFieldValue('endDate', newDate.toISOString());
                    }
                  }}
                  minDate={values.startDate ? parseISO(values.startDate) : undefined}
                  placeholder={t(
                    'CoursesManagement.CreateCourse.endDatePlaceHolder'
                  )}
                />
              </div>
              {(values.startDate || values.endDate) && (
                <DatePicker
                  startDateName="start_time"
                  endDateName="end_time"
                  parentClass="flex-[1_0_0%]"
                  label={t('SystemLog.time')}
                  range
                  selectedDate={
                    values.start_time ? parseISO(values.start_time) : undefined
                  }
                  endingDate={
                    values.end_time ? parseISO(values.end_time) : undefined
                  }
                  onRangeChange={(startDate, endDate) => {
                    if (setFieldValue) {
                      if (startDate)
                        setFieldValue('start_time', startDate.toISOString());
                      if (endDate) setFieldValue('end_time', endDate.toISOString());
                    }
                  }}
                  isTimePicker
                  showTimeSelectOnly
                  startDatePlaceholder={t(
                    'CoursesManagement.CreateCourse.startTime'
                  )}
                  endDatePlaceholder={t('CoursesManagement.CreateCourse.endTime')}
                  dateFormat="h:mm aa"
                  startDateMinTime={new Date(new Date().setHours(0, 0, 0))}
                  startDateMaxTime={
                    values?.end_time ? parseISO(values?.end_time) : undefined
                  }
                  endDateMinTime={
                    values?.start_time ? parseISO(values?.start_time) : undefined
                  }
                  endDateMaxTime={new Date(new Date().setHours(23, 59, 59))}
                />
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                variants="primary"
              >
                {t('ProjectManagement.CustomCardModal.Button.apply')}
              </Button>
              <Button
                className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                variants="primary"
                onClickHandler={() => {
                  values.startDate = '';
                  values.endDate = '';
                  values.start_time = '';
                  values.end_time = '';
                  setFormValue({
                    modules: [],
                    startDate: '',
                    endDate: '',
                    start_time: '',
                    end_time: '',
                  });
                  setFilterApply({
                    modules: [],
                    startDate: '',
                    endDate: '',
                    start_time: '',
                    end_time: '',
                  });
                }}
              >
                {t('Calendar.clearAllTitle')}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default FilterLog;
