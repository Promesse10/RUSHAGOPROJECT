import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    fetchFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    markRead: (state, action) => {
      state.notifications = state.notifications.map((n) =>
        n._id === action.payload ? { ...n, isRead: true } : n
      );
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    deleteOne: (state, action) => {
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFail,
  markRead,
  markAllRead,
  deleteOne,
} = notificationSlice.actions;

export default notificationSlice.reducer;
