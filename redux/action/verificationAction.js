// src/redux/action/verificationAction.js
import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const sendVerificationCodeAction = createAsyncThunk(
    "verification/sendCode",
    async ({ email, userName }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post(
          `${API_URL}/email/send-verification-code`,
          { email, userName }
        );
  
        // ✅ Success
        if (res.data.success) {
          return res.data.code;
        }
  
        // ❌ API responded but without success
        return rejectWithValue(res.data.error || "Unexpected error");
      } catch (err) {
        console.error("❌ Verification error:", err.response?.data || err.message);
        return rejectWithValue(err.response?.data?.error || err.message);
      }
    }
  );
  