"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import Icon from "react-native-vector-icons/Ionicons"
import * as Location from "expo-location"
import { useDispatch, useSelector } from "react-redux"
import { getApprovedCarsAction, updateCarViewsAction } from "../../redux/action/CarActions"
import I18n from "../../utils/i18n"
import NotificationChatBot from "../../screens/CarRenter/NotificationsScreen"
import SettingsModal from "../../screens/CarRenter/SettingsModal"
import CarDetailsModal from "../../screens/CarRenter/CarDetailsScreen"
import FilterSidebar from "../../screens/CarRenter/FilterSidebar"
import SkeletonLoader from "../../screens/CarRenter/SkeletonLoader"
import { getTurnByTurnDirections, calculateDistance } from "../../utils/googleDirections"
import { cloudinaryImages, getCloudinaryImage } from "../../utils/image-loader"

import { useRoute, useFocusEffect } from "@react-navigation/native"

// Constants
const screenDimensions = Dimensions.get("window")
const { width, height } = screenDimensions

// Approx Rwanda bounds (rough box)
const RWANDA_BOUNDS = {
  minLat: -2.85,
  maxLat: -1.03,
  minLng: 28.85,
  maxLng: 30.9,
}
function isLocationInRwanda(loc) {
  if (!loc) return false
  return (
    loc.latitude >= RWANDA_BOUNDS.minLat &&
    loc.latitude <= RWANDA_BOUNDS.maxLat &&
    loc.longitude >= RWANDA_BOUNDS.minLng &&
    loc.longitude <= RWANDA_BOUNDS.maxLng
  )
}

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch()

  const carsState = useSelector((state) => {
    if (!state || !state.cars) {
      return {
        cars: [],
        isLoading: false,
        error: null,
        approvedCars: [],
        approvedCarsLoading: false,
        approvedCarsError: null,
      }
    }
    return state.cars
  })

  const { user } = useSelector((state) => state.auth || {})

  const {
    cars = [],
    isLoading: carsLoading = false,
    error: carsError = null,
    approvedCars = [],
    approvedCarsLoading = false,
    approvedCarsError = null,
  } = carsState

  // State
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [routeSteps, setRouteSteps] = useState([])
  const [turnByTurnSteps, setTurnByTurnSteps] = useState([])
  const [selectedCarForRoute, setSelectedCarForRoute] = useState(null)
  const [showNavigationPanel, setShowNavigationPanel] = useState(false) // kept for logic, UI hidden
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showCarPopup, setShowCarPopup] = useState(false)
  const [popupCar, setPopupCar] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [searchText, setSearchText] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredCars, setFilteredCars] = useState([])
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showCarDetails, setShowCarDetails] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [nearestCars, setNearestCars] = useState([])
  const [nearestCar, setNearestCar] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState("rw")
  const [isLoading, setIsLoading] = useState(true)
  const [mapType, setMapType] = useState("standard")
  const [isTracking, setIsTracking] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showAdvertising, setShowAdvertising] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [showNoResultsModal, setShowNoResultsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Refs
  const slideAnim = useRef(new Animated.Value(height * 0.65)).current
  const trackingAnim = useRef(new Animated.Value(1)).current
  const adSlideAnim = useRef(new Animated.Value(width)).current
  const popupAnim = useRef(new Animated.Value(0)).current
  const navigationPanelAnim = useRef(new Animated.Value(-300)).current
  const mapRef = useRef(null)

  const route = useRoute()

  // Data derivations
  const actualApprovedCars = useMemo(() => {
    return approvedCars.length > 0 ? approvedCars : cars.filter((car) => car.status === "approved" && car.available)
  }, [approvedCars, cars])

  const carBanners = useMemo(() => {
    const featuredCars = actualApprovedCars.filter((car) => {
      const hasThumbnail = car.images?.[0] || car.image || car.thumbnail
      const isFeatured = car.featured === true || car.isFeatured === true
      return isFeatured && hasThumbnail
    })
    return featuredCars
  }, [actualApprovedCars])

  const languages = useMemo(
    () => [
      {
        code: "rw",
        name: "Kinyarwanda",
        flag: "https://cdn4.iconfinder.com/data/icons/world-flags-circular/1000/Flag_of_Rwanda_-_Circle-512.png",
      },
      {
        code: "en",
        name: "English",
        flag: "https://images.vexels.com/media/users/3/163966/isolated/preview/6ecbb5ec8c121c0699c9b9179d6b24aa-england-flag-language-icon-circle.png",
      },
      {
        code: "fr",
        name: "Français",
        flag: "https://cdn-icons-png.flaticon.com/512/197/197560.png",
      },
    ],
    [],
  )

  const advertisingImages = useMemo(() => {
    if (carBanners.length > 0) {
      const validImages = carBanners.map((car) => car.images?.[0] || car.image || car.thumbnail).filter(Boolean)
      return validImages
    }
    return []
  }, [carBanners])

  const allCarsWithCoordinates = useMemo(() => {
    return actualApprovedCars.filter((car) => {
      const carLat = car.coordinates?.latitude || car.latitude
      const carLng = car.coordinates?.longitude || car.longitude
      return (
        typeof carLat === "number" &&
        typeof carLng === "number" &&
        carLat >= -90 &&
        carLat <= 90 &&
        carLng >= -180 &&
        carLng <= 180
      )
    })
  }, [actualApprovedCars])

  // Effects
  useEffect(() => {
    dispatch(getApprovedCarsAction())
  }, [dispatch])

  useEffect(() => {
    if (actualApprovedCars.length > 0) {
      setFilteredCars(actualApprovedCars)
    }
  }, [actualApprovedCars])

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    I18n.locale = currentLanguage
  }, [currentLanguage])

  useEffect(() => {
    if (isTracking) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(trackingAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(trackingAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      )
      pulseAnimation.start()
      return () => pulseAnimation.stop()
    }
  }, [isTracking, trackingAnim])

  useEffect(() => {
    const startAdvertisingCycle = () => {
      setTimeout(() => {
        setShowAdvertising(true)
        Animated.timing(adSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start()

        const adInterval = setInterval(() => {
          setCurrentAdIndex((prev) => (prev + 1) % advertisingImages.length)
        }, 10000)

        setTimeout(() => {
          clearInterval(adInterval)
          Animated.timing(adSlideAnim, {
            toValue: width,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setShowAdvertising(false)
            setCurrentAdIndex(0)
            adSlideAnim.setValue(width)
          })
        }, 20000)
      }, 10000)
    }

    if (!isLoading && filteredCars.length > 0 && advertisingImages.length > 0) {
      startAdvertisingCycle()
      const cycleInterval = setInterval(startAdvertisingCycle, 30000)
      return () => clearInterval(cycleInterval)
    }
  }, [isLoading, filteredCars, adSlideAnim, advertisingImages])

  useEffect(() => {
    if (route?.params?.showDirections && route?.params?.destinationCar) {
      handleNavigationDirections(route.params.destinationCar)
    }
  }, [route?.params])

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        dispatch(getApprovedCarsAction())
      }
    }, [dispatch, isLoading]),
  )

  // Helpers: keys and logos
  const getStableCarKey = useCallback((car) => {
    const id = car?._id || car?.id
    if (id) return String(id)
    const brand = car?.brand || car?.make || "brand"
    const model = car?.model || "model"
    const lat = car?.coordinates?.latitude ?? car?.latitude ?? 0
    const lng = car?.coordinates?.longitude ?? car?.longitude ?? 0
    return `${brand}-${model}-${lat}-${lng}`
  }, [])

  const getBrandLogoUri = useCallback((car) => {
    const direct =
      car?.brandLogo || car?.brand_logo || car?.logo || car?.logoUrl || car?.brandLogoUrl || car?.brand_image
    if (direct) return direct

    const brandRaw = (car?.brand || car?.make || "").toString().trim()
    if (!brandRaw) return null

    const slug = brandRaw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    if (cloudinaryImages?.brands?.[slug]) return cloudinaryImages.brands[slug]
    if (cloudinaryImages?.brandLogos?.[slug]) return cloudinaryImages.brandLogos[slug]
    if (cloudinaryImages?.logos?.[slug]) return cloudinaryImages.logos[slug]

    const candidates = [
      `brands/${slug}.png`,
      `brands/${slug}.svg`,
      `brand-logos/${slug}.png`,
      `brand-logos/${slug}.svg`,
      slug,
    ]
    for (const key of candidates) {
      try {
        const url = getCloudinaryImage ? getCloudinaryImage(key) : null
        if (url) return url
      } catch (_) {}
    }
    return null
  }, [])

  // Helpers: map fitting
  const fitMapToAllCars = useCallback(
    (carsList) => {
      if (!mapRef.current) return
      const list = (carsList || allCarsWithCoordinates).slice()
      if (userLocation) list.push(userLocation)

      if (list.length === 0) return

      const minLat = Math.min(...list.map((c) => c.latitude ?? c.coordinates?.latitude ?? 0))
      const maxLat = Math.max(...list.map((c) => c.latitude ?? c.coordinates?.latitude ?? 0))
      const minLng = Math.min(...list.map((c) => c.longitude ?? c.coordinates?.longitude ?? 0))
      const maxLng = Math.max(...list.map((c) => c.longitude ?? c.coordinates?.longitude ?? 0))

      const midLat = (minLat + maxLat) / 2
      const midLng = (minLng + maxLng) / 2
      // Increase zoom out factor for better overview
      const latDelta = Math.max((maxLat - minLat) * 2.0, 0.05)
      const lngDelta = Math.max((maxLng - minLng) * 2.0, 0.05)

      mapRef.current.animateToRegion(
        {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        },
        1000,
      )
    },
    [mapRef, allCarsWithCoordinates, userLocation],
  )

  // Initialization
  const initializeApp = useCallback(async () => {
    setIsLoading(true)
    try {
      await requestLocationPermission()
      setTimeout(() => {
        setIsLoading(false)
        Animated.timing(slideAnim, {
          toValue: height * 0.65,
          duration: 1500,
          useNativeDriver: false,
        }).start()
      }, 2000)
    } catch (error) {
      console.error("App initialization error:", error)
      setIsLoading(false)
    }
  }, [slideAnim])

  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: "Location Permission",
          message: "This app needs access to location to show nearby cars.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        })
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setUserLocation({ latitude: -1.9441, longitude: 30.0619 })
          return
        }
      }

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(I18n.t("enableLocation"), I18n.t("locationPermission"), [
          { text: I18n.t("cancel"), style: "cancel" },
          { text: I18n.t("yes"), onPress: getCurrentLocation },
        ])
        return
      }
      getCurrentLocation()
    } catch (error) {
      console.log("Location permission error:", error)
      setUserLocation({ latitude: -1.9441, longitude: 30.0619 })
    }
  }, [])

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 60000,
      })
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
      setUserLocation(newLocation)

      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.animateToRegion(
            {
              ...newLocation,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            1000,
          )
        }, 1000)
      }
    } catch (error) {
      console.log("Get location error:", error)
      const defaultLocation = { latitude: -1.9441, longitude: 30.0619 }
      setUserLocation(defaultLocation)
    }
  }, [])

  // Marker press: draw route + show popup + filter cards to selected car
  const handleCarMarkerPress = useCallback(
    async (car, event) => {
      if (!userLocation) {
        Alert.alert("Location Required", "Please enable location to get directions")
        return
      }

      try {
        if (car._id || car.id) {
          const currentViews = car.views || 0
          dispatch(
            updateCarViewsAction({
              carId: car._id || car.id,
              views: currentViews + 1,
            }),
          )
        }

        const carLat = car.coordinates?.latitude || car.latitude
        const carLng = car.coordinates?.longitude || car.longitude
        if (!carLat || !carLng || typeof carLat !== "number" || typeof carLng !== "number") {
          Alert.alert("Error", "Car location not available")
          return
        }
        const carCoords = { latitude: carLat, longitude: carLng }

        // Position popup
        const nativeEvent = event?.nativeEvent || {}
        setPopupPosition({
          x: nativeEvent.coordinate ? width / 2 : nativeEvent.position?.x || width / 2,
          y: nativeEvent.coordinate ? height / 3 : nativeEvent.position?.y || height / 3,
        })
        setPopupCar(car)
        setShowCarPopup(true)
        Animated.spring(popupAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start()

        // Filter bottom cards to this selection immediately
        setFilteredCars([car])

        // Get turn-by-turn (UI panel hidden)
        try {
          const directions = await getTurnByTurnDirections(userLocation, carCoords, {
            mode: "drive",
            traffic: true,
            units: "metric",
          })

          if (directions?.coordinates?.length) {
            setRouteCoordinates(directions.coordinates)
            setRouteInfo({
              distance: directions.totalDistance,
              duration: directions.totalDuration,
              steps: directions.steps,
            })
            setTurnByTurnSteps(directions.steps || [])
            setRouteSteps(directions.steps || [])
            setSelectedCarForRoute(car)
            setCurrentStepIndex(0)
            setShowNavigationPanel(true)

            if (mapRef.current) {
              const allCoords = [userLocation, carCoords, ...directions.coordinates]
              const minLat = Math.min(...allCoords.map((c) => c.latitude))
              const maxLat = Math.max(...allCoords.map((c) => c.latitude))
              const minLng = Math.min(...allCoords.map((c) => c.longitude))
              const maxLng = Math.max(...allCoords.map((c) => c.longitude))
              const midLat = (minLat + maxLat) / 2
              const midLng = (minLng + maxLng) / 2
              const latDelta = (maxLat - minLat) * 1.3 + 0.01
              const lngDelta = (maxLng - minLng) * 1.3 + 0.01

              mapRef.current.animateToRegion(
                {
                  latitude: midLat,
                  longitude: midLng,
                  latitudeDelta: Math.max(latDelta, 0.01),
                  longitudeDelta: Math.max(lngDelta, 0.01),
                },
                1000,
              )
            }
          } else {
            throw new Error("No route coordinates received")
          }
        } catch (routeError) {
          const simpleRoute = [userLocation, carCoords]
          setRouteCoordinates(simpleRoute)
          setSelectedCarForRoute(car)
          setRouteInfo({
            distance: calculateDistance(userLocation.latitude, userLocation.longitude, carLat, carLng) + " km",
            duration: "Estimated",
            steps: [],
          })
        }

        // Auto-hide popup after a short delay
        setTimeout(() => {
          hideCarPopup()
        }, 3000)
      } catch (error) {
        Alert.alert("Error", "Unable to get directions to this car")
      }
    },
    [userLocation, dispatch, popupAnim, mapRef],
  )

  const hideCarPopup = useCallback(() => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowCarPopup(false)
      setPopupCar(null)
    })
  }, [popupAnim])

  const handlePopupPress = useCallback(() => {
    if (popupCar) {
      setSelectedCar(popupCar)
      setShowCarDetails(true)
      hideCarPopup()
    }
  }, [popupCar, hideCarPopup])

  const clearNavigation = useCallback(() => {
    setRouteCoordinates([])
    setRouteInfo(null)
    setTurnByTurnSteps([])
    setRouteSteps([])
    setSelectedCarForRoute(null)
    setCurrentStepIndex(0)
    setShowNavigationPanel(false)

    Animated.timing(navigationPanelAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [navigationPanelAnim])

  const handleNavigationDirections = useCallback(
    async (destinationCar) => {
      if (userLocation && mapRef.current) {
        try {
          const carLat = destinationCar.coordinates?.latitude || destinationCar.latitude
          const carLng = destinationCar.coordinates?.longitude || destinationCar.longitude
          if (!carLat || !carLng) return

          const directions = await getTurnByTurnDirections(
            userLocation,
            { latitude: carLat, longitude: carLng },
            {
              mode: "drive",
              traffic: true,
              units: "metric",
            },
          )

          setRouteCoordinates(directions.coordinates)
          setRouteInfo({
            distance: directions.totalDistance,
            duration: directions.totalDuration,
            steps: directions.steps,
          })
          setTurnByTurnSteps(directions.steps)
          setRouteSteps(directions.steps)
          setSelectedCarForRoute(destinationCar)
          setShowNavigationPanel(true)

          mapRef.current.animateToRegion(
            {
              latitude: (userLocation.latitude + carLat) / 2,
              longitude: (userLocation.longitude + carLng) / 2,
              latitudeDelta: Math.abs(userLocation.latitude - carLat) * 1.5 + 0.01,
              longitudeDelta: Math.abs(userLocation.longitude - carLng) * 1.5 + 0.01,
            },
            1000,
          )
        } catch (error) {
          console.log("Error getting directions:", error)
        }
      }
    },
    [userLocation, navigationPanelAnim],
  )

  // Greeting
  const getTimeBasedGreeting = useCallback(() => {
    const hour = new Date().getHours()
    const name = user?.name || user?.firstName || user?.fullName || "User"
    if (hour < 12) return `${I18n.t("morningGreeting")} ${name}!`
    if (hour < 17) return `${I18n.t("afternoonGreeting")} ${name}!`
    return `${I18n.t("eveningGreeting")} ${name}!`
  }, [user])

  // Search: already filters map via carsToShowOnMap when searchText.length > 0
  const handleSearch = useCallback(
    (text) => {
      setSearchText(text)
      setSearchQuery(text)

      if (searchTimeout) clearTimeout(searchTimeout)

      if (text.length > 0) {
        const timeout = setTimeout(() => {
          const carResults = actualApprovedCars.filter((car) => {
            const q = text.toLowerCase()
            return (
              car.brand?.toLowerCase().includes(q) ||
              car.make?.toLowerCase().includes(q) ||
              car.model?.toLowerCase().includes(q) ||
              car.type?.toLowerCase().includes(q) ||
              car.district?.toLowerCase().includes(q) ||
              car.sector?.toLowerCase().includes(q) ||
              car.location?.toLowerCase().includes(q) ||
              car.address?.toLowerCase().includes(q) ||
              `${car.brand || car.make} ${car.model}`.toLowerCase().includes(q)
            )
          })

          setFilteredCars(carResults)

          // Fit map to only searched cars
          if (mapRef.current && carResults.length > 0) {
            const list = carResults
              .filter((c) => typeof (c.coordinates?.latitude || c.latitude) === "number")
              .map((c) => ({
                latitude: c.coordinates?.latitude || c.latitude,
                longitude: c.coordinates?.longitude || c.longitude,
              }))
            if (userLocation) list.push(userLocation)
            fitMapToAllCars(list)
          }

          if (carResults.length === 0 && text.length > 2) {
            setShowNoResultsModal(true)
          }
        }, 800)
        setSearchTimeout(timeout)
      } else {
        setFilteredCars(actualApprovedCars)
        setSelectedRegion(null)
      }

      setShowSuggestions(false)
    },
    [actualApprovedCars, searchTimeout, fitMapToAllCars, userLocation],
  )

  // Select car from card
  const handleCarSelect = useCallback(
    async (car) => {
      setSelectedCar(car)

      if (car._id || car.id) {
        try {
          const currentViews = car.views || 0
          dispatch(
            updateCarViewsAction({
              carId: car._id || car.id,
              views: currentViews + 1,
            }),
          )
        } catch (error) {
          console.log("Error updating views:", error)
        }
      }

      if (userLocation) {
        try {
          const carLat = car.coordinates?.latitude || car.latitude
          const carLng = car.coordinates?.longitude || car.longitude
          if (carLat && carLng && typeof carLat === "number" && typeof carLng === "number") {
            const carCoords = { latitude: carLat, longitude: carLng }
            const directions = await getTurnByTurnDirections(userLocation, carCoords, {
              mode: "drive",
              traffic: true,
              units: "metric",
            })
            setRouteSteps(directions.steps || [])
            setTurnByTurnSteps(directions.steps || [])
            setRouteCoordinates(directions.coordinates)
            setRouteInfo({
              distance: directions.totalDistance,
              duration: directions.totalDuration,
              steps: directions.steps,
            })
            setSelectedCarForRoute(car)
          }
        } catch (error) {
          console.log("Error getting directions:", error)
        }
      }

      setShowCarDetails(true)
    },
    [userLocation, dispatch],
  )

  const handleLanguageChange = useCallback((language) => {
    setCurrentLanguage(language)
    I18n.locale = language
    setShowLanguageDropdown(false)
  }, [])

  const getCurrentLanguageFlag = useCallback(() => {
    const currentLang = languages.find((lang) => lang.code === currentLanguage)
    return currentLang ? currentLang.flag : languages[0].flag
  }, [languages, currentLanguage])

  const sortCarsByDistance = useCallback(
    (cars) => {
      if (!userLocation || !cars || cars.length === 0) return cars
      return cars
        .map((car) => {
          const carLat = car.coordinates?.latitude || car.latitude
          const carLng = car.coordinates?.longitude || car.longitude
          if (
            typeof carLat === "number" &&
            typeof carLng === "number" &&
            typeof userLocation.latitude === "number" &&
            typeof userLocation.longitude === "number"
          ) {
            const distance = calculateDistance(userLocation.latitude, userLocation.longitude, carLat, carLng)
            return { ...car, distance: distance }
          } else {
            return { ...car, distance: "0.0" }
          }
        })
        .sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance))
    },
    [userLocation],
  )

  const calculateNearbyCars = useCallback(() => {
    if (!userLocation || !actualApprovedCars.length) return []
    const nearbyCars = actualApprovedCars.filter((car) => {
      const carLat = car.coordinates?.latitude || car.latitude
      const carLng = car.coordinates?.longitude || car.longitude
      if (typeof carLat === "number" && typeof carLng === "number") {
        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, carLat, carLng)
        return Number.parseFloat(distance) <= 10 && car.available
      }
      return false
    })
    return sortCarsByDistance(nearbyCars)
  }, [userLocation, actualApprovedCars, sortCarsByDistance])

  // FAB: track nearest or zoom out to all cars; ensure user is in Rwanda before tracking
  const handleTrackNearestCar = useCallback(() => {
    if (!userLocation) {
      Alert.alert(I18n.t("enableLocation"), I18n.t("locationPermission"))
      return
    }

    if (isTracking) {
      // Toggle off: show all available cars and zoom out to include them + current location
      setIsTracking(false)
      setNearestCars([])
      setNearestCar(null)
      clearNavigation()
      setFilteredCars(actualApprovedCars) // restore full set
      fitMapToAllCars(
        allCarsWithCoordinates.map((c) => ({
          latitude: c.coordinates?.latitude || c.latitude,
          longitude: c.coordinates?.longitude || c.longitude,
        })),
      )
      Alert.alert("Tracking Disabled", "Showing all available cars")
      return
    }

    // Check country
    if (!isLocationInRwanda(userLocation)) {
      Alert.alert("Restricted", "This app is used when you are based in Rwanda location.")
      return
    }

    const nearby = calculateNearbyCars()
    setNearestCars(nearby)
    setIsTracking(true)

    if (nearby.length > 0) {
      const nearest = nearby[0]
      setNearestCar(nearest)

      if (mapRef.current) {
        const nearestLat = nearest.coordinates?.latitude || nearest.latitude
        const nearestLng = nearest.coordinates?.longitude || nearest.longitude

        if (nearestLat && nearestLng) {
          mapRef.current.animateToRegion(
            {
              latitude: (userLocation.latitude + nearestLat) / 2,
              longitude: (userLocation.longitude + nearestLng) / 2,
              latitudeDelta: Math.abs(userLocation.latitude - nearestLat) * 2 + 0.01,
              longitudeDelta: Math.abs(userLocation.longitude - nearestLng) * 2 + 0.01,
            },
            1000,
          )
        }
      }

      Alert.alert(
        "Tracking Activated",
        `Found ${nearby.length} car(s) within 10km. Nearest: ${nearest.brand || nearest.make} ${nearest.model} (${nearest.distance}km away)`,
      )
    } else {
      Alert.alert("No Nearby Cars", "No available cars found within 10km of your location")
      setIsTracking(false)
    }
  }, [
    userLocation,
    isTracking,
    calculateNearbyCars,
    clearNavigation,
    actualApprovedCars,
    allCarsWithCoordinates,
    fitMapToAllCars,
  ])

  const handleApplyFilters = useCallback(
    (filters) => {
      let filtered = actualApprovedCars

      filtered = filtered.filter(
        (car) =>
          Number.parseInt(car.price || car.base_price || car.dailyRate) >= filters.priceRange[0] &&
          Number.parseInt(car.price || car.base_price || car.dailyRate) <= filters.priceRange[1],
      )

      if (filters.make !== "all") {
        filtered = filtered.filter((car) => (car.brand || car.make) === filters.make)
      }
      if (filters.model !== "all") {
        filtered = filtered.filter((car) => car.model === filters.model)
      }
      if (filters.type !== "all") {
        filtered = filtered.filter((car) => car.type === filters.type)
      }
      if (filters.year !== "all") {
        filtered = filtered.filter((car) => car.year === filters.year)
      }
      if (filters.transmission !== "all") {
        filtered = filtered.filter((car) => car.transmission === filters.transmission)
      }
      if (filters.fuelType !== "all") {
        filtered = filtered.filter((car) => car.fuelType === filters.fuelType)
      }
      if (filters.seatings !== "all") {
        filtered = filtered.filter((car) => car.seatings === filters.seatings)
      }
      if (filters.features.length > 0) {
        filtered = filtered.filter((car) => filters.features.every((feature) => car.features?.includes(feature)))
      }

      setFilteredCars(filtered)

      if (filtered.length === 0) {
        Alert.alert("No Results", "No cars match your filter criteria")
      } else {
        Alert.alert("Filters Applied", `Found ${filtered.length} cars matching your criteria`)
      }
    },
    [actualApprovedCars, navigation],
  )

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss()
    setShowSuggestions(false)
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    dispatch(getApprovedCarsAction())
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [dispatch])

  const carsToDisplay = useMemo(() => {
    return isTracking && nearestCars.length > 0 ? nearestCars : filteredCars
  }, [isTracking, nearestCars, filteredCars])

  const sortedCars = useMemo(() => {
    return sortCarsByDistance(carsToDisplay)
  }, [carsToDisplay, sortCarsByDistance])

  const carsToShowOnMap = useMemo(() => {
    const baseCars = searchText.length > 0 ? filteredCars : allCarsWithCoordinates
    return baseCars
  }, [searchText, filteredCars, allCarsWithCoordinates])

  // Loading UI
  if (isLoading || carsLoading || approvedCarsLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#007EFD" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.leftSection}>
              <View style={[styles.skeletonText, { width: 200, height: 24, marginBottom: 8 }]} />
              <View style={[styles.skeletonText, { width: 150, height: 16 }]} />
            </View>
            <View style={styles.rightSection}>
              <View style={[styles.skeletonCircle, { width: 24, height: 18 }]} />
              <View style={[styles.skeletonCircle, { width: 45, height: 45 }]} />
            </View>
          </View>
          <View style={styles.searchContainer}>
            <View style={[styles.skeletonText, { height: 50, borderRadius: 25 }]} />
          </View>
        </View>
        <View style={[styles.fullMap, { backgroundColor: "#E0E0E0" }]} />
        <View style={[styles.carCardsOverlay, { top: height * 0.65 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carCardsContent}>
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
          </ScrollView>
        </View>
        <View style={styles.bottomNav}>
          <View style={[styles.skeletonCircle, { width: 24, height: 24 }]} />
          <View style={[styles.skeletonCircle, { width: 60, height: 60 }]} />
          <View style={[styles.skeletonCircle, { width: 24, height: 24 }]} />
        </View>
      </View>
    )
  }

  // Error UI
  if (carsError || approvedCarsError) {
    const errorMessage = carsError || approvedCarsError
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 18, color: "red", textAlign: "center", margin: 20 }}>
          Error loading cars: {errorMessage}
        </Text>
        <TouchableOpacity
          style={{ padding: 15, backgroundColor: "#007EFD", borderRadius: 8 }}
          onPress={() => dispatch(getApprovedCarsAction())}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#007EFD" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.leftSection}>
              <Text style={styles.greeting}>{getTimeBasedGreeting()}</Text>
              <Text style={styles.subtitle}>{I18n.t("welcomeMessage")}</Text>
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.flagButton} onPress={() => setShowLanguageDropdown(true)}>
                <Image source={{ uri: getCurrentLanguageFlag() }} style={styles.flagImage} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileButton}>
                <Image
                  source={{
                    uri:
                      user?.profileImage ||
                      user?.avatar ||
                      user?.photo ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                  }}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearch}
                placeholder="Shakisha ahantu cyangwa imodoka..."
                onFocus={() => setShowSuggestions(true)}
              />
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterSidebar(true)}>
              <Icon name="filter" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.fullMap}
          mapType={mapType}
          initialRegion={{
            latitude: userLocation?.latitude || -1.9441,
            longitude: userLocation?.longitude || 30.0619,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsTraffic={true}
          onPress={() => {
            hideCarPopup()
          }}
        >
          {/* User */}
          {userLocation && (
            <Marker coordinate={userLocation} title="Your Location">
              <Animated.View
                style={[
                  styles.userMarker,
                  isTracking && {
                    transform: [{ scale: trackingAnim }],
                    shadowColor: "#4CAF50",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 10,
                  },
                ]}
              >
                <Icon name="person" size={16} color="white" />
              </Animated.View>
            </Marker>
          )}

          {/* Cars */}
          {carsToShowOnMap.map((car) => {
            const carLat = car.coordinates?.latitude || car.latitude
            const carLng = car.coordinates?.longitude || car.longitude
            const markerKey = `car-marker-${getStableCarKey(car)}`
            return (
              <Marker
                key={markerKey}
                coordinate={{ latitude: carLat, longitude: carLng }}
                onPress={(event) => handleCarMarkerPress(car, event)}
                title={`${car.brand || car.make} ${car.model}`}
                description={`${car.sector}, ${car.district} - ${car.price || car.base_price || car.dailyRate} ${car.currency}/day`}
              >
                <View
                  style={[
                    styles.carMarkerContainer,
                    nearestCar?._id === car._id && isTracking && styles.nearestCarMarker,
                    selectedCarForRoute?._id === car._id && styles.selectedCarMarker,
                  ]}
                >
                  <Image
                    source={
                      car.available ? require("../../assets/available.png") : require("../../assets/nonavailable.png")
                    }
                    style={styles.carMarkerImage}
                  />
                  {car.distance && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{car.distance}km</Text>
                    </View>
                  )}
                </View>
              </Marker>
            )
          })}

          {/* Route */}
          {routeCoordinates.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="rgba(0, 0, 0, 0.3)"
                strokeWidth={8}
                lineJoin="round"
                lineCap="round"
              />
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#1E88E5"
                strokeWidth={6}
                lineJoin="round"
                lineCap="round"
              />
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#42A5F5"
                strokeWidth={3}
                lineJoin="round"
                lineCap="round"
              />
            </>
          )}
        </MapView>

        {/* No Results Modal */}
        <Modal
          visible={showNoResultsModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNoResultsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.noResultsModalContent}>
              <Icon name="car-outline" size={60} color="#ccc" style={{ marginBottom: 20 }} />
              <Text style={styles.noResultsModalTitle}>Car Not Available</Text>
              <Text style={styles.noResultsModalMessage}>
                No cars found matching "{searchQuery}". Try searching for a different brand or model.
              </Text>
              <TouchableOpacity style={styles.noResultsModalButton} onPress={() => setShowNoResultsModal(false)}>
                <Text style={styles.noResultsModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Popup: brand logo circle + model only */}
        {showCarPopup && popupCar && (
          <Animated.View
            style={[
              styles.carPopup,
              {
                left: popupPosition.x - 120,
                top: popupPosition.y - 100,
                opacity: popupAnim,
                transform: [
                  {
                    scale: popupAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity onPress={handlePopupPress} style={styles.popupContent}>
              <Image source={{ uri: popupCar.images?.[0] || popupCar.image }} style={styles.popupCarImage} />
              <View style={styles.popupInfo}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {getBrandLogoUri(popupCar) ? (
                    <Image source={{ uri: getBrandLogoUri(popupCar) }} style={styles.brandLogoCircle} />
                  ) : (
                    <Icon name="car-outline" size={20} color="#1E88E5" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.popupCarName}>{popupCar.model}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.popupArrow} />
          </Animated.View>
        )}

        {/* Navigation panel intentionally hidden */}

        {/* Map Controls: Satellite only */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
          >
            <Icon name={mapType === "standard" ? "map-outline" : "map"} size={20} color="#007EFD" />
          </TouchableOpacity>
        </View>

        {/* Bottom Car Cards (fixed, no scroll) */}
        <Animated.View style={[styles.carCardsOverlay, { top: slideAnim }]}>
          {showAdvertising && advertisingImages.length > 0 ? (
            <Animated.View style={[styles.advertisingContainer, { transform: [{ translateX: adSlideAnim }] }]}>
              <Image
                source={{ uri: advertisingImages[currentAdIndex] }}
                style={styles.advertisingImage}
                resizeMode="cover"
              />
              <View style={styles.adIndicator}>
                {advertisingImages.map((_, index) => (
                  <View
                    key={`ad-dot-${index}`}
                    style={[styles.adDot, index === currentAdIndex && styles.adDotActive]}
                  />
                ))}
              </View>
              <View style={styles.adOverlay}>
                <Text style={styles.adText}>Featured Car</Text>
              </View>
            </Animated.View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carCardsContent}
              style={styles.carCardsScroll}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {sortedCars.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    {isTracking && nearestCars.length === 0 ? "No cars found within 10km" : I18n.t("noCarsAvailable")}
                  </Text>
                </View>
              ) : (
                sortedCars.map((car) => {
                  const cardKey = `car-card-${getStableCarKey(car)}`
                  return (
                    <TouchableOpacity key={cardKey} style={styles.carCard} onPress={() => handleCarSelect(car)}>
                      <View style={styles.carImageContainer}>
                        <Image source={{ uri: car.images?.[0] || car.image }} style={styles.carImage} />
                        <View style={styles.brandBadge}>
                          <Text style={styles.brandText}>{car.brand || car.make}</Text>
                        </View>
                        <View
                          style={[
                            styles.availabilityBadge,
                            car.available ? styles.availableBadge : styles.unavailableBadge,
                          ]}
                        >
                          <Text style={styles.availabilityText}>{car.available ? "Available" : "Rented"}</Text>
                        </View>
                        {car.distance && (
                          <View style={styles.cardDistanceBadge}>
                            <Text style={styles.cardDistanceText}>{car.distance}km</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.carInfo}>
                        <Text style={styles.carName}>
                          {car.brand || car.make} {car.model}
                        </Text>
                        <Text style={styles.carPrice}>
                          {car.price || car.base_price || car.dailyRate} {car.currency}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
            </ScrollView>
          )}
        </Animated.View>

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate("CarListing", { cars: actualApprovedCars })}
          >
            <Icon name="car" size={24} color="#007EFD" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fabButton} onPress={handleTrackNearestCar}>
            <Image
              source={{ uri: "https://i.pinimg.com/originals/1d/0f/be/1d0fbe16bf9237d6f082ad8cc9be1f74.gif" }}
              style={styles.trackGif}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => setShowSettingsModal(true)}>
            <Icon name="settings" size={24} color="#007EFD" />
          </TouchableOpacity>
        </View>

        {/* Language Dropdown */}
        <Modal
          visible={showLanguageDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageDropdown(false)}
        >
          <TouchableOpacity style={styles.languageModalOverlay} onPress={() => setShowLanguageDropdown(false)}>
            <View style={styles.languageDropdown}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={`language-${language.code}`}
                  style={[styles.languageOption, currentLanguage === language.code && styles.selectedLanguageOption]}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <Image source={{ uri: language.flag }} style={styles.languageFlag} />
                  <Text style={styles.languageName}>{language.name}</Text>
                  {currentLanguage === language.code && <Icon name="checkmark" size={20} color="#007EFD" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Filter Sidebar */}
        <FilterSidebar
          visible={showFilterSidebar}
          onClose={() => setShowFilterSidebar(false)}
          onApplyFilters={handleApplyFilters}
          cars={actualApprovedCars}
        />

        {/* Notification ChatBot */}
        <NotificationChatBot />

        {/* Settings Modal */}
        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          userProfile={user}
          onProfileUpdate={() => {
            console.log("Profile updated, user data will be updated via auth state")
          }}
          navigation={navigation}
        />

        {/* Car Details Modal */}
        <CarDetailsModal
          visible={showCarDetails}
          onClose={() => {
            setShowCarDetails(false)
          }}
          car={selectedCar}
          userLocation={userLocation}
          currentLanguage={currentLanguage}
          routeInfo={routeInfo}
          routeSteps={turnByTurnSteps}
          routeCoordinates={routeCoordinates}
          navigation={navigation}
        />
      </View>
    </TouchableWithoutFeedback>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007EFD",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  flagButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  flagImage: {
    width: "100%",
    height: "100%",
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ddd",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullMap: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    top: 200,
    right: 20,
    zIndex: 1000,
  },
  mapControlButton: {
    backgroundColor: "white",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  userMarker: {
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  carMarkerContainer: {
    position: "relative",
    alignItems: "center",
  },
  carMarkerImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  nearestCarMarker: {
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedCarMarker: {
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  distanceBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  distanceText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#007EFD",
  },
  carPopup: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 0,
    width: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  popupContent: {
    borderRadius: 12,
    overflow: "hidden",
  },
  popupCarImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  popupInfo: {
    padding: 12,
  },
  popupCarName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  popupArrow: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  // Navigation panel styles kept for completeness (UI hidden)
  navigationPanel: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  navigationInfo: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  navigationDuration: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E88E5",
    marginRight: 8,
  },
  navigationDistance: {
    fontSize: 16,
    color: "#666",
  },
  closeNavigationButton: {
    padding: 4,
  },
  currentStepContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  stepIconContainer: {
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  stepDistance: {
    fontSize: 14,
    color: "#666",
  },
  carCardsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.35,
  },
  carCardsScroll: {
    flex: 1,
  },
  carCardsContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  advertisingContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    position: "relative",
  },
  advertisingImage: {
    width: "100%",
    height: "85%",
  },
  adIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "15%",
    gap: 8,
  },
  adDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
  },
  adDotActive: {
    backgroundColor: "#007EFD",
  },
  adOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0, 126, 253, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  adText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  noResultsContainer: {
    width: width - 40,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  carCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginRight: 15,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  carImageContainer: {
    position: "relative",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  carImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  brandBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#007EFD",
  },
  brandLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    resizeMode: "contain",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  availabilityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  availableBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  unavailableBadge: {
    backgroundColor: "rgba(244, 67, 54, 0.9)",
  },
  availabilityText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "white",
  },
  cardDistanceBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardDistanceText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "white",
  },
  carInfo: {
    padding: 15,
  },
  carName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  carLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  perDay: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#666",
  },
  carFeatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  carTransmission: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  carSeats: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  carFuel: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottomNav: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 25,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    padding: 12,
  },
  fabButton: {
    backgroundColor: "#007EFD",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginTop: -15,
  },
  trackGif: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  languageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  languageDropdown: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  selectedLanguageOption: {
    backgroundColor: "#f0f8ff",
  },
  languageFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noResultsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  noResultsModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },
  noResultsModalButton: {
    backgroundColor: "#007EFD",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  noResultsModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  skeletonText: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
  },
  skeletonCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
  },
})

export default HomeScreen
