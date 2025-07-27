import { createSlice } from "@reduxjs/toolkit"
import {
  loginAction,
  loadAuthFromStorage,
  logoutAction,
  updateUserProfileAction,
} from "../action/LoginActions"

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isLoginSuccess: false,
  isLoginFailed: false,
  isAuthenticated: false,
  error: null,
}

const loginSlice = createSlice({
  name: "loginState", // ✅ renamed slice name
  initialState,
  reducers: {
    clearLoginState: (state) => {
      state.isLoading = false
      state.isLoginSuccess = false
      state.isLoginFailed = false
      state.error = null
    },
    logout: (state) => {
      Object.assign(state, initialState)
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAction.pending, (state) => {
        state.isLoading = true
        state.isLoginFailed = false
        state.error = null
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.isLoginSuccess = true
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.isLoading = false
        state.isLoginFailed = true
        state.error = action.payload
        state.isAuthenticated = false
      })
      .addCase(loadAuthFromStorage.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loadAuthFromStorage.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      .addCase(logoutAction.fulfilled, (state) => {
        Object.assign(state, initialState)
      })
      .addCase(updateUserProfileAction.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { clearLoginState, logout, updateUserProfile } = loginSlice.actions
export default loginSlice.reducer
