import { createSlice } from '@reduxjs/toolkit';

const kotcHRankingSettingsSlice = createSlice({
    name: 'kotcHRankingSettings',
    initialState: {
        showRounds: false, // Default state for the checkbox
    },
    reducers: {
        toggleShowRounds: (state) => {
            state.showRounds = !state.showRounds; // Toggle the showRounds state
        },
        setShowRounds: (state, action) => {
            state.showRounds = action.payload; // Set showRounds to a specific value
        },
    },
});

export const { toggleShowRounds, setShowRounds } = kotcHRankingSettingsSlice.actions;

export default kotcHRankingSettingsSlice.reducer;