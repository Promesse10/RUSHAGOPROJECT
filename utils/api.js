import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://rushago-api.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      await AsyncStorage.removeItem('authToken');
      // Redirect to login screen
      // You'll need to implement this based on your navigation setup
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  googleAuth: (data) => api.post('/auth/google-auth', data),
  verifyEmail: () => api.get('/auth/verify-email'),
  verifyPhone: (data) => api.post('/auth/verify-phone', data),
};

// Cars endpoints
export const cars = {
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}/permanent`),
  getStats: () => api.get('/cars/stats'),
};

// Messages endpoints
export const messages = {
  startChat: (data) => api.post('/messages/start', data),
  getHistory: (threadId) => api.get(`/messages/history/${threadId}`),
  markAsRead: (messageId) => api.put(`/messages/read/${messageId}`),
  delete: (messageId) => api.delete(`/messages/${messageId}`),
  getStats: () => api.get('/messages/stats'),
};

// Reviews endpoints
export const reviews = {
  create: (data) => api.post('/reviews', data),
  moderate: (id, data) => api.put(`/reviews/moderate/${id}`, data),
  respond: (id, data) => api.put(`/reviews/respond/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: () => api.get('/reviews/stats'),
};

// User endpoints
export const users = {
  updateProfilePicture: (data) => {
    const formData = new FormData();
    formData.append('profile_picture', data);
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  subscribe: (data) => api.post('/users/subscribe', data),
  getStats: () => api.get('/users/stats'),
};

// Payments endpoints
export const payments = {
  initiateSubscription: (data) => api.post('/payments/subscription', data),
  checkStatus: (data) => api.post('/payments/status', data),
  verifyPayment: (id) => api.get(`/payments/verify/${id}`),
};

export default api;