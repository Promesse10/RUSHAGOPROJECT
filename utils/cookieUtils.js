import Cookies from "js-cookie"

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
}

// General cookie functions
export const setUserCookie = (key, value) => {
  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value)
    Cookies.set(key, stringValue, COOKIE_OPTIONS)
  } catch (error) {
    console.error("Error setting cookie:", error)
  }
}

export const getUserCookie = (key) => {
  try {
    const value = Cookies.get(key)
    if (!value) return null

    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  } catch (error) {
    console.error("Error getting cookie:", error)
    return null
  }
}

export const removeUserCookie = (key) => {
  try {
    Cookies.remove(key)
  } catch (error) {
    console.error("Error removing cookie:", error)
  }
}

// User email functions
export const setUserEmail = (email) => {
  setUserCookie("userEmail", email)
}

export const getUserEmail = () => {
  return getUserCookie("userEmail")
}

// User data functions
export const setUserData = (userData) => {
  const userEmail = getUserEmail()
  if (userEmail) {
    setUserCookie(`user_${userEmail}`, userData)
  }
}

export const getUserData = (email = null) => {
  const userEmail = email || getUserEmail()
  if (userEmail) {
    return getUserCookie(`user_${userEmail}`)
  }
  return null
}

// Language functions
export const setLanguage = (language) => {
  setUserCookie("user_language", language)
}

export const getLanguage = () => {
  return getUserCookie("user_language") || "rw"
}

// Draft functions
export const setDraftCookie = (drafts) => {
  setUserCookie("savedDrafts", drafts)
}

export const getDraftCookie = () => {
  return getUserCookie("savedDrafts") || []
}

// Clear all user cookies
export const clearAllUserCookies = () => {
  const userEmail = getUserEmail()
  if (userEmail) {
    removeUserCookie(`user_${userEmail}`)
  }
  removeUserCookie("userEmail")
  removeUserCookie("user_language")
  removeUserCookie("savedDrafts")
}
