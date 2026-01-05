"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDispatch, useSelector } from "react-redux"
import { fetchDashboardStats } from "../../redux/action/DashboardActions"
import { io } from "socket.io-client"
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../redux/action/notificationActions"
import LoadingSkeleton from "../../components/Map/LoadingSkeleton"
import NotificationBottomSheet from "../../components/NotificationBottomSheet"



const { width, height } = Dimensions.get("window")

const DashboardScreen = () => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  // ✅ Get authenticated user data from correct slice
  const { user, isAuthenticated } = useSelector((state) => state.auth || {})
  const {
    totalListings,
    activeListings,
    pendingListings,
    recentActivity,
    loading: dashboardLoading,
    error: dashboardError,
  } = useSelector((state) => state.dashboard || {})

  const notifications = useSelector((state) => state.notifications?.notifications || [])
  const isLoadingNotifications = useSelector((state) => state.notifications?.isLoading)
  const errorNotifications = useSelector((state) => state.notifications?.error)

  const [stats, setStats] = useState([])
  const [activities, setActivities] = useState([])
  const socket = io(`${process.env.EXPO_PUBLIC_API_URL}`)

  const [currentCarIndex, setCurrentCarIndex] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const textFadeAnim = useRef(new Animated.Value(1)).current

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0

  const carBrands = [
    // Japanese Brands
    { id: 1, name: "Toyota", logo: "https://www.carlogos.org/car-logos/toyota-logo.png" },
    { id: 2, name: "Honda", logo: "https://www.carlogos.org/car-logos/honda-logo.png" },
    { id: 3, name: "Nissan", logo: "https://www.carlogos.org/car-logos/nissan-logo.png" },
    { id: 4, name: "Mazda", logo: "https://www.carlogos.org/car-logos/mazda-logo.png" },
    { id: 5, name: "Subaru", logo: "https://www.carlogos.org/car-logos/subaru-logo.png" },
    { id: 6, name: "Mitsubishi", logo: "https://www.carlogos.org/car-logos/mitsubishi-logo.png" },
    { id: 7, name: "Suzuki", logo: "https://www.carlogos.org/car-logos/suzuki-logo.png" },
    { id: 8, name: "Lexus", logo: "https://www.carlogos.org/car-logos/lexus-logo.png" },
    { id: 9, name: "Infiniti", logo: "https://www.carlogos.org/car-logos/infiniti-logo.png" },
    { id: 10, name: "Acura", logo: "https://www.carlogos.org/car-logos/acura-logo.png" },

    // German Brands
    { id: 11, name: "BMW", logo: "https://www.carlogos.org/car-logos/bmw-logo.png" },
    { id: 12, name: "Mercedes-Benz", logo: "https://www.carlogos.org/car-logos/mercedes-benz-logo.png" },
    { id: 13, name: "Audi", logo: "https://www.carlogos.org/car-logos/audi-logo.png" },
    { id: 14, name: "Volkswagen", logo: "https://www.carlogos.org/car-logos/volkswagen-logo.png" },
    { id: 15, name: "Porsche", logo: "https://www.carlogos.org/car-logos/porsche-logo.png" },
    { id: 16, name: "Opel", logo: "https://www.carlogos.org/car-logos/opel-logo.png" },

    // American Brands
    { id: 17, name: "Ford", logo: "https://www.carlogos.org/car-logos/ford-logo.png" },
    { id: 18, name: "Chevrolet", logo: "https://www.carlogos.org/car-logos/chevrolet-logo.png" },
    { id: 19, name: "Tesla", logo: "https://www.carlogos.org/car-logos/tesla-logo.png" },
    { id: 20, name: "Jeep", logo: "https://www.carlogos.org/car-logos/jeep-logo.png" },
    { id: 21, name: "Dodge", logo: "https://www.carlogos.org/car-logos/dodge-logo.png" },
    { id: 22, name: "Cadillac", logo: "https://www.carlogos.org/car-logos/cadillac-logo.png" },
    { id: 23, name: "GMC", logo: "https://www.carlogos.org/car-logos/gmc-logo.png" },
    { id: 24, name: "Buick", logo: "https://www.carlogos.org/car-logos/buick-logo.png" },
    { id: 25, name: "Lincoln", logo: "https://www.carlogos.org/car-logos/lincoln-logo.png" },
    { id: 26, name: "Ram", logo: "https://www.carlogos.org/car-logos/ram-logo.png" },

    // Italian Brands
    { id: 27, name: "Ferrari", logo: "https://www.carlogos.org/car-logos/ferrari-logo.png" },
    { id: 28, name: "Lamborghini", logo: "https://www.carlogos.org/car-logos/lamborghini-logo.png" },
    { id: 29, name: "Maserati", logo: "https://www.carlogos.org/car-logos/maserati-logo.png" },
    { id: 30, name: "Alfa Romeo", logo: "https://www.carlogos.org/car-logos/alfa-romeo-logo.png" },
    { id: 31, name: "Fiat", logo: "https://www.carlogos.org/car-logos/fiat-logo.png" },

    // Korean Brands
    { id: 32, name: "Hyundai", logo: "https://www.carlogos.org/car-logos/hyundai-logo.png" },
    { id: 33, name: "Kia", logo: "https://www.carlogos.org/car-logos/kia-logo.png" },
    { id: 34, name: "Genesis", logo: "https://www.carlogos.org/car-logos/genesis-logo.png" },

    // Swedish Brands
    { id: 35, name: "Volvo", logo: "https://www.carlogos.org/car-logos/volvo-logo.png" },
    { id: 36, name: "Saab", logo: "https://www.carlogos.org/car-logos/saab-logo.png" },

    // British Brands
    { id: 37, name: "Jaguar", logo: "https://www.carlogos.org/car-logos/jaguar-logo.png" },
    { id: 38, name: "Land Rover", logo: "https://www.carlogos.org/car-logos/land-rover-logo.png" },
    { id: 39, name: "Aston Martin", logo: "https://www.carlogos.org/car-logos/aston-martin-logo.png" },
    { id: 40, name: "Bentley", logo: "https://www.carlogos.org/car-logos/bentley-logo.png" },
    { id: 41, name: "Rolls-Royce", logo: "https://www.carlogos.org/car-logos/rolls-royce-logo.png" },
    { id: 42, name: "Mini", logo: "https://www.carlogos.org/car-logos/mini-logo.png" },

    // French Brands
    { id: 43, name: "Peugeot", logo: "https://www.carlogos.org/car-logos/peugeot-logo.png" },
    { id: 44, name: "Renault", logo: "https://www.carlogos.org/car-logos/renault-logo.png" },
    { id: 45, name: "Citroën", logo: "https://www.carlogos.org/car-logos/citroen-logo.png" },

    // Other European Brands
    { id: 46, name: "Skoda", logo: "https://www.carlogos.org/car-logos/skoda-logo.png" },
    { id: 47, name: "Seat", logo: "https://www.carlogos.org/car-logos/seat-logo.png" },

    // Luxury & Sports Brands
    { id: 48, name: "Bugatti", logo: "https://www.carlogos.org/car-logos/bugatti-logo.png" },
    { id: 49, name: "McLaren", logo: "https://www.carlogos.org/car-logos/mclaren-logo.png" },
    { id: 50, name: "Lotus", logo: "https://www.carlogos.org/car-logos/lotus-logo.png" },

    // Chinese Brands
    { id: 51, name: "BYD", logo: "https://www.carlogos.org/car-logos/byd-logo.png" },
    { id: 52, name: "Geely", logo: "https://www.carlogos.org/car-logos/geely-logo.png" },

    // Indian Brands
    { id: 53, name: "Tata", logo: "https://www.carlogos.org/car-logos/tata-logo.png" },
    { id: 54, name: "Mahindra", logo: "https://www.carlogos.org/car-logos/mahindra-logo.png" },
  ]

  const [showLanguageOptions, setShowLanguageOptions] = useState(false)
  const [showNotificationBottomSheet, setShowNotificationBottomSheet] = useState(false)
    // Fetch notifications on mount
    useEffect(() => {
      dispatch(fetchNotifications())
    }, [dispatch])
  const [expandedNotifications, setExpandedNotifications] = useState({})
  const [currentLanguage, setCurrentLanguage] = useState("rw")
  const [hasNewNotifications, setHasNewNotifications] = useState(true)

  const languages = [
    {
      code: "rw",
      name: "Kinyarwanda",
      flag: "https://flagcdn.com/w40/rw.png", // Rwanda
    },
    {
      code: "en",
      name: "English",
      flag: "https://flagcdn.com/w40/us.png", // USA
    },
    {
      code: "fr",
      name: "Français",
      flag: "https://flagcdn.com/w40/fr.png", // France
    },
  ];
  

  const rushGoLogo = "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228499/logo_jlnvdx.png"

  
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start()

      setCurrentCarIndex((prevIndex) => (prevIndex + 1) % carBrands.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server")
    })

    socket.on("carUpdated", (data) => {
      console.log("📡 Real-time update received:", data)
      dispatch(fetchDashboardStats())
    })

    return () => {
      socket.off("carUpdated")
      socket.disconnect()
    }
  }, [dispatch])
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated, user]);
  // 🔁 Poll for new notifications every 30 seconds
useEffect(() => {
  if (!isAuthenticated || !user) return;
  const interval = setInterval(() => {
    dispatch(fetchNotifications());
  }, 30000); // every 30 seconds

  return () => clearInterval(interval);
}, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("❌ User not authenticated, should redirect to login...")
      return
    }

    console.log("✅ User authenticated:", user.name)
    loadSavedLanguage()
    dispatch(fetchDashboardStats())
  }, [isAuthenticated, user, dispatch])

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (isAuthenticated && user) {
        console.log("🔄 Dashboard focused, refetching stats...")
        dispatch(fetchDashboardStats())
      }
    })

    return unsubscribe
  }, [navigation, dispatch, isAuthenticated, user])

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("user_language")
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
        i18n.changeLanguage(savedLanguage)
      } else {
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

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  // ✅ UPDATED: Process real dashboard data from API with better stats
  useEffect(() => {
    if (!dashboardLoading) {
      console.log("📈 Processing dashboard data:", { totalListings, activeListings, pendingListings })

      // Calculate additional stats
      const verifiedCars = activeListings || 0
      const pendingVerification = pendingListings || 0
      const totalCars = totalListings || 0
      const inactiveCars = Math.max(0, totalCars - verifiedCars - pendingVerification)

      setStats([
        {
          title: t("totalCars", "Ibinyabiziga byose"),
          count: totalCars,
          icon: "car-outline",
          color: "#007EFD",
          subtitle: t("allVehicles", "All vehicles"),
        },
        {
          title: t("activeCars", "Bikora"),
          count: verifiedCars,
          icon: "checkmark-circle-outline",
          color: "#10B981",
          subtitle: t("verified", "Verified & Active"),
        },
        {
          title: t("pendingCars", "Bitegereje"),
          count: pendingVerification,
          icon: "time-outline",
          color: "#F59E0B",
          subtitle: t("underReview", "Under review"),
        },
        {
          title: t("inactiveCars", "Bidakora"),
          count: inactiveCars,
          icon: "pause-circle-outline",
          color: "#EF4444",
          subtitle: t("notActive", "Not active"),
        },
      ])

      // ✅ UPDATED: Process recent activities from API with better formatting
      if (recentActivity && Array.isArray(recentActivity)) {
        const processedActivities = []

        recentActivity.forEach((activityGroup) => {
          if (activityGroup.type === "Your Car Listings" && activityGroup.data) {
            activityGroup.data.forEach((listing, index) => {
              processedActivities.push({
                id: `listing_${listing.title}_${index}_${Date.now()}`,
                message: ` ${t("carAdded", "Car added")}: ${listing.title}`,
                time: listing.time,
                icon: "car-outline",
                color: "#10B981",
              })
            })
          }

          if (activityGroup.type === "New Car Listings" && activityGroup.data) {
            activityGroup.data.forEach((listing, index) => {
              processedActivities.push({
                id: `new_listing_${listing.title}_${index}_${Date.now()}`,
                message: `✨ ${t("newListing", "New listing")}: ${listing.title}`,
                time: listing.time,
                icon: "add-circle-outline",
                color: "#007EFD",
              })
            })
          }

          if (activityGroup.type === "New Commissions" && activityGroup.data) {
            activityGroup.data.forEach((commission, index) => {
              processedActivities.push({
                id: `commission_${commission.user}_${index}_${Date.now()}`,
                message: `💰 ${t("commissionReceived", "Commission received")}: ${commission.amount} FRW`,
                time: commission.time,
                icon: "wallet-outline",
                color: "#8B5CF6",
              })
            })
          }
        })

        if (processedActivities.length > 0) {
          // Sort by most recent and limit to 10
          const sortedActivities = processedActivities
            .sort((a, b) => {
              // Simple time sorting - you might want to improve this
              if (a.time.includes("Just now")) return -1
              if (b.time.includes("Just now")) return 1
              return 0
            })
            .slice(0, 10)

          setActivities(sortedActivities)
        } else {
          // Default welcome activity
          setActivities([
            {
              id: 1,
              message: `🎉 ${t("welcomeMessage", "Welcome to RushGo!")}`,
              time: t("justNow", "Just now"),
              icon: "star-outline",
              color: "#007EFD",
            },
            {
              id: 2,
              message: `📱 ${t("startListing", "Start listing your cars to see activities here")}`,
              time: t("tip", "Tip"),
              icon: "information-circle-outline",
              color: "#64748B",
            },
          ])
        }
      } else {
        // Default activities if none from API
        setActivities([
          {
            id: 1,
            message: `🎉 ${t("welcomeMessage", "Welcome to RushGo!")}`,
            time: t("justNow", "Just now"),
            icon: "star-outline",
            color: "#007EFD",
          },
          {
            id: 2,
            message: `📱 ${t("startListing", "Start listing your cars to see activities here")}`,
            time: t("tip", "Tip"),
            icon: "information-circle-outline",
            color: "#64748B",
          },
        ])
      }
    }
  }, [dashboardLoading, t, totalListings, activeListings, pendingListings, recentActivity])

  // Update data when language changes
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchDashboardStats())
    }
  }, [i18n.language, dispatch, isAuthenticated, user])

  const handleAddCar = () => {
    navigation.navigate("AddCar")
  }

// Handle mark as read & expand
const handleNotificationPress = (notificationId, isRead) => {
  setExpandedNotifications((prev) => ({
    ...prev,
    [notificationId]: !prev[notificationId],
  }));

  // Mark as read if it was unread
  if (!isRead) {
    dispatch(markNotificationAsRead(notificationId));
  }
};


// Handle delete notification (long press)
const handleNotificationDelete = (notificationId) => {
  Alert.alert(
    "Delete Notification",
    "Are you sure you want to delete this notification?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteNotification(notificationId)),
      },
    ]
  );
};


  const toggleNotificationExpansion = (notificationId) => {
    setExpandedNotifications((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }))
 
    // Mark as read when expanded
  
  }

  const closeNotificationModal = () => {
    setShowNotificationBottomSheet(false)
    setExpandedNotifications({})
  }

  const changeLanguage = async (lng) => {
    try {
      setCurrentLanguage(lng)
      await i18n.changeLanguage(lng)
      await AsyncStorage.setItem("user_language", lng)
      setShowLanguageOptions(false)

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
      case "welcome":
        return "star-outline"
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
      case "welcome":
        return "#10B981"
      default:
        return "#64748B"
    }
  }

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === currentLanguage) || languages[0]
  }

  // ✅ Show error state
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

  // ✅ Show loading if not authenticated
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
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => setShowNotificationBottomSheet(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
            {unreadCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>

          <View style={{ position: "relative", marginLeft: 16 }}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguageOptions(!showLanguageOptions)}
            >
              <Image source={{ uri: getCurrentLanguage().flag }} style={styles.currentLanguageFlag} />
              <Ionicons name="chevron-down-outline" size={16} color="#64748B" style={styles.chevron} />
            </TouchableOpacity>

            {showLanguageOptions && (
              <View style={styles.languageDropdown}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={`language-${language.code}`}
                    style={[styles.languageOption, currentLanguage === language.code && styles.selectedLanguageOption]}
                    onPress={() => changeLanguage(language.code)}
                  >
                    <Image source={{ uri: language.flag }} style={styles.languageFlag} />
                    <Text style={styles.languageName}>{language.name}</Text>
                    {currentLanguage === language.code && <Ionicons name="checkmark" size={20} color="#007EFD" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.addCarSection}>
          <View style={styles.addCarHeader}>
            
          <Text style={styles.addCarTitle}>{t("rentYourCar")}</Text>

          </View>

          <View style={styles.carouselContainer}>
            <Animated.View
              style={[
                styles.carBrandCard,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.carBrandLogoContainer}>
                <Image source={{ uri: carBrands[currentCarIndex].logo }} style={styles.carBrandLogo} />
              </View>
            </Animated.View>

           
          </View>

          <Animated.Text style={[styles.chooseCarText, { opacity: textFadeAnim }]}>
            {carBrands[currentCarIndex].name}
          </Animated.Text>

          <TouchableOpacity style={styles.addCarButton} onPress={handleAddCar}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addCarButtonText}>{t("addNewCar", " Add New Car")}</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ UPDATED: Enhanced Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("quickStats", "Imibare y'imodoka ufite")}</Text>
          {dashboardLoading ? (
            <View style={styles.statsGrid}>
              {[...Array(4)].map((_, index) => (
                <View key={index} style={styles.statCard}>
                  <LoadingSkeleton style={styles.statIconContainer} />
                  <LoadingSkeleton style={{ width: 60, height: 28, marginBottom: 4 }} />
                  <LoadingSkeleton style={{ width: 80, height: 14, marginBottom: 4 }} />
                  <LoadingSkeleton style={{ width: 100, height: 12 }} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                    <Ionicons name={stat.icon} size={28} color={stat.color} />
                  </View>
                  <Text style={styles.statCount}>{stat.count}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  {stat.subtitle && <Text style={styles.statSubtitle}>{stat.subtitle}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ✅ UPDATED: Enhanced Activities */}
        
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationBottomSheet}
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
  <View key={notification._id || notification.id} style={styles.notificationItemContainer}>
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(notification._id, item.isRead
)}
      onLongPress={() => handleNotificationDelete(notification._id)}
    >
      <View style={styles.notificationMainContent}>
        {/* ✅ Show custom icon if provided */}
        {notification.icon ? (
          <Image
            source={{ uri: notification.icon }}
            style={styles.rushGoIcon}
            resizeMode="cover"
          />
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
              { color: item.isRead
 ? "#64748B" : "#1E293B" },
              !item.isRead
 && styles.unreadNotificationTitle,
            ]}
          >
            {notification.title}
          </Text>

          <Text
            style={styles.notificationMessage}
            numberOfLines={expandedNotifications[notification._id] ? undefined : 2}
          >
            {notification.message}
          </Text>

          <Text style={styles.notificationTime}>
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.notificationActions}>
          {!item.isRead
 && <View style={styles.unreadIndicator} />}
          <Ionicons
            name={
              expandedNotifications[notification._id]
                ? "chevron-up-outline"
                : "chevron-down-outline"
            }
            size={16}
            color="#9CA3AF"
          />
        </View>
      </View>
    </TouchableOpacity>
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
  currentLanguageFlag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  languageDropdown: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedLanguageOption: {
    backgroundColor: "#F0F9FF",
  },
  languageFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addCarSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#007EFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#007EFD",
  },
  addCarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
  },
  addCarTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 12,
  },
  carouselContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  carBrandCard: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 3,
    borderColor: "#007EFD",
  },
  carBrandLogoContainer: {
    width: "80%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  carBrandLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  carouselIndicators: {
    flexDirection: "row",
    marginTop: 20,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  activeIndicator: {
    backgroundColor: "#007EFD",
    width: 24,
  },
  chooseCarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    marginBottom: 20,
  },
  addCarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007EFD",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#007EFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addCarButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: (width - 64) / 2, // Two cards per row with proper spacing
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statCount: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1E293B",
  },
  statTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    textAlign: "center",
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
  // ✅ NEW: Quick actions
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
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
