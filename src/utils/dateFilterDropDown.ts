import { Option } from 'components/FormElement/types';
import { DateFilterOption } from 'constants/dateFilterOption.constant';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  endOfYear,
  startOfYear,
  subYears,
  addMonths,
  addYears,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  addQuarters,
} from 'date-fns';
import { TFunction } from 'i18next';

export const handleDateFilter = (item: Option) => {
  let filterDate = {
    startDate: new Date(),
    endDate: new Date(),
  };
  let customPicker = false;

  if (item.value === DateFilterOption.THIS_MONTH) {
    filterDate = {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    };
  } else if (item.value === DateFilterOption.PREV_MONTH) {
    filterDate = {
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
    };
  } else if (item.value === DateFilterOption.NEXT_MONTH) {
    const monthAdd = addMonths(new Date(), 1);
    filterDate = {
      startDate: startOfMonth(monthAdd),
      endDate: endOfMonth(monthAdd),
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
  } else if (item.value === DateFilterOption.NEXT_YEAR) {
    const yearAdd = addYears(new Date(), 1);
    filterDate = {
      startDate: startOfYear(yearAdd),
      endDate: endOfYear(yearAdd),
    };
  } else if (item.value === DateFilterOption.THIS_QUAT) {
    filterDate = {
      startDate: startOfQuarter(new Date()),
      endDate: endOfQuarter(new Date()),
    };
  } else if (item.value === DateFilterOption.PREV_QUAT) {
    const quarterSub = subQuarters(new Date(), 1);
    filterDate = {
      startDate: startOfQuarter(quarterSub),
      endDate: endOfQuarter(quarterSub),
    };
  } else if (item.value === DateFilterOption.NEXT_QUAT) {
    const quarterAdd = addQuarters(new Date(), 1);
    filterDate = {
      startDate: startOfQuarter(quarterAdd),
      endDate: endOfQuarter(quarterAdd),
    };
  } else {
    filterDate = {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    };
    customPicker = true;
  }

  return { filterDate, customPicker };
};

export const dateFilterOption = (t: TFunction): Option[] => [
  { value: DateFilterOption.THIS_MONTH, label: t('filterThisMonth') },
  { value: DateFilterOption.PREV_MONTH, label: t('filterPreviousMonth') },
  { value: DateFilterOption.THIS_YEAR, label: t('filterThisYear') },
  { value: DateFilterOption.LAST_YEAR, label: t('filterLastYear') },
  { value: DateFilterOption.THIS_QUAT, label: t('filterThisQuarter') },
  { value: DateFilterOption.PREV_QUAT, label: t('filterPrevQuarter') },
  { value: 'Custom', label: t('filterCustom') },
];
