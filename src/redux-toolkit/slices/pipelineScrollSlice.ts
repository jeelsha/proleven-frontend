import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootStateType } from 'redux-toolkit/store';

// ** Types **
export type PipelineScrollSliceType = {
  pipelineScrollLeft: number | null;
};

const initialState: PipelineScrollSliceType = {
  pipelineScrollLeft: null,
};

const slice = createSlice({
  name: 'pipelineBottomScroll',
  initialState,
  reducers: {
    setScrollLeft(
      state: PipelineScrollSliceType,
      action: PayloadAction<PipelineScrollSliceType>
    ) {
      state.pipelineScrollLeft = action.payload.pipelineScrollLeft;
    },
    clearScroll(state: PipelineScrollSliceType) {
      state.pipelineScrollLeft = null;
    },
  },
});

export const { reducer } = slice;
export const { setScrollLeft, clearScroll } = slice.actions;

export const getScrollLeft = (state: RootStateType) => state.pipelineScrollLeft;

export default slice;
