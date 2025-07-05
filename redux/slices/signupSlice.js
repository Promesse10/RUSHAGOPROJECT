import { createSlice } from "@reduxjs/toolkit";
import { signupAction } from "../action/signupAction";

const initialState = {
  isLoading: false,
  isSignupSuccess: false,
  isSignupFailed: false,
  error: null,
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    clearSignupState: (state) => {
      state.isLoading = false;
      state.isSignupSuccess = false;
      state.isSignupFailed = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupAction.pending, (state) => {
        state.isLoading = true;
        state.isSignupSuccess = false;
        state.isSignupFailed = false;
        state.error = null;
      })
      .addCase(signupAction.fulfilled, (state) => {
        state.isLoading = false;
        state.isSignupSuccess = true;
        state.isSignupFailed = false;
      })
      .addCase(signupAction.rejected, (state, action) => {
        state.isLoading = false;
        state.isSignupSuccess = false;
        state.isSignupFailed = true;
        state.error = action.payload;
      });
  },
});

export const { clearSignupState } = signupSlice.actions;
export default signupSlice.reducer;
