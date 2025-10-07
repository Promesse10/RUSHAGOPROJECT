// redux/action/AuthRecoveryActions.js
import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

// sendForgotEmailOtpAction -> sends SMS OTP to phone
export const sendForgotEmailOtpAction = createAsyncThunk(
  "authRecovery/sendSmsOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/recovery/send-sms-otp", payload)
      // res.data.code is returned for auto-fill during dev; store if needed
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || "Failed to send OTP")
    }
  }
)

// verifyOtpAndUpdateEmailAction -> verify OTP and update user's email
export const verifyOtpAndUpdateEmailAction = createAsyncThunk(
  "authRecovery/verifyOtpAndUpdateEmail",
  async ({ phone, otp, newEmail }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/recovery/verify-otp-update-email", {
        phone,
        otp,
        newEmail,
      })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || "Failed to verify OTP")
    }
  }
)

// sendPasswordResetEmailAction -> send reset email to user
export const sendPasswordResetEmailAction = createAsyncThunk(
  "authRecovery/sendResetEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/recovery/send-reset-email", { email })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || "Failed to send reset email")
    }
  }
)

// resetPasswordAction -> call reset-password endpoint with token and newPassword
export const resetPasswordAction = createAsyncThunk(
  "authRecovery/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/recovery/reset-password", { token, newPassword })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || "Failed to reset password")
    }
  }
)
