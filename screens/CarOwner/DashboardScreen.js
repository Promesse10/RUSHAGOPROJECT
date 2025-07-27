"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDispatch, useSelector } from "react-redux"
import { fetchDashboardStats } from "../../redux/action/DashboardActions"

const { width, height } = Dimensions.get("window")

const DashboardScreen = () => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  // ✅ FIXED: Get authenticated user data
  const { user, isAuthenticated } = useSelector((state) => state.auth || {})
  const {
    totalCars,
    activeCars,
    pendingCars,
    recentActivity,
    loading: dashboardLoading,
    error: dashboardError,
  } = useSelector((state) => state.dashboard || {})

  const [stats, setStats] = useState([])
  const [activities, setActivities] = useState([])
  const [newCarName, setNewCarName] = useState("")
  const [showLanguageOptions, setShowLanguageOptions] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [expandedNotifications, setExpandedNotifications] = useState({})
  const [currentLanguage, setCurrentLanguage] = useState("rw")
  const [hasNewNotifications, setHasNewNotifications] = useState(true)
  const [notifications, setNotifications] = useState([])

  // RushGo logo URL
  const rushGoLogo = "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228499/logo_jlnvdx.png"

  // ✅ FIXED: Check authentication and load data
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("❌ User not authenticated, should redirect to login...")
      return
    }

    console.log("✅ User authenticated:", user.name)
    loadSavedLanguage()
    dispatch(fetchDashboardStats())
  }, [isAuthenticated, user, dispatch])

  // ✅ FIXED: Refetch when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (isAuthenticated && user) {
        console.log("🔄 Dashboard focused, refetching stats...")
        dispatch(fetchDashboardStats())
      }
    })

    return unsubscribe
  }, [navigation, dispatch, isAuthenticated, user])

  // Load saved language preference
  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("user_language")
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
        i18n.changeLanguage(savedLanguage)
      } else {
        // Set default to Kinyarwanda
        setCurrentLanguage("rw")
        i18n.changeLanguage("rw")
        await AsyncStorage.setItem("user_language", "rw")
      }
    } catch (error) {
      console.log("Error loading language:", error)
      setCurrentLanguage("rw")
      i18n.changeLanguage("rw")
    }
  }

  // ✅ FIXED: Better data processing
  useEffect(() => {
    if (!dashboardLoading) {
      console.log("📈 Processing dashboard data:", { totalCars, activeCars, pendingCars })

      setStats([
        {
          title: t("totalCars", "Ibinyabiziga byose"),
          count: totalCars || 0,
          icon: "car-outline",
          color: "#007EFD",
        },
        {
          title: t("active", "Bikora"),
          count: activeCars || 0,
          icon: "checkmark-circle-outline",
          color: "#10B981",
        },
        {
          title: t("pending", "Bitegereje"),
          count: pendingCars || 0,
          icon: "time-outline",
          color: "#F59E0B",
        },
      ])

      // ✅ FIXED: Better activity processing
      if (recentActivity && Array.isArray(recentActivity)) {
        const activityData = recentActivity.map((item, index) => ({
          id: item.id || index,
          message: item.message || item.title || item.name || "Recent activity",
          time: item.time || item.createdAt || "Just now",
          icon: item.icon || "star-outline",
          color: item.color || "#007EFD",
        }))
        setActivities(activityData)
      } else {
        // Default activities if none from API
        setActivities([
          {
            id: 1,
            message: t("welcomeMessage", "Welcome to RushGo!"),
            time: t("justNow", "Just now"),
            icon: "star-outline",
            color: "#007EFD",
          },
        ])
      }
    }
  }, [dashboardLoading, t, totalCars, activeCars, pendingCars, recentActivity])

  // Update data when language changes
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchDashboardStats())
    }
  }, [i18n.language, dispatch, isAuthenticated, user])

  const handleAddCar = () => {
    if (newCarName.trim()) {
      navigation.navigate("AddCar", {
        draftData: {
          formData: {
            make: newCarName.trim(),
            customMake: "",
            year: "",
            type: "",
            phone: user?.phone || "+250 788 123 456",
            ownerType: "individual",
            companyName: "",
            companyPhone: "",
            transmission: "",
            fuelType: "",
            seats: "",
            features: [],
            address: "",
            latitude: "",
            longitude: "",
            pricingType: "daily",
            price: "",
            photos: {
              frontExterior: null,
              sideExterior: null,
              rearExterior: null,
              interior: null,
            },
          },
          currentStep: 1,
        },
      })
      setNewCarName("")
    }
  }

  const handleNotificationPress = () => {
    setShowNotifications(true)
    if (hasNewNotifications) {
      setHasNewNotifications(false)
    }
  }

  const toggleNotificationExpansion = (notificationId) => {
    setExpandedNotifications((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }))
    // Mark as read when expanded
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }

  const closeNotificationModal = () => {
    setShowNotifications(false)
    setExpandedNotifications({}) // Reset expanded states when closing
  }

  const changeLanguage = async (lng) => {
    try {
      setCurrentLanguage(lng)
      await i18n.changeLanguage(lng)
      await AsyncStorage.setItem("user_language", lng)
      setShowLanguageOptions(false)

      // Force re-render of data with new language
      setTimeout(() => {
        dispatch(fetchDashboardStats())
      }, 100)
    } catch (error) {
      console.log("Error changing language:", error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return "calendar-outline"
      case "approval":
        return "checkmark-circle-outline"
      case "payment":
        return "card-outline"
      case "maintenance":
        return "construct-outline"
      case "review":
        return "star-outline"
      case "reminder":
        return "notifications-outline"
      default:
        return "notifications-outline"
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "booking":
        return "#007EFD"
      case "approval":
        return "#10B981"
      case "payment":
        return "#8B5CF6"
      case "maintenance":
        return "#F59E0B"
      case "review":
        return "#EF4444"
      case "reminder":
        return "#007EFD"
      default:
        return "#64748B"
    }
  }

  const renderCurrentFlag = () => {
    if (currentLanguage === "rw") {
      return (
        <Image
          source={{
            uri: "https://media.istockphoto.com/id/1425795893/vector/the-national-flag-of-the-world-rwanda.jpg?s=612x612&w=0&k=20&c=t_Ax2BkNNhWWjcayvZW_JT7Wmlt8rHyRbcbNblhAzhg=",
          }}
          style={styles.dropdownFlag}
        />
      )
    } else if (currentLanguage === "en") {
      return (
        <Image
          source={{
            uri: "https://png.pngtree.com/png-clipart/20230821/original/pngtree-american-flag-icon-template-picture-image_8142643.png",
          }}
          style={styles.dropdownFlag}
        />
      )
    } else {
      return (
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/197/197560.png",
          }}
          style={styles.dropdownFlag}
        />
      )
    }
  }

  // ✅ FIXED: Show error state
  if (dashboardError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t("dashboard", "Imbonerahamwe")}</Text>
            <Text style={styles.subtitle}>
              {t("welcome", "Murakaza neza")} {user?.name || "User"}!
            </Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{dashboardError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchDashboardStats())}>
            <Text style={styles.retryButtonText}>{t("retry", "Retry")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ✅ FIXED: Show loading if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t("dashboard", "Imbonerahamwe")}</Text>
          <Text style={styles.subtitle}>
            {t("welcome", "Murakaza neza")} {user?.name || "User"}!
          </Text>
        </View>

        {/* Header Actions */}
        <View style={styles.headerActions}>
          {/* Notification Button */}
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
            {hasNewNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>

          {/* Language Selector */}
          <View style={{ position: "relative", marginLeft: 16 }}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguageOptions(!showLanguageOptions)}
            >
              {renderCurrentFlag()}
              <Ionicons name="chevron-down-outline" size={16} color="#64748B" style={styles.chevron} />
            </TouchableOpacity>

            {showLanguageOptions && (
              <View style={styles.dropdown}>
                <TouchableOpacity onPress={() => changeLanguage("rw")} style={styles.dropdownItem}>
                  <Image
                    source={{
                      uri: "https://media.istockphoto.com/id/1425795893/vector/the-national-flag-of-the-world-rwanda.jpg?s=612x612&w=0&k=20&c=t_Ax2BkNNhWWjcayvZW_JT7Wmlt8rHyRbcbNblhAzhg=",
                    }}
                    style={[styles.dropdownFlag, currentLanguage === "rw" && styles.selectedFlag]}
                  />
                  <Text style={styles.languageText}>Kinyarwanda</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("en")} style={styles.dropdownItem}>
                  <Image
                    source={{
                      uri: "https://png.pngtree.com/png-clipart/20230821/original/pngtree-american-flag-icon-template-picture-image_8142643.png",
                    }}
                    style={[styles.dropdownFlag, currentLanguage === "en" && styles.selectedFlag]}
                  />
                  <Text style={styles.languageText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeLanguage("fr")} style={styles.dropdownItem}>
                  <Image
                    source={{
                      uri: "https://cdn-icons-png.flaticon.com/512/197/197560.png",
                    }}
                    style={[styles.dropdownFlag, currentLanguage === "fr" && styles.selectedFlag]}
                  />
                  <Text style={styles.languageText}>Français</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Car */}
        <View style={styles.addCarContainer}>
          <Ionicons name="add-outline" size={24} color="#007EFD" />
          <TextInput
            style={styles.input}
            value={newCarName}
            onChangeText={setNewCarName}
            placeholder={t("enterCarName", "Andika ubwoko bw'imodoka (urugero: Toyota, BMW)...")}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCar}>
            <Text style={styles.addButtonText}>{t("add", "Ongeraho")}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("quickStats", "Imibare y'ibanze")}</Text>
          {dashboardLoading ? (
            <View style={styles.loadingStats}>
              <Text style={styles.loadingText}>{t("loading", "Loading...")}</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Ionicons name={stat.icon} size={32} color={stat.color} />
                  <Text style={styles.statCount}>{stat.count}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("recentActivity", "Ibikorwa bya vuba")}</Text>
          {dashboardLoading ? (
            <View style={styles.loadingStats}>
              <Text style={styles.loadingText}>{t("loading", "Loading...")}</Text>
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {activities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={[styles.activityIcon, { backgroundColor: `${activity.color}15` }]}>
                    <Ionicons name={activity.icon} size={20} color={activity.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityMessage}>{activity.message}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
        onRequestClose={closeNotificationModal}
      >
        <TouchableWithoutFeedback onPress={closeNotificationModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.notificationsModal}>
                <View style={styles.notificationsHeader}>
                  <Text style={styles.notificationsTitle}>{t("notifications", "Amakuru")}</Text>
                  <TouchableOpacity onPress={closeNotificationModal} style={styles.closeButton}>
                    <Ionicons name="close-outline" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                  {notifications.map((notification) => (
                    <View key={notification.id} style={styles.notificationItemContainer}>
                      <TouchableOpacity
                        style={styles.notificationItem}
                        onPress={() => toggleNotificationExpansion(notification.id)}
                      >
                        <View style={styles.notificationMainContent}>
                          {notification.hasRushGoIcon ? (
                            <Image source={{ uri: rushGoLogo }} style={styles.rushGoIcon} />
                          ) : (
                            <View
                              style={[
                                styles.notificationIconContainer,
                                { backgroundColor: `${getNotificationColor(notification.type)}15` },
                              ]}
                            >
                              <Ionicons
                                name={getNotificationIcon(notification.type)}
                                size={20}
                                color={getNotificationColor(notification.type)}
                              />
                            </View>
                          )}
                          <View style={styles.notificationContent}>
                            <Text
                              style={[
                                styles.notificationTitle,
                                { color: notification.isRead ? "#64748B" : "#1E293B" },
                                !notification.isRead && styles.unreadNotificationTitle,
                              ]}
                            >
                              {notification.title}
                            </Text>
                            <Text style={styles.notificationMessage} numberOfLines={2}>
                              {notification.message}
                            </Text>
                            <Text style={styles.notificationTime}>{notification.time}</Text>
                          </View>
                          <View style={styles.notificationActions}>
                            {!notification.isRead && <View style={styles.unreadIndicator} />}
                            <Ionicons
                              name={
                                expandedNotifications[notification.id] ? "chevron-up-outline" : "chevron-down-outline"
                              }
                              size={16}
                              color="#9CA3AF"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Expanded Content */}
                      {expandedNotifications[notification.id] && (
                        <View style={styles.expandedContent}>
                          <Text style={styles.expandedMessage}>{notification.fullMessage}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Language Options Overlay */}
      {showLanguageOptions && (
        <TouchableWithoutFeedback onPress={() => setShowLanguageOptions(false)}>
          <View style={styles.languageOverlay} />
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  chevron: {
    marginLeft: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addCarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007EFD",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    backgroundColor: "#FFFFFF",
    shadowColor: "#007EFD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
  },
  addButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1E293B",
  },
  loadingStats: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCount: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
    color: "#1E293B",
  },
  statTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    color: "#64748B",
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    justifyContent: "center",
  },
  activityMessage: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#1E293B",
  },
  activityTime: {
    fontSize: 14,
    color: "#64748B",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
    minWidth: 150,
    borderWidth: 1,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dropdownFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedFlag: {
    borderColor: "#007EFD",
  },
  languageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  languageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 998,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsModal: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    maxHeight: height * 0.6,
  },
  notificationItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationItem: {
    padding: 16,
  },
  notificationMainContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rushGoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: "600",
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
    color: "#64748B",
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007EFD",
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  expandedMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: "#1E293B",
  },
})

export default DashboardScreen
