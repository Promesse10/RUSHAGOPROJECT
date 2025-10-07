import { configureStore } from '@reduxjs/toolkit'
import signupReducer from './slices/signupSlice'
import loginReducer from "./slices/loginSlice" // Ensure the filename matches exactly
import dashboardReducer from "./slices/DashboardSlice"
import userSlice from "./slices/userSlice"
import settingsReducer from "./slices/settingsSlice"
import notificationsReducer from "./slices/notificationSlice";
import  verification from "./slices/verificationSlice"    
import carReducer from "./slices/carSlice"
import authRecoveryReducer from "./slices/authRecoverySlice"
export const store = configureStore({
  reducer: {
    signup: signupReducer,
    auth: loginReducer,
    settings: settingsReducer,
    cars: carReducer,
    user: userSlice,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    verification: verification,
    authRecovery: authRecoveryReducer,
  },
})
