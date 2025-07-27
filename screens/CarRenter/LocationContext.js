"use client"

import { createContext, useContext, useState } from "react"
import { Alert, PermissionsAndroid, Platform } from "react-native"
import { Geolocation } from 'react-native';

const LocationContext = createContext()

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: "Location Permission",
          message: "This app needs access to your location to show nearby cars.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true
  }

  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({
          latitude,
          longitude,
          address: "Kigali, Rwanda", // This would be geocoded in a real app
        })
        setLoading(false)
      },
      (error) => {
        console.error("Location error:", error)
        setError(error.message)
        setLoading(false)
        Alert.alert("Location Error", "Unable to get your current location")
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    )
  }

  const requestLocation = async () => {
    const hasPermission = await requestLocationPermission()
    if (hasPermission) {
      getCurrentLocation()
    } else {
      Alert.alert("Permission Denied", "Location permission is required to show nearby cars")
    }
  }

  const value = {
    location,
    loading,
    error,
    requestLocation,
    getCurrentLocation,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}
