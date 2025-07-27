import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Configure base URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET: Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/notifications?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

// PATCH: Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  }
);

// PATCH: Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to mark all notifications as read'
      );
    }
  }
);

// DELETE: Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to delete notification'
      );
    }
  }
);

// POST: Create notification (admin only)
export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to create notification'
      );
    }
  }
);