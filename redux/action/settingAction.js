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

      await SecureStore.setItemAsync("userProfile", JSON.stringify(response.data.profile))

      return response.data
    } catch (err) {
      console.error("❌ Settings update error:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to update settings")
    }
  },
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
        email: profileData.email, // Include email field
        phone: profileData.phone,
        telephone: profileData.telephone, // Include telephone field
        businessName: profileData.businessName,
        businessType: profileData.businessType,
        profileImage: profileData.profileImage,
      })

      const updatedUser = response.data

      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser))
      await SecureStore.setItemAsync("userProfile", JSON.stringify(updatedUser))

      console.log("✅ Profile updated successfully")
      return updatedUser
    } catch (err) {
      console.error("❌ Profile update failed:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to update profile")
    }
  },
)

export const changePasswordAction = createAsyncThunk(
  "settings/changePassword",
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const userId = auth.user?._id || auth.user?.id

      if (!userId) {
        return rejectWithValue("User ID not found")
      }

      const response = await axiosInstance.put(`${USER_UPDATE_URL}/${userId}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      })

      console.log("✅ Password changed successfully")
      return response.data
    } catch (err) {
      console.error("❌ Password change failed:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to change password")
    }
  },
)
