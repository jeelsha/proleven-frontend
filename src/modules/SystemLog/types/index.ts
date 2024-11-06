import { TFunction } from 'i18next';
import { Dispatch, SetStateAction } from 'react';

export interface SystemLogProps {
  title: string;
  description: string;
  created_at: string;
  permission_type: string;
}

export interface FilterLogProps {
  setFilterModal: Dispatch<SetStateAction<boolean>>;
  setFilterApply: Dispatch<SetStateAction<FilterApplyProps>>;
  t: TFunction<'translation', undefined>;
  filterApply: FilterApplyProps;
}

export interface FilterApplyProps {
  startDate?: string;
  endDate?: string;
  modules?: string[];
  start_time?: string;
  end_time?: string;
}
