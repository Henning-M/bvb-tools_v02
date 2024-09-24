import { configureStore } from '@reduxjs/toolkit';
import kotcScConfigSlice from './slices/kotcScConfigSlice';
import kotcHFScoreEntrySlice from './slices/kotcHFScoreEntrySlice';
import kotcHRankingSlice from './slices/kotcHRankingSlice';
import kotcHRankingSettingSlice from './slices/kotcHRankingSettingSlice';
import userSlice from './slices/userSlice';
import teamSlice from './slices/teamSlice';

export default configureStore({
  reducer: {
    kotcScConfig: kotcScConfigSlice,  // Add your slice reducer here
    kotcHFScoreEntry: kotcHFScoreEntrySlice,
    kotcHRanking: kotcHRankingSlice,
    kotcHRankingSettings: kotcHRankingSettingSlice,
    user: userSlice,
    team: teamSlice,    
  },
});