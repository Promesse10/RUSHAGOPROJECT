import axios from "axios";
import axiosInstance from "../../utils/axios";
import {
  fetchStart,
  fetchSuccess,
  fetchFail,
  markRead,
  markAllRead,
  deleteOne,
} from "../slices/notificationSlice";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/notifications`;

// ✅ Fetch all notifications
export const fetchNotifications = () => async (dispatch) => {
  try {
    dispatch(fetchStart());

    const response = await axiosInstance.get("/notifications");

    // 🔥 FIX: backend returns ARRAY directly
    let list = [];

    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (Array.isArray(response.data?.notifications)) {
      list = response.data.notifications;
    } else if (Array.isArray(response.data?.data)) {
      list = response.data.data;
    }

    dispatch(fetchSuccess(list));
  } catch (err) {
    dispatch(fetchFail(err.response?.data?.message || err.message));
  }
};


// ✅ Mark single notification as read (FIXED)
export const markNotificationAsRead = (notification) => async (dispatch) => {
  const id = notification?._id || notification?.id || notification;

  if (!id) return;

  try {
    await axiosInstance.patch(`/notifications/${id}/read`, {});
  } catch (err) {
    console.error("Mark as read failed:", err.message);
  }

  dispatch(markRead(id));
};


// ✅ Mark all notifications as read (NEW - Add this function)
export const markAllNotificationsAsRead = () => async (dispatch, getState) => {
  try {
    const token = getState().auth?.token;
    const notifications = getState().notifications?.notifications || [];
    
    // Get all unread notifications
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    // Mark each unread notification as read
    for (const notification of unreadNotifications) {
      await axiosInstance.patch(
        `/notifications/${(notification._id || notification.id)}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    
    // Update local state
    dispatch(markAllRead());
  } catch (err) {
    console.error("Mark all as read failed", err);
  }
};

// ✅ Delete notification
export const deleteNotification = (id) => async (dispatch, getState) => {
  try {
    const token = getState().auth?.token;
    await axiosInstance.delete(`/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(deleteOne(id));
  } catch (err) {
    console.error("Delete notification failed", err);
  }
};

