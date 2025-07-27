"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Linking,
  Alert,
  Dimensions,
  FlatList,
  Share,
  StatusBar,
} from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import Icon from "react-native-vector-icons/Ionicons"
import I18n from "../../utils/i18n"
import ImageViewer from "react-native-image-zoom-viewer"

const { width, height } = Dimensions.get("window")

const CarDetailsModal = ({ visible, onClose, car, userLocation, currentLanguage, navigation }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userRating, setUserRating] = useState(0)

  if (!car) return null

  const carImages = car.images.map((image, index) => ({
    url: image,
    props: {
      source: { uri: image },
    },
  }))

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Check out this amazing ${car.make} ${car.model} (${car.year}) available for rent!\n\nPrice: ${car.base_price} ${car.currency}/day\nLocation: ${car.address}\nFeatures: ${car.features.join(", ")}\n\nContact: ${car.countryCode}${car.ownerPhone}`,
        title: `${car.make} ${car.model} - Car Rental`,
      }

      const result = await Share.share(shareContent)

      if (result.action === Share.sharedAction) {
        // Check if user is logged in, if not prompt for signup
        const isLoggedIn = false // Replace with actual auth check

        if (!isLoggedIn) {
          Alert.alert(
            I18n.t("signupRequired", "Sign Up Required"),
            I18n.t("signupMessage", "To share car details, please sign up for an account."),
            [
              { text: I18n.t("cancel", "Cancel"), style: "cancel" },
              {
                text: I18n.t("signup", "Sign Up"),
                onPress: () => navigation.navigate("CarRentalSignup"),
              },
            ],
          )
        }
      }
    } catch (error) {
      console.log("Error sharing:", error)
    }
  }

  const handleGetDirections = () => {
    if (!userLocation) {
      Alert.alert(
        I18n.t("locationRequired", "Location Required"),
        I18n.t("enableLocationMessage", "Please enable location to get directions"),
      )
      return
    }

    // Close modal and navigate back to home with directions
    onClose()

    // Navigate to home with car location for turn-by-turn directions
    navigation.navigate("Home", {
      showDirections: true,
      destinationCar: car,
      userLocation: userLocation,
    })
  }

  const handleContactOwner = (method) => {
    const { ownerPhone, countryCode } = car
    const fullPhone = `${countryCode}${ownerPhone}`

    let alertMessage = ""
    switch (method) {
      case "call":
        alertMessage = I18n.t("callAlert", "This contact is about car rental dealing. Do you want to continue?")
        break
      case "sms":
        alertMessage = I18n.t("messageAlert", "This contact is about car rental dealing. Do you want to continue?")
        break
      case "whatsapp":
        alertMessage = I18n.t("whatsappAlert", "This contact is about car rental dealing. Do you want to continue?")
        break
    }

    Alert.alert(I18n.t("contactOwner"), alertMessage, [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("yes"),
        onPress: () => {
          switch (method) {
            case "call":
              Linking.openURL(`tel:${fullPhone}`).catch(() => {
                Alert.alert("Error", "Unable to make phone call")
              })
              // Show review modal after call attempt
              setTimeout(() => setShowReviewModal(true), 2000)
              break
            case "sms":
              Linking.openURL(`sms:${fullPhone}`).catch(() => {
                Alert.alert("Error", "Unable to send SMS")
              })
              break
            case "whatsapp":
              const whatsappUrl = `https://wa.me/${fullPhone.replace("+", "")}?text=Hi, I'm interested in your ${car.make} ${car.model}`
              Linking.openURL(whatsappUrl).catch(() => {
                Alert.alert("Error", "WhatsApp not available")
              })
              break
          }
        },
      },
    ])
  }

  const handleImagePress = (index) => {
    setSelectedImageIndex(index)
    setShowImageViewer(true)
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

  const getDirectionsCoordinates = () => {
    if (!userLocation) return []
    return [
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      {
        latitude: car.latitude,
        longitude: car.longitude,
      },
    ]
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />)
    }

    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={16} color="#FFD700" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-outline" size={16} color="#E5E5E5" />)
    }

    return stars
  }

  const getCarCategory = (car) => {
    // Determine car category based on type and features
    if (car.type === "SUV" && car.features.includes("4WD")) return "Adventure"
    if (car.type === "Electric") return "Eco-Friendly"
    if (car.type === "Luxury" || car.make === "BMW") return "Luxury"
    if (car.base_price < 3000) return "Economy"
    if (car.seatings >= 7) return "Family"
    return "Standard"
  }

  const distance = userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, car.latitude, car.longitude)
    : null

  const handleSubmitReview = () => {
    if (userRating === 0) {
      Alert.alert("Error", "Please select a rating")
      return
    }
    Alert.alert(I18n.t("thankYouReview"), `You rated this car ${userRating} stars`, [
      { text: "OK", onPress: () => setShowReviewModal(false) },
    ])
    setUserRating(0)
  }

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity style={styles.galleryImageContainer} onPress={() => handleImagePress(index)}>
      <Image source={{ uri: item }} style={styles.galleryImage} />
    </TouchableOpacity>
  )

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{I18n.t("aboutCar", "About Car")}</Text>

              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Icon name="share-social" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Map Section */}
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: car.latitude,
                    longitude: car.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation={true}
                >
                  {/* User Location */}
                  {userLocation && (
                    <Marker coordinate={userLocation} title="Your Location">
                      <View style={styles.userMarker}>
                        <Icon name="person" size={16} color="white" />
                      </View>
                    </Marker>
                  )}

                  {/* Car Location */}
                  <Marker coordinate={{ latitude: car.latitude, longitude: car.longitude }}>
                    <View style={styles.carMarker}>
                      <Image
                        source={
                          car.available
                            ? require("../../assets/available.png")
                            : require("../../assets/nonavailable.png")
                        }
                        style={styles.carMarkerImage}
                      />
                    </View>
                  </Marker>

                  {/* Directions Polyline */}
                  {showDirections && userLocation && (
                    <Polyline
                      coordinates={getDirectionsCoordinates()}
                      strokeColor="#007EFD"
                      strokeWidth={3}
                      lineDashPattern={[5, 5]}
                    />
                  )}
                </MapView>
                <View style={styles.mapOverlay}>
                  {distance && (
                    <View style={styles.distanceIndicator}>
                      <Text style={styles.distanceText}>
                        {distance}km {I18n.t("distanceAway")}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                    <Icon name="navigate" size={20} color="white" />
                    <Text style={styles.directionsButtonText}>{I18n.t("getDirections")}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Car Info Section */}
              <View style={styles.carInfoSection}>
                <View style={styles.carHeader}>
                  <View style={styles.carHeaderLeft}>
                    <Text style={styles.carCategory}>{getCarCategory(car)}</Text>
                    <Text style={styles.carTitle}>
                      {car.make} {car.model} ({car.year})
                    </Text>
                    <Text style={styles.carPrice}>
                      {car.base_price} {car.currency}/{I18n.t("perDay")}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>{renderStars(car.rating)}</View>
                      <Text style={styles.ratingValue}>{car.rating.toFixed(1)}/5.0</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.mainImageContainer}
                    onPress={() => handleImagePress(selectedImageIndex)}
                  >
                    <Image source={{ uri: car.images[selectedImageIndex] }} style={styles.carMainImage} />
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>
                        {selectedImageIndex + 1}/{car.images.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Image Gallery Section */}
                <View style={styles.imageGallerySection}>
                  <Text style={styles.sectionTitle}>Car Images</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGalleryScroll}>
                    {car.images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.thumbnailContainer, selectedImageIndex === index && styles.selectedThumbnail]}
                        onPress={() => setSelectedImageIndex(index)}
                      >
                        <Image source={{ uri: image }} style={styles.thumbnailImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Specifications */}
                <View style={styles.specificationsSection}>
                  <Text style={styles.sectionTitle}>{I18n.t("specifications")}</Text>
                  <View style={styles.specsGrid}>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>{I18n.t("make", "Make")}</Text>
                      <Text style={styles.specValue}>{car.make}</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>{I18n.t("model", "Model")}</Text>
                      <Text style={styles.specValue}>{car.model}</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Icon name="settings" size={24} color="#007EFD" />
                      <Text style={styles.specValue}>{car.transmission}</Text>
                      <Text style={styles.specLabel}>Transmission</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Icon name="people" size={24} color="#007EFD" />
                      <Text style={styles.specValue}>{car.seatings} Seats</Text>
                      <Text style={styles.specLabel}>Places</Text>
                    </View>
                  </View>

                  {/* Additional Specs */}
                  <View style={styles.additionalSpecs}>
                    <View style={styles.specRow}>
                      <Text style={styles.specRowLabel}>Year:</Text>
                      <Text style={styles.specRowValue}>{car.year}</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specRowLabel}>Fuel Type:</Text>
                      <Text style={styles.specRowValue}>{car.fuel_type}</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specRowLabel}>Type:</Text>
                      <Text style={styles.specRowValue}>{car.type}</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specRowLabel}>Category:</Text>
                      <Text style={styles.specRowValue}>{getCarCategory(car)}</Text>
                    </View>
                  </View>

                  {/* Features */}
                  {car.features && (
                    <View style={styles.featuresSection}>
                      <Text style={styles.sectionTitle}>{I18n.t("features")}</Text>
                      <View style={styles.featuresGrid}>
                        {car.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <Icon name="checkmark-circle" size={16} color="#00A651" />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Owner Information */}
                <View style={styles.ownerSection}>
                  <View style={styles.ownerInfo}>
                    <View style={styles.ownerAvatar}>
                      <Text style={styles.ownerInitial}>{car.ownerName?.charAt(0) || "O"}</Text>
                    </View>
                    <View style={styles.ownerDetails}>
                      <Text style={styles.ownerName}>{car.ownerName}</Text>
                      <Text style={styles.ownerLocation}>{car.address}</Text>
                      <Text style={styles.ownerType}>
                        {car.ownerType === "individual"
                          ? I18n.t("individual", "Individual")
                          : I18n.t("company", "Company")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.priceContainer}>
                <Text style={styles.totalPrice}>
                  {car.base_price} {car.currency}
                </Text>
                <Text style={styles.priceLabel}>Per Day</Text>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  Alert.alert(I18n.t("contactOwner"), "Choose how you want to contact the car owner:", [
                    { text: "Call", onPress: () => handleContactOwner("call") },
                    { text: "SMS", onPress: () => handleContactOwner("sms") },
                    { text: "WhatsApp", onPress: () => handleContactOwner("whatsapp") },
                    { text: I18n.t("cancel"), style: "cancel" },
                  ])
                }}
              >
                <Text style={styles.contactButtonText}>{I18n.t("contactOwner")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Gallery Modal */}
          <Modal visible={showImageGallery} transparent={true} animationType="fade">
            <View style={styles.galleryModalOverlay}>
              <View style={styles.galleryHeader}>
                <TouchableOpacity onPress={() => setShowImageGallery(false)}>
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.galleryTitle}>Car Images</Text>
                <View style={{ width: 24 }} />
              </View>
              <FlatList
                data={car.images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={styles.galleryContent}
              />
            </View>
          </Modal>

          {/* Review Modal */}
          <Modal visible={showReviewModal} transparent={true} animationType="slide">
            <View style={styles.reviewModalOverlay}>
              <View style={styles.reviewModal}>
                <Text style={styles.reviewTitle}>{I18n.t("rateExperience")}</Text>
                <Text style={styles.reviewSubtitle}>
                  How was your experience with {car.make} {car.model}?
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                      <Icon
                        name="star"
                        size={40}
                        color={star <= userRating ? "#FFD700" : "#DDD"}
                        style={styles.reviewStar}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.reviewButtons}>
                  <TouchableOpacity style={styles.reviewCancelButton} onPress={() => setShowReviewModal(false)}>
                    <Text style={styles.reviewCancelText}>{I18n.t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reviewSubmitButton} onPress={handleSubmitReview}>
                    <Text style={styles.reviewSubmitText}>{I18n.t("submitReview")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={showImageViewer} transparent={true} onRequestClose={() => setShowImageViewer(false)}>
        <ImageViewer
          imageUrls={carImages}
          index={selectedImageIndex}
          onSwipeDown={() => setShowImageViewer(false)}
          enableSwipeDown={true}
          backgroundColor="rgba(0,0,0,0.9)"
          saveToLocalByLongPress={false}
          enablePreload={true}
          renderHeader={() => (
            <View style={styles.imageViewerHeader}>
              <TouchableOpacity onPress={() => setShowImageViewer(false)} style={styles.imageViewerClose}>
                <Text style={styles.imageViewerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    position: "relative",
  },
  map: {
    flex: 1,
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
  carMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  carMarkerImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  mapOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceIndicator: {
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  directionsButton: {
    backgroundColor: "#007EFD",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  directionsButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  carInfoSection: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  carHeaderLeft: {
    flex: 1,
  },
  carCategory: {
    fontSize: 14,
    color: "#007EFD",
    fontWeight: "600",
    marginBottom: 5,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  carPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007EFD",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  mainImageContainer: {
    position: "relative",
  },
  carMainImage: {
    width: 120,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  imageCounter: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCounterText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  imageGallerySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  imageGalleryScroll: {
    marginBottom: 10,
  },
  thumbnailContainer: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    borderColor: "#007EFD",
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    backgroundColor: "#f0f0f0",
  },
  specificationsSection: {
    marginBottom: 20,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  specItem: {
    alignItems: "center",
    width: "30%",
    marginBottom: 15,
  },
  specLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  specValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  additionalSpecs: {
    marginBottom: 20,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  specRowLabel: {
    fontSize: 14,
    color: "#666",
  },
  specRowValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  ownerSection: {
    marginBottom: 20,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007EFD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  ownerInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ownerLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  ownerType: {
    fontSize: 12,
    color: "#007EFD",
    marginTop: 2,
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  priceContainer: {
    flex: 1,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  contactButton: {
    backgroundColor: "#007EFD",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginLeft: 20,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Gallery Modal Styles
  galleryModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  galleryContent: {
    padding: 10,
  },
  galleryImageContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
  },
  galleryImage: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  // Review Modal Styles
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    alignItems: "center",
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  reviewSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  reviewStar: {
    marginHorizontal: 5,
  },
  reviewButtons: {
    flexDirection: "row",
    gap: 15,
  },
  reviewCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  reviewCancelText: {
    fontSize: 16,
    color: "#666",
  },
  reviewSubmitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#007EFD",
  },
  reviewSubmitText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  imageViewerHeader: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  imageViewerClose: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default CarDetailsModal
