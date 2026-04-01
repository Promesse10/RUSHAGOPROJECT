import React, { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Vibration } from "react-native"
import AppNavigator from "./AppNavigator"
import { I18nProvider } from "../utils/i18n"
import { AppContextProvider } from "../context/AppContext"
import { ThemeProvider } from "../navigation/theme-context"
import { Provider, useDispatch, useSelector } from "react-redux"
import store from "../redux/store"
import { loadAuthFromStorage } from "../redux/action/LoginActions"
import { fetchNotifications } from "../redux/action/notificationActions"
import { fetchDashboardStats } from "../redux/action/DashboardActions"
import * as Linking from "expo-linking"
import { NavigationContainer } from "@react-navigation/native"
import * as Notifications from 'expo-notifications'
import { io } from 'socket.io-client'
// ✅ Define deep linking prefixes (for Expo Go + your website + custom URI)
const prefix = Linking.createURL("/") // works for Expo Go
const linking = {
  prefixes: [
    prefix,
    "MUVCAR://", // your app custom scheme (use same in backend email link)
    "https://MUVCAR.com", // if you host a website domain
    "http://localhost:3000", // for local testing
  ],
  config: {
    screens: {
      ResetPasswordScreen: "reset-password", // matches link path in email
    },
  },
}

const Startup = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth || {})
  const notifications = useSelector((state) => state.notifications?.notifications ?? [])
  const [globalNotificationToast, setGlobalNotificationToast] = useState(false)
  const [globalNotificationText, setGlobalNotificationText] = useState("New notification received")
  const prevNotificationsRef = useRef([])
  const lastNotificationIdRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  useEffect(() => {
    // App opened from killed state by notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        console.log("🔔 Opened from quit state:", response)
        dispatch(fetchNotifications())
      }
    })

    // App opened from background by notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔔 Opened from background:", response)
      dispatch(fetchNotifications())
    })

    // App receives a notification while app is foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("🔔 Foreground notification received:", notification)
      dispatch(fetchNotifications())
    })

    return () => {
      responseSubscription.remove()
      receivedSubscription.remove()
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(loadAuthFromStorage())
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    dispatch(fetchNotifications())

    // Aggressive polling every 6 seconds for frontend-only real-time detection
    pollingIntervalRef.current = setInterval(() => {
      dispatch(fetchNotifications())
    }, 6000)

    // Real-time socket updates (if backend supports)
    const socket = io(`${process.env.EXPO_PUBLIC_API_URL}`)

    socket.on("connect", () => {
      console.log("🔗 Socket connected:", socket.id)
    })

    socket.on("notification", (data) => {
      console.log("🔗 Socket notification event received:", data)
      dispatch(fetchNotifications())
      dispatch(fetchDashboardStats())
    })

    socket.on("carUpdated", (payload) => {
      console.log("🔗 Socket carUpdated event:", payload)
      dispatch(fetchDashboardStats())
    })

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      socket.disconnect()
    }
  }, [dispatch, isAuthenticated])

  // Monitor for NEW notifications via polling comparison
  useEffect(() => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      prevNotificationsRef.current = notifications
      return
    }

    const prevNotifications = prevNotificationsRef.current
    const prevIds = prevNotifications.map((n) => n._id || n.id)

    // Detect newly added notifications
    const newNotifications = notifications.filter((n) => {
      const id = n._id || n.id
      return !prevIds.includes(id)
    })

    if (newNotifications.length > 0) {
      const label = newNotifications.length === 1 ? "New notification received" : `${newNotifications.length} new notifications`
      setGlobalNotificationText(label)
      setGlobalNotificationToast(true)
      Vibration.vibrate([0, 500, 200, 500])

      setTimeout(() => {
        setGlobalNotificationToast(false)
      }, 1800)
    }

    // Trigger local notification for each new unread notification and prevent duplicates
    newNotifications.forEach((notification) => {
      const notificationId = notification._id || notification.id

      if (lastNotificationIdRef.current === notificationId) {
        console.log("⏭️ Skipping duplicate notification:", notificationId)
        return
      }

      lastNotificationIdRef.current = notificationId

      console.log("🎉 NEW NOTIFICATION DETECTED:", notification.title)

      Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title || "New Notification",
          body: notification.message || "You have a new message",
          data: {
            notificationId: notificationId,
            type: notification.type || "default",
          },
          sound: "default",
          vibrate: [0, 500, 200, 500],
          priority: "high",
          badge: 1,
        },
        trigger: null,
      })
    })

    // Update reference for next comparison
    prevNotificationsRef.current = notifications
  }, [notifications])

  return (
    <I18nProvider>
      <AppContextProvider>
        <ThemeProvider>
          {/* ✅ Add NavigationContainer with linking config */}
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>

          {globalNotificationToast && (
            <View style={styles.globalNotificationToast} pointerEvents="none">
              <Text style={styles.globalNotificationToastText}>{globalNotificationText}</Text>
            </View>
          )}
        </ThemeProvider>
      </AppContextProvider>
    </I18nProvider>
  )
}

const styles = StyleSheet.create({
  globalNotificationToast: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  globalNotificationToastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
})

const App = () => (
  <Provider store={store}>
    <Startup />
  </Provider>
)

export default App
