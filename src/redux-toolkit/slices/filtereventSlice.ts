import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootStateType } from '../store';

interface FilterInfo {
  id: string;
  title: string;
  name: string;
  slug: string;
}

export type FilterOptionsType = {
  course: FilterInfo[];
  trainer: FilterInfo[];
  trainingspecialist: FilterInfo[];
  resource: FilterInfo[];
  room: FilterInfo[];
};

const initialState: FilterOptionsType = {
  course: [],
  trainer: [],
  trainingspecialist: [],
  resource: [],
  room: [],
};

const filterOptionsSlice = createSlice({
  name: 'filterOptions',
  initialState,
  reducers: {
    setFilterOptions(
      state: FilterOptionsType,
      action: PayloadAction<FilterOptionsType>
    ) {
      state.course = action.payload.course;
      state.trainer = action.payload.trainer;
      state.trainingspecialist = action.payload.trainingspecialist;
      state.resource = action.payload.resource;
      state.room = action.payload.room;
    },
  },
});

export const { reducer } = filterOptionsSlice;
export const useFilterOptions = (state: RootStateType) => state.filterOptions;

export const { setFilterOptions } = filterOptionsSlice.actions;

export default filterOptionsSlice;
