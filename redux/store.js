import { configureStore } from '@reduxjs/toolkit'
import signupReducer from './slices/signupSlice'
import loginReducer from "./slices/LoginSlice"; 

export const store = configureStore({
  reducer: {
    signup: signupReducer,
    auth: loginReducer, 
  },
})
