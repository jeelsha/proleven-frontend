export const initialLabel = {
  id: 0,
  title: '',
  color: '',
  slug: '',
  language: '',
  parent_table_id: 0,
  created_by: 0,
  updated_by: 0,
  created_at: '',
};

export const initialEditValue: {
  labelName?: string;
  indexValue?: number;
  isChecked?: boolean;
} = { labelName: '', indexValue: -1, isChecked: false };

export const PriorityConst = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};
