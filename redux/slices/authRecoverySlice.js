// redux/slices/authRecoverySlice.js
import { createSlice } from "@reduxjs/toolkit"
import {
  sendForgotEmailOtpAction,
  verifyOtpAndUpdateEmailAction,
  sendPasswordResetEmailAction,
  resetPasswordAction,
  sendRecoveryFormAction, 
} from "../action/AuthRecoveryActions"

const initialState = {
  isLoading: false,
  error: null,
  otpSent: false,
  generatedOtp: null, // dev use
  emailUpdated: false,
  resetEmailSent: false,
  passwordReset: false,
    recoveryFormSent: false,
}

const slice = createSlice({
  name: "authRecovery",
  initialState,
  reducers: {
    clearAuthRecoveryState: (state) => {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    builder
      // sendSmsOtp
      .addCase(sendForgotEmailOtpAction.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.otpSent = false
        state.generatedOtp = null
      })
      .addCase(sendForgotEmailOtpAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpSent = true
        // dev convenience: server returns code. Keep it optional.
        if (action.payload?.code) state.generatedOtp = String(action.payload.code)
      })
      .addCase(sendForgotEmailOtpAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error?.message
      })

      // verifyOtpAndUpdateEmail
      .addCase(verifyOtpAndUpdateEmailAction.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.emailUpdated = false
      })
      .addCase(verifyOtpAndUpdateEmailAction.fulfilled, (state) => {
        state.isLoading = false
        state.emailUpdated = true
      })
      .addCase(verifyOtpAndUpdateEmailAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error?.message
      })
// sendRecoveryFormAction
.addCase(sendRecoveryFormAction.pending, (state) => {
  state.isLoading = true
  state.error = null
  state.recoveryFormSent = false
})
.addCase(sendRecoveryFormAction.fulfilled, (state) => {
  state.isLoading = false
  state.recoveryFormSent = true
})
.addCase(sendRecoveryFormAction.rejected, (state, action) => {
  state.isLoading = false
  state.error = action.payload || action.error?.message
})

      // sendPasswordResetEmail
      .addCase(sendPasswordResetEmailAction.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.resetEmailSent = false
      })
      .addCase(sendPasswordResetEmailAction.fulfilled, (state) => {
        state.isLoading = false
        state.resetEmailSent = true
      })
      .addCase(sendPasswordResetEmailAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error?.message
      })

      // resetPasswordAction
      .addCase(resetPasswordAction.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.passwordReset = false
      })
      .addCase(resetPasswordAction.fulfilled, (state) => {
        state.isLoading = false
        state.passwordReset = true
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error?.message
      })
  },
})

export const { clearAuthRecoveryState } = slice.actions
export default slice.reducer
