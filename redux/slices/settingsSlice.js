import { createSlice } from "@reduxjs/toolkit"
import { updateUserSettings, updateUserProfileAction, fetchUserProfile } from "../actions/settingAction"

const initialState = {
  notifications: {
    pushNotifications: true,
  },
  loading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetSettings: () => initialState,
    updateLocalNotificationSetting: (state, action) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Update push notification setting
      .addCase(updateUserSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.notifications) {
          state.notifications = {
            ...state.notifications,
            ...action.payload.notifications,
          }
        }
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ✅ Update personal profile info
      .addCase(updateUserProfileAction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfileAction.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUserProfileAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ✅ Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, resetSettings, updateLocalNotificationSetting } = settingsSlice.actions

export default settingsSlice.reducer
