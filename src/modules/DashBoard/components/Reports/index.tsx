import DatePicker from 'components/FormElement/datePicker';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import Image from 'components/Image';
import { DateFilterOption } from 'constants/dateFilterOption.constant';
import { endOfMonth, startOfMonth } from 'date-fns';
import { BarChart } from 'modules/DashBoard/components/Charts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SidebarSelector } from 'redux-toolkit/slices/sidebarSlice';
import { dateFilterOption, handleDateFilter } from 'utils/dateFilterDropDown';

export const Reports = () => {
  const openSidebar = useSelector(SidebarSelector);
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date;
    endDate: Date;
    selectedVal: string | number;
    customPicker: boolean;
  }>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    selectedVal: DateFilterOption.THIS_MONTH,
    customPicker: false,
  });

  const handleOnChange = (item: Option) => {
    const { value } = item;
    const { filterDate, customPicker } = handleDateFilter(item);
    setDateFilter({ ...filterDate, selectedVal: value, customPicker });
  };

  const defaultDate = {
    startDate: dateFilter?.startDate ?? startOfMonth(new Date()),
    endDate: dateFilter?.endDate ?? endOfMonth(new Date()),
    selectedVal: dateFilter?.selectedVal,
    customPicker: dateFilter?.customPicker,
  };
  return (
    <div className="bg-white p-7 flex flex-col gap-4 rounded-3xl">
      <div className="flex justify-between flex-wrap 1500:flex-nowrap gap-y-4 gap-x-4">
        <div className="min-w-[180px]">
          <h2 className="text-xl text-blacktheme font-semibold line-clamp-1">
            {t('Dashboard.reports.title')}
          </h2>
          <p className="line-clamp-1">{t('Dashboard.reports.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
          <div className="max-w-[120px] 1500:max-w-[160px]">
            <ReactSelect
              // label={t('Calendar.createEvent.date')}
              options={dateFilterOption(t)}
              onChange={(item) => {
                handleOnChange(item as Option);
              }}
              selectedValue={dateFilter?.selectedVal ?? DateFilterOption.THIS_MONTH}
            />
          </div>
          {dateFilter?.customPicker && (
            <div className="flex items-center gap-2">
              <p className="text-sm leading-5 font-semibold">
                {t('Calendar.createEvent.date')}
              </p>
              <DatePicker
                isClearable
                parentClass="flex-[1_0_0%] min-w-[300px] max-w-[300px]"
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
                endDatePlaceholder={t('CompanyManager.courses.endDatePlaceholder')}
                startDatePlaceholder={t(
                  'CompanyManager.courses.startDatePlaceholder'
                )}
              />
            </div>
          )}
          <Image iconName="dotsThreeFillSD" width={30} height={30} />
        </div>
      </div>
      <div
        className={`!min-w-full md:[&>canvas]:!min-w-[402px] 1400:[&>canvas]:!min-w-[487px] 1600:[&>canvas]:!min-w-[548px] md:[&>canvas]:!min-h-[275px] [&>canvas]:!w-full [&>canvas]: ${
          openSidebar ? '[&>canvas]:!min-w-[370px] [&>canvas]:!min-h-[auto]' : ''
        }`}
      >
        <BarChart {...defaultDate} />
      </div>
    </div>
  );
};
