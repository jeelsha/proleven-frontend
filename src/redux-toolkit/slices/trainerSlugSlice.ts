import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootStateType } from 'redux-toolkit/store';

export type TrainerSlugType = {
  trainer_slug: string;
};

const initialState = {
  trainer_slug: '',
};

const slice = createSlice({
  name: 'trainerSlug',
  initialState,
  reducers: {
    setTrainerSlug(state: TrainerSlugType, action: PayloadAction<TrainerSlugType>) {
      state.trainer_slug = action.payload.trainer_slug;
    },
  },
});

export const { reducer } = slice;

export const { setTrainerSlug } = slice.actions;

export const getTrainerSlug = (state: RootStateType) =>
  state.trainerSlug.trainer_slug;

export default slice;
