"use client"

import { useState, useEffect } from "react"
import * as ScreenCapture from "expo-screen-capture";
import { useDispatch, useSelector } from "react-redux"


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
  Share,
  StatusBar,
} from "react-native"
// Use mock for react-native-maps to avoid native resolution issues during bundling
// Use real react-native-maps for native platforms
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from "react-native-vector-icons/Ionicons"
import I18n from "../../utils/i18n"
import { rateUserAction,getOwnerRatingAction } from "../../redux/action/UserActions"
import { getTurnByTurnDirections } from "../../utils/googleDirections"
// Try to load `react-native-image-viewing`, fall back to a tiny internal viewer if unavailable
let ImageViewing
try {
  // prefer default export when available
  const mod = require("react-native-image-viewing")
  ImageViewing = mod && (mod.default || mod)
} catch (err) {
  // Lightweight fallback viewer used during bundling or when the package isn't installed
  ImageViewing = ({ images = [], imageIndex = 0, visible = false, onRequestClose = () => {} }) => {
    const [index, setIndex] = useState(imageIndex)
    if (!visible) return null

    const uri = images && images[index] && (images[index].uri || images[index])

    return (
      <Modal visible={visible} transparent onRequestClose={onRequestClose}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {uri ? (
            <Image source={{ uri }} style={{ flex: 1, resizeMode: "contain" }} />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>No image available</Text>
            </View>
          )}
          <TouchableOpacity onPress={onRequestClose} style={{ position: "absolute", top: 40, left: 20 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }
}
import { incrementCarViewAction } from "../../redux/action/CarActions"
const { width, height } = Dimensions.get("window")

const CarDetailsModal = ({ visible, onClose, car, userLocation, currentLanguage, navigation }) => {
  const dispatch = useDispatch() 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  // Internal route state for "Menyainzira" button
  const [internalRouteCoordinates, setInternalRouteCoordinates] = useState([])
  const [internalRouteInfo, setInternalRouteInfo] = useState(null)
  const [showInternalRoute, setShowInternalRoute] = useState(false)
  const [showBlockedNotice, setShowBlockedNotice] = useState(false);

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
  ];

  const getBrandLogo = (brandName, carBrands = []) => {
    if (!brandName || !Array.isArray(carBrands)) return null;
  
    const brand = carBrands.find(
      b => b?.name?.toLowerCase() === brandName?.toLowerCase()
    );
  
    return brand?.logo || null;
  };

  useEffect(() => {
    if (!car || !car._id) return; // ✅ Ensure `car` is valid before proceeding

    dispatch(incrementCarViewAction(car._id));

    const ownerId =
    car?.owner?.userId || // ✅ This is the actual field in your schema
    car?.owner?._id ||
    car?.ownerId ||
    car?.user?._id ||
    car?.userId ||
    car?.createdBy?._id ||
    null;
  

    if (ownerId) {
      dispatch(getOwnerRatingAction(ownerId))
        .unwrap()
        .then((data) => setRating(data.ratingAverage || 0))
        .catch((err) => console.log("⚠️ Rating fetch failed:", err));
    }
  }, [car?._id]);
useEffect(() => {
  if (normalizedCar?.ownerId) {
    dispatch(getOwnerRatingAction(normalizedCar.ownerId))
  }
}, [normalizedCar?.ownerId])


const { ratingCheck } = useSelector(state => state.user)

useEffect(() => {
  // Removed: No longer show review modal based on ratingCheck on load
  // if (ratingCheck?.canRate) {
  //   setShowReviewModal(true)
  // }
}, [ratingCheck])

  useEffect(() => {
    let subscription;
  
    const handleScreenshotAttempt = () => {
      console.log("📸 Screenshot attempt detected!");
      setShowBlockedNotice(true);
      setTimeout(() => setShowBlockedNotice(false), 2500);
    };
  
    const enableSecurity = async () => {
      try {
        if (visible) {
          // Prevent actual screenshot saving
          await ScreenCapture.preventScreenCaptureAsync();
  
          // Listen for screenshot attempts
          subscription = ScreenCapture.addScreenshotListener(handleScreenshotAttempt);
        } else {
          await ScreenCapture.allowScreenCaptureAsync();
        }
      } catch (err) {
        console.log("❌ Screen capture error:", err);
      }
    };
  
    enableSecurity();
  
    return () => {
      if (subscription) subscription.remove();
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [visible]);
   
  const normalizedCar = car
    ? {
        ...car,
        ownerId: car?.owner?.userId || car?.owner?._id || car?.userId || car?.user || null,

      
      

        make: car.brand || car.make || "Unknown",
        brand: car.brand || car.make || "Unknown",
        model: car.model || "Unknown",
        year: car.year || "N/A",
        type: car.type || "Standard",
        transmission: car.transmission || "Manual",
        fuel_type: car.fuelType || car.fuel_type || "petrol",
        fuelType: car.fuelType || car.fuel_type || "petrol",
        seatings: car.seatings || "4",
        features: car.features || [],
        ownerName: car.owner?.name || car.ownerName || "Owner",
        ownerPhone: car.owner?.phone || car.ownerPhone || "",
        ownerType: car.owner?.type || car.ownerType || "individual",
        countryCode: car.countryCode || "",
        district: car.district || "Unknown",
        sector: car.sector || "Unknown",
        location: car.location || car.address || "Unknown Location",
        address: car.location || car.address || "Unknown Location",
        latitude: car.coordinates?.latitude || car.latitude || -1.9441,
        longitude: car.coordinates?.longitude || car.longitude || 30.0619,
        price: car.price || car.base_price || car.dailyRate || "0",
        base_price: car.price || car.base_price || car.dailyRate || "0",
        dailyRate: car.price || car.base_price || car.dailyRate || "0",
        currency: car.currency || "FRW",
        available: car.available !== undefined ? car.available : true,
        images:
          car.images && car.images.length > 0
            ? car.images
            : ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"],
        rating: car.rating || 4.0,
        views: car.views || 0,
        description: car.description || "",
        weeklyDiscount: car.weeklyDiscount || 0,
        monthlyDiscount: car.monthlyDiscount || 0,
      }
    : null;

  // ✅ Send rating to backend (renter -> owner)
 // ✅ Place this AFTER normalizedCar is defined, not before
const submitRating = async (stars) => {
  try {
    setSubmitted(true);

    const ownerId = normalizedCar.ownerId;
    console.log("🚀 Sending rating payload:", { ownerId, stars, car });


    if (!ownerId) {
      Alert.alert("Error", "Owner information missing for this car");
      return;
    }

    await dispatch(rateUserAction({ ownerId, stars })).unwrap();

    // ✅ Fetch latest owner rating to update display
    const ratingData = await dispatch(getOwnerRatingAction(ownerId)).unwrap();
    setRating(ratingData.ratingAverage);

    Alert.alert(I18n.t("thankYouReview"), I18n.t("ratingSubmitted"));
    setShowReviewModal(false);
    setUserRating(stars);
  } catch (error) {
    console.log("❌ Rating error:", error);
    Alert.alert(I18n.t("error"), I18n.t("ratingFailed"));
  } finally {
    setSubmitted(false);
  }
};


  if (!car) return null

  // Normalize car data to handle different property structures
  
  // Handle "Menyainzira" button - show route on internal map
  const handleMenyainzira = async () => {
    try {
      const carCoords = {
        latitude: normalizedCar.latitude,
        longitude: normalizedCar.longitude,
      }

      const directions = await getTurnByTurnDirections(userLocation, carCoords)
      setInternalRouteCoordinates(directions.coordinates)
      setInternalRouteInfo({
        distance: directions.totalDistance,
        duration: directions.totalDuration,
        steps: directions.steps,
      })
      setShowInternalRoute(true)

      Alert.alert(
        "Route Displayed",
        `Route to ${normalizedCar.make} ${normalizedCar.model} is now shown on the map.\nDistance: ${directions.totalDistance}\nDuration: ${directions.totalDuration}`,
      )
    } catch (error) {
      console.log("Error getting directions for Menyainzira:", error)
      // Fallback to simple polyline
      setInternalRouteCoordinates([
        userLocation,
        {
          latitude: normalizedCar.latitude,
          longitude: normalizedCar.longitude,
        },
      ])
      setShowInternalRoute(true)
      Alert.alert("Route Displayed", "Basic route is now shown on the map")
    }
  }

  const handleShare = async () => {
    try {
      // Replace these with your actual store URLs
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.MUVCAR.app";
      const appStoreLink = "https://apps.apple.com/app/MUVCAR/id1234567890";
  
      const appDownloadMessage = `
  🚗 ${normalizedCar.make} is now available for rent!
  You can now rent cars easily using the MUVCAR app.
  
  👉 Download now:
  • Android: ${playStoreLink}
  • iOS: ${appStoreLink}
      `;
  
      const shareContent = {
        title: `Rent with MUVCAR`,
        message: appDownloadMessage,
        url: "https://res.cloudinary.com/def0cjmh2/image/upload/v1723728395/logo_1_tj9guu.jpg", // Thumbnail URL
      };
  
      const result = await Share.share(shareContent);
  
      if (result.action === Share.sharedAction) {
        console.log("Shared successfully");
      }
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };
  

  const handleGetDirections = () => {
  // ✅ Do NOT block user here
  onClose()

  navigation?.navigate("Home", {
    showDirections: true,
    destinationCar: normalizedCar,
    // pass it only if available
    userLocation: userLocation ?? null,
  })
}

  const handleContactOwner = (method) => {
    const { ownerPhone, countryCode } = normalizedCar
    const fullPhone = `${countryCode}${ownerPhone}`

    if (!ownerPhone) {
      Alert.alert("Error", "Owner contact information not available")
      return
    }

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

    Alert.alert(I18n.t("caution"), alertMessage, [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("yes"),
        onPress: () => {
          switch (method) {
            case "call":
              Linking.openURL(`tel:${fullPhone}`).catch(() => {
                Alert.alert("Error", "Unable to make phone call")
              })
              setTimeout(() => setShowReviewModal(true), 2000)
              break
            case "sms":
              Linking.openURL(`sms:${fullPhone}`).catch(() => {
                Alert.alert("Error", "Unable to send SMS")
              })
              setTimeout(() => setShowReviewModal(true), 2000)
              break
            case "whatsapp":
              const whatsappUrl = `https://wa.me/${fullPhone.replace("+", "")}?text=Hi, I'm interested in your ${normalizedCar.make} ${normalizedCar.model}`
              Linking.openURL(whatsappUrl).catch(() => {
                Alert.alert("Error", "WhatsApp not available")
              })
              setTimeout(() => setShowReviewModal(true), 2000)
              break
          }
        },
      },
    ])
  }

  const handleImagePress = (index) => {
    console.log("Opening image viewer for index:", index);
    setSelectedImageIndex(index);
    setShowImageGallery(true);
  };
  

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

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0
    const stars = []
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={`star-${i}`} name="star" size={16} color="#FFD700" />)
    }

    if (hasHalfStar) {
      stars.push(<Icon key="half-star" name="star-half" size={16} color="#FFD700" />)
    }

    const emptyStars = 5 - Math.ceil(numRating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-star-${i}`} name="star-outline" size={16} color="#E5E5E5" />)
    }

    return stars
  }

  const getCarCategory = (car) => {
    if (car.type === "SUV" && car.features.includes("4WD")) return "Adventure"
    if (car.type === "Electric") return "Eco-Friendly"
    if (car.type === "Luxury" || car.make === "BMW") return "Luxury"
    if (Number.parseInt(car.base_price || "0") < 3000) return "Economy"
    if (Number.parseInt(car.seatings || "0") >= 7) return "Family"
    return "Standard"
  }

  const distance = userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, normalizedCar.latitude, normalizedCar.longitude)
    : null

    const handleSubmitReview = async () => {
      if (userRating === 0) {
        Alert.alert(I18n.t("error"), I18n.t("selectRating"))
        return
      }
      await submitRating(userRating)
      setUserRating(0)
    }
    

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
              {/* Map Section with Route */}
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: normalizedCar.latitude,
                    longitude: normalizedCar.longitude,
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
           <Marker
  coordinate={{
    latitude: normalizedCar.latitude,
    longitude: normalizedCar.longitude,
  }}
  onPress={(event) => {
    if (event && event.persist) event.persist()
  }}
>
  <View style={styles.brandPin}>
    {getBrandLogo(normalizedCar.make, carBrands) ? (
      <Image
        source={{
          uri: getBrandLogo(normalizedCar.make, carBrands),
        }}
        style={styles.brandLogo}
      />
    ) : (
      <Icon name="car-outline" size={28} color="#007EFD" />
    )}
  </View>
</Marker>


                  {/* Internal Route Polyline - shown when "Menyainzira" is pressed */}
                  {showInternalRoute && internalRouteCoordinates.length > 0 && (
                    <Polyline
                      coordinates={internalRouteCoordinates}
                      strokeColor="#007EFD"
                      strokeWidth={4}
                      lineDashPattern={[1]}
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
                  {/* Menyainzira Button */}
                  <TouchableOpacity style={styles.menyainziraButton} onPress={handleMenyainzira}>
                    <Icon name="map" size={18} color="white" />
                    <Text style={styles.menyainziraButtonText}>Menyainzira</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Internal Route Info Section */}
              {showInternalRoute && internalRouteInfo && (
                <View style={styles.internalRouteSection}>
                  <View style={styles.internalRouteHeader}>
                    <Text style={styles.sectionTitle}>Route Information</Text>
                    <TouchableOpacity
                      style={styles.clearRouteButton}
                      onPress={() => {
                        setShowInternalRoute(false)
                        setInternalRouteCoordinates([])
                        setInternalRouteInfo(null)
                      }}
                    >
                      <Icon name="close" size={16} color="#666" />
                      <Text style={styles.clearRouteText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.routeInfo}>
                    <View style={styles.routeInfoItem}>
                      <Icon name="time" size={16} color="#007EFD" />
                      <Text style={styles.routeInfoText}>{internalRouteInfo.duration}</Text>
                    </View>
                    <View style={styles.routeInfoItem}>
                      <Icon name="location" size={16} color="#007EFD" />
                      <Text style={styles.routeInfoText}>{internalRouteInfo.distance}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Car Info Section */}
              <View style={styles.carInfoSection}>
                <View style={styles.carHeader}>
                  <View style={styles.carHeaderLeft}>
                    <Text style={styles.carCategory}>{getCarCategory(normalizedCar)}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {getBrandLogo(normalizedCar.make, carBrands) ? (
                        <Image
                          source={{ uri: getBrandLogo(normalizedCar.make, carBrands) }}
                          style={styles.brandLogoCircle}
                        />
                      ) : (
                        <Icon name="car-outline" size={20} color="#007EFD" style={{ marginRight: 8 }} />
                      )}
                      <Text style={styles.carTitle}>
                        {normalizedCar.make} {normalizedCar.model} ({normalizedCar.year})
                      </Text>
                    </View>
                    <Text style={styles.carPrice}>
                      {normalizedCar.base_price} {normalizedCar.currency}/{I18n.t("perDay")}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>{renderStars(rating)}</View>
                      <Text style={styles.ratingValue}>{rating.toFixed(1)}/5.0</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.mainImageContainer}
                    onPress={() => handleImagePress(selectedImageIndex)}
                  >
                    <Image source={{ uri: normalizedCar.images[selectedImageIndex] }} style={styles.carMainImage} />
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>
                        {selectedImageIndex + 1}/{normalizedCar.images.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Image Gallery Section */}
                <View style={styles.imageGallerySection}>
                  <Text style={styles.sectionTitle}>{I18n.t("carImages")}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGalleryScroll}>
                    {normalizedCar.images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.thumbnailContainer, selectedImageIndex === index && styles.selectedThumbnail]}
                        onPress={() => handleImagePress(index)}
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
      <Text style={styles.specLabel}>{I18n.t("make")}</Text>
      <Text style={styles.specValue}>{normalizedCar.make}</Text>
    </View>
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{I18n.t("model")}</Text>
      <Text style={styles.specValue}>{normalizedCar.model}</Text>
    </View>
    <View style={styles.specItem}>
      <Icon name="settings" size={24} color="#007EFD" />
      <Text style={styles.specValue}>{normalizedCar.transmission}</Text>
      <Text style={styles.specLabel}>{I18n.t("transmission")}</Text>
    </View>
    <View style={styles.specItem}>
      <Icon name="people" size={24} color="#007EFD" />
      <Text style={styles.specValue}>
        {normalizedCar.seatings} {I18n.t("seats")}
      </Text>
      <Text style={styles.specLabel}>{I18n.t("places")}</Text>
    </View>
  </View>

                  {/* Additional Specs */}
                  <View style={styles.additionalSpecs}>
    <View style={styles.specRow}>
      <Text style={styles.specRowLabel}>{I18n.t("year")}:</Text>
      <Text style={styles.specRowValue}>{normalizedCar.year}</Text>
    </View>
    <View style={styles.specRow}>
      <Text style={styles.specRowLabel}>{I18n.t("fuelType")}:</Text>
      <Text style={styles.specRowValue}>
        {normalizedCar.fuel_type === "petrol"
          ? I18n.t("petrol")
          : normalizedCar.fuel_type === "diesel"
          ? I18n.t("diesel")
          : normalizedCar.fuel_type === "electric"
          ? I18n.t("electric")
          : normalizedCar.fuel_type === "hybrid"
          ? I18n.t("hybrid")
          : normalizedCar.fuel_type}
      </Text>
    </View>
    <View style={styles.specRow}>
      <Text style={styles.specRowLabel}>{I18n.t("type")}:</Text>
      <Text style={styles.specRowValue}>{normalizedCar.type}</Text>
    </View>
    <View style={styles.specRow}>
    <Text style={styles.carCategory}>{car.category || "Standard"}</Text>

      <Text style={styles.specRowValue}>{getCarCategory(normalizedCar)}</Text>
    </View>

                  </View>

                  {/* Features */}
                  {normalizedCar.features && normalizedCar.features.length > 0 && (
                    <View style={styles.featuresSection}>
                      <Text style={styles.sectionTitle}>{I18n.t("features")}</Text>
                      <View style={styles.featuresGrid}>
                        {normalizedCar.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <Icon name="checkmark-circle" size={16} color="#00A651" />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Description */}
                  {normalizedCar.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.sectionTitle}>{I18n.t("description")}</Text>
                      <Text style={styles.descriptionText}>{normalizedCar.description}</Text>
                    </View>
                  )}

                  {/* Pricing Details */}
                  <View style={styles.pricingSection}>
                    <Text style={styles.sectionTitle}>{I18n.t("pricing")}</Text>
                    <View style={styles.pricingGrid}>
                      <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Daily Rate</Text>
                        <Text style={styles.pricingValue}>
                          {normalizedCar.dailyRate} {normalizedCar.currency}
                        </Text>
                      </View>
                      {normalizedCar.weeklyDiscount > 0 && (
                        <View style={styles.pricingItem}>
                          <Text style={styles.pricingLabel}>Weekly Discount</Text>
                          <Text style={styles.pricingValue}>{normalizedCar.weeklyDiscount}%</Text>
                        </View>
                      )}
                      {normalizedCar.monthlyDiscount > 0 && (
                        <View style={styles.pricingItem}>
                          <Text style={styles.pricingLabel}>Monthly Discount</Text>
                          <Text style={styles.pricingValue}>{normalizedCar.monthlyDiscount}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Owner Information */}
                <View style={styles.ownerSection}>
                  <View style={styles.ownerInfo}>
                    <View style={styles.ownerAvatar}>
                      <Text style={styles.ownerInitial}>{normalizedCar.ownerName?.charAt(0) || "O"}</Text>
                    </View>
                    <View style={styles.ownerDetails}>
                      <Text style={styles.ownerName}>{normalizedCar.ownerName}</Text>
                      <Text style={styles.ownerLocation}>{normalizedCar.address}</Text>
                      <Text style={styles.ownerType}>
                        {normalizedCar.ownerType === "individual"
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
                  {normalizedCar.base_price} {normalizedCar.currency}
                </Text>
                <Text style={styles.priceLabel}>{I18n.t("Perday")}</Text>
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

          {/* Review Modal */}
          <Modal visible={showReviewModal} transparent={true} animationType="slide">
            <View style={styles.reviewModalOverlay}>
              <View style={styles.reviewModal}>
                <Text style={styles.reviewTitle}>{I18n.t("rateExperience")}</Text>
                <Text style={styles.reviewSubtitle}>
                  How was your experience with {normalizedCar.ownerName}?
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
          <ImageViewing
  images={normalizedCar.images.map((uri) => ({ uri }))}
  imageIndex={selectedImageIndex}
  visible={showImageGallery}
  onRequestClose={() => setShowImageGallery(false)}
/>
<Modal visible={showBlockedNotice} transparent animationType="fade">
  <View style={styles.blockedOverlay}>
    <View style={styles.blockedCard}>
      <Icon name="camera-off-outline" size={50} color="#007EFD" style={styles.blockedIcon} />
      <Text style={styles.blockedTitle}>Screenshot Blocked</Text>
      <Text style={styles.blockedSubtitle}>This screenshot was blocked for added privacy.</Text>
      <Image
        source={{ uri: "https://res.cloudinary.com/def0cjmh2/image/upload/v1723728395/logo_1_tj9guu.jpg" }}
        style={styles.blockedLogo}
        resizeMode="contain"
      />
    </View>
  </View>
</Modal>

        </View>
        
      </Modal>

      {/* Image Gallery Modal */}


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
    flexWrap: "wrap",
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
    marginBottom: 8,
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
    marginBottom: 8,
  },
  directionsButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  blockedOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  blockedCard: {
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    padding: 30,
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  blockedIcon: {
    marginBottom: 15,
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007EFD",
    marginBottom: 5,
  },
  blockedSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  blockedLogo: {
    width: 100,
    height: 40,
    marginTop: 10,
  },
  
  menyainziraButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  menyainziraButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  internalRouteSection: {
    backgroundColor: "#f8f9fa",
    margin: 20,
    borderRadius: 15,
    padding: 15,
  },
  internalRouteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearRouteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearRouteText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  routeInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
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
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 20,
  },
  pricingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pricingItem: {
    alignItems: "center",
    width: "30%",
    marginBottom: 15,
  },
  pricingLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007EFD",
    marginTop: 5,
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
    paddingBottom: 70,
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
})

export default CarDetailsModal
