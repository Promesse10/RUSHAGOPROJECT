"use client"

import { useState, useRef, useEffect } from "react"
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
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import Icon from "react-native-vector-icons/Ionicons"
import * as Location from "expo-location"
import I18n from "../../utils/i18n"
import NotificationChatBot from "../../screens/CarRenter/NotificationsScreen"
import SettingsModal from "../../screens/CarRenter/SettingsModal"
import CarDetailsModal from "../../screens/CarRenter/CarDetailsScreen"
import FilterSidebar from "../../screens/CarRenter/FilterSidebar"
import SkeletonLoader from "../../screens/CarRenter/SkeletonLoader"
import { getDirections } from "../../utils/googleDirections"
import { useRoute } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")

const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showCarDetails, setShowCarDetails] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [filteredCars, setFilteredCars] = useState([])
  const [currentLanguage, setCurrentLanguage] = useState("rw") // Default to Kinyarwanda
  const [userLocation, setUserLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapType, setMapType] = useState("standard")
  const [isTracking, setIsTracking] = useState(false)
  const [nearestCar, setNearestCar] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [showAdvertising, setShowAdvertising] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    profileImage: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  })

  const slideAnim = useRef(new Animated.Value(height * 0.4)).current
  const trackingAnim = useRef(new Animated.Value(1)).current
  const adSlideAnim = useRef(new Animated.Value(width)).current
  const mapRef = useRef(null)
  const route = useRoute()
  const [searchTimeout, setSearchTimeout] = useState(null)

  const languages = [
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
  ]

  // Rwanda Districts, Sectors, and Streets
  const rwandaPlaces = [
    // Kigali Districts
    "Nyarugenge, Kigali",
    "Gasabo, Kigali",
    "Kicukiro, Kigali",

    // Nyarugenge Sectors
    "Gitega, Nyarugenge",
    "Kanyinya, Nyarugenge",
    "Kigali, Nyarugenge",
    "Kimisagara, Nyarugenge",
    "Mageragere, Nyarugenge",
    "Muhima, Nyarugenge",
    "Nyakabanda, Nyarugenge",
    "Nyamirambo, Nyarugenge",
    "Nyarugenge, Nyarugenge",
    "Rwezamenyo, Nyarugenge",

    // Gasabo Sectors
    "Bumbogo, Gasabo",
    "Gatsata, Gasabo",
    "Gikomero, Gasabo",
    "Gisozi, Gasabo",
    "Jabana, Gasabo",
    "Jali, Gasabo",
    "Kacyiru, Gasabo",
    "Kimihurura, Gasabo",
    "Kimironko, Gasabo",
    "Kinyinya, Gasabo",
    "Ndera, Gasabo",
    "Nduba, Gasabo",
    "Remera, Gasabo",
    "Rusororo, Gasabo",
    "Rutunga, Gasabo",

    // Kicukiro Sectors
    "Gahanga, Kicukiro",
    "Gatenga, Kicukiro",
    "Gikondo, Kicukiro",
    "Kagarama, Kicukiro",
    "Kanombe, Kicukiro",
    "Kicukiro, Kicukiro",
    "Kigarama, Kicukiro",
    "Masaka, Kicukiro",
    "Niboye, Kicukiro",
    "Nyarugunga, Kicukiro",

    // Other Major Districts
    "Musanze, Rwanda",
    "Huye, Rwanda",
    "Rubavu, Rwanda",
    "Muhanga, Rwanda",
    "Nyanza, Rwanda",
    "Rwamagana, Rwanda",
    "Kayonza, Rwanda",
    "Kirehe, Rwanda",
    "Ngoma, Rwanda",
    "Bugesera, Rwanda",
    "Ruhango, Rwanda",
    "Nyagatare, Rwanda",
    "Gatsibo, Rwanda",
    "Kamonyi, Rwanda",
    "Rulindo, Rwanda",

    // Popular Streets and Places
    "KG Ave, Kigali",
    "Kimihurura Road, Kigali",
    "Remera Road, Kigali",
    "Nyamirambo Road, Kigali",
    "Kacyiru Road, Kigali",
    "Airport Road, Kigali",
    "Gikondo Road, Kigali",
    "Kimisagara Road, Kigali",
    "Muhima Road, Kigali",
    "Nyabugogo Road, Kigali",
  ]

  // Advertising images
  const advertisingImages = [
    "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/car-rental-ads-design-template-3207db6ef2a30bfdab0764c26be1299b_screen.jpg?ts=1686821575",
    "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/car-rental-flyers-design-template-3499e893ec42cdf60176581c4c269c39_screen.jpg?ts=1622280638",
  ]

  // Enhanced car data with more cars distributed across regions
  const cars = [
    // Nyarugenge Cars
    {
      id: 1,
      make: "BMW",
      model: "i3",
      year: "2023",
      type: "Electric",
      transmission: "Automatic",
      fuel_type: "Electric",
      seatings: "4",
      features: ["GPS", "Bluetooth", "AC", "USB Charging"],
      ownerType: "individual",
      ownerName: "Jean Claude Uwimana",
      countryCode: "+250",
      ownerPhone: "788123456",
      province: "Kigali",
      district: "Nyarugenge",
      sector: "Nyamirambo",
      address: "KG 15 Ave, Nyarugenge",
      country: "Rwanda",
      latitude: -1.9441,
      longitude: 30.0619,
      base_price: "3500",
      currency: "FRW",
      weekly_discount: "10",
      monthly_discount: "20",
      available: true,
      images: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400",
      ],
      rating: 4.8,
      category: "Electric",
    },
    {
      id: 2,
      make: "Toyota",
      model: "Camry",
      year: "2022",
      type: "Sedan",
      transmission: "Automatic",
      fuel_type: "Gasoline",
      seatings: "5",
      features: ["GPS", "Bluetooth", "AC", "Backup Camera"],
      ownerType: "individual",
      ownerName: "Marie Uwimana",
      countryCode: "+250",
      ownerPhone: "788987654",
      province: "Kigali",
      district: "Nyarugenge",
      sector: "Muhima",
      address: "KG 21 Ave, Nyarugenge",
      country: "Rwanda",
      latitude: -1.9456,
      longitude: 30.0598,
      base_price: "3000",
      currency: "FRW",
      weekly_discount: "12",
      monthly_discount: "22",
      available: false,
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400",
      ],
      rating: 4.5,
      category: "Sedan",
    },

    // Gasabo Cars
    {
      id: 3,
      make: "Toyota",
      model: "Prius",
      year: "2023",
      type: "Hybrid",
      transmission: "Automatic",
      fuel_type: "Hybrid",
      seatings: "5",
      features: ["Eco Mode", "GPS", "Bluetooth", "AC", "Wireless Charging"],
      ownerType: "agency",
      ownerName: "Green Car Agency",
      countryCode: "+250",
      ownerPhone: "788555444",
      province: "Kigali",
      district: "Gasabo",
      sector: "Kacyiru",
      address: "KG 5 Ave, Gasabo",
      country: "Rwanda",
      latitude: -1.9461,
      longitude: 30.0644,
      base_price: "3200",
      currency: "FRW",
      weekly_discount: "15",
      monthly_discount: "25",
      available: true,
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400",
      ],
      rating: 4.7,
      category: "Hybrid",
    },
    {
      id: 4,
      make: "Toyota",
      model: "RAV4",
      year: "2023",
      type: "SUV",
      transmission: "Automatic",
      fuel_type: "Gasoline",
      seatings: "7",
      features: ["4WD", "GPS", "Bluetooth", "AC", "Roof Rack"],
      ownerType: "individual",
      ownerName: "Paul Kagame",
      countryCode: "+250",
      ownerPhone: "788777888",
      province: "Kigali",
      district: "Gasabo",
      sector: "Kimihurura",
      address: "KG 10 Ave, Gasabo",
      country: "Rwanda",
      latitude: -1.938,
      longitude: 30.068,
      base_price: "4500",
      currency: "FRW",
      weekly_discount: "18",
      monthly_discount: "30",
      available: true,
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400",
      ],
      rating: 4.9,
      category: "SUV",
    },

    // Kicukiro Cars
    {
      id: 5,
      make: "Honda",
      model: "Civic",
      year: "2022",
      type: "Sedan",
      transmission: "Manual",
      fuel_type: "Gasoline",
      seatings: "5",
      features: ["GPS", "Bluetooth", "AC"],
      ownerType: "individual",
      ownerName: "Alice Mukamana",
      countryCode: "+250",
      ownerPhone: "788333222",
      province: "Kigali",
      district: "Kicukiro",
      sector: "Gatenga",
      address: "KG 25 Ave, Kicukiro",
      country: "Rwanda",
      latitude: -1.9536,
      longitude: 30.0606,
      base_price: "2800",
      currency: "FRW",
      weekly_discount: "10",
      monthly_discount: "18",
      available: true,
      images: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
      ],
      rating: 4.3,
      category: "Sedan",
    },
    {
      id: 6,
      make: "Nissan",
      model: "X-Trail",
      year: "2023",
      type: "SUV",
      transmission: "Automatic",
      fuel_type: "Gasoline",
      seatings: "7",
      features: ["4WD", "GPS", "Bluetooth", "AC", "Sunroof"],
      ownerType: "agency",
      ownerName: "Kigali Car Rentals",
      countryCode: "+250",
      ownerPhone: "788111000",
      province: "Kigali",
      district: "Kicukiro",
      sector: "Kanombe",
      address: "Airport Road, Kicukiro",
      country: "Rwanda",
      latitude: -1.9686,
      longitude: 30.1394,
      base_price: "4200",
      currency: "FRW",
      weekly_discount: "20",
      monthly_discount: "35",
      available: false,
      images: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
      ],
      rating: 4.6,
      category: "SUV",
    },

    // Additional cars for other regions
    {
      id: 7,
      make: "Hyundai",
      model: "Elantra",
      year: "2022",
      type: "Sedan",
      transmission: "Automatic",
      fuel_type: "Gasoline",
      seatings: "5",
      features: ["GPS", "Bluetooth", "AC", "Heated Seats"],
      ownerType: "individual",
      ownerName: "David Nkurunziza",
      countryCode: "+250",
      ownerPhone: "788444555",
      province: "Southern",
      district: "Huye",
      sector: "Tumba",
      address: "Huye Town, Rwanda",
      country: "Rwanda",
      latitude: -2.5967,
      longitude: 29.7392,
      base_price: "2900",
      currency: "FRW",
      weekly_discount: "12",
      monthly_discount: "20",
      available: true,
      images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400"],
      rating: 4.4,
      category: "Sedan",
    },
    {
      id: 8,
      make: "Mitsubishi",
      model: "Outlander",
      year: "2023",
      type: "SUV",
      transmission: "Automatic",
      fuel_type: "Gasoline",
      seatings: "7",
      features: ["4WD", "GPS", "Bluetooth", "AC"],
      ownerType: "agency",
      ownerName: "Rwanda Car Hub",
      countryCode: "+250",
      ownerPhone: "788666777",
      province: "Northern",
      district: "Musanze",
      sector: "Muhoza",
      address: "Musanze Town, Rwanda",
      country: "Rwanda",
      latitude: -1.4983,
      longitude: 29.6384,
      base_price: "4000",
      currency: "FRW",
      weekly_discount: "15",
      monthly_discount: "28",
      available: true,
      images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400"],
      rating: 4.5,
      category: "SUV",
    },
  ]

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    I18n.setLocale(currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    if (isTracking) {
      // Start pulsing animation for tracking
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
  }, [isTracking])

  // Advertising cycle effect
  useEffect(() => {
    const startAdvertisingCycle = () => {
      // Show car cards for 10 seconds
      setTimeout(() => {
        setShowAdvertising(true)

        // Start ad sliding animation
        Animated.timing(adSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start()

        // Show ads for 20 seconds with sliding between them
        const adInterval = setInterval(() => {
          setCurrentAdIndex((prev) => (prev + 1) % advertisingImages.length)
        }, 10000) // Change ad every 10 seconds

        // Hide ads after 20 seconds
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

    if (!isLoading && filteredCars.length > 0) {
      startAdvertisingCycle()

      // Repeat the cycle every 30 seconds (10s cards + 20s ads)
      const cycleInterval = setInterval(startAdvertisingCycle, 30000)

      return () => clearInterval(cycleInterval)
    }
  }, [isLoading, filteredCars])

  useEffect(() => {
    if (route?.params?.showDirections && route?.params?.destinationCar) {
      const destinationCar = route.params.destinationCar

      // Set up turn-by-turn directions
      if (userLocation && mapRef.current) {
        // Focus on route between user and car
        mapRef.current.animateToRegion(
          {
            latitude: (userLocation.latitude + destinationCar.latitude) / 2,
            longitude: (userLocation.longitude + destinationCar.longitude) / 2,
            latitudeDelta: Math.abs(userLocation.latitude - destinationCar.latitude) * 1.5 + 0.01,
            longitudeDelta: Math.abs(userLocation.longitude - destinationCar.longitude) * 1.5 + 0.01,
          },
          1000,
        )

        // Get and display directions
        getDirections(userLocation, {
          latitude: destinationCar.latitude,
          longitude: destinationCar.longitude,
        })
          .then((directions) => {
            setRouteCoordinates(directions.coordinates)
            setRouteInfo(directions)
          })
          .catch((error) => {
            console.log("Error getting directions:", error)
            setRouteCoordinates([
              userLocation,
              { latitude: destinationCar.latitude, longitude: destinationCar.longitude },
            ])
          })
      }
    }
  }, [route?.params])

  const initializeApp = async () => {
    setIsLoading(true)

    // Request location permission and get current location
    await requestLocationPermission()

    // Simulate loading time
    setTimeout(() => {
      setFilteredCars(cars)
      setIsLoading(false)

      // Animate car cards sliding up to overlay position
      Animated.timing(slideAnim, {
        toValue: height * 0.65,
        duration: 1500,
        useNativeDriver: false,
      }).start()
    }, 2000)
  }

  const requestLocationPermission = async () => {
    try {
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
      // Set default location to Kigali if location access fails
      setUserLocation({
        latitude: -1.9441,
        longitude: 30.0619,
      })
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({})
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    } catch (error) {
      console.log("Get location error:", error)
      // Set default location to Kigali if location access fails
      setUserLocation({
        latitude: -1.9441,
        longitude: 30.0619,
      })
    }
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    const name = userProfile.name

    if (hour < 12) {
      return `${I18n.t("morningGreeting")} ${name}`
    } else if (hour < 17) {
      return `${I18n.t("afternoonGreeting")} ${name}`
    } else {
      return `${I18n.t("eveningGreeting")} ${name}`
    }
  }

  const handleSearch = (text) => {
    setSearchText(text)

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (text.length > 0) {
      const placeSuggestions = rwandaPlaces.filter((place) => place.toLowerCase().includes(text.toLowerCase()))

      setShowSuggestions(placeSuggestions.length > 0)

      // Set timeout for car filtering and "no results" alert
      const timeout = setTimeout(() => {
        const carResults = cars.filter(
          (car) =>
            car.make.toLowerCase().includes(text.toLowerCase()) ||
            car.model.toLowerCase().includes(text.toLowerCase()) ||
            car.type.toLowerCase().includes(text.toLowerCase()) ||
            car.district?.toLowerCase().includes(text.toLowerCase()) ||
            car.sector?.toLowerCase().includes(text.toLowerCase()) ||
            car.address?.toLowerCase().includes(text.toLowerCase()) ||
            `${car.make} ${car.model}`.toLowerCase().includes(text.toLowerCase()),
        )

        setFilteredCars(carResults)

        // Show "no car found" alert only after complete typing (1.5 seconds delay)
        if (carResults.length === 0 && text.length > 2 && !placeSuggestions.length) {
          Alert.alert(I18n.t("carNotFound"), `No cars found matching "${text}"`)
        }
      }, 1500)

      setSearchTimeout(timeout)
    } else {
      setFilteredCars(cars)
      setShowSuggestions(false)
      setSelectedRegion(null)
    }
  }

  const handleSuggestionSelect = (place) => {
    setSearchText(place)
    setShowSuggestions(false)
    dismissKeyboard()

    // Filter cars by selected location
    const searchLocation = place.toLowerCase()
    const locationCars = cars.filter(
      (car) =>
        car.district?.toLowerCase().includes(searchLocation) ||
        car.sector?.toLowerCase().includes(searchLocation) ||
        car.address?.toLowerCase().includes(searchLocation),
    )

    setFilteredCars(locationCars)

    // Set region selection for map highlighting
    if (searchLocation.includes("nyarugenge")) {
      setSelectedRegion("nyarugenge")
    } else if (searchLocation.includes("gasabo")) {
      setSelectedRegion("gasabo")
    } else if (searchLocation.includes("kicukiro")) {
      setSelectedRegion("kicukiro")
    }
  }

  const handleCarSelect = async (car) => {
    setSelectedCar(car)

    // Get directions to selected car
    if (userLocation) {
      try {
        const directions = await getDirections(userLocation, {
          latitude: car.latitude,
          longitude: car.longitude,
        })

        setRouteCoordinates(directions.coordinates)
        setRouteInfo(directions)
      } catch (error) {
        console.log("Error getting directions:", error)
        // Fallback to simple polyline
        setRouteCoordinates([userLocation, { latitude: car.latitude, longitude: car.longitude }])
      }
    }

    setShowCarDetails(true)
  }

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language)
    I18n.setLocale(language)
    setShowLanguageDropdown(false)
  }

  const getCurrentLanguageFlag = () => {
    const currentLang = languages.find((lang) => lang.code === currentLanguage)
    return currentLang ? currentLang.flag : languages[0].flag // Default to Kinyarwanda
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance.toFixed(1)
  }

  const sortCarsByDistance = (cars) => {
    if (!userLocation) return cars

    return cars
      .map((car) => ({
        ...car,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, car.latitude, car.longitude),
      }))
      .sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance))
  }

  const handleTrackNearestCar = () => {
    if (!userLocation) {
      Alert.alert(I18n.t("enableLocation"), I18n.t("locationPermission"))
      return
    }

    const sortedCars = sortCarsByDistance(cars.filter((car) => car.available))
    if (sortedCars.length > 0) {
      const nearest = sortedCars[0]
      setNearestCar(nearest)
      setIsTracking(true)

      // Focus map on user location with nearest car visible
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: (userLocation.latitude + nearest.latitude) / 2,
            longitude: (userLocation.longitude + nearest.longitude) / 2,
            latitudeDelta: Math.abs(userLocation.latitude - nearest.latitude) * 2 + 0.01,
            longitudeDelta: Math.abs(userLocation.longitude - nearest.longitude) * 2 + 0.01,
          },
          1000,
        )
      }
    }
  }

  const handleApplyFilters = (filters) => {
    let filtered = cars

    // Apply price filter
    filtered = filtered.filter(
      (car) =>
        Number.parseInt(car.base_price) >= filters.priceRange[0] &&
        Number.parseInt(car.base_price) <= filters.priceRange[1],
    )

    // Apply make filter
    if (filters.make !== "all") {
      filtered = filtered.filter((car) => car.make === filters.make)
    }

    // Apply model filter
    if (filters.model !== "all") {
      filtered = filtered.filter((car) => car.model === filters.model)
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((car) => car.type === filters.type)
    }

    // Apply year filter
    if (filters.year !== "all") {
      filtered = filtered.filter((car) => car.year === filters.year)
    }

    // Apply transmission filter
    if (filters.transmission !== "all") {
      filtered = filtered.filter((car) => car.transmission === filters.transmission)
    }

    // Apply fuel type filter
    if (filters.fuelType !== "all") {
      filtered = filtered.filter((car) => car.fuel_type === filters.fuelType)
    }

    // Apply seatings filter
    if (filters.seatings !== "all") {
      filtered = filtered.filter((car) => car.seatings === filters.seatings)
    }

    // Apply features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter((car) => filters.features.every((feature) => car.features?.includes(feature)))
    }

    setFilteredCars(filtered)

    // Navigate to AvailableCars screen with filtered results
    if (filtered.length === 0) {
      Alert.alert("No Results", "No cars match your filter criteria")
    } else {
      navigation.navigate("AvailableCars", { filteredCars: filtered })
    }
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss()
    setShowSuggestions(false)
  }

  const getRegionOverlay = () => {
    if (!selectedRegion) return null

    const regionCoords = {
      nyarugenge: [
        { latitude: -1.95, longitude: 30.05 },
        { latitude: -1.95, longitude: 30.07 },
        { latitude: -1.935, longitude: 30.07 },
        { latitude: -1.935, longitude: 30.05 },
      ],
      gasabo: [
        { latitude: -1.935, longitude: 30.06 },
        { latitude: -1.935, longitude: 30.08 },
        { latitude: -1.92, longitude: 30.08 },
        { latitude: -1.92, longitude: 30.06 },
      ],
      kicukiro: [
        { latitude: -1.96, longitude: 30.05 },
        { latitude: -1.96, longitude: 30.15 },
        { latitude: -1.98, longitude: 30.15 },
        { latitude: -1.98, longitude: 30.05 },
      ],
    }

    return regionCoords[selectedRegion] || null
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#007EFD" />

        {/* Header Skeleton */}
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

        {/* Map Skeleton */}
        <View style={[styles.fullMap, { backgroundColor: "#E0E0E0" }]} />

        {/* Car Cards Skeleton */}
        <View style={[styles.carCardsOverlay, { top: height * 0.65 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carCardsContent}>
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
          </ScrollView>
        </View>

        {/* Bottom Navigation Skeleton */}
        <View style={styles.bottomNav}>
          <View style={[styles.skeletonCircle, { width: 24, height: 24 }]} />
          <View style={[styles.skeletonCircle, { width: 60, height: 60 }]} />
          <View style={[styles.skeletonCircle, { width: 24, height: 24 }]} />
        </View>
      </View>
    )
  }

  const sortedCars = sortCarsByDistance(filteredCars)

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
                <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
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
                placeholder="Shakisha ahantu cyangwa imodoka..." // Kinyarwanda placeholder
                onFocus={() => setShowSuggestions(true)}
              />
            </View>

            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterSidebar(true)}>
              <Icon name="filter" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Suggestions */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {rwandaPlaces
                .filter((place) => place.toLowerCase().includes(searchText.toLowerCase()))
                .slice(0, 8) // Limit suggestions
                .map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(place)}
                  >
                    <Icon name="location" size={16} color="#007EFD" />
                    <Text style={styles.suggestionText}>{place}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        {/* Full Map with grayscale and satellite toggle */}
        <MapView
          ref={mapRef}
          style={[styles.fullMap, { filter: "grayscale(100%)" }]}
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
        >
          {/* Region Overlay for selected area */}
          {getRegionOverlay() && (
            <Polyline
              coordinates={getRegionOverlay()}
              strokeColor="rgba(0, 126, 253, 0.6)"
              fillColor="rgba(0, 126, 253, 0.2)"
              strokeWidth={3}
            />
          )}

          {/* User Location Marker with Tracking Glow */}
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

          {/* Car Markers with availability status */}
          {sortedCars.map((car) => (
            <Marker
              key={car.id}
              coordinate={{
                latitude: car.latitude,
                longitude: car.longitude,
              }}
              onPress={() => handleCarSelect(car)}
            >
              <View
                style={[styles.carMarkerContainer, nearestCar?.id === car.id && isTracking && styles.nearestCarMarker]}
              >
                <Image
                  source={car.available ? require("../../assets/available.png") : require("../../assets/nonavailable.png")}
                  style={styles.carMarkerImage}
                />
                {car.distance && (
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{car.distance}km</Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}

          {/* Google Directions Route */}
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeColor="#007EFD" strokeWidth={4} lineDashPattern={[1]} />
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
          >
            <Icon name={mapType === "standard" ? "satellite" : "map"} size={20} color="#007EFD" />
          </TouchableOpacity>
        </View>

        {/* Overlaying Car Cards or Advertising */}
        <Animated.View style={[styles.carCardsOverlay, { top: slideAnim }]}>
          {showAdvertising ? (
            <Animated.View style={[styles.advertisingContainer, { transform: [{ translateX: adSlideAnim }] }]}>
              <Image
                source={{ uri: advertisingImages[currentAdIndex] }}
                style={styles.advertisingImage}
                resizeMode="cover"
              />
              <View style={styles.adIndicator}>
                {advertisingImages.map((_, index) => (
                  <View key={index} style={[styles.adDot, index === currentAdIndex && styles.adDotActive]} />
                ))}
              </View>
            </Animated.View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carCardsContent}
              style={styles.carCardsScroll}
            >
              {sortedCars.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>{I18n.t("noCarsAvailable")}</Text>
                </View>
              ) : (
                sortedCars.map((car) => (
                  <TouchableOpacity key={car.id} style={styles.carCard} onPress={() => handleCarSelect(car)}>
                    <View style={styles.carImageContainer}>
                      <Image source={{ uri: car.images[0] }} style={styles.carImage} />
                      <View style={styles.brandBadge}>
                        <Text style={styles.brandText}>{car.make}</Text>
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
                        {car.make} {car.model}
                      </Text>
                      <Text style={styles.carLocation}>
                        {car.sector}, {car.district}
                      </Text>
                      <Text style={styles.carPrice}>
                        {car.base_price} {car.currency} <Text style={styles.perDay}>/{I18n.t("perDay")}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </Animated.View>

        {/* White Bottom Navigation with FAB */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("CarListing", { cars: cars })}>
            <Icon name="car" size={24} color="#007EFD" />
          </TouchableOpacity>

          {/* FAB Track Button */}
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

        {/* Language Dropdown Modal */}
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
                  key={language.code}
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
          cars={cars}
        />

        {/* Notification ChatBot */}
        <NotificationChatBot />

        {/* Settings Modal */}
        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          userProfile={userProfile}
          onProfileUpdate={setUserProfile}
          navigation={navigation}
        />

        {/* Car Details Modal */}
        <CarDetailsModal
          visible={showCarDetails}
          onClose={() => {
            setShowCarDetails(false)
            setRouteCoordinates([])
            setRouteInfo(null)
          }}
          car={selectedCar}
          userLocation={userLocation}
          currentLanguage={currentLanguage}
          routeInfo={routeInfo}
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
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
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
  carCardsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  carCardsScroll: {
    flex: 1,
  },
  carCardsContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  noResultsContainer: {
    width: width - 40,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  carCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginRight: 20,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  carImageContainer: {
    position: "relative",
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  carImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  brandBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007EFD",
  },
  availabilityBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availableBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  unavailableBadge: {
    backgroundColor: "rgba(244, 67, 54, 0.9)",
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  cardDistanceBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardDistanceText: {
    fontSize: 10,
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
  },
  perDay: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#666",
  },
  // White Bottom Navigation with FAB
  bottomNav: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingBottom: 30,
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
    padding: 15,
  },
  // FAB Button
  fabButton: {
    backgroundColor: "#007EFD",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: -20, // Elevate above bottom bar
  },
  trackGif: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  // Skeleton styles
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
