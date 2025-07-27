import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSettings,
  updateSettings,
  updateGeneralSettings,
  updateNotificationSettings,
  updatePaymentSettings,
  updateSecuritySettings,
} from '../action/settingAction';

const initialState = {
  general: {
    appName: 'Rushago Car Rentals',
    supportEmail: 'support@rushago.com',
    maintenanceMode: false,
    allowRegistrations: true,
    language: 'rw',
    currency: 'RWF',
    darkMode: false,
    autoLocation: true,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    bookingUpdates: true,
    promotionalOffers: false,
  },
  payments: {
    commissionRate: 10,
    paymentMethods: ['mobile_money', 'bank_transfer'],
    autoPayouts: false,
    minimumPayout: 10000,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 3,
  },
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSettings: (state) => {
      return initialState;
    },
    // Local updates for immediate UI feedback
    updateLocalGeneralSettings: (state, action) => {
      state.general = { ...state.general, ...action.payload };
    },
    updateLocalNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateLocalPaymentSettings: (state, action) => {
      state.payments = { ...state.payments, ...action.payload };
    },
    updateLocalSecuritySettings: (state, action) => {
      state.security = { ...state.security, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.general = { ...state.general, ...action.payload.general };
          state.notifications = { ...state.notifications, ...action.payload.notifications };
          state.payments = { ...state.payments, ...action.payload.payments };
          state.security = { ...state.security, ...action.payload.security };
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update all settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.general = { ...state.general, ...action.payload.general };
          state.notifications = { ...state.notifications, ...action.payload.notifications };
          state.payments = { ...state.payments, ...action.payload.payments };
          state.security = { ...state.security, ...action.payload.security };
        }
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update general settings
      .addCase(updateGeneralSettings.fulfilled, (state, action) => {
        if (action.payload?.general) {
          state.general = { ...state.general, ...action.payload.general };
        }
      })

      // Update notification settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        if (action.payload?.notifications) {
          state.notifications = { ...state.notifications, ...action.payload.notifications };
        }
      })

      // Update payment settings
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        if (action.payload?.payments) {
          state.payments = { ...state.payments, ...action.payload.payments };
        }
      })

      // Update security settings
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        if (action.payload?.security) {
          state.security = { ...state.security, ...action.payload.security };
        }
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  resetSettings,
  updateLocalGeneralSettings,
  updateLocalNotificationSettings,
  updateLocalPaymentSettings,
  updateLocalSecuritySettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;