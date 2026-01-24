import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

if (!API_URL) {
  throw new Error("❌ API_URL missing from Expo extra config");
}

console.log("🔗 API_URL:", API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🌐 Request URL:", config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
