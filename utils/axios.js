import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("🔗 API_URL:", API_URL); // Debug log for API URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Enable credentials for CORS
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Token added to request:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
