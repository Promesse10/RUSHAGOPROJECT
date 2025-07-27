import { createSlice } from "@reduxjs/toolkit"
import { saveDraft, getDrafts, updateDraft, deleteDraft } from "../action/draftsActions"

const initialState = {
  drafts: [],
  loading: false,
  error: null,
  saveLoading: false,
  deleteLoading: false,
}

const draftsSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearDrafts: (state) => {
      state.drafts = []
    },
  },
  extraReducers: (builder) => {
    // Save draft
    builder
      .addCase(saveDraft.pending, (state) => {
        state.saveLoading = true
        state.error = null
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.saveLoading = false
        const existingIndex = state.drafts.findIndex((draft) => draft.id === action.payload.id)
        if (existingIndex !== -1) {
          state.drafts[existingIndex] = action.payload
        } else {
          state.drafts.push(action.payload)
        }
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.saveLoading = false
        state.error = action.payload
      })

    // Get drafts
    builder
      .addCase(getDrafts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDrafts.fulfilled, (state, action) => {
        state.loading = false
        state.drafts = action.payload || []
      })
      .addCase(getDrafts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update draft
    builder
      .addCase(updateDraft.pending, (state) => {
        state.saveLoading = true
        state.error = null
      })
      .addCase(updateDraft.fulfilled, (state, action) => {
        state.saveLoading = false
        const index = state.drafts.findIndex((draft) => draft.id === action.payload.id)
        if (index !== -1) {
          state.drafts[index] = action.payload
        }
      })
      .addCase(updateDraft.rejected, (state, action) => {
        state.saveLoading = false
        state.error = action.payload
      })

    // Delete draft
    builder
      .addCase(deleteDraft.pending, (state) => {
        state.deleteLoading = true
        state.error = null
      })
      .addCase(deleteDraft.fulfilled, (state, action) => {
        state.deleteLoading = false
        state.drafts = state.drafts.filter((draft) => draft.id !== action.payload)
      })
      .addCase(deleteDraft.rejected, (state, action) => {
        state.deleteLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearDrafts } = draftsSlice.actions
export default draftsSlice.reducer
