import { createAsyncThunk } from "@reduxjs/toolkit"
import { getAuthHeaders, getUserData } from "../../utils/"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"

// Get user's drafts
export const getDrafts = createAsyncThunk("drafts/getDrafts", async (_, { rejectWithValue }) => {
  try {
    // Get user ID from stored data
    const user = await getUserData()
    let userId = "user123" // fallback

    if (user) {
      userId = user.id || user._id || user.userId || "user123"
    }

    // Try to fetch from API first
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/drafts/user/${userId}`, {
        method: "GET",
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        return data || []
      }
    } catch (apiError) {
      console.log("API drafts not available, using local storage")
    }

    // Fallback to local storage
    const drafts = await AsyncStorage.getItem(`drafts_${userId}`)
    return drafts ? JSON.parse(drafts) : []
  } catch (error) {
    console.error("Load drafts error:", error)
    return rejectWithValue(error.message || "Failed to load drafts")
  }
})

// Save draft
export const saveDraft = createAsyncThunk("drafts/saveDraft", async (draftData, { rejectWithValue }) => {
  try {
    // Get user info from stored data
    const user = await getUserData()
    let userId = "user123"

    if (user) {
      userId = user.id || user._id || user.userId || "user123"
    }

    const payload = {
      ...draftData,
      userId,
      updatedAt: new Date().toISOString(),
      createdAt: draftData.createdAt || new Date().toISOString(),
    }

    // Try to save to API first
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/drafts`, {
        method: "POST",
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (apiError) {
      console.log("API drafts not available, using local storage")
    }

    // Fallback to local storage
    const existingDrafts = await AsyncStorage.getItem(`drafts_${userId}`)
    const drafts = existingDrafts ? JSON.parse(existingDrafts) : []

    const existingIndex = drafts.findIndex((d) => d.id === payload.id)
    if (existingIndex !== -1) {
      drafts[existingIndex] = payload
    } else {
      drafts.push(payload)
    }

    await AsyncStorage.setItem(`drafts_${userId}`, JSON.stringify(drafts))
    return payload
  } catch (error) {
    console.error("Save draft error:", error)
    return rejectWithValue(error.message || "Failed to save draft")
  }
})

// Update draft
export const updateDraft = createAsyncThunk("drafts/updateDraft", async ({ id, draftData }, { rejectWithValue }) => {
  try {
    const payload = {
      ...draftData,
      updatedAt: new Date().toISOString(),
    }

    // Try to update via API first
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/drafts/${id}`, {
        method: "PUT",
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (apiError) {
      console.log("API drafts not available, using local storage")
    }

    // Fallback to local storage
    const user = await getUserData()
    const userId = user?.id || user?._id || user?.userId || "user123"

    const existingDrafts = await AsyncStorage.getItem(`drafts_${userId}`)
    const drafts = existingDrafts ? JSON.parse(existingDrafts) : []

    const index = drafts.findIndex((d) => d.id === id)
    if (index !== -1) {
      drafts[index] = { ...drafts[index], ...payload }
      await AsyncStorage.setItem(`drafts_${userId}`, JSON.stringify(drafts))
      return drafts[index]
    } else {
      throw new Error("Draft not found")
    }
  } catch (error) {
    console.error("Update draft error:", error)
    return rejectWithValue(error.message || "Failed to update draft")
  }
})

// Delete draft
export const deleteDraft = createAsyncThunk("drafts/deleteDraft", async (id, { rejectWithValue }) => {
  try {
    // Try to delete via API first
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/drafts/${id}`, {
        method: "DELETE",
        headers,
      })

      if (response.ok) {
        return { id }
      }
    } catch (apiError) {
      console.log("API drafts not available, using local storage")
    }

    // Fallback to local storage
    const user = await getUserData()
    const userId = user?.id || user?._id || user?.userId || "user123"

    const existingDrafts = await AsyncStorage.getItem(`drafts_${userId}`)
    const drafts = existingDrafts ? JSON.parse(existingDrafts) : []

    const filteredDrafts = drafts.filter((d) => d.id !== id)
    await AsyncStorage.setItem(`drafts_${userId}`, JSON.stringify(filteredDrafts))

    return { id }
  } catch (error) {
    console.error("Delete draft error:", error)
    return rejectWithValue(error.message || "Failed to delete draft")
  }
})