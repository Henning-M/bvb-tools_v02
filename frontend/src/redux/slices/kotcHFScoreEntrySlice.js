import { createSlice } from '@reduxjs/toolkit';

const kotcHFScoreEntrySlice = createSlice({
    name: 'kotcHFScoreEntry',
    initialState: {
        points: {}, // Object to hold points for each team
    },
    reducers: {
        setPoints: (state, action) => {
            const { teamId, round, value } = action.payload;
            if (!state.points[round]) {
                state.points[round] = {}; // Initialize round if it doesn't exist
            }
            state.points[round][teamId] = value; // Update points for the specific team in the specific round
        },
        resetPoints: (state) => {
            state.points = {}; // Reset points
        },
    },
});

export const { setPoints, resetPoints } = kotcHFScoreEntrySlice.actions;

export default kotcHFScoreEntrySlice.reducer;