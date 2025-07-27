import { createAsyncThunk } from "@reduxjs/toolkit"
import { getAuthHeaders } from "../../utils/auth"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"

// Fetch user settings
export const fetchUserSettings = createAsyncThunk("settings/fetchUserSettings", async (_, { rejectWithValue }) => {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "GET",
      headers,
    })

    // If settings endpoint doesn't exist, return default settings
    if (response.status === 404) {
      console.log("Settings endpoint not found, returning default settings")
      return {
        notifications: true,
        darkMode: false,
        language: "en",
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Fetch settings error:", error)
    // Return default settings instead of rejecting
    return {
      notifications: true,
      darkMode: false,
      language: "en",
    }
  }
})

// Update user settings
export const updateUserSettings = createAsyncThunk(
  "settings/updateUserSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const headers = await getAuthHeaders()

      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Update settings error:", error)
      return rejectWithValue(error.message || "Failed to update settings")
    }
  },
)

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "settings/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const headers = await getAuthHeaders()

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Update profile error:", error)
      return rejectWithValue(error.message || "Failed to update profile")
    }
  },
)
