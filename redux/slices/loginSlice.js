// import { createSlice } from "@reduxjs/toolkit";
// import { loginUser } from "../action/LoginActions";

// const initialState = {
//   isLoading: false,
//   isLoginSuccess: false,
//   isLoginFailed: false,
//   error: null,
//   user: null,
//   token: null,
// };

// const loginSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     clearLoginState: (state) => {
//       Object.assign(state, initialState);
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.isLoading = true;
//         state.isLoginSuccess = false;
//         state.isLoginFailed = false;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isLoginSuccess = true;
//         state.user = action.payload.user || null;
//         state.token = action.payload.token || null;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isLoginFailed = true;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearLoginState } = loginSlice.actions;
// export default loginSlice.reducer;
