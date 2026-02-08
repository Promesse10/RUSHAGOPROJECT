import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("❌ EXPO_PUBLIC_API_URL is missing");
}

console.log("🔗 API_URL USED BY APP:", API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
   timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🌐 Request:", config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.method?.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ Response Error:", error.message, error.code, error.config?.method?.toUpperCase(), error.config?.url);
    if (error.response) {
      console.log("❌ Status:", error.response.status);
      console.log("❌ Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
