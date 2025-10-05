import axios from "axios";
import {
  fetchStart,
  fetchSuccess,
  fetchFail,
  markRead,
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
export const markNotificationAsRead = (id) => async (dispatch, getState) => {
  try {
    const token = getState().auth?.token;

    // ✅ Backend expects PATCH (not PUT)
    await axios.patch(`${API_URL}/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch(markRead(id));
  } catch (err) {
    console.error("Mark notification as read failed", err);
  }
};


// ✅ Mark single notification as read

// ✅ Mark all as read


// ✅ Delete notification
export const deleteNotification = (id) => async (dispatch, getState) => {
  try {
    const token = getState().auth?.token
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    dispatch(deleteOne(id))
  } catch (err) {
    console.error("Delete notification failed", err)
  }
};
