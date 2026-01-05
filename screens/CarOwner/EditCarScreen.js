"use client"

import React, { useState, useEffect, useRef } from "react"


import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  Dimensions,
  FlatList,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "../../utils/axios"
import carIcon from "../../assets/car-marker.png"
import { rwandaLocations, searchLocations, getProvinceCoordinates } from "../../utils/rwandaLocations"
import { createCarAction, updateCarAction, checkPlateUniquenessAction } from "../../redux/action/CarActions"
import { getCurrentUserAction, searchUsersAction } from "../../redux/action/UserActions"
import { clearSearchResults } from "../../redux/slices/userSlice"
import { clearCreateState, clearUpdateState } from "../../redux/slices/carSlice"
import { carMakes, carModels, carTypes, transmissionTypes, fuelTypes, seatOptions } from "../../utils/carData"
import PaymentBottomSheet from "./PaymentBottomSheet"
import "../../utils/i18n"
import DraftBottomSheet from "../../components/DraftBottomSheet"

let MapView;
if (Platform.OS !== 'web') {
  MapView = require('react-native-maps').default;
}

let Marker;
if (Platform.OS !== 'web') {
  Marker = require('react-native-maps').Marker;
}

const { height: screenHeight } = Dimensions.get("window")

const initialFormData = {
  make: "",
  model: "",
  year: "",
  type: "",
  transmission: "",
  fuel_type: "",
  seatings: "",
  features: [],
  ownerType: "individual",
  ownerName: "",
  countryCode: "+250",
  ownerPhone: "",
  province: "",
  address: "",
  country: "Rwanda",
  latitude: "",
  longitude: "",
  base_price: "",
  currency: "FRW",
  weekly_discount: "",
  monthly_discount: "",
  images: {
    interior: null,
    exterior_front: null,
    exterior_side: null,
    exterior_rear: null,
  },
  thumbnail: null,
  category: "",
  plateNumber: "",
}

const EditCarScreen = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const route = useRoute()
  const carData = route.params?.carData;
const carId = carData?._id || carData?.id;

  const { t } = useTranslation()
  if (Platform.OS === 'web') {
    return <p>Map is not supported on web.</p>;
  }

  // ✅ FIXED: Get user from auth state and user state
  const authUser = useSelector((state) => state.auth?.user)
  const { currentUser, searchResults, isSearching } = useSelector((state) => state.user || {})
  const user = currentUser || authUser // Use currentUser if available, fallback to authUser

  // Redux state
  const {
    isCreating = false,
    isUpdating = false,
    isCreateSuccess = false,
    isUpdateSuccess = false,
    isCreateFailed = false,
    isUpdateFailed = false,
    createError = null,
    updateError = null,
    isCheckingPlate = false,
    isPlateUnique = null,
    plateCheckError = null,
  } = useSelector((state) => state.cars || {})

  const [isEditing, setIsEditing] = useState(route.params?.draftData?.isEditing || false)
  const [editingCarId, setEditingCarId] = useState(route.params?.draftData?.id)

  console.log("🚗 EditCarScreen - isEditing:", isEditing, "editingCarId:", editingCarId)

  const [currentStep, setCurrentStep] = useState(1)
  const [showMakeDropdown, setShowMakeDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showTransmissionDropdown, setShowTransmissionDropdown] = useState(false)
  const [showFuelDropdown, setShowFuelDropdown] = useState(false)
  const [showSeatsDropdown, setShowSeatsDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [originalData, setOriginalData] = useState(initialFormData)
  const [hasChanges, setHasChanges] = useState(false)
  const [filteredModels, setFilteredModels] = useState([])
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)
  const [isCustomModel, setIsCustomModel] = useState(false)
 const [showExitPrompt, setShowExitPrompt] = useState(false)

  // ✅ NEW: Owner autocomplete states
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false)
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("")
  const [isManualEntry, setIsManualEntry] = useState(false)

  // Custom make state
  const [customMake, setCustomMake] = useState("")

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Draft bottom sheet states
  const [showDraftBottomSheet, setShowDraftBottomSheet] = useState(false)

  // Draft prompt states
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [draftData, setDraftData] = useState(null)

const [showSaveDraftPrompt, setShowSaveDraftPrompt] = useState(false);

  // Local draft saving function
 const saveDraftLocally = async (draftData) => {
  try {
    const existing = await AsyncStorage.getItem("carDrafts");
    const drafts = existing ? JSON.parse(existing) : [];

    const filtered = drafts.filter(d => d.id !== draftData.id);
    filtered.push(draftData);

    await AsyncStorage.setItem("carDrafts", JSON.stringify(filtered));

    Alert.alert(t("Success"), t("Draft saved successfully!"));

  } catch (e) {
    Alert.alert(t("Error"), t("Failed to save draft"));
  }
};


  // Handle save as draft
  const handleSaveAsDraft = async () => {
    try {
      const draftData = {
        id: isEditing ? editingCarId : `draft_${Date.now()}`,
        formData,
        currentStep,
        isEditing,
        editingCarId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const response = await axios.post("/listings/draft", draftData)
      console.log("💾 Draft saved to server:", response.data)
      Alert.alert(t("Success"), t("Draft saved successfully!"))
    } catch (error) {
      console.error('❌ Failed to save draft:', error)
      Alert.alert(t("Error"), error.response?.data?.message || "Failed to save draft")
    }
  }
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
 const [formData, setFormData] = useState(initialFormData)
  const [mapRegion, setMapRegion] = useState({
    latitude: -1.9441,
    longitude: 30.0619,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
 useEffect(() => {
  if (!formData) return;

  if (formData.latitude && formData.longitude) {
    setSelectedLocation({
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    });

    setMapRegion({
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }
}, [formData]);
 const [selectedLocation, setSelectedLocation] = useState(null)

 

  // ✅ FIXED: Fetch current user on component mount
  useEffect(() => {
    if (!user && authUser) {
      console.log("🔄 Fetching current user profile...")
      dispatch(getCurrentUserAction())
    }
  }, [dispatch, user, authUser])

  // ✅ FIXED: Auto-fill owner information when user is available
  useEffect(() => {
    if (user && !isEditing && !isManualEntry) {
      console.log("👤 Auto-filling owner information:", user)
      setFormData((prev) => ({
        ...prev,
        ownerName: user.name || "",
        ownerPhone: user.phone?.replace("+250", "") || "",
      }))
    }
  }, [user, isEditing, isManualEntry])

  // ✅ FIXED: Reset form when not editing
  useEffect(() => {
    if (!isEditing) {
      setFormData(initialFormData)
      setCurrentStep(1)
      setHasChanges(false)
      setOriginalData(initialFormData)
      setCustomMake("")
      setSelectedLocation(null)
      setMapRegion({
        latitude: -1.9441,
        longitude: 30.0619,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
      setPaymentCompleted(false)
      setIsManualEntry(false)
    }
  }, [isEditing])

  // Handle back navigation prompt when editing
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) return;

      e.preventDefault();

      if (isEditing) {
        Alert.alert(
          t('Unsaved Changes'),
          t('You have unsaved changes. Would you like to save as draft or continue editing?'),
          [
            {
              text: t('Save as Draft'),
              onPress: async () => {
                await handleSaveAsDraft();
                navigation.dispatch(e.data.action)
              },
            },
            {
              text: t('Continue Editing'),
              style: 'cancel',
            },
            {
              text: t('Discard Changes'),
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        )
      } else {
        setShowExitPrompt(true);
      }
    });

    return unsubscribe;
  }, [navigation, hasChanges, isEditing, t])
)
  useEffect(() => {
    if (!isEditing) {
      console.log("🔍 Checking for drafts when adding new car...")
      AsyncStorage.getItem('carDrafts').then(drafts => {
        console.log("📝 Drafts found:", drafts)
        if (drafts) {
          const parsed = JSON.parse(drafts)
          console.log("📝 Parsed drafts:", parsed)
          if (parsed && parsed.length > 0) {
            setDraftData(parsed[0])
            setShowDraftPrompt(true)
            console.log("📝 Showing draft prompt with data:", parsed[0])
          }
        }
      }).catch(err => console.log('❌ Error loading drafts:', err))
    }
  }, [isEditing])

  // ✅ NEW: Handle owner name search for autocomplete
  const handleOwnerNameSearch = (text) => {
    setOwnerSearchQuery(text)
    setFormData({ ...formData, ownerName: text })
    setValidationErrors((prev) => ({ ...prev, ownerName: false }))

    if (text.length > 2 && !isManualEntry) {
      dispatch(searchUsersAction(text))
      setShowOwnerSuggestions(true)
    } else {
      setShowOwnerSuggestions(false)
      dispatch(clearSearchResults())
    }
  }

  // ✅ NEW: Select user from autocomplete
  const selectOwnerFromSuggestions = (selectedUser) => {
    console.log("👤 Selected user from suggestions:", selectedUser)
    setFormData({
      ...formData,
      ownerName: selectedUser.name,
      ownerPhone: selectedUser.phone?.replace("+250", "") || "",
    })
    setOwnerSearchQuery(selectedUser.name)
    setShowOwnerSuggestions(false)
    dispatch(clearSearchResults())
    setValidationErrors((prev) => ({ ...prev, ownerName: false, ownerPhone: false }))
  }

  // ✅ NEW: Toggle manual entry mode
  const toggleManualEntry = () => {
    setIsManualEntry(!isManualEntry)
    setShowOwnerSuggestions(false)
    dispatch(clearSearchResults())

    if (!isManualEntry) {
      // Switching to manual entry - clear auto-filled data
      setFormData((prev) => ({
        ...prev,
        ownerName: "",
        ownerPhone: "",
      }))
    } else {
      // Switching back to auto-complete - restore user data
      if (user) {
        setFormData((prev) => ({
          ...prev,
          ownerName: user.name || "",
          ownerPhone: user.phone?.replace("+250", "") || "",
        }))
      }
    }
  }

  // Load existing data if editing
 useEffect(() => {
  if (!carData) return;

  setIsEditing(true);
  setEditingCarId(carId);

  setFormData({

    make: carData.brand || "",
    model: carData.model || "",
    year: carData.year?.toString() || "",

    type: carData.type || carData.carType || "",
    transmission: carData.transmission || "",
    fuel_type: carData.fuelType || "",

    seatings: carData.seatings?.toString() || "",

    features: carData.features || [],

    ownerType: carData.owner?.type || "individual",
    ownerName: carData.owner?.name || "",
    ownerPhone: carData.owner?.phone?.replace("+250","") || "",
    countryCode: "+250",

      province: carData.province || "",
  address: carData.location || "",
  latitude: carData.coordinates?.latitude?.toString() || "",
  longitude: carData.coordinates?.longitude?.toString() || "",
  country: "Rwanda",

 base_price: carData.price?.toString() || "",
  weekly_discount: carData.weeklyDiscount?.toString() || "",
  monthly_discount: carData.monthlyDiscount?.toString() || "",

    category: carData.category || "",

    images: {
      exterior_front: carData.images?.[0] || null,
      exterior_side: carData.images?.[1] || null,
      exterior_rear: carData.images?.[2] || null,
      interior: carData.images?.[3] || null,
    },

    thumbnail: carData.thumbnail || null,
    plateNumber: carData.plate_number || "",

  });

setOriginalData({
  ...carData,
  weekly_discount: carData.weeklyDiscount,
  monthly_discount: carData.monthlyDiscount,
})


}, [carData]);
// Take ORIGINAL snapshot only once when editing starts
const originalSet = useRef(false)

useEffect(() => {
  if (
    isEditing &&
    !originalSet.current &&
    formData &&
    Object.keys(formData).length
  ) {
    setOriginalData(formData)
    originalSet.current = true
  }
}, [isEditing, formData])


  // Check for changes in form data
  useEffect(() => {
    if (isEditing) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData)
      setHasChanges(changed)
    }
  }, [formData, originalData, isEditing])

  // Handle Redux state changes
  useEffect(() => {
    if (isCreateSuccess) {
      Alert.alert(t("Success"), t("Car listing created successfully!"), [
        {
          text: t("OK"),
          onPress: () => {
            dispatch(clearCreateState())
            setFormData(initialFormData)
            setCurrentStep(1)
            navigation.navigate("MyCars")
          },
        },
      ])
    }
  }, [isCreateSuccess, dispatch, navigation, t])
useEffect(() => {
  if (isUpdateSuccess) {

    setOriginalData(formData); // sync baseline
    setHasChanges(false);      // reset change flag

    Alert.alert(
      t("Success"),
      t("Car listing updated successfully!"),
      [{ text: t("OK") }]
    );

    dispatch(clearUpdateState());
  }
}, [isUpdateSuccess]);


  useEffect(() => {
    if (isCreateFailed && createError) {
      Alert.alert(t("Error"), createError, [
        {
          text: t("OK"),
          onPress: () => {
            dispatch(clearCreateState())
            navigation.navigate("MyCars")
          },
        },
      ])
    }
  }, [isCreateFailed, createError, dispatch, navigation, t])

  useEffect(() => {
    if (isUpdateFailed && updateError) {
      Alert.alert(t("Error"), updateError)
      dispatch(clearUpdateState())
    }
  }, [isUpdateFailed, updateError, dispatch, t])

  // Auto-save draft
  useEffect(() => {
    if (currentStep > 1 && !isEditing && Object.keys(formData).some(key => formData[key] !== initialFormData[key])) {
      const draftData = {
        formData,
        currentStep,
        id: `draft_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveDraftLocally(draftData)
    }
  }, [currentStep, formData, isEditing])

  // Country codes with flags
  const countryCodes = [
    { code: "+250", country: "Rwanda", flag: "🇷🇼" },
    { code: "+256", country: "Uganda", flag: "🇺🇬" },
    { code: "+254", country: "Kenya", flag: "🇰🇪" },
    { code: "+255", country: "Tanzania", flag: "🇹🇿" },
    { code: "+257", country: "Burundi", flag: "🇧🇮" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
  ]

  const provinces = Object.keys(rwandaLocations)

  const allLocations = []
  for (const province in rwandaLocations) {
    for (const district in rwandaLocations[province].districts) {
      allLocations.push(district)
      for (const sector in rwandaLocations[province].districts[district].sectors) {
        allLocations.push(sector)
        const sectorData = rwandaLocations[province].districts[district].sectors[sector]
        if (sectorData.streets) sectorData.streets.forEach(street => allLocations.push(street))
        if (sectorData.cells) sectorData.cells.forEach(cell => allLocations.push(cell))
        if (sectorData.villages) sectorData.villages.forEach(village => allLocations.push(village))
      }
    }
  }

  const typeOptions = carTypes.map((type) => t(type.toLowerCase(), type))
  const transmissionOptions = transmissionTypes.map((type) => t(type.toLowerCase(), type))
  const fuelOptions = fuelTypes.map((type) => t(type.toLowerCase(), type))
  const seatsOptions = seatOptions

  const categoryOptions = [
    t("Economy"),
    t("Compact"),
    t("Mid-Size"),
    t("Full-Size"),
    t("Premium"),
    t("Luxury"),
    t("Sports"),
    t("Family"),
    t("Business"),
    t("Wedding"),
    t("Airport Transfer"),
    t("Off-Road"),
    t("Commercial"),
  ]

  const makeOptions = carMakes

  const features = [
    t("Air Conditioning"),
    t("GPS Navigation"),
    t("Bluetooth"),
    t("USB Charging"),
    t("Backup Camera"),
    t("Sunroof"),
    t("Leather Seats"),
    t("Heated Seats"),
    t("Premium Sound"),
    t("Keyless Entry"),
    t("Cruise Control"),
    t("Parking Sensors"),
    t("WiFi Hotspot"),
    t("Apple CarPlay"),
    t("Android Auto"),
    t("Lane Assist"),
    t("Automatic Emergency Braking"),
    t("Blind Spot Monitoring"),
    t("Adaptive Cruise Control"),
    t("360 Camera"),
    t("Wireless Charging"),
    t("Ventilated Seats"),
    t("Memory Seats"),
    t("Panoramic Roof"),
    t("Head-Up Display"),
    t("Night Vision"),
    t("Massage Seats"),
    t("Ambient Lighting"),
  ]

  // Auto-fill models when make changes
  useEffect(() => {
    if (formData.make && carModels[formData.make] && formData.make !== "Other") {
      setFilteredModels(carModels[formData.make])
      setIsCustomModel(false)
    } else {
      setFilteredModels([])
      setIsCustomModel(true)
    }
    if (formData.model && (!carModels[formData.make] || !carModels[formData.make].includes(formData.model))) {
      setFormData((prev) => ({ ...prev, model: "" }))
    }
  }, [formData.make])

  // Address search functionality
  const handleAddressSearch = (text) => {
    setFormData({ ...formData, address: text })
    setValidationErrors((prev) => ({ ...prev, address: false }))

    if (text.length > 1) {
      setShowAllSuggestions(false)
      const filtered = allLocations.filter(loc => loc.toLowerCase().includes(text.toLowerCase()))
      setAddressSuggestions(filtered.slice(0, 5).map(loc => ({ description: loc })))
      setShowAddressSuggestions(filtered.length > 0)
    } else if (showAllSuggestions) {
      const filtered = allLocations.filter(loc => loc.toLowerCase().includes(text.toLowerCase()))
      setAddressSuggestions(filtered.slice(0, 20).map(loc => ({ description: loc })))
      setShowAddressSuggestions(filtered.length > 0)
    } else {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    }
  }

  const showAllAddressSuggestions = () => {
    setShowAllSuggestions(true)
    setAddressSuggestions(allLocations.slice(0, 20).map(loc => ({ description: loc })))
    setShowAddressSuggestions(true)
  }

  const selectAddressSuggestion = (suggestion) => {
    setFormData({
      ...formData,
      address: suggestion.description,
    })
    setAddressSuggestions([])
    setShowAddressSuggestions(false)
    setShowAllSuggestions(false)
  }

  // Map functionality
  const openMapModal = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(t("Permission Needed"), t("Location permission is required to use the map"))
        return
      }

      if (formData.province) {
        const provinceCoords = getProvinceCoordinates(formData.province)
        if (provinceCoords) {
          setMapRegion({
            latitude: provinceCoords.latitude,
            longitude: provinceCoords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          })
        }
      }

      setShowMapModal(true)
    } catch (error) {
      console.error("Error opening map:", error)
      Alert.alert(t("Error"), t("Unable to open map"))
    }
  }

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    setSelectedLocation({ latitude, longitude })
    setFormData({
      ...formData,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    })
    setValidationErrors((prev) => ({ ...prev, location: false }))
  }

  const confirmLocation = () => {
    if (selectedLocation) {
      setShowMapModal(false)
      Alert.alert(t("Success"), t("Location selected successfully"))
    } else {
      Alert.alert(t("Error"), t("Please select a location on the map"))
    }
  }

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(t("Permission Needed"), t("Location permission is required"))
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      setSelectedLocation({ latitude, longitude })
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
      setFormData({
        ...formData,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      })
      setValidationErrors((prev) => ({ ...prev, location: false }))
    } catch (error) {
      console.error("Error getting current location:", error)
      Alert.alert(t("Error"), t("Unable to get current location"))
    }
  }

  // Payment handlers
  const handlePaymentSuccess = (paymentResult) => {
    setPaymentCompleted(true)
    Alert.alert(t("Payment Successful"), t("You can now upload photos and submit your car listing."))
  }

  const handlePaymentRequired = () => {
    if (!paymentCompleted) {
      setShowPaymentModal(true)
    }
  }

  // Name validation
  const isValidName = (name) => {
    return /^[a-zA-Z\s'-]{2,}$/.test(name)
  }

  // Phone validation (9 digits for Rwanda)
  const isValidPhone = (phone) => {
    return /^\d{9}$/.test(phone)
  }

  // Plate number validation (alphanumeric, no spaces, 3-10 characters)
  const isValidPlateNumber = (plate) => {
    return /^[A-Z0-9]{3,7}$/.test(plate)
  }

  const validateCurrentStep = () => {
    const errors = {}

    switch (currentStep) {
      case 1: // Basic Information
        if (!formData.make || (formData.make === "Other" && !customMake)) errors.make = true
        if (!formData.model) errors.model = true
        if (!formData.year || formData.year.length !== 4 || isNaN(formData.year) || parseInt(formData.year) < 1900 || parseInt(formData.year) > 2035) errors.year = true
        if (!formData.type) errors.type = true
        if (!formData.transmission) errors.transmission = true
        if (!formData.fuel_type) errors.fuel_type = true
        if (!formData.seatings || isNaN(formData.seatings) || parseInt(formData.seatings) < 1) errors.seatings = true
        if (!formData.plateNumber || !isValidPlateNumber(formData.plateNumber)) errors.plateNumber = true
        break

      case 2: // Owner Information
        if (!formData.ownerName || !isValidName(formData.ownerName)) errors.ownerName = true
        if (!formData.ownerPhone || !isValidPhone(formData.ownerPhone)) errors.ownerPhone = true
        break

      case 3: // Location
        if (!formData.province) errors.province = true
        if (!formData.address) errors.address = true
        if (!formData.latitude || !formData.longitude) errors.location = true
        break

      case 4: // Pricing
        if (!formData.base_price) errors.base_price = true
        if (!formData.category) errors.category = true
        break

      case 5: // Media
        const requiredImages = Object.values(formData.images)
        if (requiredImages.some((img) => !img)) errors.images = true
        break
    }

    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      Alert.alert(t("requiredFields"), t("fillAllRequiredFields"))
      return false
    }
    return true
  }

const handleBackPress = () => {
  if (isEditing && hasChanges) {
    setShowExitPrompt(true)
  } else {
    navigation.goBack()
  }
}


  const handleNext = () => {
    if (validateCurrentStep() && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setValidationErrors({})
      setCurrentStep(currentStep - 1)
    }
  }

  // ✅ FIXED: Better error handling for user null
  const handleSaveChanges = async () => {
    console.log("💾 Saving changes for editing...")

    if (!editingCarId) {
      console.error("❌ No editing car ID")
      return
    }

    if (!user || !user.id) {
      Alert.alert(t("Error"), t("User information not available. Please try logging in again."))
      console.error("❌ User is null or missing _id:", user)
      return
    }

    try {
      console.log("🏗️ Preparing update data...")

      // For editing, use existing images (they are already URLs)
      const existingImages = []
      if (formData.images.exterior_front) existingImages.push(formData.images.exterior_front)
      if (formData.images.exterior_side) existingImages.push(formData.images.exterior_side)
      if (formData.images.exterior_rear) existingImages.push(formData.images.exterior_rear)
      if (formData.images.interior) existingImages.push(formData.images.interior)

      const updateData = {
        brand: formData.make === "Other" ? customMake : formData.make,
        model: formData.model,
        year: Number.parseInt(formData.year),
        type: formData.type,
        transmission: formData.transmission.toLowerCase(),
        fuelType: formData.fuel_type.toLowerCase(),
        seatings: Number.parseInt(formData.seatings),
        features: formData.features,
        base_price: Number.parseFloat(formData.base_price),
        price: Number.parseFloat(formData.base_price),
        weekly_discount: Number.parseFloat(formData.weekly_discount || 0),
        monthly_discount: Number.parseFloat(formData.monthly_discount || 0),
        currency: formData.currency,
        category: formData.category,
        images: existingImages,
        thumbnail: formData.thumbnail,
        // ✅ FIXED: Better owner data handling
        ownerName: formData.ownerName,
        ownerPhone: formData.countryCode + formData.ownerPhone,
        ownerType: formData.ownerType,
        owner: {
          userId: user._id || user.id,
          name: formData.ownerName,
          phone: formData.countryCode + formData.ownerPhone,
          email: user.email,
          type: formData.ownerType,
        },
        location: {
          province: formData.province,
          address: formData.address,
          country: formData.country,
          latitude: formData.latitude && !isNaN(Number.parseFloat(formData.latitude)) ? Number.parseFloat(formData.latitude) : null,
          longitude: formData.longitude && !isNaN(Number.parseFloat(formData.longitude)) ? Number.parseFloat(formData.longitude) : null,
        },
        province: formData.province,
        address: formData.address,
        latitude: formData.latitude && !isNaN(Number.parseFloat(formData.latitude)) ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude && !isNaN(Number.parseFloat(formData.longitude)) ? Number.parseFloat(formData.longitude) : null,
        available: true,
        description: `${formData.make === "Other" ? customMake : formData.make} ${formData.model} ${formData.year} - ${formData.category}`,
        status: "pending",
      }

      console.log("📋 Update data prepared:", updateData)

      dispatch(updateCarAction({ carId: editingCarId, updatedData: updateData }))
    } catch (error) {
      console.error("❌ Save changes error:", error)
      Alert.alert("Error", "Failed to save changes: " + error.message)
    }
  }

  const handleSubmit = async () => {
    console.log("🚀 Starting form submission...")

    // ✅ FIXED: Check if user exists before accessing _id
    if (!user || !user.id) {
      Alert.alert(t("Error"), t("User information not available. Please try logging in again."))
      console.error("❌ User is null or missing _id:", user)
      return
    }

    if (formData.thumbnail && !paymentCompleted) {
      Alert.alert(t("Payment Required"), t("Please complete payment to include advertisement thumbnail"))
      return
    }

    if (!validateCurrentStep()) {
      console.log("❌ Validation failed")
      return
    }
if (isEditing && formData.plateNumber === originalData.plate_number) {
  console.log("Plate unchanged — skipping uniqueness check");
} else {
  const plateCheckResult = await dispatch(
    checkPlateUniquenessAction(formData.plateNumber)
  ).unwrap();

  if (!plateCheckResult.isUnique) {
    Alert.alert(t("Error"), t("Plate number already exists"));
    return;
  }
}

    // Check plate number uniqueness
    console.log("🔍 Checking plate number uniqueness...")
    try {
      const plateCheckResult = await dispatch(checkPlateUniquenessAction(formData.plateNumber)).unwrap()
      if (!plateCheckResult.isUnique) {
        Alert.alert(t("Error"), t("plateNumberAlreadyExists"))
        return
      }
    } catch (error) {
      console.error("❌ Plate check failed:", error)
      Alert.alert(t("Error"), error || t("plateCheckFailed"))
      return
    }

    try {
      console.log("📤 Uploading images to Cloudinary...")

      // Upload all images to Cloudinary in specific order: front exterior first
      const uploadedImages = []
      const imageOrder = ['exterior_front', 'exterior_side', 'exterior_rear', 'interior']
      for (const key of imageOrder) {
        const uri = formData.images[key]
        if (uri) {
          console.log(`📸 Uploading ${key} image...`)
          const cloudForm = new FormData()
          cloudForm.append("file", {
            uri,
            type: "image/jpeg",
            name: `${key}.jpg`,
          })
          cloudForm.append("upload_preset", "carlistings")

          const cloudRes = await fetch("https://api.cloudinary.com/v1_1/def0cjmh2/image/upload", {
            method: "POST",
            body: cloudForm,
          })
          const cloudData = await cloudRes.json()

          if (cloudData.secure_url) {
            uploadedImages.push(cloudData.secure_url)
            console.log(`✅ ${key} image uploaded successfully`)
          } else {
            throw new Error(`Failed to upload ${key} image`)
          }
        }
      }

      // Upload thumbnail if present
      let uploadedThumbnail = null
      if (formData.thumbnail) {
        console.log(`📸 Uploading thumbnail...`)
        const cloudForm = new FormData()
        cloudForm.append("file", {
          uri: formData.thumbnail,
          type: "image/jpeg",
          name: "thumbnail.jpg",
        })
        cloudForm.append("upload_preset", "carlistings")

        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/def0cjmh2/image/upload", {
          method: "POST",
          body: cloudForm,
        })
        const cloudData = await cloudRes.json()

        if (cloudData.secure_url) {
          uploadedThumbnail = cloudData.secure_url
          console.log(`✅ Thumbnail uploaded successfully`)
        } else {
          throw new Error(`Failed to upload thumbnail`)
        }
      }

      console.log("🏗️ Preparing submission data...")

      const submitData = {
        brand: formData.make === "Other" ? customMake : formData.make,
        model: formData.model,
        year: Number.parseInt(formData.year),
        type: formData.type,
        transmission: formData.transmission.toLowerCase(),
        fuelType: formData.fuel_type.toLowerCase(),
        seatings: Number.parseInt(formData.seatings),
        features: formData.features,
        base_price: Number.parseFloat(formData.base_price),
        price: Number.parseFloat(formData.base_price),
        weekly_discount: Number.parseFloat(formData.weekly_discount || 0),
        monthly_discount: Number.parseFloat(formData.monthly_discount || 0),
        currency: formData.currency,
        category: formData.category,
        images: uploadedImages,
        thumbnail: uploadedThumbnail,
       plate_number: formData.plateNumber?.toUpperCase().trim(),

        // ✅ FIXED: Better owner data handling
        ownerName: formData.ownerName,
        ownerPhone: formData.countryCode + formData.ownerPhone,
        ownerType: formData.ownerType,
        owner: {
          userId: user._id || user.id,
          name: formData.ownerName,
          phone: formData.countryCode + formData.ownerPhone,
          email: user.email,
          type: formData.ownerType,
        },
        location: {
          province: formData.province,
          address: formData.address,
          country: formData.country,
          latitude: formData.latitude && !isNaN(Number.parseFloat(formData.latitude)) ? Number.parseFloat(formData.latitude) : null,
          longitude: formData.longitude && !isNaN(Number.parseFloat(formData.longitude)) ? Number.parseFloat(formData.longitude) : null,
        },
        province: formData.province,
        address: formData.address,
        latitude: formData.latitude && !isNaN(Number.parseFloat(formData.latitude)) ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude && !isNaN(Number.parseFloat(formData.longitude)) ? Number.parseFloat(formData.longitude) : null,
        available: true,
        description: `${formData.make === "Other" ? customMake : formData.make} ${formData.model} ${formData.year} - ${formData.category}`,
        status: "pending",
      }

      console.log("📋 Submit data prepared:", submitData)

    if (isEditing) {
   dispatch(updateCarAction({
     carId: editingCarId,
     updatedData: submitData
   }));
} else {
   dispatch(createCarAction(submitData));
}
    } catch (error) {
      console.error("❌ Submission error:", error)
      Alert.alert(t("Error"), t("submissionFailed") + ": " + error.message)
    } 
  }

  const toggleFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const pickImage = async (imageType) => {
    if (imageType === "thumbnail" && !paymentCompleted) {
      handlePaymentRequired()
      return
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(t("Permission Needed"), t("Grant camera roll permissions to upload photos"))
      return
    }

    Alert.alert(t("Select Photo"), t("Choose how to add a photo"), [
      { text: t("Camera"), onPress: () => openCamera(imageType) },
      { text: t("Gallery"), onPress: () => openGallery(imageType) },
      { text: t("Cancel"), style: "cancel" },
    ])
  }

  const openCamera = async (imageType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(t("Permission Needed"), t("Grant camera permissions to take photos"))
      return
    }

    const aspectRatio = imageType === "thumbnail" ? [100, 85] : [4, 3]

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    })

    if (!result.canceled) {
      const imageUri = result.assets[0].uri

      if (imageType !== "thumbnail" && selectedImages.includes(imageUri)) {
        Alert.alert(
          t("Image Already Selected"),
          t("This image has already been selected for another photo type. It will be highlighted in your gallery."),
        )
      }

      if (imageType !== "thumbnail") {
        const currentImage = formData.images[imageType]
        if (currentImage) {
          setSelectedImages((prev) => prev.filter((uri) => uri !== currentImage))
        }
        setSelectedImages((prev) => [...prev, imageUri])
      }

      setFormData((prev) => ({
        ...prev,
        [imageType === "thumbnail" ? "thumbnail" : "images"]:
          imageType === "thumbnail"
            ? imageUri
            : {
                ...prev.images,
                [imageType]: imageUri,
              },
      }))
    }
  }

  const openGallery = async (imageType) => {
    const aspectRatio = imageType === "thumbnail" ? [100, 85] : [4, 3]

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    })

    if (!result.canceled) {
      const imageUri = result.assets[0].uri

      if (imageType !== "thumbnail" && selectedImages.includes(imageUri)) {
        Alert.alert(
          t("Image Already Selected"),
          t("This image has already been selected for another photo type. It will be highlighted in your gallery."),
        )
      }

      if (imageType !== "thumbnail") {
        const currentImage = formData.images[imageType]
        if (currentImage) {
          setSelectedImages((prev) => prev.filter((uri) => uri !== currentImage))
        }
        setSelectedImages((prev) => [...prev, imageUri])
      }

      setFormData((prev) => ({
        ...prev,
        [imageType === "thumbnail" ? "thumbnail" : "images"]:
          imageType === "thumbnail"
            ? imageUri
            : {
                ...prev.images,
                [imageType]: imageUri,
              },
      }))
    }
  }

  const renderDropdown = (options, value, onSelect, placeholder, showState, setShowState, errorKey) => (
    <>
      <TouchableOpacity
        style={[styles.dropdownButton, validationErrors[errorKey] && styles.errorBorder]}
        onPress={() => setShowState(!showState)}
      >
        <Text style={[styles.dropdownButtonText, !value && styles.placeholderText]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="#64748B" />
      </TouchableOpacity>
      {showState && (
        <Modal transparent visible={showState} animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowState(false)}>
            <View style={styles.dropdownModal}>
              <ScrollView>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      onSelect(option)
                      setShowState(false)
                      setValidationErrors((prev) => ({ ...prev, [errorKey]: false }))
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  )

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={styles.stepIndicatorItem}>
          <View style={[styles.stepCircle, currentStep >= step ? styles.stepCircleActive : styles.stepCircleInactive]}>
            <Text
              style={[styles.stepNumber, currentStep >= step ? styles.stepNumberActive : styles.stepNumberInactive]}
            >
              {step}
            </Text>
          </View>
          {step < 5 && (
            <View style={[styles.stepLine, currentStep > step ? styles.stepLineActive : styles.stepLineInactive]} />
          )}
        </View>
      ))}
    </View>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("vehicleInformation")}</Text>


            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("make")}</Text>
                {renderDropdown(
                  makeOptions,
                  formData.make,
                  (value) => setFormData({ ...formData, make: value }),
                  t("Select Make"),
                  showMakeDropdown,
                  setShowMakeDropdown,
                  "make",
                )}
                {formData.make === "Other" && (
                  <TextInput
                    style={[styles.input, validationErrors.make && styles.errorBorder, { marginTop: 8 }]}
                    value={customMake}
                    onChangeText={(text) => {
                      setCustomMake(text)
                      setValidationErrors((prev) => ({ ...prev, make: false }))
                    }}
                    placeholder={t("Enter custom make")}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("model")}</Text>
                {formData.make && !isCustomModel ? (
                  renderDropdown(
                    filteredModels,
                    formData.model,
                    (value) => setFormData({ ...formData, model: value }),
                    t("Select Model"),
                    showModelDropdown,
                    setShowModelDropdown,
                    "model",
                  )
                ) : (
                  <TextInput
                    style={[styles.input, validationErrors.model && styles.errorBorder]}
                    value={formData.model}
                    onChangeText={(text) => {
                      setFormData({ ...formData, model: text })
                      setValidationErrors((prev) => ({ ...prev, model: false }))
                    }}
                    placeholder={t("Enter Model")}
                  />
                )}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("year")}</Text>
                <TextInput
                  style={[styles.input, validationErrors.year && styles.errorBorder]}
                  value={formData.year}
                  onChangeText={(text) => {
                    setFormData({ ...formData, year: text })
                    setValidationErrors((prev) => ({ ...prev, year: false }))
                  }}
                  placeholder="e.g. 2020"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("type")}</Text>
                {renderDropdown(
                  typeOptions,
                  formData.type,
                  (value) => setFormData({ ...formData, type: value }),
                  t("Select Type"),
                  showTypeDropdown,
                  setShowTypeDropdown,
                  "type",
                )}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("transmission")}</Text>
                {renderDropdown(
                  transmissionOptions,
                  formData.transmission,
                  (value) => setFormData({ ...formData, transmission: value }),
                  t("Select Transmission"),
                  showTransmissionDropdown,
                  setShowTransmissionDropdown,
                  "transmission",
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("fuelType")}</Text>
                {renderDropdown(
                  fuelOptions,
                  formData.fuel_type,
                  (value) => setFormData({ ...formData, fuel_type: value }),
                  t("Select Fuel Type"),
                  showFuelDropdown,
                  setShowFuelDropdown,
                  "fuel_type",
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("seatingCapacity")}</Text>
              <TextInput
                style={[styles.input, validationErrors.seatings && styles.errorBorder]}
                value={formData.seatings}
                onChangeText={(text) => setFormData({ ...formData, seatings: text })}
                placeholder={t("Enter seating capacity")}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("plateNumber")} <Text style={styles.optionalText}>({t("required")})</Text></Text>
              <TextInput
                style={[styles.input, validationErrors.plateNumber && styles.errorBorder]}
                value={formData.plateNumber}
            onChangeText={(text) => {
  const formatted = text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0,7);

  setFormData({ ...formData, plateNumber: formatted });
  setValidationErrors((prev) => ({ ...prev, plateNumber: false }));
}}

                placeholder={t("Enter plate number")}
                autoCapitalize="characters"
                maxLength={10}
              />
              {validationErrors.plateNumber && (
                <Text style={styles.errorText}>{t("invalidPlateFormat")}</Text>
              )}
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.label}>{t("features")}</Text>
              <View style={styles.featuresGrid}>
                {features.map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={[styles.featureButton, formData.features.includes(feature) && styles.featureButtonSelected]}
                    onPress={() => toggleFeature(feature)}
                  >
                    <Text
                      style={[
                        styles.featureButtonText,
                        formData.features.includes(feature) && styles.featureButtonTextSelected,
                      ]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )

      case 2: // Owner Information
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("ownerInformation")}</Text>

            <View style={styles.ownerTypeContainer}>
              <Text style={styles.label}>{t("ownerType")}</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, ownerType: "individual" })}
                >
                  <View style={[styles.radioCircle, formData.ownerType === "individual" && styles.radioSelected]}>
                    {formData.ownerType === "individual" && <View style={styles.radioInner} />}
                  </View>
                  <Ionicons name="person-outline" size={20} color="#64748B" />
                  <Text style={styles.radioText}>{t("individual")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, ownerType: "company" })}
                >
                  <View style={[styles.radioCircle, formData.ownerType === "company" && styles.radioSelected]}>
                    {formData.ownerType === "company" && <View style={styles.radioInner} />}
                  </View>
                  <Ionicons name="business-outline" size={20} color="#64748B" />
                  <Text style={styles.radioText}>{t("company")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ✅ NEW: Auto-complete toggle */}
            <View style={styles.autoCompleteToggle}>
              <TouchableOpacity style={styles.toggleButton} onPress={toggleManualEntry}>
                <Ionicons
                  name={isManualEntry ? "create-outline" : "people-outline"}
                  size={20}
                  color={isManualEntry ? "#F59E0B" : "#007EFD"}
                />
                <Text style={[styles.toggleButtonText, { color: isManualEntry ? "#F59E0B" : "#007EFD" }]}>
                  {isManualEntry ? t("manualEntry") : t("autoComplete")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{formData.ownerType === "company" ? t("companyName") : t("fullName")}</Text>
              <View style={styles.ownerInputContainer}>
                <TextInput
                  style={[styles.input, validationErrors.ownerName && styles.errorBorder]}
                  value={formData.ownerName}
                  onChangeText={handleOwnerNameSearch}
                  placeholder={
                    isManualEntry
                      ? formData.ownerType === "company"
                        ? t("Enter company name")
                        : t("Enter your full name")
                      : t("Search or use your name")
                  }
                />
                {!isManualEntry && (
                  <TouchableOpacity style={styles.searchIcon}>
                    <Ionicons name="search-outline" size={20} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* ✅ NEW: Owner suggestions dropdown */}
              {showOwnerSuggestions && searchResults.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.suggestionItem} onPress={() => selectOwnerFromSuggestions(item)}>
                        <Ionicons name="person-outline" size={16} color="#64748B" />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionName}>{item.name}</Text>
                          <Text style={styles.suggestionDetails}>
                            {item.phone} • {item.email}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                    nestedScrollEnabled
                  />
                </View>
              )}

              {validationErrors.ownerName && <Text style={styles.errorText}>{t("invalidName")}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="call-outline" size={16} /> {t("phoneNumber")}
              </Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                >
                  <Text style={styles.flagText}>
                    {countryCodes.find((c) => c.code === formData.countryCode)?.flag || "🇷🇼"}
                  </Text>
                  <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
                  <Ionicons name="chevron-down-outline" size={16} color="#64748B" />
                </TouchableOpacity>

                <TextInput
                  style={[styles.phoneInput, validationErrors.ownerPhone && styles.errorBorder]}
                  value={formData.ownerPhone}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "").slice(0, 9)
                    setFormData({ ...formData, ownerPhone: cleaned })
                    setValidationErrors((prev) => ({ ...prev, ownerPhone: false }))
                  }}
                  placeholder="788123456"
                  keyboardType="numeric"
                  maxLength={9}
                  editable={isManualEntry || !user?.phone} // Allow editing if manual or no user phone
                />
              </View>
              {validationErrors.ownerPhone && <Text style={styles.errorText}>{t("Invalid Phone")}</Text>}
            </View>
          </View>
        )

      case 3: // Location Details
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("locationDetails")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("province")}</Text>
              {renderDropdown(
                provinces,
                formData.province,
                (value) => {
                  setFormData({ ...formData, province: value })
                  const provinceCoords = getProvinceCoordinates(value)
                  if (provinceCoords) {
                    setMapRegion({
                      latitude: provinceCoords.latitude,
                      longitude: provinceCoords.longitude,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    })
                  }
                },
                t("selectProvince"),
                showProvinceDropdown,
                setShowProvinceDropdown,
                "province",
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("address")}</Text>
              <View style={styles.addressInputContainer}>
                <TextInput
                  style={[styles.input, validationErrors.address && styles.errorBorder]}
                  value={formData.address}
                  onChangeText={handleAddressSearch}
                  placeholder={t("Enter district, sector, or street name")}
                  autoComplete="street-address"
                />
                <TouchableOpacity style={styles.searchIcon} onPress={showAllAddressSuggestions}>
                  <Ionicons name="search-outline" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {showAddressSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                    {addressSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => selectAddressSuggestion(suggestion)}
                      >
                        <Ionicons name="location-outline" size={16} color="#64748B" />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionAddress}>{suggestion.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("country")}</Text>
              <TextInput style={styles.input} value={formData.country} editable={false} />
            </View>

            <View style={styles.locationContainer}>
              <Text style={styles.label}>{t("Pin Location on Map")}</Text>
              {validationErrors.location && (
                <Text style={styles.errorText}>{t("Please select a location on the map")}</Text>
              )}

              <View style={styles.locationActions}>
                <TouchableOpacity style={styles.mapButton} onPress={openMapModal}>
                  <Ionicons name="map-outline" size={20} color="#007EFD" />
                  <Text style={styles.mapButtonText}>{t("selectonMap")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
                  <Ionicons name="locate-outline" size={20} color="#10B981" />
                  <Text style={styles.currentLocationButtonText}>{t("currentLocation")}</Text>
                </TouchableOpacity>
              </View>

              {selectedLocation && (
                <View style={styles.selectedLocationContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.selectedLocationText}>
                    {t("locationselected")}: {selectedLocation.latitude.toFixed(6)},{" "}
                    {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )

      case 4: // Pricing & Category
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("pricingandCategory")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("category")}</Text>
              {renderDropdown(
                categoryOptions,
                formData.category,
                (value) => setFormData({ ...formData, category: value }),
                t("selectCategory"),
                showCategoryDropdown,
                setShowCategoryDropdown,
                "category",
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("Base Price (FRW per day)")}</Text>
              <TextInput
                style={[styles.input, validationErrors.base_price && styles.errorBorder]}
                value={formData.base_price}
                onChangeText={(text) => {
                  setFormData({ ...formData, base_price: text })
                  setValidationErrors((prev) => ({ ...prev, base_price: false }))
                }}
                placeholder="50000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("Weekly Discount (%)")}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weekly_discount}
                  onChangeText={(text) => setFormData({ ...formData, weekly_discount: text })}
                  placeholder="10"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("Monthly Discount (%)")}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.monthly_discount}
                  onChangeText={(text) => setFormData({ ...formData, monthly_discount: text })}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )

      case 5: // Media Upload
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("uploadPhotos")}</Text>

            <View style={styles.photosContainer}>
              <Text style={styles.label}>{t("carPhotos")}</Text>
              {validationErrors.images && <Text style={styles.errorText}>{t("uploadallrequired photos")}</Text>}

              <View style={styles.photosGrid}>
                {[
                  { key: "interior", label: t("interiorView") },
                  { key: "exterior_front", label: t("frontExterior") },
                  { key: "exterior_side", label: t("sideExterior") },
                  { key: "exterior_rear", label: t("rearExterior") },
                ].map((photo) => (
                  <View
                    key={photo.key}
                    style={[
                      styles.photoUploadContainer,
                      validationErrors.images && !formData.images[photo.key] && styles.errorBorder,
                    ]}
                  >
                    {formData.images[photo.key] ? (
                      <Image source={{ uri: formData.images[photo.key] }} style={styles.uploadedPhoto} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                      </View>
                    )}
                    <Text style={styles.photoLabel}>{photo.label}</Text>
                    <TouchableOpacity style={styles.chooseButton} onPress={() => pickImage(photo.key)}>
                      <Ionicons name="cloud-upload-outline" size={16} color="#007EFD" />
                      <Text style={styles.chooseButtonText}>{t("choose")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.thumbnailContainer}>
              <Text style={styles.label}>
                {t("advertisementThumbnail")} <Text style={styles.optionalText}>({t("optional")})</Text>
              </Text>

              {!paymentCompleted && (
                <View style={styles.paymentRequiredContainer}>
                  <Ionicons name="warning-outline" size={24} color="#F59E0B" />
                  <Text style={styles.paymentRequiredText}>
                    {t("Payment of 5,000 RWF is required for advertisement thumbnail")}
                  </Text>
                  <TouchableOpacity style={styles.paymentButton} onPress={() => setShowPaymentModal(true)}>
                    <Text style={styles.paymentButtonText}>{t("Pay Now")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.thumbnailUploadContainer, !paymentCompleted && styles.disabledPhotoContainer]}>
                {formData.thumbnail ? (
                  <Image source={{ uri: formData.thumbnail }} style={styles.thumbnailImage} />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.thumbnailPlaceholderText}>{t("Advertisement Image")}</Text>
                    <Text style={styles.thumbnailDimensionsText}>{t("Cropped to 100:85 ratio")}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.thumbnailChooseButton, !paymentCompleted && styles.disabledButton]}
                  onPress={() => pickImage("thumbnail")}
                  disabled={!paymentCompleted}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color={paymentCompleted ? "#007EFD" : "#9CA3AF"} />
                  <Text style={[styles.chooseButtonText, !paymentCompleted && styles.disabledButtonText]}>
                    {t("chooseThumbnail")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{isEditing ? t("editCar") : t("addNewCar")}</Text>
          <Text style={styles.subtitle}>{t("Step {{current}} of {{total}}", { current: currentStep, total: 5 })}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>{renderStep()}</View>
      </ScrollView>

      <View style={styles.navigationContainer}>

  {/* PREVIOUS */}
  <TouchableOpacity
    style={[styles.navButton, styles.prevButton, currentStep === 1 && styles.disabledButton]}
    onPress={handlePrevious}
    disabled={currentStep === 1}
  >
    <Ionicons name="arrow-back-outline" size={16} color={currentStep === 1 ? "#9CA3AF" : "#475569"} />
    <Text style={[styles.navButtonText, currentStep === 1 && styles.disabledButtonText]}>
      {t("previous")}
    </Text>
  </TouchableOpacity>


  {/* SAVE DRAFT — ALWAYS MIDDLE */}
 <TouchableOpacity
  style={styles.draftButton}
  onPress={() => saveDraftLocally({
    id: editingCarId || `draft_${Date.now()}`,
    formData,
    currentStep,
    isEditing,
    editingCarId,
    updatedAt: new Date().toISOString()
  })}
>
  <Text style={styles.draftButtonText}>{t("saveDraft")}</Text>
</TouchableOpacity>



  {/* NEXT / SAVE CHANGES */}
  {currentStep === 5 ? (
    <TouchableOpacity
      style={[styles.navButton, styles.submitButton, (isCreating || isUpdating) && styles.disabledButton]}
      onPress={(isEditing && hasChanges) ? handleSaveChanges : handleSubmit}
      disabled={isCreating || isUpdating}
    >
      <Text style={styles.submitButtonText}>
        {(isEditing && hasChanges) ? t("saveChanges") : t("submit")}
      </Text>
    </TouchableOpacity>
  ) : (
  <TouchableOpacity
  style={[styles.navButton, styles.nextButton]}
  onPress={(isEditing && hasChanges) ? handleSaveChanges : handleNext}
>
  <Text style={styles.nextButtonText}>
    {(isEditing && hasChanges) ? t("saveChanges") : t("next")}
  </Text>

  <Ionicons
    name={(isEditing && hasChanges) ? "checkmark-outline" : "arrow-forward-outline"}
    size={16}
    color="#FFFFFF"
  />
</TouchableOpacity>

  )}

</View>


      
      <PaymentBottomSheet
        isVisible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={5000}
      />

      <DraftBottomSheet
        visible={showDraftBottomSheet}
        onClose={() => setShowDraftBottomSheet(false)}
        onSaveDraft={handleSaveAsDraft}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <Modal visible={showMapModal} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapCloseButton}>
              <Ionicons name="close-outline" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>{t("Select Location")}</Text>
            <TouchableOpacity onPress={confirmLocation} style={styles.mapConfirmButton}>
              <Text style={styles.mapConfirmButtonText}>{t("Confirm")}</Text>
            </TouchableOpacity>
          </View>

          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title={t("Selected Location")}
                description={formData.address || t("Car Location")}
              >
                <Image source={carIcon} style={styles.carMarker} />
              </Marker>
            )}
          </MapView>

          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionsText}>{t("Tap on the map to select your car's location")}</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {showCountryCodeDropdown && (
        <Modal transparent visible={showCountryCodeDropdown} animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCountryCodeDropdown(false)}>
            <View style={styles.dropdownModal}>
              <ScrollView>
                {countryCodes.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFormData({ ...formData, countryCode: country.code })
                      setShowCountryCodeDropdown(false)
                    }}
                  >
                    <Text style={styles.countryOption}>
                      {country.flag} {country.code} {country.country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },modalOverlay:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"rgba(0,0,0,0.5)"
},
modalBox:{
  width:"85%",
  backgroundColor:"#fff",
  borderRadius:12,
  padding:20
},
modalTitle:{
  fontSize:18,
  fontWeight:"700",
  marginBottom:5
},
navigationContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
draftButton: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 10,
  backgroundColor: "#E5E7EB",
},
draftButtonText: {
  color: "#374151",
  fontWeight: "600",
},

modalText:{
  fontSize:15,
  color:"#555",
  marginBottom:15
},
modalButtons:{
  flexDirection:"row",
  justifyContent:"space-between"
},
cancelBtn:{
  padding:10
},
draftBtn:{
  backgroundColor:"#007EFD",
  padding:10,
  borderRadius:8
},
discardBtn:{
  backgroundColor:"red",
  padding:10,
  borderRadius:8
}
,
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  subtitle: {
    padding: 4,
    fontSize: 14,
    color: "#64748B",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  stepIndicatorItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  stepCircleActive: {
    backgroundColor: "#007EFD",
    borderColor: "#007EFD",
  },
  stepCircleInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepNumberInactive: {
    color: "#64748B",
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 1,
  },
  stepLineActive: {
    backgroundColor: "#007EFD",
  },
  stepLineInactive: {
    backgroundColor: "#E2E8F0",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepContainer: {
    gap: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
  },
  errorBorder: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1E293B",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    maxHeight: 300,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#1E293B",
  },
  countryOption: {
    fontSize: 16,
    color: "#1E293B",
  },
  ownerTypeContainer: {
    gap: 12,
  },
  radioContainer: {
    flexDirection: "row",
    gap: 24,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#007EFD",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007EFD",
  },
  radioText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  // ✅ NEW: Auto-complete styles
  autoCompleteToggle: {
    alignItems: "center",
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  ownerInputContainer: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  suggestionName: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 8,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  flagText: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
  },
  addressInputContainer: {
    position: "relative",
  },
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestionText: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionAddress: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  suggestionDetails: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  locationContainer: {
    gap: 16,
  },
  locationActions: {
    flexDirection: "row",
    gap: 12,
  },
  mapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#007EFD",
    borderRadius: 8,
    backgroundColor: "#F0F9FF",
  },
  mapButtonText: {
    fontSize: 16,
    color: "#007EFD",
    fontWeight: "600",
  },
  currentLocationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
  },
  currentLocationButtonText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  selectedLocationText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  mapCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  mapConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007EFD",
    borderRadius: 8,
  },
  mapConfirmButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  carMarker: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  mapInstructions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
    borderRadius: 8,
  },
  mapInstructionsText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  featuresContainer: {
    gap: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureButtonSelected: {
    backgroundColor: "#007EFD",
    borderColor: "#007EFD",
  },
  featureButtonText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  featureButtonTextSelected: {
    color: "#FFFFFF",
  },
  paymentRequiredContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
    marginBottom: 20,
  },
  paymentRequiredText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
  },
  paymentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F59E0B",
    borderRadius: 6,
  },
  paymentButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  photosContainer: {
    gap: 16,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  photoUploadContainer: {
    width: "48%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  disabledPhotoContainer: {
    opacity: 0.5,
    backgroundColor: "#F1F5F9",
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadedPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 8,
    textAlign: "center",
  },
  chooseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#007EFD",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  chooseButtonText: {
    fontSize: 12,
    color: "#007EFD",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  thumbnailContainer: {
    gap: 16,
    marginTop: 20,
  },
  thumbnailUploadContainer: {
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  thumbnailImage: {
    width: 100,
    height: 85,
    borderRadius: 8,
    marginBottom: 12,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginBottom: 12,
  },
  thumbnailPlaceholderText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  thumbnailDimensionsText: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
  },
  thumbnailChooseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#007EFD",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  prevButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    backgroundColor: "#007EFD",
  },
  submitButton: {
    backgroundColor: "#007EFD",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  draftModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: "90%",
  },
  draftTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
  },
  draftMessage: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  draftButtons: {
    flexDirection: "row",
    gap: 12,
  },
  loadDraftButton: {
    flex: 1,
    backgroundColor: "#007EFD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loadDraftText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  newCarButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  newCarText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "600",
  },
})
  
export default EditCarScreen
