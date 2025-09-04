import axios from "axios"
import * as SecureStore from "expo-secure-store"

// Function to get base URL automatically
const getBaseURL = async () => {
  try {
    const ip = "127.0.0.1"; // Fallback to localhost IP
    console.log("🌐 Using fallback IP:", ip)
    return `http://${ip}:5000` // replace 5000 with your backend port
  } catch (error) {
    console.error("Error getting LAN IP, falling back to localhost:", error)
  }
  return "http://localhost:5000" // fallback
}

// Create axios instance with dynamic baseURL
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Dynamically set baseURL
getBaseURL().then((baseURL) => {
  axiosInstance.defaults.baseURL = baseURL
  console.log("✅ Axios baseURL set to:", baseURL)
})

// Request interceptor to add auth token
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
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync("token")
        await SecureStore.deleteItemAsync("user")
        console.log("🔐 Token expired, cleared storage")
        delete axios.defaults.headers.common["Authorization"]
      } catch (clearError) {
        console.error("Error clearing auth storage:", clearError)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
