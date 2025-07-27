import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

const API_URL = "/users"

// Get current user profile
export const getCurrentUserAction = createAsyncThunk("user/getCurrent", async (_, { rejectWithValue }) => {
  try {
    console.log("👤 Fetching current user profile...")
    const response = await axiosInstance.get(`${API_URL}/profile`)
    console.log("✅ User profile fetched:", response.data.name)
    return response.data
  } catch (err) {
    console.error("❌ User profile fetch error:", err)
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

// Update user profile
export const updateUserAction = createAsyncThunk("user/update", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/profile`, userData)
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update user")
  }
})
