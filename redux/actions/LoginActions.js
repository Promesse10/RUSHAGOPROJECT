import { createAsyncThunk } from "@reduxjs/toolkit";

// Placeholder async actions
export const updateUserProfileAction = createAsyncThunk(
  "auth/updateUserProfile",
  async (profile, thunkAPI) => {
    // Simulate an API call
    return profile;
  }
);