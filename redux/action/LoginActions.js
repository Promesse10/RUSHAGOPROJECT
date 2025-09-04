import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import axiosInstance from "../../utils/axios"

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`

export const loginAction = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    console.log("🔐 Attempting login with:", credentials.email)

    const response = await axios.post(API_URL, credentials, {
      headers: { "Content-Type": "application/json" },
    })

    const { token, user } = response.data

    if (!token || !user) {
      return rejectWithValue("Login failed: Missing token or user.")
    }

    await SecureStore.setItemAsync("token", token)
    await SecureStore.setItemAsync("user", JSON.stringify(user))

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // Optional dashboard test
    try {
      const dashboard = await axiosInstance.get("/dashboard")
      console.log("✅ Dashboard response:", dashboard.data)
    } catch (err) {
      console.log("⚠️ Dashboard error:", err.message)
    }

    return { token, user }
  } catch (err) {
    console.error("❌ Login error:", err)
    return rejectWithValue(err.response?.data?.message || "Login failed.")
  }
})

export const loadAuthFromStorage = createAsyncThunk("auth/loadFromStorage", async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("token")
    const userJson = await SecureStore.getItemAsync("user")

    if (!token || !userJson) throw new Error("No stored auth found")

    const user = JSON.parse(userJson)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    console.log("✅ Loaded auth from storage:", user.name)

    return { token, user }
  } catch (err) {
    console.error("❌ Load auth error:", err)
    return rejectWithValue("Failed to load auth.")
  }
})

// ✅ FIXED: Proper logout that clears everything
export const logoutAction = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    console.log("🚪 Starting logout process...")

    // Clear secure storage
    await SecureStore.deleteItemAsync("token")
    await SecureStore.deleteItemAsync("user")

    // Clear axios headers
    delete axios.defaults.headers.common["Authorization"]

    console.log("✅ Logout successful - all data cleared")
    return true
  } catch (err) {
    console.error("❌ Logout error:", err)
    return rejectWithValue("Failed to logout")
  }
})

// ✅ FIXED: Update user profile via proper user API endpoint
export const updateUserProfileAction = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const userId = auth.user?._id || auth.user?.id

      if (!userId) {
        console.log("❌ User object has no ID:", auth.user)
        return rejectWithValue("User ID not found")
      }

      const response = await axiosInstance.put(`/users/${userId}`, {
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
      console.error("❌ Profile update error:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to update profile")
    }
  }
)
export const googleLoginAction = createAsyncThunk(
  "auth/googleLogin",
  async ({ idToken, userType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/google`, { idToken, userType });
      const { token, user } = res.data;

      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { token, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Google login failed");
    }
  }
);

