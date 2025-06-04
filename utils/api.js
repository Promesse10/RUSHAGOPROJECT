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
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // Handle unauthorized access
      return Promise.reject({ message: 'Session expired. Please login again.' });
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth endpoints
export const auth = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyPhone: (data) => api.post('/auth/verify-phone', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
};

// User endpoints
export const users = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateProfilePicture: (data) => {
    const formData = new FormData();
    formData.append('profile_picture', data);
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getProfile: () => api.get('/users/profile'),
};

// Car endpoints
export const cars = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`),
  search: (params) => api.get('/cars/search', { params }),
  getTopRated: () => api.get('/cars/top-rated'),
  getNearby: (params) => api.get('/cars/nearby', { params }),
};

// Booking endpoints
export const bookings = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  getRenterBookings: () => api.get('/bookings/renter'),
  getOwnerBookings: () => api.get('/bookings/owner'),
};

// Rating endpoints
export const ratings = {
  create: (data) => api.post('/ratings', data),
  update: (id, data) => api.put(`/ratings/${id}`, data),
  getByBooking: (bookingId) => api.get(`/ratings/booking/${bookingId}`),
  getUserRatings: () => api.get('/ratings/user'),
};

// Location tracking endpoints
export const tracking = {
  updateLocation: (data) => api.post('/tracking/location', data),
  getLocation: (userId) => api.get(`/tracking/location/${userId}`),
};

export default api;