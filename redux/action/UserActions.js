import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

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
        return response.data
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to update user")
      }
    }
  )
  
