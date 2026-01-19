// redux/action/AuthRecoveryActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Send SMS OTP (now expects { name, phone })
export const sendForgotEmailOtpAction = createAsyncThunk(
  "authRecovery/sendEmailRecoveryOtp",
  async ({ phone }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/recovery/send-otp-for-email-update",
        { phone }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const verifyOtpAction = createAsyncThunk(
  "authRecovery/verifyOtp",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/recovery/verify-otp-reveal-or-update-email",
        { phone, otp }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid OTP"
      );
    }
  }
);


export const verifyPasswordResetOtpAction = createAsyncThunk(
  "authRecovery/verifyPasswordResetOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/recovery/verify-password-reset-otp",
        { email, otp }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid or expired code"
      );
    }
  }
);


export const verifyOtpAndUpdateEmailAction = createAsyncThunk(
  "authRecovery/verifyOtpAndUpdateEmail",
  async ({ phone, otp, newEmail }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/recovery/verify-otp-reveal-or-update-email",
        { phone, otp, newEmail}
      );
      return res.data;
    } catch (err) {
      console.error(
        "❌ verifyOtpAndUpdateEmail error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to verify OTP"
      );
    }
  }
);


export const sendPasswordResetEmailAction = createAsyncThunk(
  "authRecovery/sendResetEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/recovery/send-password-reset-otp",
        { email }
      );
      return res.data;
    } catch (err) {
      console.error("❌ sendPasswordResetEmail error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Failed to send reset code"
      );
    }
  }
);


export const resetPasswordAction = createAsyncThunk(
  "authRecovery/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/recovery/reset-password-otp",
        { email, otp, newPassword }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// sendRecoveryFormAction (unchanged)
export const sendRecoveryFormAction = createAsyncThunk(
  "authRecovery/sendRecoveryForm",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/recovery/send-recovery-form", { email });
      return res.data;
    } catch (err) {
      console.error("❌ sendRecoveryForm error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Failed to send recovery form");
    }
  }
);
