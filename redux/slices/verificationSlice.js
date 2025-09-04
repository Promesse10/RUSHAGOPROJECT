import { createSlice } from "@reduxjs/toolkit"
import { sendVerificationCodeAction } from "../action/verificationAction"

const initialState = {
  isSending: false,
  sentCode: null,
  error: null,
  isSuccess: false,
}

const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
    resetVerificationState: (state) => {
      state.isSending = false
      state.sentCode = null
      state.error = null
      state.isSuccess = false
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
        state.sentCode = action.payload
        state.isSuccess = true
        state.error = null
      })
      .addCase(sendVerificationCodeAction.rejected, (state, action) => {
        state.isSending = false
        state.error = action.payload
        state.isSuccess = false
      })
  },
})

export const { resetVerificationState } = verificationSlice.actions
export default verificationSlice.reducer
