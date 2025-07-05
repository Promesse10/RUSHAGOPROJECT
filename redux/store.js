import { configureStore } from '@reduxjs/toolkit'
import signupReducer from './slices/signupSlice'
// import loginReducer from "./slices/loginSlice";

export const store = configureStore({
  reducer: {
    signup: signupReducer,
    // auth: loginReducer, 
  },
})
