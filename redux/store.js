import { configureStore } from '@reduxjs/toolkit'
import signupReducer from './slices/signupSlice'
import loginReducer from "./slices/LoginSlice"
import dashboardReducer from "./slices/DashboardSlice"
import userSlice from "./slices/userSlice"
// import settingsReducer from "./slices/SettingsSlice"
// import draftsReducer from "./slices/DraftsSlice"
import carReducer from "./slices/carSlice"
export const store = configureStore({
  reducer: {
    signup: signupReducer,
    loginState: loginReducer,
    cars: carReducer,
    user: userSlice,
    dashboard: dashboardReducer,
    // settings: settingsReducer,
    // drafts: draftsReducer,
  },
})
