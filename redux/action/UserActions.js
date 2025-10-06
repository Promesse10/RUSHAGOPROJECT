import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"
import * as SecureStore from "expo-secure-store"

const API_URL = "/users"

// Get current user profile
export const getCurrentUserAction = createAsyncThunk("user/getCurrent", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/profile`)
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch user profile")
  }
})

// Search users for autocomplete
export const searchUsersAction = createAsyncThunk("user/search", async (query, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/search?q=${query}`)
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to search users")
  }
})
export const updateUserAction = createAsyncThunk(
  "user/update",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${userData._id}`, userData)
      const updatedUser = response.data

      // ✅ Save updated user profile locally in SecureStore
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser))

      return updatedUser
    } catch (err) {
      console.error("❌ Update user failed:", err.response?.data || err.message)
      return rejectWithValue(err.response?.data?.message || "Failed to update user")
    }
  }
)
  
  export const rateUserAction = createAsyncThunk(
    "user/rateUser",
    async ({ ownerId, stars }, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post(`${API_URL}/rate`, { ownerId, stars });
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to submit rating");
      }
    }
  );
  
  