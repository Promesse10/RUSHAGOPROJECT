
import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"
import * as SecureStore from "expo-secure-store"

const USER_UPDATE_URL = "/users"

// ✅ Update car owner settings (e.g., notification toggle, etc.)
export const updateUserSettings = createAsyncThunk(
  "settings/updateUserSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/settings", {
        notifications: settings.notifications
      })

      return response.data
    } catch (err) {
      return rejectWithValue("Failed to update settings")
    }
  }
)


export const updateUserProfileAction = createAsyncThunk(
  "settings/updateUserProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      console.log("📝 Updating profile with:", profileData)

      const response = await axiosInstance.patch(`/users/profile`, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        profileImage: profileData.profileImage,
      })

      console.log("✅ Profile updated:", response.data)

      const updatedUser = response.data

      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser))

      return updatedUser
    } catch (err) {
      console.error("❌ Profile update error:", err.response?.data || err.message)
      return rejectWithValue(err.response?.data?.message || "Failed to update profile")
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  "settings/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📥 Fetching user profile from /users/profile...")
      const response = await axiosInstance.get("/users/profile")
      console.log("✅ User profile fetched:", response.data)

      await SecureStore.setItemAsync("user", JSON.stringify(response.data))

      return response.data
    } catch (err) {
      console.error("❌ Fetch profile error:", err.response?.data || err.message)
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile")
    }
  }
)
