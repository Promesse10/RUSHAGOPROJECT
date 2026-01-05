import axios from "axios";
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
export const fetchNotifications = () => async (dispatch, getState) => {
  try {
    dispatch(fetchStart());

    const token = getState().auth?.token;
    const { data } = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(fetchSuccess(data));
  } catch (err) {
    dispatch(fetchFail(err.response?.data?.message || err.message));
  }
};

// ✅ Mark single notification as read (FIXED)
export const markNotificationAsRead = (id) => async (dispatch, getState) => {
  try {
    // Handle both _id and id formats
    const notificationId = id || null
    
    if (!notificationId) {
      console.error("❌ No notification ID provided")
      return
    }

    console.log("📤 Marking notification as read:", notificationId)

    const token = getState().auth?.token;

    const response = await axios.patch(
      `${API_URL}/${notificationId}/read`,
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    )

    console.log("✅ Notification marked as read:", response.data)
    dispatch(markRead(notificationId))

  } catch (err) {
    console.error("❌ Mark notification as read failed:", err?.response?.data || err.message)
  }
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
      await axios.patch(
        `${API_URL}/${(notification._id || notification.id)}/read`,

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
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(deleteOne(id));
  } catch (err) {
    console.error("Delete notification failed", err);
  }
};

