import { createSlice } from "@reduxjs/toolkit"
import {
  getCarsAction,
  getMyCarsAction,
  createCarAction,
  updateCarAction,
  updateCarAvailabilityAction,
  updateCarViewsAction,
  updateCarRatingAction,
  deleteCarAction,
} from "../action/CarActions"

const initialState = {
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  isGetSuccess: false,
  isCreateSuccess: false,
  isUpdateSuccess: false,
  isDeleteSuccess: false,

  isGetFailed: false,
  isCreateFailed: false,
  isUpdateFailed: false,
  isDeleteFailed: false,

  cars: [],
  selectedCar: null,

  error: null,
  createError: null,
  updateError: null,
  deleteError: null,

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
      // Get my cars
      .addCase(getMyCarsAction.pending, (state) => {
        state.isLoading = true
        state.isGetSuccess = false
        state.isGetFailed = false
        state.error = null
      })
      .addCase(getMyCarsAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.isGetSuccess = true
        state.cars = action.payload
        state.totalCars = action.payload.length
      })
      .addCase(getMyCarsAction.rejected, (state, action) => {
        state.isLoading = false
        state.isGetFailed = true
        state.error = action.payload || "Failed to fetch your cars"
      })

      // Get all cars
      .addCase(getCarsAction.pending, (state) => {
        state.isLoading = true
        state.isGetSuccess = false
        state.isGetFailed = false
        state.error = null
      })
      .addCase(getCarsAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.isGetSuccess = true
        state.cars = action.payload
        state.totalCars = action.payload.length
      })
      .addCase(getCarsAction.rejected, (state, action) => {
        state.isLoading = false
        state.isGetFailed = true
        state.error = action.payload || "Failed to fetch cars"
      })

      // Create car
      .addCase(createCarAction.pending, (state) => {
        state.isCreating = true
        state.isCreateSuccess = false
        state.isCreateFailed = false
        state.createError = null
      })
      .addCase(createCarAction.fulfilled, (state, action) => {
        state.isCreating = false
        state.isCreateSuccess = true
        state.cars.unshift(action.payload)
        state.totalCars += 1
      })
      .addCase(createCarAction.rejected, (state, action) => {
        state.isCreating = false
        state.isCreateFailed = true
        state.createError = action.payload || "Failed to create car"
      })

      // Update car
      .addCase(updateCarAction.pending, (state) => {
        state.isUpdating = true
        state.isUpdateSuccess = false
        state.isUpdateFailed = false
        state.updateError = null
      })
      .addCase(updateCarAction.fulfilled, (state, action) => {
        state.isUpdating = false
        state.isUpdateSuccess = true
        const index = state.cars.findIndex((car) => car._id === action.payload._id)
        if (index !== -1) {
          state.cars[index] = action.payload
        }
        if (state.selectedCar && state.selectedCar._id === action.payload._id) {
          state.selectedCar = action.payload
        }
      })
      .addCase(updateCarAction.rejected, (state, action) => {
        state.isUpdating = false
        state.isUpdateFailed = true
        state.updateError = action.payload || "Failed to update car"
      })

      // Update car availability
      .addCase(updateCarAvailabilityAction.fulfilled, (state, action) => {
        const { carId, available } = action.payload
        const index = state.cars.findIndex((car) => car._id === carId)
        if (index !== -1) {
          state.cars[index].available = available
        }
      })

      // Update car views
      .addCase(updateCarViewsAction.fulfilled, (state, action) => {
        const { carId, views } = action.payload
        const index = state.cars.findIndex((car) => car._id === carId)
        if (index !== -1) {
          state.cars[index].views = views
        }
      })

      // Update car rating
      .addCase(updateCarRatingAction.fulfilled, (state, action) => {
        const { carId, rating, reviews } = action.payload
        const index = state.cars.findIndex((car) => car._id === carId)
        if (index !== -1) {
          state.cars[index].rating = rating
          state.cars[index].reviews = reviews
        }
      })

      // Delete car
      .addCase(deleteCarAction.pending, (state) => {
        state.isDeleting = true
        state.isDeleteSuccess = false
        state.isDeleteFailed = false
        state.deleteError = null
      })
      .addCase(deleteCarAction.fulfilled, (state, action) => {
        state.isDeleting = false
        state.isDeleteSuccess = true
        state.cars = state.cars.filter((car) => car._id !== action.payload)
        state.totalCars -= 1
        if (state.selectedCar && state.selectedCar._id === action.payload) {
          state.selectedCar = null
        }
      })
      .addCase(deleteCarAction.rejected, (state, action) => {
        state.isDeleting = false
        state.isDeleteFailed = true
        state.deleteError = action.payload || "Failed to delete car"
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
