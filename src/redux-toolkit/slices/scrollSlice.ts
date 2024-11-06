import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootStateType } from 'redux-toolkit/store';

type ScrollType = {
  isScrollUp: boolean;
};

const initialState: ScrollType = {
  isScrollUp: false,
};

const slice = createSlice({
  name: 'scroll',
  initialState,
  reducers: {
    toggleScroll(state: ScrollType, action: PayloadAction<ScrollType>) {
      state.isScrollUp = action.payload.isScrollUp;
    },
  },
});

export const { reducer } = slice;
export const ScrollSelector = (state: RootStateType) => state.scroll.isScrollUp;
export const { toggleScroll } = slice.actions;

export default slice;
