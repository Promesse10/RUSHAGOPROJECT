import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../utils/axios"

const API_URL = "/listings"

// Get my cars (owner only)
export const getMyCarsAction = createAsyncThunk("cars/getMine", async (_, { rejectWithValue }) => {
  try {
    console.log("🚗 Fetching my cars...")
    const response = await axiosInstance.get(`${API_URL}/me`)
    console.log("✅ My cars fetched:", response.data?.length || 0)
    return response.data || []
  } catch (err) {
    console.error("❌ Get my cars error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to fetch your cars")
  }
})

// Get all cars (Admin only or if needed elsewhere)
export const getCarsAction = createAsyncThunk("cars/getAll", async (_, { rejectWithValue }) => {
  try {
    console.log("🚗 Fetching all cars...")
    const response = await axiosInstance.get(API_URL)
    console.log("✅ All cars fetched:", response.data?.length || 0)
    return response.data || []
  } catch (err) {
    console.error("❌ Get all cars error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to fetch cars")
  }
})

// Get public cars (guest browsing, no mandatory user token) 
export const getPublicCarsAction = createAsyncThunk("cars/getPublic", async (_, { rejectWithValue }) => {
  try {
    console.log("🚗 Fetching public cars (guest)")
    let response
    try {
      response = await axiosInstance.get("/listings/renter/approved")
      console.log("✅ Approved public cars fetched:", response.data?.length || 0)
      return response.data || []
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn("🔒 Approved public endpoint requires auth, falling back to open listings")
        response = await axiosInstance.get(API_URL)
        console.log("✅ Fallback public cars fetched:", response.data?.length || 0)
        return response.data || []
      }
      throw err
    }
  } catch (err) {
    console.error("❌ Get public cars error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to fetch public cars")
  }
})

// ✅ Get Approved Cars - Enhanced with better error handling
export const getApprovedCarsAction = createAsyncThunk("cars/getApproved", async (_, { rejectWithValue }) => {
  try {
    console.log("🚗 Fetching approved cars...")
    const response = await axiosInstance.get("/listings/renter/approved")
    const cars = response.data || []
    console.log("✅ Approved cars fetched:", cars.length)

    // Log some sample data for debugging
    if (cars.length > 0) {
      console.log("📊 Sample car data:", {
        id: cars[0]._id || cars[0].id,
        brand: cars[0].brand || cars[0].make,
        model: cars[0].model,
        coordinates: cars[0].coordinates || { lat: cars[0].latitude, lng: cars[0].longitude },
      })
    }

    return cars
  } catch (err) {
    console.error("❌ Get approved cars error:", err)
    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch approved cars"
    return rejectWithValue(errorMessage)
  }
})

// Create a car
export const createCarAction = createAsyncThunk("cars/create", async (carData, { rejectWithValue }) => {
  try {
    console.log("🆕 Creating new car:", carData.brand, carData.model)
    const response = await axiosInstance.post(API_URL, carData)
    console.log("✅ Car created successfully:", response.data._id)
    return response.data
  } catch (err) {
    console.error("❌ Create car error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to create car")
  }
})

// Update a car
export const updateCarAction = createAsyncThunk("cars/update", async ({ carId, updatedData }, { rejectWithValue }) => {
  try {
    console.log("✏️ Updating car:", carId)
    const response = await axiosInstance.put(`${API_URL}/${carId}`, updatedData, { timeout: 30000 })
    console.log("✅ Car updated successfully")
    return response.data
  } catch (err) {
    console.error("❌ Update car error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to update car")
  }
})
// ✅ Increment Car View (for renter)
export const incrementCarViewAction = createAsyncThunk(
  "cars/incrementCarView",
  async (carId, { rejectWithValue }) => {
    try {
      console.log("👀 Incrementing view for car:", carId)
      const res = await axiosInstance.post(`/listings/${carId}/view`)
      console.log("✅ View incremented successfully:", res.data.views)
      return { carId, views: res.data.views }
    } catch (err) {
      console.error("❌ Increment view failed:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      })
    return { carId }

    }
  }
)

// Delete a car
export const deleteCarAction = createAsyncThunk("cars/delete", async (carId, { rejectWithValue }) => {
  try {
    console.log("🗑️ Deleting car:", carId)
    await axiosInstance.delete(`${API_URL}/${carId}`)
    console.log("✅ Car deleted successfully")
    return carId
  } catch (err) {
    console.error("❌ Delete car error:", err)
    return rejectWithValue(err.response?.data?.message || "Failed to delete car")
  }
})

// Update car availability
export const updateCarAvailabilityAction = createAsyncThunk(
  "cars/updateAvailability",
  async ({ carId, available }, { rejectWithValue }) => {
    try {
      console.log("🔄 Updating car availability:", carId, "to:", available)
      const response = await axiosInstance.patch(`${API_URL}/${carId}/availability`, { available })
      console.log("✅ Car availability updated")
      return { carId, available: response.data.available }
    } catch (err) {
      console.error("❌ Update availability error:", err)
      return rejectWithValue("Failed to update availability")
    }
  },
)



// Update car rating
export const updateCarRatingAction = createAsyncThunk(
  "cars/updateRating",
  async ({ carId, rating, reviews }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/${carId}/rating`, { rating, reviews })
      return {
        carId,
        rating: response.data.rating,
        reviews: response.data.reviews,
      }
    } catch (err) {
      return rejectWithValue("Failed to update rating")
    }
  },
)

// Check plate number uniqueness
export const checkPlateUniquenessAction = createAsyncThunk(
  "cars/checkPlateUniqueness",
  async (plateNumber, { rejectWithValue }) => {
    try {
      console.log("🔍 Checking plate uniqueness:", plateNumber)
      const response = await axiosInstance.get(`${API_URL}/check-plate/${plateNumber}`)
      console.log("✅ Plate check result:", response.data)
      return response.data
    } catch (err) {
      console.error("❌ Plate check error:", err)
      // For now, assume plate is unique if endpoint fails
      if (err.response?.status === 404) {
        console.log("🔄 Endpoint not found, assuming plate is unique")
        return { isUnique: true }
      }
      return rejectWithValue(err.response?.data?.message || "Failed to check plate uniqueness")
    }
  }
)
