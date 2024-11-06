// ** Components **
import Button from 'components/Button/Button';
import DatePicker from 'components/FormElement/datePicker';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';

// ** Hooks **
import { useTranslation } from 'react-i18next';

// ** Types **
import { IUseToggleDropdown } from 'hooks/useToggleDropdown';
import { FilterDataProps } from 'modules/Reports/types';

// ** Formik **
import { Form, Formik } from 'formik';

// ** Utils **
import { dateFilterOption, handleDateFilter } from 'utils/dateFilterDropDown';

// ** config **
import { REACT_APP_DATE_FORMAT } from 'config';

type DateFilter = {
  startDate: Date;
  endDate: Date;
  selectedVal: string | number;
  customPicker: boolean;
};
interface IFilter {
  dateFilter: DateFilter;
  setFilterData: React.Dispatch<React.SetStateAction<FilterDataProps>>;
  filterDataModal: IUseToggleDropdown;
  setDateFilter: React.Dispatch<React.SetStateAction<DateFilter>>;
  modalRef: React.RefObject<HTMLDivElement>;
}

const PreviousMonthOrderFilter = ({
  dateFilter,
  setFilterData,
  filterDataModal,
  setDateFilter,
  modalRef,
}: IFilter) => {
  const { t } = useTranslation();

  // ** CONSTs
  const initialValues = {
    startDate: '',
    endDate: '',
  };

  const handleOnChange = (item: Option) => {
    const { value } = item;
    const { filterDate, customPicker } = handleDateFilter(item);
    setDateFilter({ ...filterDate, selectedVal: value, customPicker });
  };

  const OnSubmit = () => {
    const { startDate, endDate, customPicker } = dateFilter;
    const formatDate = (date: Date) => date.toISOString();
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
    filterDataModal.closeDropDown();
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => OnSubmit()}
      enableReinitialize
    >
      {({ values }) => {
        return (
          <Form>
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
                  filterDataModal.toggleDropdown();
                }}
                variants="primary"
                className="gap-1 !flex !py-2.5 !px-3.5"
              >
                <Image iconName="filterIcon2" iconClassName="w-4 h-4" />
                {t('Calendar.filterButton')}
              </Button>

              {filterDataModal.isDropdownOpen && (
                <div
                  ref={modalRef}
                  className={`${
                    filterDataModal.isDropdownOpen && 'z-1'
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
                              dateFormat={REACT_APP_DATE_FORMAT as string}
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
          </Form>
        );
      }}
    </Formik>
  );
};

export default PreviousMonthOrderFilter;
