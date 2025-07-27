import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import axiosInstance from "../../utils/axios"

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`

export const loginAction = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    console.log("🔐 Attempting login with:", credentials.email)

    // 1. Login request
    const response = await axios.post(API_URL, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const { token, user } = response.data

    if (!token || !user) {
      return rejectWithValue("Login failed: Missing token or user.")
    }

    console.log("✅ Login successful for user:", user.name)

    // 2. Save token and user to secure storage
    await SecureStore.setItemAsync("token", token)
    await SecureStore.setItemAsync("user", JSON.stringify(user))

    // 3. Set default axios header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // 4. Test protected endpoint
    try {
      const dashboard = await axiosInstance.get("/dashboard")
      console.log("✅ Protected Dashboard Response:", dashboard.data)
    } catch (dashboardError) {
      console.log("⚠️ Dashboard test failed:", dashboardError.message)
    }

    return { token, user }
  } catch (err) {
    console.error("❌ Login error:", err)
    return rejectWithValue(err.response?.data?.message || "Login failed. Please try again.")
  }
})

export const loadAuthFromStorage = createAsyncThunk("auth/loadFromStorage", async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("token")
    const userJson = await SecureStore.getItemAsync("user")

    if (!token || !userJson) {
      throw new Error("No stored auth found")
    }

    const user = JSON.parse(userJson)

    // Set default auth header for all axios requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    console.log("✅ Auth loaded from storage for user:", user.name)

    return { token, user }
  } catch (err) {
    console.error("❌ Failed to load auth:", err)
    return rejectWithValue("Failed to load auth from storage.")
  }
})

export const logoutAction = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Clear secure storage
    await SecureStore.deleteItemAsync("token")
    await SecureStore.deleteItemAsync("user")

    // Clear axios default headers
    delete axios.defaults.headers.common["Authorization"]

    console.log("✅ Logout successful")

    return true
  } catch (err) {
    console.error("❌ Logout error:", err)
    return rejectWithValue("Failed to logout properly")
  }
})

export const updateUserProfileAction = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/users/profile", profileData)

      // Update stored user data
      const updatedUser = response.data
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser))

      console.log("✅ Profile updated successfully")

      return updatedUser
    } catch (err) {
      console.error("❌ Profile update error:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to update profile")
    }
  },
)
