import { createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "../action/notificationActions";

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload || [];
        state.unreadCount = (action.payload || []).filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload._id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })

      // delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications.splice(index, 1);
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  },
});

export const { clearNotificationError, addNotification, updateUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
