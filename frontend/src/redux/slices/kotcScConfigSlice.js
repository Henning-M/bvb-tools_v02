import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groups: 1,
  rounds: 1,
  teams: [],
  schedule: []
};

const kotcScConfigSlice = createSlice({
  name: 'kotcScConfig',
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.groups = Math.max(1, action.payload);
    },
    setRounds: (state, action) => {
      state.rounds = Math.max(1, action.payload);
    },
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
    setSchedule: (state, action) => {
      state.schedule = action.payload;
    }
  }
});

export const { setGroups, setRounds, setTeams, setSchedule } = kotcScConfigSlice.actions;

export default kotcScConfigSlice.reducer;
