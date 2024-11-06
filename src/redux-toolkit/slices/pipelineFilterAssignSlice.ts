import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootStateType } from '../store';

type filterAssignType = {
  isFilterAssign: boolean;
};

const initialState = {
  isFilterAssign: true,
};

export const slice = createSlice({
  name: 'filterAssign',
  initialState,
  reducers: {
    setFilterState: (
      state: filterAssignType,
      action: PayloadAction<filterAssignType>
    ) => {
      state.isFilterAssign = action.payload.isFilterAssign;
    },
  },
});

export const { reducer } = slice;

export const currentFilterState = (state: RootStateType) => {
  return state.filterAssign;
};

export const { setFilterState } = slice.actions;

export default slice;
