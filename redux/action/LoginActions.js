import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import axiosInstance from "../../utils/axios"
import messaging from '@react-native-firebase/messaging'
const registerFCMToken = async (userId, authToken) => {
  try {
    // Request permission (Android 13+ safe)
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (!enabled) {
      console.log("🔕 Notification permission denied")
      return
    }

    // Get token
    const fcmToken = await messaging().getToken()
    console.log("📲 FCM TOKEN:", fcmToken)

    // Send to backend
    await axiosInstance.post(
      "/users/fcm-token",
      { fcmToken },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    )
  } catch (err) {
    console.log("❌ FCM register error:", err.message)
  }
}



export const loginAction = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("🔐 Attempting login with:", credentials.email);

      const res = await axiosInstance.post("/auth/login", credentials);

      const { token, user } = res.data;

      if (!token || !user) {
        return rejectWithValue("Login failed: missing token or user");
      }

      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
     await registerFCMToken(user._id || user.id, token);
      return { token, user };
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Network error"
      );
    }
  }
);

export const loadAuthFromStorage = createAsyncThunk("auth/loadFromStorage", async (_, { rejectWithValue }) => {
  try {
    const token = await SecureStore.getItemAsync("token")
    const userJson = await SecureStore.getItemAsync("user")
    if (!token || !userJson) {
      console.log("ℹ️ No stored auth found in secure storage")
      return rejectWithValue("No stored auth")
    }

    const user = JSON.parse(userJson)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    console.log("✅ Loaded auth from storage:", user.name)

    return { token, user }
  } catch (err) {
    console.error("❌ Load auth error:", err)
    return rejectWithValue(err.message || "Failed to load auth.")
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

// ✅ ENHANCED: Update user profile with password change support
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

      const updatePayload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        businessName: profileData.businessName,
        businessType: profileData.businessType,
        address: profileData.address,
        profileImage: profileData.profileImage,
      }

      // Add password fields if changing password
      if (profileData.oldPassword && profileData.newPassword) {
        updatePayload.oldPassword = profileData.oldPassword
        updatePayload.newPassword = profileData.newPassword
      }

      const response = await axiosInstance.put(`/users/${userId}`, updatePayload)

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

export const googleLoginAction = createAsyncThunk(
  "auth/googleLogin",
  async ({ idToken, userType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/google`, { idToken, userType })
      const { token, user } = res.data

      await SecureStore.setItemAsync("token", token)
      await SecureStore.setItemAsync("user", JSON.stringify(user))
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return { token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Google login failed")
    }
  },
)
