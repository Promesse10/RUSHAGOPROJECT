import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`;
console.log("API_URL is:", API_URL);

export const loginAction = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data; // Expect: { token, user }
    } catch (err) {
      console.log("Login error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);
