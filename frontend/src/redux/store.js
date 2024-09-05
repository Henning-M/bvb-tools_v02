import { configureStore } from '@reduxjs/toolkit';
import kotcScConfigSlice from './slices/kotcScConfigSlice';
import kotcHFScoreEntrySlice from './slices/kotcHFScoreEntrySlice';

export default configureStore({
  reducer: {
    kotcScConfig: kotcScConfigSlice,  // Add your slice reducer here
    kotcHFScoreEntry: kotcHFScoreEntrySlice,
  },
});