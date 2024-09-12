import { createSlice } from '@reduxjs/toolkit';

const kotcHRankingSlice = createSlice({
    name: 'kotcHRanking',
    initialState: {
        pointsType: 'calibrated', // Default to calibrated points
    },
    reducers: {
        setPointsType: (state, action) => {
            state.pointsType = action.payload; // Update points type
        },
    },
});

export const { setPointsType } = kotcHRankingSlice.actions;

export default kotcHRankingSlice.reducer;