// redux/action/DashboardActions.js
import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

// Get dashboard stats for car owner using /listings/me
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📊 Fetching dashboard stats from /listings/me...")
      const response = await axiosInstance.get("/listings/me")
      const listings = response.data || []

      const totalListings = listings.length
      const activeListings = listings.filter((l) => l.status === "approved").length
      const pendingListings = listings.filter((l) => l.status === "pending").length
      const inactiveListings = Math.max(0, totalListings - activeListings - pendingListings)

      const recentActivity = [
        {
          type: "Your Car Listings",
          data: listings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map((listing) => ({
              title: listing.title || `${listing.brand} ${listing.model}`,
              time: timeAgo(listing.createdAt),
            })),
        },
      ]

      console.log("✅ Stats processed:", { totalListings, activeListings, pendingListings })

      return { totalListings, activeListings, pendingListings, recentActivity }
    } catch (err) {
      console.error("❌ Failed to fetch dashboard stats:", err)
      return rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard stats.")
    }
  }
)

// (Optional) Fetch other user-specific stats
export const fetchUserStats = createAsyncThunk(
  "dashboard/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/dashboard/user") // Customize if you have this endpoint
      return response.data
    } catch (err) {
      return rejectWithValue("Failed to fetch user stats.")
    }
  }
)

// Time ago helper
function timeAgo(date) {
  const now = new Date()
  const diffMs = now - new Date(date)
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}
