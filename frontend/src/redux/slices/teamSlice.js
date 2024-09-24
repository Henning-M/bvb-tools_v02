import { createSlice } from '@reduxjs/toolkit';

const teamSlice = createSlice({
    name: 'team',
    initialState: {
        selectedTeam: null,
        teams: []
    },
    reducers: {
        setTeams(state, action) {
            state.teams = action.payload;
        },
        selectTeam(state, action) {
            state.selectedTeam = action.payload;
        }
    }
});

export const { setTeams, selectTeam } = teamSlice.actions;
export default teamSlice.reducer;
