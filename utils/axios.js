import axios from "axios"
import * as SecureStore from "expo-secure-store"

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// ✅ FIXED: Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log("🔐 Token added to request:", config.url)
      }
    } catch (error) {
      console.error("Error getting token from secure store:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// ✅ FIXED: Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await SecureStore.deleteItemAsync("token")
        await SecureStore.deleteItemAsync("user")
        console.log("🔐 Token expired, cleared storage")

        // Clear axios default headers
        delete axios.defaults.headers.common["Authorization"]

        // You might want to dispatch a logout action here
        // store.dispatch(logout())
      } catch (clearError) {
        console.error("Error clearing auth storage:", clearError)
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
