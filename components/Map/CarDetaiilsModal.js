"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
  Modal,
  PanResponder,
  Animated,
} from "react-native"
import { X, Calendar, MapPin, Phone, User, Droplet, Settings, Star } from "react-native-feather"
import { cloudinaryImages, getCloudinaryImage } from "../../utils/image-loader"

const { width, height } = Dimensions.get("window")

// Company data mapping from AllCarsScreen
const companyData = [
  {
    name: "MUVCAR Car Rentals",
    type: "company",
    location: "Kigali City Center, Rwanda",
    phone: "0780114522",
    photo: getCloudinaryImage(cloudinaryImages.companies.companyLogo),
  },
  {
    name: "Keza Motors Ltd",
    type: "company",
    location: "Remera, Kigali, Rwanda",
    phone: "0733445566",
    photo: getCloudinaryImage(cloudinaryImages.companies.companyLogo2),
  },
  {
    name: "Rwanda Premium Cars",
    type: "company",
    location: "Nyarutarama, Kigali, Rwanda",
    phone: "0722334455",
    photo: getCloudinaryImage(cloudinaryImages.companies.logo),
  },
  {
    name: "Kigali Auto Rentals",
    type: "company",
    location: "Kimihurura, Kigali, Rwanda",
    phone: "0788112233",
    photo: getCloudinaryImage(cloudinaryImages.companies.companyLogo),
  },
  {
    name: "Safari Car Hire",
    type: "company",
    location: "Kacyiru, Kigali, Rwanda",
    phone: "0733998877",
    photo: getCloudinaryImage(cloudinaryImages.companies.companyLogo2),
  },
  {
    name: "RwandaDrive",
    type: "company",
    location: "Gisozi, Kigali, Rwanda",
    phone: "0722556677",
    photo: getCloudinaryImage(cloudinaryImages.companies.logo),
  },
]

// Car-specific photos mapping
const carPhotosMapping = {
  // Jeep Rubicon
  1: {
    interior: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/jeep-rubicon-inter_fgzppb.png",
    ),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/jeep-rubicon-ext_fgzppb.png",
    ),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
  },
  // Audi A8 Quattro
  2: {
    interior: getCloudinaryImage(cloudinaryImages.cars.audiA8Int),
    exterior1: getCloudinaryImage(cloudinaryImages.cars.audiA8Ext),
    exterior2: getCloudinaryImage(cloudinaryImages.cars.audiA8),
  },
  // Tesla Model X
  3: {
    interior: getCloudinaryImage(cloudinaryImages.cars.teslaModelInt),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/tesla-model-ex_fgzppb.png",
    ),
    exterior2: getCloudinaryImage(cloudinaryImages.cars.teslaModelX),
  },
  // Ford Mustang GT
  4: {
    interior: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/ford-mustangInt_fgzppb.png",
    ),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/ford-mustangEx_fgzppb.png",
    ),
  },
  // Audi Q5
  5: {
    interior: getCloudinaryImage(cloudinaryImages.cars.audiQ5Interior),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/audi-q5-exterior1_fgzppb.jpg",
    ),
    exterior2: getCloudinaryImage(cloudinaryImages.cars.audiQ5Exterior),
  },
  // BMW X5
  6: {
    interior: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/bmw-x5-interior_fgzppb.jpg",
    ),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/bmw-x5-exterior1_fgzppb.jpg",
    ),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/bmw-x5-exterior2_fgzppb.jpg",
    ),
  },
  // Mercedes GLE
  7: {
    interior: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/mercedes-gle-interior_fgzppb.jpg",
    ),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/mercedes-gle-exterior1_fgzppb.jpg",
    ),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/mercedes-gle-exterior2_fgzppb.jpg",
    ),
  },
  // Toyota Land Cruiser
  8: {
    interior: getCloudinaryImage(cloudinaryImages.cars.toyotaLandcruiserInt),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/toyota-landcruiser-exterior1_fgzppb.jpg",
    ),
    exterior2: getCloudinaryImage(cloudinaryImages.cars.toyotaLandcruiserExt),
  },
  // Range Rover Sport
  9: {
    interior: getCloudinaryImage(cloudinaryImages.cars.rangeRoverSportInt),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/range-rover-sport-exterior1_fgzppb.jpg",
    ),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/range-rover-sport-exterior2_fgzppb.jpg",
    ),
  },
  // Porsche Cayenne
  10: {
    interior: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/porsche-cayenne-interior_fgzppb.jpg",
    ),
    exterior1: getCloudinaryImage(cloudinaryImages.cars.porscheCayenne),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/porsche-cayenne-exterior2_fgzppb.jpg",
    ),
  },
  // Default photos for any car not in the mapping
  default: {
    interior: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/default-interior_fgzppb.jpg",
    ),
    exterior1: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/default-exterior1_fgzppb.jpg",
    ),
    exterior2: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228450/default-exterior2_fgzppb.jpg",
    ),
  },
}

// Generate current month availability dates
const generateAvailabilityDates = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const dates = []
  for (let i = 1; i <= daysInMonth; i++) {
    // Randomly mark some dates as available (about 60%)
    const isAvailable = Math.random() > 0.4
    const date = new Date(currentYear, currentMonth, i)

    // Don't include past dates as available
    if (date < today) continue

    dates.push({
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      available: isAvailable,
    })
  }

  return dates
}

const CarDetailsModal = ({ car, visible, onClose, hideBottomNav }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [photoZoomVisible, setPhotoZoomVisible] = useState(false)
  const [zoomedPhotoIndex, setZoomedPhotoIndex] = useState(0)
  const [owner, setOwner] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [lastTapTime, setLastTapTime] = useState(0)
  const [carPhotos, setCarPhotos] = useState([])

  // Animation for modal slide
  const pan = useRef(new Animated.ValueXY()).current
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow downward movement
          pan.y.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100px, close modal
          onClose()
        } else {
          // Otherwise, reset position
          Animated.spring(pan.y, {
            toValue: 0,
            useNativeDriver: true,
          }).start()
        }
      },
    }),
  ).current

  // Create car photos array with the main image from car data and additional photos
  const getCarPhotos = (car) => {
    if (!car) return []

    // Get car-specific photos or use defaults if not found
    const carSpecificPhotos = carPhotosMapping[car.id] || carPhotosMapping.default

    return [
      { id: 1, uri: car.image, type: "exterior" },
      { id: 2, uri: carSpecificPhotos.exterior1, type: "exterior" },
      { id: 3, uri: carSpecificPhotos.exterior2, type: "exterior" },
      { id: 4, uri: carSpecificPhotos.interior, type: "interior" },
    ]
  }

  useEffect(() => {
    if (visible && car) {
      // Reset loading state when modal becomes visible
      setIsLoading(true)
      setMainPhotoIndex(0)
      pan.y.setValue(0)

      // Set car photos
      setCarPhotos(getCarPhotos(car))

      // Hide bottom navigation when modal is open
      if (hideBottomNav) {
        hideBottomNav(true)
      }

      // Generate random availability dates
      setAvailableDates(generateAvailabilityDates())

      // Find the company that matches the car's company
      const matchingCompany = companyData.find((company) => company.name === car.company)
      setOwner(matchingCompany || companyData[0])

      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)

      return () => {
        clearTimeout(timer)
        // Show bottom navigation when modal is closed
        if (hideBottomNav) {
          hideBottomNav(false)
        }
      }
    }
  }, [visible, car, hideBottomNav])

  const handlePhotoPress = (index) => {
    const now = Date.now()
    if (now - lastTapTime < 300 && mainPhotoIndex === index) {
      // Double tap detected
      handlePhotoDoubleTap(index)
    } else {
      setMainPhotoIndex(index)
      setLastTapTime(now)
    }
  }

  const handlePhotoDoubleTap = (index) => {
    setZoomedPhotoIndex(index)
    setPhotoZoomVisible(true)
  }

  const handleContactPress = () => {
    Alert.alert("Important Notice", "This call is for business purposes only, specifically for renting cars.", [
      { text: "Cancel", style: "cancel" },
      { text: "Call Now", onPress: () => Linking.openURL(`tel:${owner?.phone || "0780114522"}`) },
    ])
  }

  const handleLocationPress = () => {
    // Navigate to map view with this location
    // For now, just show an alert
    Alert.alert("Location", `View ${owner?.location} on map`)

    // Uncomment this when map page is ready
    // navigation.navigate('MapView', { location: owner.location });
  }

  const handleOverlayPress = () => {
    onClose()
  }

  if (!visible || !car) return null

  // Get current month name
  const currentMonthName = new Date().toLocaleString("default", { month: "long" })
  const currentYear = new Date().getFullYear()

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={handleOverlayPress} />

      <Animated.View
        style={[styles.modalContainer, { transform: [{ translateY: pan.y }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.modalHandle} />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X width={24} height={24} color="#000" />
        </TouchableOpacity>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading ? (
            <View style={styles.imageSkeleton}>
              <ActivityIndicator size="large" color="#4B4DFF" />
            </View>
          ) : (
            <View>
              {/* Main Photo */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePhotoPress(mainPhotoIndex)}
                style={styles.mainPhotoContainer}
              >
                <Image
                  source={mainPhotoIndex === 0 ? car.image : carPhotos[mainPhotoIndex].uri}
                  style={styles.carImage}
                  resizeMode="cover"
                />
                {carPhotos[mainPhotoIndex].type === "interior" && (
                  <View style={styles.photoTypeTag}>
                    <Text style={styles.photoTypeText}>Interior</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Photo Thumbnails */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsContainer}>
                {carPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={photo.id}
                    style={[styles.thumbnailWrapper, mainPhotoIndex === index && styles.activeThumbnail]}
                    onPress={() => handlePhotoPress(index)}
                  >
                    <Image source={index === 0 ? car.image : photo.uri} style={styles.thumbnail} resizeMode="cover" />
                    {photo.type === "interior" && (
                      <View style={styles.thumbnailTypeTag}>
                        <Text style={styles.thumbnailTypeText}>Interior</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.carInfo}>
            {isLoading ? (
              <>
                <View style={styles.carHeaderSkeleton}>
                  <View style={styles.carNameSkeleton} />
                  <View style={styles.priceSkeleton} />
                </View>
                <View style={styles.featureTextSkeleton} />
                <View style={styles.sectionTitleSkeleton} />
                <View style={styles.descriptionTextSkeleton} />
                <View style={styles.descriptionTextSkeleton} />
                <View style={styles.sectionTitleSkeleton} />
                <View style={styles.locationTextSkeleton} />
                <View style={styles.buttonSkeleton} />
              </>
            ) : (
              <>
                {/* Car Name and Price */}
                <View style={styles.carHeader}>
                  <Text style={styles.carName}>{car.title}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>FRW {car.price}</Text>
                    <Text style={styles.priceUnit}>{car.rentalPeriod}</Text>
                  </View>
                </View>

                {/* Car Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <Settings width={18} height={18} color="#666" />
                    <Text style={styles.detailText}>{car.transmission}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Droplet width={18} height={18} color="#666" />
                    <Text style={styles.detailText}>{car.fuel}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.categoryTag}>{car.brand}</Text>
                  </View>
                </View>

                {/* Availability Calendar */}
                <View style={styles.availabilitySection}>
                  <Text style={styles.sectionTitle}>Availability</Text>
                  <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                      <Calendar width={18} height={18} color="#4B4DFF" />
                      <Text style={styles.calendarTitle}>{`${currentMonthName} ${currentYear}`}</Text>
                    </View>
                    <View style={styles.datesContainer}>
                      {availableDates.map((date) => (
                        <View key={date.date} style={[styles.dateItem, date.available && styles.availableDate]}>
                          <Text style={[styles.dateText, date.available && styles.availableDateText]}>
                            {date.date.split("-")[2]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Car Owner */}
                <View style={styles.ownerSection}>
                  <Text style={styles.sectionTitle}>Car Owner</Text>
                  <View style={styles.ownerCard}>
                    {owner?.photo ? (
                      <Image source={owner.photo} style={styles.ownerPhoto} />
                    ) : (
                      <View style={styles.ownerIconContainer}>
                        <User width={24} height={24} color="#4B4DFF" />
                      </View>
                    )}
                    <View style={styles.ownerDetails}>
                      <Text style={styles.ownerName}>{owner?.name || car.company}</Text>
                      <Text style={styles.ownerType}>Company</Text>

                      <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
                        <MapPin width={16} height={16} color="#4B4DFF" />
                        <Text style={styles.locationText}>{owner?.location || "Rwanda"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Contact Button */}
                <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                  <Phone width={20} height={20} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>Contact Us</Text>
                </TouchableOpacity>

                {/* Review Stars Section */}
                <View style={styles.reviewSection}>
                  <Text style={styles.sectionTitle}>Your Review</Text>
                  <Text style={styles.reviewPrompt}>Had a call with the car owner? Rate your experience:</Text>

                  <View style={styles.starsRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={`star-${star}`}
                        onPress={() => Alert.alert("Rating", `You rated ${star} stars!`)}
                      >
                        <Star
                          fill={star <= (car.rating || 3) ? "#FFD700" : "transparent"}
                          stroke="#FFD700"
                          width={30}
                          height={30}
                          style={styles.starIcon}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.submitReviewButton}>
                    <Text style={styles.submitReviewText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Photo Zoom Modal */}
      <Modal visible={photoZoomVisible} transparent={true} onRequestClose={() => setPhotoZoomVisible(false)}>
        <View style={styles.zoomModalContainer}>
          <TouchableOpacity style={styles.zoomCloseButton} onPress={() => setPhotoZoomVisible(false)}>
            <X width={24} height={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={zoomedPhotoIndex === 0 ? car.image : carPhotos[zoomedPhotoIndex]?.uri}
            style={styles.zoomedImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
    padding: 20,
    paddingBottom: 100, // Add extra padding at bottom to ensure Contact button is visible
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 5,
  },
  modalContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30, // Additional padding for scroll content
  },
  mainPhotoContainer: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  photoTypeTag: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  photoTypeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  thumbnailsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  thumbnailWrapper: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#4B4DFF",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailTypeTag: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  thumbnailTypeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "600",
  },
  carInfo: {
    flex: 1,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  carName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B4DFF",
  },
  priceUnit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  categoryTag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  availabilitySection: {
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  datesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dateItem: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  availableDate: {
    backgroundColor: "#4B4DFF",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  availableDateText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ownerSection: {
    marginBottom: 25,
  },
  ownerCard: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
  },
  ownerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E6E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  ownerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ownerType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#4B4DFF",
    marginLeft: 6,
    textDecorationLine: "underline",
  },
  contactButton: {
    backgroundColor: "#4B4DFF",
    borderRadius: 30,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  contactButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  // Zoom modal styles
  zoomModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    width: width,
    height: width,
  },
  zoomCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  // Skeleton styles
  imageSkeleton: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  carHeaderSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  carNameSkeleton: {
    width: "60%",
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  priceSkeleton: {
    width: "30%",
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  featureTextSkeleton: {
    width: "70%",
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 20,
  },
  sectionTitleSkeleton: {
    width: "40%",
    height: 18,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 12,
  },
  descriptionTextSkeleton: {
    width: "100%",
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },
  locationTextSkeleton: {
    width: "60%",
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 30,
  },
  buttonSkeleton: {
    width: "100%",
    height: 56,
    backgroundColor: "#E0E0E0",
    borderRadius: 30,
    marginBottom: 20,
  },
  reviewSection: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
  },
  reviewPrompt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  starsRating: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  submitReviewButton: {
    backgroundColor: "#4B4DFF",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  submitReviewText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default CarDetailsModal
