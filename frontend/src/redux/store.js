import { configureStore } from '@reduxjs/toolkit';
import kotcScConfigSlice from './slices/kotcScConfigSlice'

export default configureStore({
  reducer: {
    kotcScConfig: kotcScConfigSlice,  // Add your slice reducer here
  },
});