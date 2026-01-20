import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/users`;
console.log("API_URL is:", API_URL);

export const signupAction = createAsyncThunk(
  "signup/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users", userData);
      return response.data;
    } catch (err) {
      console.log("Signup error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  }
);
