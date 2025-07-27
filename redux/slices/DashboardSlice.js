import { createSlice } from "@reduxjs/toolkit"
import { fetchDashboardStats, fetchUserStats } from "../action/DashboardActions"

const initialState = {
  totalCars: 0,
  activeCars: 0,
  pendingCars: 0,
  recentActivity: [],
  userStats: {
    totalBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  },
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        const stats = action.payload
        state.totalCars = stats.totalListings || stats.totalCars || 0
        state.activeCars = stats.activeListings || stats.activeCars || 0
        state.pendingCars = stats.pendingListings || stats.pendingCars || 0
        state.recentActivity = stats.recentActivity || []
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload
      })
  },
})

export const { clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer
