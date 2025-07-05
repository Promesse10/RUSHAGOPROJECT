import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/users`;
console.log("API_URL is:", API_URL);

export const signupAction = createAsyncThunk(
  "signup/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      console.log("Signup error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  }
);
