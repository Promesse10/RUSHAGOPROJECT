import { createSlice } from "@reduxjs/toolkit"
import {
  getApprovedCarsAction,
  getCarsAction,
  getMyCarsAction,
  createCarAction,
  updateCarAction,
  updateCarAvailabilityAction,
  updateCarViewsAction,
  updateCarRatingAction,
  deleteCarAction,
  incrementCarViewAction,
  checkPlateUniquenessAction,
} from "../action/CarActions"

const initialState = {
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isCheckingPlate: false,

  isGetSuccess: false,
  isCreateSuccess: false,
  isUpdateSuccess: false,
  isDeleteSuccess: false,

  isGetFailed: false,
  isCreateFailed: false,
  isUpdateFailed: false,
  isDeleteFailed: false,

  cars: [], // all cars (e.g. admin, owner, etc.)
  approvedCars: [], // specific to approved cars
  approvedCarsLoading: false,
  approvedCarsError: null,

  selectedCar: null,

  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  plateCheckError: null,
  isPlateUnique: null,

  totalCars: 0,
  currentPage: 1,
  filters: {
    status: "all",
    category: "all",
    availability: "all",
  },
}

const carSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {
    clearCarState: (state) => {
      Object.assign(state, initialState)
    },
    clearCreateState: (state) => {
      state.isCreating = false
      state.isCreateSuccess = false
      state.isCreateFailed = false
      state.createError = null
    },
    clearUpdateState: (state) => {
      state.isUpdating = false
      state.isUpdateSuccess = false
      state.isUpdateFailed = false
      state.updateError = null
    },
    clearDeleteState: (state) => {
      state.isDeleting = false
      state.isDeleteSuccess = false
      state.isDeleteFailed = false
      state.deleteError = null
    },
    setSelectedCar: (state, action) => {
      state.selectedCar = action.payload
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    builder

      // Get My Cars
      .addCase(getMyCarsAction.pending, (state) => {
        state.isLoading = true
        state.isGetSuccess = false
        state.isGetFailed = false
        state.error = null
      })
      .addCase(getMyCarsAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.isGetSuccess = true
        state.cars = action.payload || []
        state.totalCars = (action.payload || []).length
      })
      .addCase(getMyCarsAction.rejected, (state, action) => {
        state.isLoading = false
        state.isGetFailed = true
        state.error = action.payload || "Failed to fetch your cars"
      })

      // Get All Cars
      .addCase(getCarsAction.pending, (state) => {
        state.isLoading = true
        state.isGetSuccess = false
        state.isGetFailed = false
        state.error = null
      })
      .addCase(getCarsAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.isGetSuccess = true
        state.cars = action.payload || []
        state.totalCars = (action.payload || []).length
      })
      .addCase(getCarsAction.rejected, (state, action) => {
        state.isLoading = false
        state.isGetFailed = true
        state.error = action.payload || "Failed to fetch cars"
      })
// ✅ Increment Car View
.addCase(incrementCarViewAction.fulfilled, (state, action) => {
  const { carId, views } = action.payload
  const index = state.cars.findIndex((car) => car._id === carId)
  if (index !== -1) state.cars[index].views = views

  const approvedIndex = state.approvedCars.findIndex((car) => car._id === carId)
  if (approvedIndex !== -1) state.approvedCars[approvedIndex].views = views
})

      // ✅ Get Approved Cars - Enhanced
      .addCase(getApprovedCarsAction.pending, (state) => {
        state.approvedCarsLoading = true
        state.approvedCarsError = null
        state.isLoading = true // Also set general loading for compatibility
      })
      .addCase(getApprovedCarsAction.fulfilled, (state, action) => {
        state.approvedCarsLoading = false
        state.isLoading = false
        state.approvedCars = action.payload || []
        state.isGetSuccess = true
        console.log("✅ Approved cars loaded in Redux:", (action.payload || []).length)
      })
      .addCase(getApprovedCarsAction.rejected, (state, action) => {
        state.approvedCarsLoading = false
        state.isLoading = false
        state.approvedCarsError = action.payload || "Failed to fetch approved cars"
        state.isGetFailed = true
        state.error = action.payload || "Failed to fetch approved cars"
        console.error("❌ Failed to load approved cars:", action.payload)
      })

      // Create Car
      .addCase(createCarAction.pending, (state) => {
        state.isCreating = true
        state.isCreateSuccess = false
        state.isCreateFailed = false
        state.createError = null
      })
      .addCase(createCarAction.fulfilled, (state, action) => {
        state.isCreating = false
        state.isCreateSuccess = true
        if (action.payload) {
          state.cars.unshift(action.payload)
          state.totalCars += 1
        }
      })
      .addCase(createCarAction.rejected, (state, action) => {
        state.isCreating = false
        state.isCreateFailed = true
        state.createError = action.payload || "Failed to create car"
      })

      // Update Car
      .addCase(updateCarAction.pending, (state) => {
        state.isUpdating = true
        state.isUpdateSuccess = false
        state.isUpdateFailed = false
        state.updateError = null
      })
      .addCase(updateCarAction.fulfilled, (state, action) => {
        state.isUpdating = false
        state.isUpdateSuccess = true
        if (action.payload) {
          // Update in cars array
          const index = state.cars.findIndex((car) => car._id === action.payload._id)
          if (index !== -1) state.cars[index] = action.payload

          // Update in approvedCars array
          const approvedIndex = state.approvedCars.findIndex((car) => car._id === action.payload._id)
          if (approvedIndex !== -1) state.approvedCars[approvedIndex] = action.payload

          // Update selected car
          if (state.selectedCar?._id === action.payload._id) {
            state.selectedCar = action.payload
          }
        }
      })
      .addCase(updateCarAction.rejected, (state, action) => {
        state.isUpdating = false
        state.isUpdateFailed = true
        state.updateError = action.payload || "Failed to update car"
      })

      // Update Car Availability
      .addCase(updateCarAvailabilityAction.fulfilled, (state, action) => {
        if (action.payload) {
          const { carId, available } = action.payload

          // Update in cars array
          const index = state.cars.findIndex((car) => car._id === carId)
          if (index !== -1) {
            state.cars[index].available = available
          }

          // Update in approvedCars array
          const approvedIndex = state.approvedCars.findIndex((car) => car._id === carId)
          if (approvedIndex !== -1) {
            state.approvedCars[approvedIndex].available = available
          }
        }
      })


      // Update Rating
      .addCase(updateCarRatingAction.fulfilled, (state, action) => {
        if (action.payload) {
          const { carId, rating, reviews } = action.payload

          // Update in cars array
          const index = state.cars.findIndex((car) => car._id === carId)
          if (index !== -1) {
            state.cars[index].rating = rating
            state.cars[index].reviews = reviews
          }

          // Update in approvedCars array
          const approvedIndex = state.approvedCars.findIndex((car) => car._id === carId)
          if (approvedIndex !== -1) {
            state.approvedCars[approvedIndex].rating = rating
            state.approvedCars[approvedIndex].reviews = reviews
          }
        }
      })

      // Delete Car
      .addCase(deleteCarAction.pending, (state) => {
        state.isDeleting = true
        state.isDeleteSuccess = false
        state.isDeleteFailed = false
        state.deleteError = null
      })
      .addCase(deleteCarAction.fulfilled, (state, action) => {
        state.isDeleting = false
        state.isDeleteSuccess = true
        if (action.payload) {
          // Remove from cars array
          state.cars = state.cars.filter((car) => car._id !== action.payload)

          // Remove from approvedCars array
          state.approvedCars = state.approvedCars.filter((car) => car._id !== action.payload)

          state.totalCars -= 1

          // Clear selected car if it was deleted
          if (state.selectedCar?._id === action.payload) {
            state.selectedCar = null
          }
        }
      })
      .addCase(deleteCarAction.rejected, (state, action) => {
        state.isDeleting = false
        state.isDeleteFailed = true
        state.deleteError = action.payload || "Failed to delete car"
      })

      // Check Plate Uniqueness
      .addCase(checkPlateUniquenessAction.pending, (state) => {
        state.isCheckingPlate = true
        state.plateCheckError = null
        state.isPlateUnique = null
      })
      .addCase(checkPlateUniquenessAction.fulfilled, (state, action) => {
        state.isCheckingPlate = false
        state.isPlateUnique = action.payload?.isUnique || false
        state.plateCheckError = null
      })
      .addCase(checkPlateUniquenessAction.rejected, (state, action) => {
        state.isCheckingPlate = false
        state.isPlateUnique = false
        state.plateCheckError = action.payload || "Failed to check plate uniqueness"
      })
  },
})

export const {
  clearCarState,
  clearCreateState,
  clearUpdateState,
  clearDeleteState,
  setSelectedCar,
  updateFilters,
  setCurrentPage,
} = carSlice.actions

export default carSlice.reducer
