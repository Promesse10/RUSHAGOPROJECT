// redux/slices/authRecoverySlice.js
import { createSlice } from "@reduxjs/toolkit"
import {
  sendForgotEmailOtpAction,
  verifyOtpAndUpdateEmailAction,
  verifyOtpAction,
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

  // new fields
  maskedEmail: null,
  profilePic: null,
  fullName: null,
  selectedPhone: null,
  otpVerified: false,
}

const slice = createSlice({
  name: "authRecovery",
  initialState,
  reducers: {
    clearAuthRecoveryState: (state) => {
      Object.assign(state, initialState)
    },
    // small helper to set phone & fullname locally
    setRecoveryContact: (state, action) => {
      const { fullName, phone } = action.payload || {}
      state.fullName = fullName || null
      state.selectedPhone = phone || null
    },
    clearOtpVerification: (state) => {
      state.otpVerified = false
      state.maskedEmail = null
      state.profilePic = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // sendSmsOtp
      .addCase(sendForgotEmailOtpAction.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        state.otpSent = false
        state.generatedOtp = null
      })
      .addCase(sendForgotEmailOtpAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpSent = true
        // Keep the contact info if provided client-side
        if (action.meta?.arg?.fullName) state.fullName = action.meta.arg.fullName
        if (action.meta?.arg?.phone) state.selectedPhone = action.meta.arg.phone
        // dev convenience: server returns code. Keep it optional.
        if (action.payload?.code) state.generatedOtp = String(action.payload.code)
      })
      .addCase(sendForgotEmailOtpAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error?.message
      })

      // verifyOtp (verify-only, returns masked email + profilePic)
      .addCase(verifyOtpAction.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.otpVerified = false
        state.maskedEmail = null
        state.profilePic = null
      })
      .addCase(verifyOtpAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.otpVerified = true
        // expected payload: { maskedEmail, profilePic? }
        if (action.payload?.maskedEmail) state.maskedEmail = action.payload.maskedEmail
        if (action.payload?.profilePic) state.profilePic = action.payload.profilePic
      })
      .addCase(verifyOtpAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error?.message
      })

      // verifyOtpAndUpdateEmail
      .addCase(verifyOtpAndUpdateEmailAction.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.emailUpdated = false
      })
      .addCase(verifyOtpAndUpdateEmailAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.emailUpdated = true
        // Optionally update maskedEmail with returned value
        if (action.payload?.maskedEmail) state.maskedEmail = action.payload.maskedEmail
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

export const { clearAuthRecoveryState, setRecoveryContact, clearOtpVerification, clearError } = slice.actions
export default slice.reducer
