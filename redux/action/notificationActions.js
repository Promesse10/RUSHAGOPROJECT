import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import * as SecureStore from "expo-secure-store"

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/notifications`

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token")
      if (!token) throw new Error("No token found")
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      const response = await axios.get(API_URL)
      return response.data
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message)
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token")
      if (!token) throw new Error("No token found")
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      const response = await axios.patch(`${API_URL}/${notificationId}/read`)
      return response.data
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message)
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token")
      if (!token) throw new Error("No token found")
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      const response = await axios.patch(`${API_URL}/read-all`)
      return response.data
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message)
    }
  }
)

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("token")
      if (!token) throw new Error("No token found")
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      await axios.delete(`${API_URL}/${notificationId}`)
      return notificationId
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message)
    }
  }
)
