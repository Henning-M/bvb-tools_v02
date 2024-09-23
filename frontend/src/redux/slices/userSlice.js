import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,   // This will hold user details like username, role, etc.
  isLoggedIn: false,  // To track login status
  error: null,  // To track any login/register errors
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.error = null;  // Reset errors on successful login/register
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, logout, setError } = userSlice.actions;
export default userSlice.reducer;
