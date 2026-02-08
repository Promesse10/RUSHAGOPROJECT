import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

export const sendVerificationCodeAction = createAsyncThunk(
  "verification/sendCode",
  async ({ email, userName }, { rejectWithValue }) => {
    try {
      const trimmedEmail = email.trim();
      const trimmedUserName = userName.trim();
      console.log("Sending verification code to:", trimmedEmail, "userName:", trimmedUserName);
      console.log("Payload being sent:", { email: trimmedEmail, userName: trimmedUserName });
    const res = await axiosInstance.post(
  "/email/send-verification-code",
  {
    email: trimmedEmail,
    userName: trimmedUserName,
  },
  { timeout: 90000 }
);

      console.log("Send verification response:", res.data);

      if (res.data.success) {
        return {
          message: res.data.message || "Verification code sent",
        }
      }

      // Backend-controlled failure
      return rejectWithValue({
        error: res.data.error || "OTP_FAILED",
        retryAfter: res.data.retryAfter || null,
      })
    } catch (err) {
      console.log("Send verification error:", err);
      const data = err.response?.data

      return rejectWithValue({
        error: data?.error || "NETWORK_ERROR",
        retryAfter: data?.retryAfter || null,
      })
    }
  }

)
export const verifyEmailOtpAction = createAsyncThunk(
  "verification/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      console.log("🔍 Verifying OTP for:", email);

      const res = await axiosInstance.post(
        "/email/verify-otp",
        {
          email,
          otp: otp.trim(),
        }
      );

      console.log("✅ Verify response:", res.data);

      if (res.data.success) {
        return true;
      }

      return rejectWithValue(res.data.error || "INVALID_OTP");
    } catch (err) {
      console.log(
        "❌ Verify OTP error:",
        err.response?.status,
        err.response?.data,
        err.message
      );

      return rejectWithValue(
        err.response?.data?.error || "NETWORK_ERROR"
      );
    }
  }
);

