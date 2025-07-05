"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    // Return default theme instead of throwing error
    return {
      isDarkMode: false,
      toggleDarkMode: () => {},
      isLoading: true,
      colors: lightColors,
    }
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme_preference")
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark")
      }
    } catch (error) {
      console.log("Error loading theme preference:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDarkMode = async (value) => {
    try {
      setIsDarkMode(value)
      await AsyncStorage.setItem("theme_preference", value ? "dark" : "light")
    } catch (error) {
      console.log("Error saving theme preference:", error)
    }
  }

  const theme = {
    isDarkMode,
    toggleDarkMode,
    isLoading,
    colors: isDarkMode ? darkColors : lightColors,
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

// Light theme colors
const lightColors = {
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  text: "#1E293B",
  textSecondary: "#64748B",
  textTertiary: "#9CA3AF",
  border: "#E2E8F0",
  primary: "#007EFD",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  headerBackground: "#FFFFFF",
  inputBackground: "#F8FAFC",
  statusBarStyle: "dark-content",
  statusBarBackground: "#FFFFFF",
}

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  cardBackground: "#1E293B",
  text: "#F1F5F9",
  textSecondary: "#CBD5E1",
  textTertiary: "#64748B",
  border: "#334155",
  primary: "#007EFD",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  headerBackground: "#1E293B",
  inputBackground: "#334155",
  statusBarStyle: "light-content",
  statusBarBackground: "#1E293B",
}
