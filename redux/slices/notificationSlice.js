import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    currentUserId: null,
  },
  reducers: {
    fetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
 fetchSuccess: (state, action) => {
  state.isLoading = false;
  state.error = null;

  const data = action.payload || [];
  const list = Array.isArray(data) ? data : [];

  state.notifications = list
    .filter(n => n && (n._id || n.id))
    .map(n => {
      const id = n._id || n.id;

      // 🔥 IMPORTANT: backend readBy is per-user
      const currentUserId =
        state.currentUserId || null; // we’ll inject this

      const isReadForUser = currentUserId
        ? Array.isArray(n.readBy) &&
          n.readBy.some(r => String(r) === String(currentUserId))
        : Boolean(n.isRead);

      return {
        ...n,
        id,
        _id: id,
        isRead: isReadForUser
      };
    });

  state.unreadCount = state.notifications.filter(n => !n.isRead).length;
},


    fetchFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
   markRead: (state, action) => {
  const { id, readAt } = action.payload || {}
  state.notifications = state.notifications.map((n) =>
    (n._id || n.id) === id ? { ...n, isRead: true, readAt: readAt || new Date().toISOString() } : n
  );

  state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
},

    markAllRead: (state) => {
      const now = new Date().toISOString();
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true, readAt: n.readAt || now }));
      state.unreadCount = 0;
    },
   deleteOne: (state, action) => {
  state.notifications = state.notifications.filter(
    (n) => (n._id || n.id) !== action.payload
  );

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
