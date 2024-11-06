import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootStateType } from 'redux-toolkit/store';

export interface TitleType {
  title: string;
}

const initialState: TitleType = {
  title: 'Proleven Whiz',
};

const slice = createSlice({
  name: 'documentTitle',
  initialState,
  reducers: {
    setTitle(state: TitleType, action: PayloadAction<TitleType>) {
      state.title = action.payload.title;
    },
    setDefaultTitle(state: TitleType) {
      state.title = 'Proleven Whiz';
    },
  },
});

export const { reducer } = slice;
export const { setTitle, setDefaultTitle } = slice.actions;
export const getTitle = (state: RootStateType) => state.title.title;
export default slice;
