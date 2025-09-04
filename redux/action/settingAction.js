import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"
import * as SecureStore from "expo-secure-store"

const USER_UPDATE_URL = "/users"

// ✅ Update car owner settings (e.g., notification toggle, etc.)
export const updateUserSettings = createAsyncThunk(
  "settings/updateUserSettings",
  async (settings, { rejectWithValue }) => {
    try {
      console.log("💾 Updating car owner settings...", settings)
      const response = await axiosInstance.put("/settings", settings)
      console.log("✅ Car owner settings updated:", response.data)
      return response.data
    } catch (err) {
      console.error("❌ Settings update error:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to update settings")
    }
  }
)

// ✅ Update car owner profile (personal info: name, phone, etc.)
export const updateUserProfileAction = createAsyncThunk(
  "settings/updateUserProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const userId = auth.user?._id || auth.user?.id

      if (!userId) {
        console.log("❌ No user ID found in auth state")
        return rejectWithValue("User ID not found")
      }

      console.log("📝 Updating profile for user:", userId)

      const response = await axiosInstance.put(`${USER_UPDATE_URL}/${userId}`, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        businessName: profileData.businessName,
        businessType: profileData.businessType,
        address: profileData.address,
        profileImage: profileData.profileImage,
      })

      const updatedUser = response.data
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser))

      console.log("✅ Profile updated successfully")
      return updatedUser
    } catch (err) {
      console.error("❌ Profile update failed:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to update profile")
    }
  }
)
