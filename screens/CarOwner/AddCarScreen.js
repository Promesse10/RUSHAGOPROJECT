"use client"

import React, { useState, useEffect } from "react"
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
  ActivityIndicator,
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
import { saveDraft, deleteDraft, loadDrafts } from "../../redux/action/draftsActions"
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

const generateDraftId = () => {
  return `draft_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`
}

const AddCarScreen = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const route = useRoute()
  const { t } = useTranslation()
  if (Platform.OS === 'web') {
    return <p>Map is not supported on web.</p>;
  }

  // ✅ FIXED: Get user from auth state and user state
  const authUser = useSelector((state) => state.auth?.user)
  const { currentUser, searchResults, isSearching } = useSelector((state) => state.user || {})
  const user = currentUser || authUser

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
  const [isDraft, setIsDraft] = useState(route.params?.isDraft || false)
  const [editingCarId, setEditingCarId] = useState(route.params?.draftData?.id)

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

  // ✅ NEW: Owner autocomplete states
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false)
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("")
  const [isManualEntry, setIsManualEntry] = useState(false)

  // ✅ NEW: Plate number validation states
  const [plateValidationError, setPlateValidationError] = useState("")
  const [plateIsValid, setPlateIsValid] = useState(false)

  // Custom make state
  const [customMake, setCustomMake] = useState("")

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Draft bottom sheet states
  const [showDraftBottomSheet, setShowDraftBottomSheet] = useState(false)

  // Draft prompt states
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [draftData, setDraftData] = useState(null)
  const [draftId, setDraftId] = useState(route.params?.draftData?.id || generateDraftId())

  // Track if we've already shown the draft prompt on this screen visit
  const [draftPromptShown, setDraftPromptShown] = useState(false)

  // Local draft saving function (fallback when API/redux fails)
  const saveDraftLocally = async (draftData, { showAlert = true } = {}) => {
    try {
      const userId = user?.id || user?._id || user?.userId || "user123"
      const storageKey = `drafts_${userId}`
      const existingDrafts = await AsyncStorage.getItem(storageKey)
      const drafts = existingDrafts ? JSON.parse(existingDrafts) : []

      // Remove existing draft for this id
      const filteredDrafts = drafts.filter((d) => d.id !== draftData.id)
      filteredDrafts.push(draftData)

      await AsyncStorage.setItem(storageKey, JSON.stringify(filteredDrafts))
      if (showAlert) {
        Alert.alert(t("Success"), t("Draft saved successfully!"))
      }
    } catch (error) {
      console.error('❌ Failed to save draft:', error)
      if (showAlert) {
        Alert.alert(t("Error"), t("Failed to save draft"))
      }
    }
  }

  // Handle save as draft (called when user intentionally saves or exits)
  const handleSaveAsDraft = async ({ showAlert = true } = {}) => {
    try {
      const finalDraftId = draftData?.id || draftId || generateDraftId()
      setDraftId(finalDraftId)

      const draftDataToSave = {
        id: finalDraftId,
        formData,
        currentStep,
        isEditing,
        isDraft,
        editingCarId,
        createdAt: draftData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save via Redux/actions (handles API + local storage fallback)
      await dispatch(saveDraft(draftDataToSave)).unwrap()
      // Refresh local drafts list so SavedDraftsScreen shows the latest
      dispatch(loadDrafts())

      setDraftData(draftDataToSave)
      setIsDraft(true)

      if (showAlert) {
        Alert.alert(
          t("Success"),
          t("Draft saved at Step {{step}} - your progress is saved!", { step: currentStep })
        )
      }
      return true
    } catch (error) {
      // Fallback: save locally if server/redux fails
      const finalDraftId = draftData?.id || draftId || generateDraftId()
      const draftDataToSave = {
        id: finalDraftId,
        formData,
        currentStep,
        isEditing,
        isDraft,
        editingCarId,
        createdAt: draftData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await saveDraftLocally(draftDataToSave, { showAlert })
      return true
    }
  }

  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])

  const [mapRegion, setMapRegion] = useState({
    latitude: -1.9441,
    longitude: 30.0619,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [selectedLocation, setSelectedLocation] = useState(null)

  const [formData, setFormData] = useState(initialFormData)

  // ✅ FIXED: Fetch current user on component mount
  useEffect(() => {
    if (!user && authUser) {
      dispatch(getCurrentUserAction())
    }
  }, [dispatch, user, authUser])

  // ✅ FIXED: Auto-fill owner information when user is available
  useEffect(() => {
    if (user && !isEditing && !isManualEntry) {
      setFormData((prev) => ({
        ...prev,
        ownerName: user.name || "",
        ownerPhone: user.phone?.replace("+250", "") || "",
      }))
    }
  }, [user, isEditing, isManualEntry])

  // ✅ FIXED: Reset form when not editing and not loading a draft
  useEffect(() => {
    if (!isEditing && !isDraft) {
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
      setPlateValidationError("")
      setPlateIsValid(false)
    }
  }, [isEditing, isDraft])

  // Ensure AddCar screen is reset when focused from other tabs/screens
  useFocusEffect(
    React.useCallback(() => {
      if (!isEditing && !isDraft && !route.params?.draftData) {
        setDraftData(null)
        setDraftId(generateDraftId())
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
        setPlateValidationError("")
        setPlateIsValid(false)
        setDraftPromptShown(false)
      }
    }, [isEditing, isDraft, route.params?.draftData])
  )

  // Handle back navigation and navigation away with unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only show alert if there are actual changes
      if (!hasChanges) {
        return
      }

      e.preventDefault()

      Alert.alert(
        t('Unsaved Changes'),
        t('You have unsaved changes. What would you like to do?'),
        [
          {
            text: t('Save as Draft'),
            onPress: async () => {
              await handleSaveAsDraft({ showAlert: false })
              // Wait a moment then navigate
              setTimeout(() => {
                navigation.dispatch(e.data.action)
              }, 300)
            },
          },
          {
            text: t('Continue Editing'),
            style: 'cancel',
          },
          {
            text: t('Discard Changes'),
            style: 'destructive',
            onPress: () => {
              // Clear draft data when discarding
              const userId = user?.id || user?._id || user?.userId || "user123"
              AsyncStorage.removeItem(`drafts_${userId}`)
              setFormData(initialFormData)
              setCurrentStep(1)
              setHasChanges(false)
              setDraftData(null)
              setDraftId(generateDraftId())
              navigation.dispatch(e.data.action)
            },
          },
        ]
      )
    })

    return unsubscribe
  }, [navigation, hasChanges, t, user])

  // Check for drafts when adding/editing a car - only show once per screen visit
  useEffect(() => {
    // Don't show draft prompt if already shown or if we're already loading/editing a draft
    if (draftPromptShown || isDraft || isEditing) return

    const userId = user?.id || user?._id || user?.userId || "user123"
    const storageKey = `drafts_${userId}`

    AsyncStorage.getItem(storageKey)
      .then((drafts) => {
        if (!drafts) return

        const parsed = JSON.parse(drafts) || []

        // Only show popup if a REAL draft exists
        const validDrafts = parsed.filter(
          (d) =>
            d?.formData &&
            Object.keys(d.formData).length > 0
        )

        if (validDrafts.length > 0) {
          let draftToShow = null

          // If editing, prefer a draft matching the car being edited
          if (editingCarId) {
            draftToShow = validDrafts.find((d) => d.id === editingCarId)
          }

          // Otherwise fall back to latest draft
          if (!draftToShow) {
            validDrafts.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
            draftToShow = validDrafts[0]
          }

          if (draftToShow) {
            setDraftData(draftToShow)
            setDraftId(draftToShow.id)
            setShowDraftPrompt(true)
            setDraftPromptShown(true)
          }
        }
      })
      .catch((err) => console.error('❌ Error loading drafts:', err))
  }, [draftPromptShown, isDraft, isEditing, editingCarId, user])

  // Auto-save draft on form changes (silent, local only)
  useEffect(() => {
    const hasData = JSON.stringify(formData) !== JSON.stringify(initialFormData)
    if (hasData) {
      const timeoutId = setTimeout(() => {
        const currentDraftId = draftData?.id || draftId || (isEditing ? editingCarId : generateDraftId())
        setDraftId(currentDraftId)

        const draftDataToSave = {
          formData,
          currentStep,
          id: currentDraftId,
          createdAt: draftData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        saveDraftLocally(draftDataToSave, { showAlert: false })
      }, 2000) // Save after 2 seconds of no changes
      return () => clearTimeout(timeoutId)
    }
  }, [formData, currentStep, draftData, isEditing, editingCarId, draftId])

  // ✅ NEW: Enhanced plate number formatter
  const formatPlateNumber = (text) => {
    // Remove all non-alphanumeric characters
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
    
    // Limit to 7 characters (3 letters + 3 numbers + 1 letter)
    const limited = cleaned.slice(0, 7)
    
    // Auto-format as ABC123D pattern
    let formatted = ""
    for (let i = 0; i < limited.length; i++) {
      formatted += limited[i]
      // Add space after first 3 characters for visual separation
      if (i === 2 && limited.length > 3) {
        formatted += " "
      }
    }
    
    return formatted
  }

  // ✅ NEW: Validate plate number format
  const validatePlateFormat = (plate) => {
    const cleaned = plate.replace(/\s/g, '')
    const isValid = /^[A-Z]{3}[0-9]{3}[A-Z]$/.test(cleaned)
    const remainingChars = 7 - cleaned.length
    
    setPlateIsValid(isValid)
    
    if (cleaned.length === 0) {
      setPlateValidationError("")
    } else if (cleaned.length < 7) {
      setPlateValidationError(
        `${remainingChars} character${remainingChars !== 1 ? 's' : ''} remaining`
      )
    } else if (!isValid) {
      setPlateValidationError(t("invalidPlateFormat", "Invalid format: ABC123D"))
    } else {
      setPlateValidationError("")
    }
  }

  // ✅ NEW: Handle plate number input
  const handlePlateNumberChange = (text) => {
    const formatted = formatPlateNumber(text)
    setFormData({ ...formData, plateNumber: formatted })
    validatePlateFormat(formatted)
    setValidationErrors((prev) => ({ ...prev, plateNumber: false }))
  }

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

  // Load existing data if editing or resuming a draft
  useEffect(() => {
    if ((isEditing || isDraft) && route.params?.draftData?.formData) {
      const existingData = route.params.draftData.formData

      // Handle make/brand
      const brand = existingData.brand || existingData.make || ""
      const isStandardMake = carMakes.includes(brand)

      // Handle images - support both array and object formats
      let images = {
        interior: null,
        exterior_front: null,
        exterior_side: null,
        exterior_rear: null,
      }

      if (existingData.images) {
        if (Array.isArray(existingData.images)) {
          // Assuming order: front, side, rear, interior
          images = {
            exterior_front: existingData.images[0] || null,
            exterior_side: existingData.images[1] || null,
            exterior_rear: existingData.images[2] || null,
            interior: existingData.images[3] || null,
          }
        } else if (typeof existingData.images === 'object') {
          // If images is an object with keys
          images = {
            exterior_front: existingData.images.exterior_front || existingData.images.front || null,
            exterior_side: existingData.images.exterior_side || existingData.images.side || null,
            exterior_rear: existingData.images.exterior_rear || existingData.images.rear || null,
            interior: existingData.images.interior || null,
          }
        }
      }

      setFormData({
        make: isStandardMake ? brand : "Other",
        model: existingData.model || "",
        year: existingData.year?.toString() || "",
        type: existingData.type || existingData.carType || "",
        transmission: existingData.transmission || "",
        fuel_type: existingData.fuelType || existingData.fuel_type || "",
        seatings: existingData.seatings || existingData.seats || "",
        features: existingData.features || [],
        ownerType: existingData.owner?.type || existingData.ownerType || "individual",
        ownerName: existingData.owner?.name || existingData.ownerName || "",
        countryCode: "+250",
        ownerPhone: existingData.owner?.phone?.replace("+250", "") || existingData.ownerPhone || "",
        province: existingData.location?.province || existingData.province || "",
        address: existingData.location?.address || existingData.address || "",
        country: existingData.location?.country || existingData.country || "Rwanda",
        latitude: existingData.location?.latitude?.toString() || existingData.latitude?.toString() || "",
        longitude: existingData.location?.longitude?.toString() || existingData.longitude?.toString() || "",
        base_price: existingData.price?.toString() || existingData.base_price?.toString() || "",
        currency: existingData.currency || "FRW",
        weekly_discount: existingData.weeklyDiscount?.toString() || existingData.weekly_discount?.toString() || "",
        monthly_discount: existingData.monthlyDiscount?.toString() || existingData.monthly_discount?.toString() || "",
        images: images,
        thumbnail: existingData.thumbnail || null,
        category: existingData.category || "",
        plateNumber: existingData.plateNumber || existingData.plate_number || "",
      })
      
      if (!isStandardMake && brand) {
        setCustomMake(brand)
      }

      // Set map location if available
      const lat = existingData.location?.latitude || existingData.latitude
      const lng = existingData.location?.longitude || existingData.longitude
      if (lat && lng) {
        const latitude = Number.parseFloat(lat)
        const longitude = Number.parseFloat(lng)
        if (!isNaN(latitude) && !isNaN(longitude)) {
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          })
          setSelectedLocation({ latitude, longitude })
        }
      }

      setPaymentCompleted(!!existingData.thumbnail)
      setIsManualEntry(true) // Set to manual entry for editing
      setCurrentStep(route.params?.draftData?.currentStep ?? 1) // Restore step if editing a draft
      // setOriginalData will be set after formData is updated
    }
  }, [isEditing, route.params])

  // Set original data after form data is loaded (for editing/draft)
  useEffect(() => {
    if ((isEditing || isDraft) && formData && Object.keys(formData).some(key => formData[key] !== initialFormData[key])) {
      setOriginalData(formData)
      // When loading existing data, don't show as "changed"
      setHasChanges(false)
    }
  }, [formData, isEditing, isDraft])

  // Check for changes in form data (only if there's actual data)
  useEffect(() => {
    // Only detect changes if we have meaningful data
    const hasData = JSON.stringify(formData) !== JSON.stringify(initialFormData)
    const changed = hasData && JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(changed)
  }, [formData, originalData])

  // Handle Redux state changes
  useEffect(() => {
    if (isCreateSuccess) {
      Alert.alert(t("Success"), t("Car listing created successfully!"), [
        {
          text: t("OK"),
          onPress: () => {
            dispatch(clearCreateState())
            // Remove associated draft once listing is published
            if (draftId) {
              dispatch(deleteDraft(draftId))
              setDraftId(generateDraftId())
            }
            setFormData(initialFormData)
            setCurrentStep(1)
            navigation.navigate("MyCars")
          },
        },
      ])
    }
  }, [isCreateSuccess, dispatch, navigation, t, draftId])

  useEffect(() => {
    if (isUpdateSuccess) {
      Alert.alert(t("Success"), t("Car listing updated successfully!"), [
        {
          text: t("OK"),
          onPress: () => {
            dispatch(clearUpdateState())
            // Remove associated draft once listing is updated
            if (draftId) {
              dispatch(deleteDraft(draftId))
              setDraftId(generateDraftId())
            }
            navigation.navigate("MyCars")
          },
        },
      ])
    }
  }, [isUpdateSuccess, dispatch, navigation, t, draftId])

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

  // Plate number validation (alphanumeric, 7 characters, format: ABC123D)
  const isValidPlateNumber = (plate) => {
    const cleaned = plate.replace(/\s/g, '')
    return /^[A-Z]{3}[0-9]{3}[A-Z]$/.test(cleaned)
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
    // Check if we have unsaved changes
    if (hasChanges) {
      Alert.alert(
        t('Unsaved Changes'),
        t('You have unsaved changes. What would you like to do?'),
        [
          {
            text: t('Save as Draft'),
            onPress: async () => {
              await handleSaveAsDraft({ showAlert: false })
              setTimeout(() => navigation.goBack(), 300)
            },
          },
          {
            text: t('Continue Editing'),
            style: 'cancel',
          },
          {
            text: t('Discard Changes'),
            style: 'destructive',
            onPress: () => {
              // Clear draft data when discarding
              const userId = user?.id || user?._id || user?.userId || "user123"
              AsyncStorage.removeItem(`drafts_${userId}`)
              setFormData(initialFormData)
              setCurrentStep(1)
              setHasChanges(false)
              setDraftData(null)
              setDraftId(generateDraftId())
              navigation.goBack()
            },
          },
        ]
      )
    } else {
      // No changes, just go back
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
        plate_number: formData.plateNumber?.toUpperCase().replace(/\s/g, ''),
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

      dispatch(updateCarAction({ carId: editingCarId, updatedData: updateData }))
    } catch (error) {
      console.error("❌ Save changes error:", error)
      Alert.alert("Error", "Failed to save changes: " + error.message)
    }
  }

  const handleSubmit = async () => {

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
      return
    }

    // ✅ FIXED: Plate number check logic
    if (isEditing && formData.plateNumber === originalData.plateNumber) {
      // Plate number unchanged; skip uniqueness check
    } else {
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
    }

    try {

      // Upload all images to Cloudinary in specific order: front exterior first
      const uploadedImages = []
      const imageOrder = ['exterior_front', 'exterior_side', 'exterior_rear', 'interior']
      for (const key of imageOrder) {
        const uri = formData.images[key]
        if (uri) {
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
            const originalUrl = cloudData.secure_url

            // Blur detected license plate automatically
            const blurredUrl = originalUrl.replace(
              "/upload/",
              "/upload/e_blur_region:2000,g_auto:license_plate/"
            )

            uploadedImages.push(blurredUrl)
          } else {
            throw new Error(`Failed to upload ${key} image`)
          }
        }
      }

      // Upload thumbnail if present
      let uploadedThumbnail = null
      if (formData.thumbnail) {
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
          const originalUrl = cloudData.secure_url

          const blurredUrl = originalUrl.replace(
            "/upload/",
            "/upload/e_blur_region:2000,g_auto:license_plate/"
          )

          uploadedThumbnail = blurredUrl
        } else {
          throw new Error(`Failed to upload thumbnail`)
        }
      }


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
        plate_number: formData.plateNumber?.toUpperCase().replace(/\s/g, ''),

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


      if (isEditing) {
        submitData._id = editingCarId
        dispatch(updateCarAction({ carId: editingCarId, updatedData: submitData }))
      } else {
        dispatch(createCarAction(submitData))
      }
    } catch (error) {
      console.error("❌ Submission error:", error)
      Alert.alert("Error", "Image upload failed or listing error: " + error.message)
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
                    key={`dropdown-${errorKey}-${index}-${option}`}
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
        <View key={`step-${step}`} style={styles.stepIndicatorItem}>
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

            {/* ✅ ENHANCED: Plate number with real-time validation */}
            <View style={styles.inputContainer}>
              <View style={styles.plateNumberHeader}>
                <Text style={styles.label}>{t("plateNumber")} <Text style={styles.requiredText}>*</Text></Text>
                {plateIsValid && formData.plateNumber && (
                  <View style={styles.validIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.validIndicatorText}>{t("valid", "Valid")}</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.plateNumber && !plateIsValid && styles.errorBorder,
                  plateIsValid && styles.successBorder,
                ]}
                value={formData.plateNumber}
                onChangeText={handlePlateNumberChange}
                placeholder="ABC 123D"
                autoCapitalize="characters"
                maxLength={8}
              />
              {plateValidationError && (
                <Text style={[styles.helperText, !plateIsValid && formData.plateNumber ? styles.errorHelperText : styles.infoHelperText]}>
                  {plateValidationError}
                </Text>
              )}
              {validationErrors.plateNumber && !plateIsValid && (
                <Text style={styles.errorText}>{t("invalidPlateFormat", "Invalid format: ABC123D")}</Text>
              )}
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.label}>{t("features")}</Text>
              <View style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <TouchableOpacity
                    key={`feature-${index}-${feature}`}
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

              {/* ✅ FIXED: Owner suggestions with proper key */}
              {showOwnerSuggestions && searchResults.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, index) => `owner-${item._id}-${index}`}
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
                  editable={isManualEntry || !user?.phone}
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
                        key={`addr-${index}-${suggestion.description}`}
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
                ].map((photo, index) => (
                  <View
                    key={`photo-${photo.key}-${index}`}
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
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentStep === 1 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentStep === 1}
        >
          <Ionicons name="arrow-back-outline" size={16} color={currentStep === 1 ? "#9CA3AF" : "#475569"} />
          <Text style={[styles.navButtonText, currentStep === 1 && styles.disabledButtonText]}>{t("previous")}</Text>
        </TouchableOpacity>

        {currentStep === 5 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton, (isCreating || isUpdating) && styles.disabledButton]}
            onPress={(isEditing && hasChanges) ? handleSaveChanges : handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {(isEditing && hasChanges) ? t("saveChanges") : currentStep === 5 ? t("submit") : t("next")}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={(isEditing && hasChanges) ? handleSaveChanges : handleNext}>
            <Text style={styles.nextButtonText}>{ (isEditing && hasChanges) ? t("saveChanges") : t("next") }</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Draft Prompt Modal */}
      <Modal visible={showDraftPrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.draftModal}>
            <Text style={styles.draftTitle}>{t("unsavedDraft", "Unsaved Draft Found")}</Text>
            <Text style={styles.draftMessage}>
              {t("draftMessage", "You have an unsaved car listing draft. Would you like to continue editing it or start a new listing?")}
            </Text>
            <View style={styles.draftButtons}>
              <TouchableOpacity
                style={styles.loadDraftButton}
                onPress={() => {
                  if (draftData) {
                    setFormData(draftData.formData || {})
                    setCurrentStep(draftData.currentStep || 1)
                    setIsDraft(true)
                    setIsEditing(draftData.isEditing || false)
                    setEditingCarId(draftData.editingCarId || draftData.id || null)
                    setOriginalData(draftData.formData || {})
                    setDraftId(draftData.id || generateDraftId())
                    setHasChanges(false)
                  }
                  setShowDraftPrompt(false)
                }}
              >
                <Text style={styles.loadDraftText}>{t("continueEditing", "Continue Editing")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.newCarButton}
                onPress={() => {
                  setShowDraftPrompt(false)
                  const userId = user?.id || user?._id || user?.userId || "user123"
                  AsyncStorage.removeItem(`drafts_${userId}`)
                  setFormData(initialFormData)
                  setCurrentStep(1)
                  setHasChanges(false)
                  setDraftData(null)
                  setIsEditing(false)
                  setIsDraft(false)
                  setEditingCarId(null)
                  setDraftId(generateDraftId())
                  setPlateValidationError("")
                  setPlateIsValid(false)
                  setDraftPromptShown(false)
                }}
              >
                <Text style={styles.newCarText}>{t("startNew", "Start New")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exit Modal */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.draftModal}>
            <Text style={styles.draftTitle}>{t("saveDraft", "Save Draft?")}</Text>
            <Text style={styles.draftMessage}>
              {t("exitMessage", "You haven't completed adding the car. Save as draft to continue later?")}
            </Text>
            <View style={styles.draftButtons}>
              <TouchableOpacity
                style={styles.loadDraftButton}
                onPress={async () => {
                  await handleSaveAsDraft();
                  setShowExitModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.loadDraftText}>{t("saveDraft", "Save Draft")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.newCarButton}
                onPress={() => {
                  setShowExitModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.newCarText}>{t("exit", "Exit")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                    key={`country-${index}-${country.code}`}
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

// ✅ ENHANCED: Add these new styles to the StyleSheet.create
const styles = StyleSheet.create({
  // ...existing styles...
  plateNumberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requiredText: {
    color: "#EF4444",
    fontSize: 14,
  },
  validIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ECFDF5",
    borderRadius: 4,
  },
  validIndicatorText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  successBorder: {
    borderColor: "#10B981",
    borderWidth: 2,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  errorHelperText: {
    color: "#EF4444",
  },
  infoHelperText: {
    color: "#64748B",
  },

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
  },
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

export default AddCarScreen