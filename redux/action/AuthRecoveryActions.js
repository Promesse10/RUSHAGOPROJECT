// redux/action/AuthRecoveryActions.js
import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/recovery`;

export const sendForgotEmailOtpAction = createAsyncThunk(
    "authRecovery/sendSmsOtp",
    async (payload, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post(`${API_URL}/send-sms-otp`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        return res.data;
      } catch (err) {
        console.error("❌ sendSmsOtp error:", err.response?.data || err.message);
        return rejectWithValue(err.response?.data?.message || "Failed to send OTP");
      }
    }
  );
  
  // verifyOtpAndUpdateEmailAction
  export const verifyOtpAndUpdateEmailAction = createAsyncThunk(
    "authRecovery/verifyOtpAndUpdateEmail",
    async ({ phone, otp, newEmail }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post(`${API_URL}/verify-otp-update-email`, { phone, otp, newEmail });
        return res.data;
      } catch (err) {
        console.error("❌ verifyOtpAndUpdateEmail error:", err.response?.data || err.message);
        return rejectWithValue(err.response?.data?.message || "Failed to verify OTP");
      }
    }
  );
  
  // sendPasswordResetEmailAction
  export const sendPasswordResetEmailAction = createAsyncThunk(
    "authRecovery/sendResetEmail",
    async ({ email }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post(`${API_URL}/send-reset-email`, { email });
        return res.data;
      } catch (err) {
        console.error("❌ sendPasswordResetEmail error:", err.response?.data || err.message);
        return rejectWithValue(err.response?.data?.message || "Failed to send reset email");
      }
    }
  );
  
  // resetPasswordAction
  export const resetPasswordAction = createAsyncThunk(
    "authRecovery/resetPassword",
    async ({ token, newPassword }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post(`${API_URL}/reset-password`, { token, newPassword });
        return res.data;
      } catch (err) {
        console.error("❌ resetPassword error:", err.response?.data || err.message);
        return rejectWithValue(err.response?.data?.message || "Failed to reset password");
      }
    }
  );
  