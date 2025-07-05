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
  Alert,
  Image,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import * as ImagePicker from "expo-image-picker"
import MapView, { Marker } from "react-native-maps"
import * as Location from "expo-location"
import carIcon from "../../assets/car-marker.png"
import { rwandaLocations, searchLocations, getProvinceCoordinates } from "../../utils/rwandaLocations"
import "../../utils/i18n"

const { height: screenHeight } = Dimensions.get("window")

const AddCarScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { t } = useTranslation()

  // Check if we're in editing mode
  const isEditing = route.params?.draftData?.isEditing || false
  const editingCarId = route.params?.draftData?.id

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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [filteredModels, setFilteredModels] = useState([])
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentData, setPaymentData] = useState({
    momoPhone: "",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    cardType: "",
  })
  const [isCustomModel, setIsCustomModel] = useState(false)

  const [mapRegion, setMapRegion] = useState({
    latitude: -1.9441,
    longitude: 30.0619,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [selectedLocation, setSelectedLocation] = useState(null)

  const [formData, setFormData] = useState({
    // Basic Information
    make: "",
    model: "",
    year: "",
    type: "",
    transmission: "",
    fuel_type: "",
    seatings: "",
    features: [],

    // Owner Information
    ownerType: "individual",
    ownerName: "",
    countryCode: "+250",
    ownerPhone: "",

    // Location
    province: "",
    address: "",
    country: "Rwanda",
    latitude: "",
    longitude: "",

    // Pricing
    base_price: "",
    currency: "FRW",
    weekly_discount: "",
    monthly_discount: "",

    // Media
    images: {
      interior: null,
      exterior_front: null,
      exterior_side: null,
      exterior_rear: null,
    },
    thumbnail: null,

    // Category
    category: "",
  })

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

  // Comprehensive car makes
  const carMakes = [
    "Acura",
    "Alfa Romeo",
    "Aston Martin",
    "Audi",
    "Bentley",
    "BMW",
    "Bugatti",
    "Buick",
    "Cadillac",
    "Chevrolet",
    "Chrysler",
    "Citroën",
    "Dacia",
    "Daewoo",
    "Daihatsu",
    "Dodge",
    "Ferrari",
    "Fiat",
    "Ford",
    "Genesis",
    "GMC",
    "Honda",
    "Hyundai",
    "Infiniti",
    "Isuzu",
    "Jaguar",
    "Jeep",
    "Kia",
    "Lamborghini",
    "Land Rover",
    "Lexus",
    "Lincoln",
    "Lotus",
    "Maserati",
    "Mazda",
    "McLaren",
    "Mercedes-Benz",
    "Mini",
    "Mitsubishi",
    "Nissan",
    "Opel",
    "Peugeot",
    "Porsche",
    "Ram",
    "Renault",
    "Rolls-Royce",
    "Saab",
    "Seat",
    "Skoda",
    "Smart",
    "Subaru",
    "Suzuki",
    "Tesla",
    "Toyota",
    "Volkswagen",
    "Volvo",
    "Other",
  ]

  // Car models by make (comprehensive list)
  const carModels = {
    Toyota: [
      "Camry",
      "Corolla",
      "Prius",
      "RAV4",
      "Highlander",
      "4Runner",
      "Tacoma",
      "Tundra",
      "Sienna",
      "Avalon",
      "Yaris",
      "C-HR",
      "Venza",
      "Sequoia",
      "Land Cruiser",
      "Prado",
      "Hilux",
      "Fortuner",
      "Innova",
      "Vitz",
      "Allion",
      "Premio",
      "Fielder",
      "Wish",
    ],
    Honda: [
      "Civic",
      "Accord",
      "CR-V",
      "Pilot",
      "Odyssey",
      "Fit",
      "HR-V",
      "Passport",
      "Ridgeline",
      "Insight",
      "Clarity",
      "Element",
      "S2000",
      "NSX",
      "Prelude",
      "Del Sol",
      "CRX",
      "Integra",
    ],
    Nissan: [
      "Altima",
      "Sentra",
      "Maxima",
      "Rogue",
      "Murano",
      "Pathfinder",
      "Armada",
      "Titan",
      "Frontier",
      "Versa",
      "Kicks",
      "Juke",
      "Leaf",
      "370Z",
      "GT-R",
      "Quest",
      "NV200",
      "Patrol",
      "X-Trail",
      "Qashqai",
      "Micra",
      "Note",
      "Tiida",
      "Sunny",
    ],
    BMW: [
      "3 Series",
      "5 Series",
      "7 Series",
      "X1",
      "X3",
      "X5",
      "X7",
      "Z4",
      "i3",
      "i8",
      "1 Series",
      "2 Series",
      "4 Series",
      "6 Series",
      "8 Series",
      "X2",
      "X4",
      "X6",
      "M3",
      "M5",
      "M8",
      "iX",
      "i4",
    ],
    "Mercedes-Benz": [
      "C-Class",
      "E-Class",
      "S-Class",
      "GLA",
      "GLC",
      "GLE",
      "GLS",
      "A-Class",
      "B-Class",
      "CLA",
      "CLS",
      "G-Class",
      "SL",
      "SLC",
      "AMG GT",
      "EQC",
      "EQS",
      "Sprinter",
      "Metris",
    ],
  }

  const provinces = Object.keys(rwandaLocations)

  const typeOptions = [
    t("Sedan"),
    t("SUV"),
    t("Hatchback"),
    t("Coupe"),
    t("Convertible"),
    t("Pickup"),
    t("Van"),
    t("Minibus"),
    t("Crossover"),
    t("Station Wagon"),
    t("Truck"),
    t("Limousine"),
    t("Sports Car"),
    t("Other"),
  ]

  const transmissionOptions = [t("Automatic"), t("Manual"), t("CVT"), t("Semi-Automatic")]
  const fuelOptions = [t("Gasoline"), t("Diesel"), t("Hybrid"), t("Electric"), t("CNG"), t("LPG")]
  const seatsOptions = ["2", "4", "5", "7", "8", "9+"]

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

  // Generate years from 1990 to current year + 1
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => (currentYear + 1 - i).toString())

  // Name validation
  const isValidName = (name) => {
    return /^[a-zA-Z\s'-]{2,}$/.test(name)
  }

  // Phone validation (10 digits)
  const isValidPhone = (phone) => {
    return /^\d{10}$/.test(phone)
  }

  // Card type detection
  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, "")
    if (/^4/.test(number)) return "Visa"
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return "MasterCard"
    if (/^3[47]/.test(number)) return "American Express"
    return ""
  }

  // Format card number
  const formatCardNumber = (value) => {
    const number = value.replace(/\S/g, "")
    const match = number.match(/.{1,4}/g)
    return match ? match.join(" ") : ""
  }

  // Auto-fill current location on load
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({})
          const { latitude, longitude } = location.coords
          setFormData((prev) => ({
            ...prev,
            address: t("Current Location"),
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }))
          setSelectedLocation({ latitude, longitude })
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })
        } catch (error) {
          console.log("Error getting location:", error)
        }
      }
    })()
  }, [])

  // Update models when make changes
  useEffect(() => {
    if (formData.make && carModels[formData.make] && formData.make !== "Other") {
      setFilteredModels(carModels[formData.make])
      setIsCustomModel(false)
    } else {
      setFilteredModels([])
      setIsCustomModel(true)
    }
    // Reset model when make changes
    if (formData.model && (!carModels[formData.make] || !carModels[formData.make].includes(formData.model))) {
      setFormData((prev) => ({ ...prev, model: "" }))
    }
  }, [formData.make])

  // Update map when province changes
  useEffect(() => {
    if (formData.province) {
      const coordinates = getProvinceCoordinates(formData.province)
      setMapRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      })
      setSelectedLocation({ latitude: coordinates.latitude, longitude: coordinates.longitude })
    }
  }, [formData.province])

  // Handle address input and suggestions
  const handleAddressChange = (text) => {
    setFormData((prev) => ({ ...prev, address: text }))

    if (text.length >= 3) {
      const suggestions = searchLocations(text, 5)
      setAddressSuggestions(suggestions)
      setShowAddressSuggestions(true)
    } else {
      setShowAddressSuggestions(false)
    }
  }

  // Select address suggestion
  const selectAddressSuggestion = async (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.fullAddress,
      province: suggestion.province,
    }))
    setShowAddressSuggestions(false)
    Keyboard.dismiss()

    // Geocode the selected address
    try {
      const geocoded = await Location.geocodeAsync(suggestion.fullAddress + ", Rwanda")
      if (geocoded.length > 0) {
        const location = geocoded[0]
        updateMapLocation(location.latitude, location.longitude)
      }
    } catch (error) {
      console.log("Geocoding error:", error)
      // Use province coordinates as fallback
      const coordinates = getProvinceCoordinates(suggestion.province)
      updateMapLocation(coordinates.latitude, coordinates.longitude)
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

  const validateCurrentStep = () => {
    const errors = {}

    switch (currentStep) {
      case 1: // Basic Information
        if (!formData.make) errors.make = true
        if (!formData.model) errors.model = true
        if (!formData.year) errors.year = true
        if (!formData.type) errors.type = true
        if (!formData.transmission) errors.transmission = true
        if (!formData.fuel_type) errors.fuel_type = true
        if (!formData.seatings) errors.seatings = true
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
      Alert.alert(t("Required Fields"), t("Fill all required fields"))
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setValidationErrors({})
      setCurrentStep(currentStep - 1)
    }
  }

  const updateMapLocation = (latitude, longitude) => {
    setSelectedLocation({ latitude, longitude })
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
    setFormData((prev) => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }))
  }

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    updateMapLocation(latitude, longitude)
  }

  const handlePayment = () => {
    if (paymentMethod === "momo") {
      if (!isValidPhone(paymentData.momoPhone)) {
        Alert.alert(t("Invalid Phone"), t("Enter a valid phone number"))
        return
      }
    } else if (paymentMethod === "card") {
      if (!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryDate || !paymentData.cvv) {
        Alert.alert(t("Incomplete Card Details"), t("Fill in all card information"))
        return
      }
    }

    // Simulate payment processing
    Alert.alert(t("Processing Payment"), t("Please wait while we process your payment"), [{ text: t("OK") }])

    setTimeout(() => {
      Alert.alert(t("Payment Successful"), t("Payment processed successfully"), [
        {
          text: t("OK"),
          onPress: () => {
            setShowPaymentModal(false)
            pickImageAfterPayment()
          },
        },
      ])
    }, 2000)
  }

  const pickImageAfterPayment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: result.assets[0].uri,
      }))
    }
  }

  const pickImage = async (imageType) => {
    if (imageType === "thumbnail") {
      setShowPaymentModal(true)
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

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [imageType]: result.assets[0].uri,
        },
      }))
    }
  }

  const openGallery = async (imageType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [imageType]: result.assets[0].uri,
        },
      }))
    }
  }

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      const carData = {
        id: isEditing ? editingCarId : Date.now().toString(),
        name: `${formData.make} ${formData.model}`,
        ...formData,
        price: Number.parseInt(formData.base_price),
        year: Number.parseInt(formData.year),
        image: formData.images.exterior_front || "https://via.placeholder.com/300x200/E2E8F0/64748B?text=Car+Image",
        status: "active",
        available: true,
        views: 0,
        rating: 0,
        reviews: 0,
      }

      const message = isEditing ? t("Listing Updated") : t("Listing Submitted")

      Alert.alert(t("Success"), message, [
        {
          text: t("OK"),
          onPress: () => navigation.navigate("MyCars"),
        },
      ])
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

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentBottomSheet}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentTitle}>{t("Premium Thumbnail Upload")}</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close-outline" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentContent}>
              <Text style={styles.paymentAmount}>{t("Amount")}</Text>
              <Text style={styles.paymentDescription}>
                {t("Upload your business poster for premium visibility and better customer engagement")}
              </Text>

              <Text style={styles.paymentMethodTitle}>{t("Choose Payment Method")}</Text>

              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[styles.paymentMethodButton, paymentMethod === "momo" && styles.selectedPaymentMethod]}
                  onPress={() => setPaymentMethod("momo")}
                >
                  <Image
                    source={{
                      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoXU9ZNvjHa2LUc6_xyeEBa_bl0IGDKbzrTg&s",
                    }}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentMethodText}>{t("MTN MoMo")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paymentMethodButton, paymentMethod === "card" && styles.selectedPaymentMethod]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <Image
                    source={{ uri: "https://img.freepik.com/free-vector/realistic-credit-card-design_23-2149126088.jpg" }}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentMethodText}>{t("Credit Card")}</Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === "momo" && (
                <View style={styles.paymentForm}>
                  <Text style={styles.formLabel}>{t("Phone Number")}</Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.countryCodeText}>+250</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={paymentData.momoPhone}
                      onChangeText={(text) => setPaymentData((prev) => ({ ...prev, momoPhone: text }))}
                      placeholder="788123456"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                </View>
              )}

              {paymentMethod === "card" && (
                <View style={styles.paymentForm}>
                  <View style={styles.cardInputContainer}>
                    <Text style={styles.formLabel}>{t("Card Number")}</Text>
                    <View style={styles.cardNumberContainer}>
                      <TextInput
                        style={styles.cardInput}
                        value={paymentData.cardNumber}
                        onChangeText={(text) => {
                          const formatted = formatCardNumber(text)
                          const cardType = detectCardType(text)
                          setPaymentData((prev) => ({
                            ...prev,
                            cardNumber: formatted,
                            cardType: cardType,
                          }))
                        }}
                        placeholder="1234 5678 9012 3456"
                        keyboardType="numeric"
                        maxLength={19}
                      />
                      {paymentData.cardType && <Text style={styles.cardType}>{paymentData.cardType}</Text>}
                    </View>
                  </View>

                  <Text style={styles.formLabel}>{t("Cardholder Name")}</Text>
                  <TextInput
                    style={styles.cardInput}
                    value={paymentData.cardHolder}
                    onChangeText={(text) => setPaymentData((prev) => ({ ...prev, cardHolder: text }))}
                    placeholder="John Doe"
                  />

                  <View style={styles.cardRow}>
                    <View style={styles.cardInputHalf}>
                      <Text style={styles.formLabel}>{t("Expiry Date")}</Text>
                      <TextInput
                        style={styles.cardInput}
                        value={paymentData.expiryDate}
                        onChangeText={(text) => {
                          // Format MM/YY
                          let formatted = text.replace(/\D/g, "")
                          if (formatted.length >= 2) {
                            formatted = formatted.substring(0, 2) + "/" + formatted.substring(2, 4)
                          }
                          setPaymentData((prev) => ({ ...prev, expiryDate: formatted }))
                        }}
                        placeholder="MM/YY"
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>

                    <View style={styles.cardInputHalf}>
                      <Text style={styles.formLabel}>{t("CVV")}</Text>
                      <TextInput
                        style={styles.cardInput}
                        value={paymentData.cvv}
                        onChangeText={(text) => setPaymentData((prev) => ({ ...prev, cvv: text }))}
                        placeholder="123"
                        keyboardType="numeric"
                        maxLength={paymentData.cardType === "American Express" ? 4 : 3}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>
              )}

              {paymentMethod && (
                <TouchableOpacity style={styles.confirmPaymentButton} onPress={handlePayment}>
                  <Text style={styles.confirmPaymentText}>{t("Confirm Payment")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Vehicle Information")}</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("Make")}</Text>
                {renderDropdown(
                  carMakes,
                  formData.make,
                  (value) => setFormData({ ...formData, make: value }),
                  t("Select Make"),
                  showMakeDropdown,
                  setShowMakeDropdown,
                  "make",
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("Model")}</Text>
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
                <Text style={styles.label}>{t("Year")}</Text>
                <TextInput
                  style={[styles.input, validationErrors.year && styles.errorBorder]}
                  value={formData.year}
                  onChangeText={(text) => {
                    setFormData({ ...formData, year: text })
                    setValidationErrors((prev) => ({ ...prev, year: false }))
                  }}
                  placeholder="e.g. 2020"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("Type")}</Text>
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
                <Text style={styles.label}>{t("Transmission")}</Text>
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
                <Text style={styles.label}>{t("Fuel Type")}</Text>
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
              <Text style={styles.label}>{t("Seating Capacity")}</Text>
              {renderDropdown(
                seatsOptions,
                formData.seatings,
                (value) => setFormData({ ...formData, seatings: value }),
                t("Select Seating Capacity"),
                showSeatsDropdown,
                setShowSeatsDropdown,
                "seatings",
              )}
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.label}>{t("Features")}</Text>
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
            <Text style={styles.stepTitle}>{t("Owner Information")}</Text>

            <View style={styles.ownerTypeContainer}>
              <Text style={styles.label}>{t("Owner Type")}</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, ownerType: "individual" })}
                >
                  <View style={[styles.radioCircle, formData.ownerType === "individual" && styles.radioSelected]}>
                    {formData.ownerType === "individual" && <View style={styles.radioInner} />}
                  </View>
                  <Ionicons name="person-outline" size={20} color="#64748B" />
                  <Text style={styles.radioText}>{t("Individual")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, ownerType: "company" })}
                >
                  <View style={[styles.radioCircle, formData.ownerType === "company" && styles.radioSelected]}>
                    {formData.ownerType === "company" && <View style={styles.radioInner} />}
                  </View>
                  <Ionicons name="business-outline" size={20} color="#64748B" />
                  <Text style={styles.radioText}>{t("Company")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {formData.ownerType === "company" ? t("Company Name") : t("Full Name")}
              </Text>
              <TextInput
                style={[styles.input, validationErrors.ownerName && styles.errorBorder]}
                value={formData.ownerName}
                onChangeText={(text) => {
                  setFormData({ ...formData, ownerName: text })
                  setValidationErrors((prev) => ({ ...prev, ownerName: false }))
                }}
                placeholder={formData.ownerType === "company" ? t("Enter company name") : t("Enter your full name")}
              />
              {validationErrors.ownerName && <Text style={styles.errorText}>{t("Invalid Name")}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="call-outline" size={16} /> {t("Phone Number")}
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
                    // Only allow digits and limit to 10
                    const cleaned = text.replace(/\D/g, "").slice(0, 10)
                    setFormData({ ...formData, ownerPhone: cleaned })
                    setValidationErrors((prev) => ({ ...prev, ownerPhone: false }))
                  }}
                  placeholder="788123456"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              {validationErrors.ownerPhone && <Text style={styles.errorText}>{t("Invalid Phone")}</Text>}

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
            </View>
          </View>
        )

      case 3: // Location
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Location Details")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("Province")}</Text>
              {renderDropdown(
                provinces,
                formData.province,
                (value) => setFormData({ ...formData, province: value }),
                t("Select Province"),
                showProvinceDropdown,
                setShowProvinceDropdown,
                "province",
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("Address")}</Text>
              <TextInput
                style={[styles.input, validationErrors.address && styles.errorBorder]}
                value={formData.address}
                onChangeText={handleAddressChange}
                placeholder={t("Enter Address")}
              />

              {showAddressSuggestions && addressSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {addressSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectAddressSuggestion(suggestion)}
                    >
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={styles.suggestionText}>{suggestion.fullAddress}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("Country")}</Text>
              <TextInput style={styles.input} value={formData.country} editable={false} />
            </View>

            <View style={styles.mapContainer}>
              <Text style={styles.label}>
                <Ionicons name="location-outline" size={16} /> {t("Location on Map")}
              </Text>
              {validationErrors.location && <Text style={styles.errorText}>{t("Select Location on Map")}</Text>}

              <TouchableOpacity style={styles.mapPreview} onPress={() => setShowMapModal(true)}>
                {selectedLocation ? (
                  <MapView style={styles.miniMap} region={mapRegion} scrollEnabled={false} zoomEnabled={false}>
                    <Marker coordinate={selectedLocation}>
                      <Image source={carIcon} style={styles.markerIcon} />
                    </Marker>
                  </MapView>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Ionicons name="location-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.mapPlaceholderText}>{t("Tap to Select Location")}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Full Screen Map Modal */}
            <Modal visible={showMapModal} animationType="slide">
              <SafeAreaView style={styles.mapModalContainer}>
                <View style={styles.mapModalHeader}>
                  <TouchableOpacity onPress={() => setShowMapModal(false)}>
                    <Ionicons name="close-outline" size={24} color="#1E293B" />
                  </TouchableOpacity>
                  <Text style={styles.mapModalTitle}>{t("Select Location")}</Text>
                  <TouchableOpacity onPress={() => setShowMapModal(false)}>
                    <Text style={styles.mapModalDone}>{t("Done")}</Text>
                  </TouchableOpacity>
                </View>

                <MapView
                  style={styles.fullMap}
                  region={mapRegion}
                  onPress={handleMapPress}
                  onRegionChangeComplete={setMapRegion}
                >
                  {selectedLocation && (
                    <Marker coordinate={selectedLocation}>
                      <Image source={carIcon} style={styles.markerIcon} />
                    </Marker>
                  )}
                </MapView>
              </SafeAreaView>
            </Modal>
          </View>
        )

      case 4: // Pricing & Category
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Pricing and Category")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("Category")}</Text>
              {renderDropdown(
                categoryOptions,
                formData.category,
                (value) => setFormData({ ...formData, category: value }),
                t("Select Category"),
                showCategoryDropdown,
                setShowCategoryDropdown,
                "category",
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("Base Price")}</Text>
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
                <Text style={styles.label}>{t("Weekly Discount")}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weekly_discount}
                  onChangeText={(text) => setFormData({ ...formData, weekly_discount: text })}
                  placeholder="10"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("Monthly Discount")}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.monthly_discount}
                  onChangeText={(text) => setFormData({ ...formData, monthly_discount: text })}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                <Text style={styles.noteLabel}>{t("Note")}:</Text>{" "}
                {t("Discounts are optional and will be applied automatically for weekly and monthly rentals")}
              </Text>
            </View>
          </View>
        )

      case 5: // Media Upload
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>{t("Upload Photos")}</Text>

            <View style={styles.photosContainer}>
              <Text style={styles.label}>{t("Car Photos")}</Text>
              {validationErrors.images && <Text style={styles.errorText}>{t("Upload all required photos")}</Text>}

              <View style={styles.photosGrid}>
                {[
                  { key: "interior", label: t("Interior View") },
                  { key: "exterior_front", label: t("Front Exterior") },
                  { key: "exterior_side", label: t("Side Exterior") },
                  { key: "exterior_rear", label: t("Rear Exterior") },
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
                      <Text style={styles.chooseButtonText}>{t("Choose")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Thumbnail Upload (Premium Feature) */}
            <View style={styles.thumbnailContainer}>
              <Text style={styles.label}>
                {t("Business Thumbnail")} <Ionicons name="star-outline" size={16} color="#F59E0B" />
              </Text>
              <Text style={styles.thumbnailDescription}>
                {t("Upload your business poster for premium visibility (5000 FRW)")}
              </Text>

              <View style={styles.thumbnailUpload}>
                {formData.thumbnail ? (
                  <Image source={{ uri: formData.thumbnail }} style={styles.thumbnailImage} />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <Ionicons name="business-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.thumbnailPlaceholderText}>{t("Business Poster")}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.premiumButton} onPress={() => pickImage("thumbnail")}>
                  <Ionicons name="diamond-outline" size={16} color="#F59E0B" />
                  <Text style={styles.premiumButtonText}>{t("Upload Premium")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )

      case 6: // Review & Submit
        return (
          <View style={styles.stepContainer}>
            <View style={styles.reviewHeader}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
              <Text style={styles.stepTitle}>{t("Review and Submit")}</Text>
              <Text style={styles.reviewSubtitle}>
                {isEditing ? t("Review your changes before updating") : t("Review your car details before submitting")}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t("Vehicle Summary")}</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Vehicle")}:</Text>
                <Text style={styles.summaryValue}>
                  {formData.make} {formData.model} {formData.year}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Type")}:</Text>
                <Text style={styles.summaryValue}>{formData.type}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Category")}:</Text>
                <Text style={styles.summaryValue}>{formData.category}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Owner")}:</Text>
                <Text style={styles.summaryValue}>
                  {formData.ownerName} ({formData.ownerType})
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Phone")}:</Text>
                <Text style={styles.summaryValue}>
                  {formData.countryCode} {formData.ownerPhone}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Location")}:</Text>
                <Text style={styles.summaryValue}>
                  {formData.address}, {formData.province}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Base Price")}:</Text>
                <Text style={[styles.summaryValue, styles.priceText]}>{formData.base_price} FRW per day</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Features")}:</Text>
                <Text style={styles.summaryValue}>{formData.features.length} {t("selected")}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("Photos")}:</Text>
                <Text style={styles.summaryValue}>{t("4 uploaded")}</Text>
              </View>

              {formData.thumbnail && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t("Premium Thumbnail")}:</Text>
                  <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>{t("Included")}</Text>
                </View>
              )}
            </View>

            <View style={styles.finalNoteContainer}>
              <Text style={styles.noteText}>
                <Text style={styles.noteLabel}>{t("Note")}:</Text>{" "}
                {isEditing
                  ? t("Your changes will be saved and the listing will be updated immediately")
                  : t("Your listing will be reviewed within 24 hours. You'll receive a notification once approved and live")}
              </Text>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  const stepTitles = [
    t("Step 1: Vehicle"),
    t("Step 2: Owner"),
    t("Step 3: Location"),
    t("Step 4: Pricing"),
    t("Step 5: Media"),
    t("Step 6: Review"),
  ]

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{isEditing ? t("Edit Car") : t("Add New Car")}</Text>
          <Text style={styles.subtitle}>{t("Step {{current}} of {{total}}", { current: currentStep, total: 6 })}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 6) * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          {stepTitles.map((title, index) => (
            <Text key={index} style={styles.progressLabel}>
              {title}
            </Text>
          ))}
        </View>
      </View>

      {/* Form Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>{renderStep()}</View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentStep === 1 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentStep === 1}
        >
          <Ionicons name="arrow-back-outline" size={16} color={currentStep === 1 ? "#9CA3AF" : "#475569"} />
          <Text style={[styles.navButtonText, currentStep === 1 && styles.disabledButtonText]}>{t("Previous")}</Text>
        </TouchableOpacity>

        {!isEditing && (
          <TouchableOpacity style={styles.draftButton} onPress={() => {}}>
            <Ionicons name="save-outline" size={16} color="#64748B" />
            <Text style={styles.draftButtonText}>{t("Save Draft")}</Text>
          </TouchableOpacity>
        )}

        {currentStep === 6 ? (
          <TouchableOpacity style={[styles.navButton, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{isEditing ? t("Save Changes") : t("Submit")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t("Next")}</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Modal */}
      {renderPaymentModal()}
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
    fontSize: 14,
    color: "#64748B",
  },
  progressContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007EFD",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
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
  countryOption: {
    fontSize: 16,
    color: "#1E293B",
  },
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
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
  mapContainer: {
    gap: 12,
  },
  mapPreview: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  miniMap: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    fontWeight: "500",
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  mapModalDone: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007EFD",
  },
  fullMap: {
    flex: 1,
  },
  markerIcon: {
    width: 32,
    height: 32,
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
  thumbnailContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  thumbnailDescription: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 16,
  },
  thumbnailUpload: {
    alignItems: "center",
    gap: 12,
  },
  thumbnailImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 120,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FCD34D",
    borderStyle: "dashed",
  },
  thumbnailPlaceholderText: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 4,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 8,
  },
  premiumButtonText: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
  },
  noteContainer: {
    backgroundColor: "#EBF8FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  noteText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  noteLabel: {
    fontWeight: "600",
  },
  reviewHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  reviewSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
  },
  summaryCard: {
    borderWidth: 2,
    borderColor: "#007EFD",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#F0F9FF",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007EFD",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  priceText: {
    color: "#007EFD",
    fontSize: 16,
  },
  finalNoteContainer: {
    backgroundColor: "#EBF8FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
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
  draftButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    backgroundColor: "#007EFD",
  },
  submitButton: {
    backgroundColor: "#007EFD",
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
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
  disabledButtonText: {
    color: "#9CA3AF",
  },
  // Payment Modal Styles
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  paymentBottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  paymentContent: {
    padding: 20,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  paymentMethodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  selectedPaymentMethod: {
    borderColor: "#007EFD",
    backgroundColor: "#F0F9FF",
  },
  paymentIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  paymentForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  cardInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
  },
  cardInputContainer: {
    marginBottom: 16,
  },
  cardNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007EFD",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  cardInputHalf: {
    flex: 1,
  },
  confirmPaymentButton: {
    backgroundColor: "#007EFD",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  confirmPaymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default AddCarScreen