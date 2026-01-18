

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
import { Ionicons } from "@expo/vector-icons"
// Use project mock to avoid native dependency resolution during bundling
import MapsMock from "../../mocks/react-native-maps"
const MapView = MapsMock.MapView || MapsMock.default?.MapView || (() => null)
const Marker = MapsMock.Marker || MapsMock.default?.Marker || (() => null)
const Polyline = MapsMock.Polyline || MapsMock.default?.Polyline || (() => null)
const PROVIDER_GOOGLE = MapsMock.PROVIDER_GOOGLE || MapsMock.default?.PROVIDER_GOOGLE || null
import Icon from "react-native-vector-icons/Ionicons"
import * as Location from "expo-location"
import { useDispatch, useSelector } from "react-redux"
import { getApprovedCarsAction, updateCarViewsAction } from "../../redux/action/CarActions"
import { useTranslation } from 'react-i18next';
// add near other redux/action imports
import { getCurrentUserAction } from "../../redux/action/UserActions"
import SettingsModal from "../../screens/CarRenter/SettingsModal"
import CarDetailsModal from "../../screens/CarRenter/CarDetailsScreen"
import FilterSidebar from "../../screens/CarRenter/FilterSidebar"
import SkeletonLoader from "../../screens/CarRenter/SkeletonLoader"
import { getTurnByTurnDirections, calculateDistance } from "../../utils/googleDirections"
import { cloudinaryImages, getCloudinaryImage } from "../../utils/image-loader"
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../redux/action/notificationActions";

import { useRoute, useFocusEffect } from "@react-navigation/native"
import NotificationBottomSheet from "../../components/NotificationBottomSheet"
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
 
  const user = useSelector((state) => state.user.currentUser);
  useEffect(() => {
    dispatch(getCurrentUserAction());
  }, [dispatch]);
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



  const {
    cars = [],
    isLoading: carsLoading = false,
    error: carsError = null,
    approvedCars = [],
    approvedCarsLoading = false,
    approvedCarsError = null,
  } = carsState

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
  const [userLocation, setUserLocation] = useState({ latitude: -1.9441, longitude: 30.0619 })
  const [locationSubscription, setLocationSubscription] = useState(null)
  const [nearestCars, setNearestCars] = useState([])
  const [nearestCar, setNearestCar] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState("rw")
  
  const [mapType, setMapType] = useState("standard")
  const [isTracking, setIsTracking] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showAdvertising, setShowAdvertising] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [showNoResultsModal, setShowNoResultsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { t, i18n } = useTranslation();
const unreadCount = Array.isArray(notifications)
  ? notifications.filter(n => !n.isRead).length
  : 0



const [showNotifications, setShowNotifications] = useState(false)
const [expandedNotifications, setExpandedNotifications] = useState({})
const notifications = useSelector(
  (state) => state.notifications?.notifications || []
)
const isLoading = useSelector(
  (state) => state.notifications?.isLoading
)
const error = useSelector(
  (state) => state.notifications?.error
)


const selectedPinAnim = useRef(new Animated.Value(0)).current

const [selectedCarId, setSelectedCarId] = useState(null)
 const bouncePin = () => {
  selectedPinAnim.setValue(0)
  Animated.sequence([
    Animated.timing(selectedPinAnim, {
      toValue: -12,
      duration: 180,
      useNativeDriver: true,
    }),
    Animated.timing(selectedPinAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }),
  ]).start()
}


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

const [showNotificationBottomSheet, setShowNotificationBottomSheet] = useState(false)
    // Fetch notifications on mount
    useEffect(() => {
      dispatch(fetchNotifications())
    }, [dispatch])
  const advertisingImages = useMemo(() => {
    if (carBanners.length > 0) {
      const validImages = carBanners.map((car) => car.images?.[0] || car.image || car.thumbnail).filter(Boolean)
      return validImages
    }
    return []
  }, [carBanners])
useEffect(() => {
  const getPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setPermissionDenied(true);
      return;
    }

    setPermissionDenied(false);

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  getPermission();
}, []); // ⬅️ VERY IMPORTANT

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
    i18n.changeLanguage(currentLanguage);
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

  // Cleanup location subscription on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove()
      }
    }
  }, [locationSubscription])

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

    const getBrandLogo = (brand) => {
    if (!brand) return null

    const found = carBrands.find(
      b => b.name.toLowerCase() === brand.toLowerCase()
    )

    return found?.logo || null
  }
const handleNotificationPress = (notificationId, isRead) => {
  setExpandedNotifications(prev => ({
    ...prev,
    [notificationId]: !prev[notificationId],
  }));

  if (!isRead) {
    dispatch(markNotificationAsRead(notificationId));
  }
};


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
    ],
  )
}

const closeNotificationModal = () => {
  setShowNotifications(false)
  setExpandedNotifications({})
}

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
        Alert.alert(t("enableLocation"), t("locationPermission"), [
          { text: t("cancel"), style: "cancel" },
          { text: t("yes"), onPress: getCurrentLocation },
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
      // First get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      })
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
      setUserLocation(newLocation)

      // Start watching for location updates
      const subscription = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 50,
      }, (loc) => {
        const updatedLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }
        setUserLocation(updatedLocation)
      })
      setLocationSubscription(subscription)
    } catch (error) {
      console.log("Get location error:", error)
      const defaultLocation = { latitude: -1.9441, longitude: 30.0619 }
      setUserLocation(defaultLocation)
    }
  }, [])

  // Marker press: draw route + show popup + filter cards to selected car
  const handleCarMarkerPress = async (car) => {
  setSelectedCarId(car._id || car.id)
  bouncePin()

  try {
    const carCoords = {
      latitude: car.coordinates?.latitude || car.latitude,
      longitude: car.coordinates?.longitude || car.longitude,
    }

    const directions = await getTurnByTurnDirections(userLocation, carCoords)

    setRouteCoordinates(directions.coordinates)
    setRouteInfo({
      distance: directions.totalDistance,
      duration: directions.totalDuration,
    })

    setSelectedCar(car)
    setShowCarDetails(true)
  } catch (error) {
    console.log("❌ Directions failed in Home:", error)
  }
}

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
    if (hour < 12) return `${t("morningGreeting")} ${name}!`
    if (hour < 17) return `${t("afternoonGreeting")} ${name}!`
    return `${t("eveningGreeting")} ${name}!`
  }, [user])
// AUTO FILTER WHILE TYPING
const handleSearch = useCallback(
  (text) => {
    setSearchText(text)
    setSearchQuery(text)

    if (text.trim().length === 0) {
      setFilteredCars(actualApprovedCars)
      setShowNoResultsModal(false)
      return
    }

    // auto filter instantly (no waiting)
    const query = text.toLowerCase().trim()
    const results = actualApprovedCars.filter((car) =>
      [
        car.brand,
        car.make,
        car.model,
        car.type,
        car.district,
        car.sector,
        car.location,
        car.address,
        `${car.brand || car.make} ${car.model}`,
      ]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(query)),
    )

    setFilteredCars(results)

    if (results.length > 0 && mapRef.current) {
      const coords = results
        .filter((c) => typeof (c.coordinates?.latitude || c.latitude) === "number")
        .map((c) => ({
          latitude: c.coordinates?.latitude || c.latitude,
          longitude: c.coordinates?.longitude || c.longitude,
        }))
      if (userLocation) coords.push(userLocation)
      fitMapToAllCars(coords)
    }

    // Don't trigger modal here (only on submit)
    setShowNoResultsModal(false)
  },
  [actualApprovedCars, fitMapToAllCars, userLocation],
)

// TRIGGER WHEN PRESS RETURN / ENTER
const handleSearchSubmit = useCallback(
  (text) => {
    const q = text.toLowerCase().trim()
    if (!q || q.length < 2) return

    const results = actualApprovedCars.filter((car) =>
      [
        car.brand,
        car.make,
        car.model,
        car.type,
        car.district,
        car.sector,
        car.location,
        car.address,
        `${car.brand || car.make} ${car.model}`,
      ]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(q)),
    )

    setFilteredCars(results)

    if (results.length > 0 && mapRef.current) {
      const coords = results
        .filter((c) => typeof (c.coordinates?.latitude || c.latitude) === "number")
        .map((c) => ({
          latitude: c.coordinates?.latitude || c.latitude,
          longitude: c.coordinates?.longitude || c.longitude,
        }))
      if (userLocation) coords.push(userLocation)
      fitMapToAllCars(coords)
    }

    // 👇 Show modal only on Return
    if (results.length === 0) {
      setShowNoResultsModal(true)
    } else {
      setShowNoResultsModal(false)
    }
  },
  [actualApprovedCars, fitMapToAllCars, userLocation],
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
    i18n.changeLanguage(currentLanguage);
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
     
Alert.alert(
  t("trackingDisabledTitle"),
  t("trackingDisabledMessage")
)
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
        t("trackingActivatedTitle"),
        t("trackingActivatedMessage", {
          count: nearby.length,
          brand: nearest.brand || nearest.make,
          model: nearest.model,
          distance: nearest.distance,
        })
      );
    } else {
      Alert.alert(
        t("noNearbyCarsTitle"),
        t("noNearbyCarsMessage")
      );
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
        Alert.alert(
          t("noResultsTitle"),
          t("noResultsMessage"),
          [
            {
              text: "OK",
              onPress: () => {
                setSearchText("")                // 🔹 clear search bar
                setSearchQuery("")               // 🔹 clear query
                setFilteredCars(actualApprovedCars) // 🔹 restore all cars
              // 🔹 zoom map to normal
              },
            },
          ],
          { cancelable: true },
        )
      } else {
        Alert.alert(
          t("filtersAppliedTitle"),
          t("filtersAppliedMessage", { count: filtered.length }),
          [
            {
              text: "OK",
              onPress: () => {
                // optional: you can also refocus map to filtered cars here if you want
                fitMapToAllCars(filtered)
              },
            },
          ],
          { cancelable: true },
        )
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
              <Text style={styles.subtitle}>{t("welcomeMessage")}</Text>
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.flagButton} onPress={() => setShowLanguageDropdown(true)}>
                <Image source={{ uri: getCurrentLanguageFlag() }} style={styles.flagImage} />
              </TouchableOpacity>

<TouchableOpacity
  style={styles.notificationButton}
  onPress={() => setShowNotificationBottomSheet(true)}
>
  <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />

  {unreadCount > 0 && <View style={styles.notificationDot} />}
</TouchableOpacity>
        {/* Notification Bottom Sheet */}
        <NotificationBottomSheet
          visible={showNotificationBottomSheet}
          onClose={() => setShowNotificationBottomSheet(false)}
        />



            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
  style={styles.searchInput}
  value={searchText}
  onChangeText={handleSearch}
  placeholder={t("searchPlaceholder")}
  returnKeyType="search"
  onSubmitEditing={() => handleSearchSubmit(searchText)}
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
          onUserLocationChange={(e) => {
            const { coordinate } = e.nativeEvent
            setUserLocation(coordinate)
          }}
          onPress={(event) => {
            if (event && event.persist) event.persist()
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

  if (!carLat || !carLng) return null

  const isSelected = selectedCarId === (car._id || car.id)
  const logo = getBrandLogo(car.brand || car.make)

  return (
    <Marker
      key={`car-${getStableCarKey(car)}`}
      coordinate={{ latitude: carLat, longitude: carLng }}
      onPress={(event) => {
        if (event && event.persist) event.persist()
        handleCarMarkerPress(car)
      }}
    >
      <Animated.View
        style={{
         transform: [{ translateY: isSelected ? selectedPinAnim : 0 }]
,
        }}
      >
        <View style={styles.pinWrapper}>
          <View
            style={[
              styles.pinCircle,
              isSelected && { borderColor: "#FF9800" },
            ]}
          >
            {logo ? (
              <Image source={{ uri: logo }} style={styles.pinLogo} />
            ) : (
              <Icon name="car-outline" size={20} color="#007EFD" />
            )}
          </View>
          <View style={styles.pinTriangle} />
        </View>
      </Animated.View>
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
              <Text style={styles.noResultsModalTitle}>{t("carNotAvailableTitle")}</Text>
              <Text style={styles.noResultsModalMessage}>
              {t("carNotAvailableMessage", { query: searchQuery })}
              </Text>
              <TouchableOpacity
  style={styles.noResultsModalButton}
  onPress={() => {
    setShowNoResultsModal(false)
    setSearchText("")              // 🔹 clear search bar text
    setSearchQuery("")             // 🔹 clear search query
    setFilteredCars(actualApprovedCars) // 🔹 show all cars again
  }}
>
  <Text style={styles.noResultsModalButtonText}>{t("close")}</Text>
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
             {getBrandLogo(popupCar.brand || popupCar.make) ? (
  <Image
    source={{ uri: getBrandLogo(popupCar.brand || popupCar.make) }}
    style={styles.brandLogoCircle}
  />
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
              {sortedCars.map((car) => {
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
})}

            </ScrollView>
          )}
        </Animated.View>

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate("CarListing", { cars: actualApprovedCars })}
          >
            <Icon name="car" size={28} color="#007EFD" />
          </TouchableOpacity>
<View style={styles.fabWrapper}>
  <TouchableOpacity style={styles.fabButton} onPress={handleTrackNearestCar}>
    <Image
      source={{
        uri: "https://i.pinimg.com/originals/1d/0f/be/1d0fbe16bf9237d6f082ad8cc9be1f74.gif",
      }}
      style={styles.trackGif}
    />
  </TouchableOpacity>

  <Text style={styles.fabLabel}>
    {t("trackNearestCar")}

  </Text>
</View>

          <TouchableOpacity style={styles.navButton} onPress={() => setShowSettingsModal(true)}>
            <Icon name="settings" size={28} color="#007EFD" />
          </TouchableOpacity>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  dropPin: {
  width: 46,
  height: 46,
  backgroundColor: "#ff0000ff",
  borderRadius: 23,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
  transform: [{ rotate: "45deg" }],
},

dropLogo: {
  width: 28,
  height: 28,
  transform: [{ rotate: "-45deg" }],
},

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22.5,
    resizeMode: "cover",
  },
  notificationButton: {
  position: "relative",
  padding: 6,
},


notificationBadge: {
  position: "absolute",
  top: -4,
  right: -4,
  backgroundColor: "#FF3B30",
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
},

notificationCount: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
},

notificationDot: {
  position: "absolute",
  top: 4,
  right: 4,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "red",
},
pinWrapper: {
  alignItems: "center",
},

pinCircle: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#007EFD",
  elevation: 5,
},

pinLogo: {
  width: 26,
  height: 26,
  resizeMode: "contain",
},

pinTriangle: {
  width: 0,
  height: 0,
  borderLeftWidth: 6,
  borderRightWidth: 6,
  borderTopWidth: 10,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  borderTopColor: "#007EFD",
  marginTop: -1,
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
  brandPin: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#ff0000ff",
  justifyContent: "center",
  alignItems: "center",

  borderWidth: 3,
  borderColor: "#007EFD",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},

brandLogo: {
  width: 28,
  height: 28,
  resizeMode: "contain",
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
    width: width - 10,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 55,
    marginRight: 55,
  },
  noResultsText: {
    fontSize: 16,
    color: "rgba(244, 67, 54, 0.9)",
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
    paddingVertical: 1,
    paddingBottom: 50,
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
  fabWrapper: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: -25, // lifts FAB above bottom bar nicely
},

fabLabel: {
  marginTop: 4,
  fontSize: 12,
  fontWeight: "600",
  color: "#333",
  textAlign: "center",
},

  fabButton: {
    backgroundColor: "#007EFD",
    borderRadius: 40,
    width: 70,
    height: 70,
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
