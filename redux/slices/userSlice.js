import { createSlice } from "@reduxjs/toolkit"
import { getCurrentUserAction, searchUsersAction, updateUserAction,rateUserAction } from "../action/UserActions"

const initialState = {
  currentUser: null,
  searchResults: [],
  isLoading: false,
  isSearching: false,
  isUpdating: false,
  error: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    clearError: (state) => {
      state.error = null
    },
    clearUserState: (state) => {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current user
      .addCase(getCurrentUserAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentUserAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
      })
      .addCase(getCurrentUserAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Search users
      .addCase(searchUsersAction.pending, (state) => {
        state.isSearching = true
      })
      .addCase(searchUsersAction.fulfilled, (state, action) => {
        state.isSearching = false
        state.searchResults = action.payload
      })
      .addCase(searchUsersAction.rejected, (state, action) => {
        state.isSearching = false
        state.error = action.payload
      })
      // Update user
      .addCase(updateUserAction.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
        state.isUpdating = false
        state.currentUser = action.payload
      })
      .addCase(updateUserAction.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload
      })
      // ⭐ Rate user
.addCase(rateUserAction.pending, (state) => {
  state.isUpdating = true
  state.error = null
})
.addCase(rateUserAction.fulfilled, (state, action) => {
  state.isUpdating = false

  // If the current user is the owner who was rated, update their rating data
  if (state.currentUser && state.currentUser._id === action.meta.arg.ownerId) {
    state.currentUser.ratingAverage = action.payload.ratingAverage
    state.currentUser.ratingPercent = action.payload.ratingPercent
  }
})
.addCase(rateUserAction.rejected, (state, action) => {
  state.isUpdating = false
  state.error = action.payload
})

  },
})

export const { clearSearchResults, clearError, clearUserState } = userSlice.actions
export default userSlice.reducer
