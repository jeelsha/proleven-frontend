import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import DatePicker from 'components/FormElement/datePicker';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Form, Formik } from 'formik';
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import TrainingSpecialistCourseReport from 'modules/Reports/components/TrainingSpecialistCourseReport';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dateFilterOption, handleDateFilter } from 'utils/dateFilterDropDown';
import CourseReport from './components/CoursesReport';
import OverviewReport from './components/OverviewReport';
import RatingGraphReport from './components/RatingGraphReport';
import RevenueReport from './components/RevenueReport';
import TransactionReport from './components/TransactionReport';
import { FilterDataProps } from './types';

const Reports = () => {
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.Reports'));

  const filterDataModal = useModal();
  const [filterData, setFilterData] = useState<FilterDataProps>({
    startDate: '',
    endDate: '',
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
  const initialValues = {
    startDate: '',
    endDate: '',
  };
  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
  const OnSubmit = () => {
    const { startDate, endDate, customPicker } = dateFilter;

    const formatDate = (date: Date) => {
      console.log('🚀 ~ original ~ date:', date);
      console.log(
        '🚀 ~ formatted ~ date:',
        format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
      );
      return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    };

    if (customPicker) {
      setFilterData({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
    } else {
      const { filterDate } = handleDateFilter({
        value: dateFilter.selectedVal,
      } as Option);
      setFilterData({
        startDate: formatDate(filterDate.startDate),
        endDate: formatDate(filterDate.endDate),
      });
    }

    filterDataModal.closeModal();
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        filterDataModal.closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOnChange = (item: Option) => {
    const { value } = item;
    const { filterDate, customPicker } = handleDateFilter(item);
    setDateFilter({ ...filterDate, selectedVal: value, customPicker });
  };

  return (
    <Formik enableReinitialize initialValues={initialValues} onSubmit={OnSubmit}>
      {({ values }) => (
        <Form>
          <PageHeader small text={t('SideNavigation.Reports')}>
            <div className="flex flex-wrap justify-end gap-2 relative">
              <Button
                onClickHandler={() => {
                  values.startDate = '';
                  values.endDate = '';
                  setFilterData({ startDate: '', endDate: '' });
                }}
                variants="primary"
                className="gap-1 !flex !py-2.5 !px-3.5"
              >
                <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
                {t('CompanyManager.courses.clearFiltersTitle')}
              </Button>
              <Button
                onClickHandler={() => {
                  filterDataModal.openModal();
                }}
                variants="primary"
                className="gap-1 !flex !py-2.5 !px-3.5"
              >
                <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
                {t('Calendar.filterButton')}
              </Button>

              {filterDataModal.isOpen && (
                <div
                  ref={modalRef}
                  className={`${
                    filterDataModal.isOpen && 'z-1'
                  } absolute top-full mt-3 right-0 before:absolute transition-all duration-300`}
                >
                  <div className="bg-white rounded-xl shadow-xl w-[340px]">
                    <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                      <h5 className="text-base leading-5 font-semibold text-dark">
                        {t('ProjectManagement.Header.filter')}
                      </h5>
                    </div>
                    <div className="px-5 py-3">
                      <div className="flex flex-col gap-y-3 mt-4">
                        <div>
                          <ReactSelect
                            placeholder={t('filterDefaultValue')}
                            label={t('Calendar.createEvent.date')}
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
                              {t('Calendar.createEvent.date')}
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
                                dateFilter?.endDate
                                  ? new Date(dateFilter?.endDate)
                                  : null
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
                      <Button
                        type="submit"
                        className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
                        variants="primary"
                      >
                        {t('ProjectManagement.CustomCardModal.Button.apply')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PageHeader>

          <div className="grid 1200:grid-cols-2 grid-cols-1 gap-5">
            <OverviewReport t={t} filterData={filterData} />
            <RatingGraphReport
              t={t}
              filterData={filterData}
              className="[&_canvas]:!h-[360px] "
            />
            <RevenueReport
              className="1200:col-span-2 [&_canvas]:!h-[400px]"
              t={t}
              filterData={filterData}
            />
            <CourseReport t={t} filterData={filterData} />
            <TransactionReport
              className="[&_canvas]:!h-[300px]"
              t={t}
              filterData={filterData}
            />
          </div>
          <div className="mt-5">
            <TrainingSpecialistCourseReport filterData={filterData} />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Reports;
