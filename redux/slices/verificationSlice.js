import { createSlice } from "@reduxjs/toolkit"
import {
  sendVerificationCodeAction,
  verifyEmailOtpAction
} from "../action/verificationAction";


const initialState = {
  isSending: false,
message: null,
retryAfter: null,
isVerified: false, 
  error: null,
  isSuccess: false,
}

const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
   resetVerificationState: (state) => {
  state.isSending = false
  state.isSuccess = false
  state.message = null
  state.retryAfter = null
  state.error = null
},

  },
  extraReducers: (builder) => {
    builder
      .addCase(sendVerificationCodeAction.pending, (state) => {
        state.isSending = true
        state.error = null
        state.isSuccess = false
      })
     .addCase(sendVerificationCodeAction.fulfilled, (state, action) => {
  state.isSending = false
  state.isSuccess = true
  state.message = action.payload?.message || "Verification code sent"
  state.retryAfter = null
  state.error = null
})

    .addCase(sendVerificationCodeAction.rejected, (state, action) => {
  state.isSending = false
  state.isSuccess = false
  state.error = action.payload?.error || "OTP_FAILED"
  state.retryAfter = action.payload?.retryAfter || null
})
.addCase(verifyEmailOtpAction.fulfilled, (state) => {
  state.isVerified = true;
  state.error = null;
})
.addCase(verifyEmailOtpAction.rejected, (state, action) => {
  state.isVerified = false;
  state.error = action.payload;
});

  },
})

export const { resetVerificationState } = verificationSlice.actions
export default verificationSlice.reducer
