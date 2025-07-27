import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

export const fetchDashboardStats = createAsyncThunk("dashboard/fetchStats", async (_, { rejectWithValue }) => {
  try {
    console.log("📊 Fetching dashboard stats...")
    const response = await axiosInstance.get("/dashboard")
    console.log("✅ Dashboard stats fetched:", response.data)
    return response.data
  } catch (err) {
    console.error("❌ Dashboard fetch error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to load dashboard")
  }
})

export const fetchUserStats = createAsyncThunk("dashboard/fetchUserStats", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/dashboard/user-stats")
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load user stats")
  }
})
