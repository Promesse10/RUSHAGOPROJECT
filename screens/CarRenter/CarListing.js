"use client"

import { useState, useEffect } from "react"
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
  FlatList,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { getApprovedCarsAction, updateCarViewsAction } from "../../redux/action/CarActions"
import CarDetailsModal from "./CarDetailsScreen"
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window")

const CarListing = ({ navigation, route }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  // Get cars from Redux store
  const { cars: reduxCars, isLoading, error } = useSelector((state) => state.cars || {})

  const [searchText, setSearchText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [filteredCars, setFilteredCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [showCarDetails, setShowCarDetails] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  // Fallback cars data if Redux is empty - matches MongoDB schema structure
  const fallbackCars = [
    {
      _id: "1",
      title: "BMW i3 2023 - Electric Luxury Car",
      brand: "BMW",
      model: "i3",
      year: 2023,
      type: "Electric",
      transmission: "Automatic",
      fuelType: "Electric",
      seatings: 4,
      plate_number: "RAJ001E",
      mileage: 5000,
      color: "Pearl White",
      description: "Luxurious electric vehicle perfect for city driving with premium features.",
      features: ["GPS", "Bluetooth", "AC", "USB Charging", "Electric Windows", "Leather Seats"],
      category: "Luxury",
      price: 3500,
      dailyRate: 3500,
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      currency: "FRW",
      location: "KG 15 Ave, Nyarugenge",
      coordinates: {
        latitude: -1.9441,
        longitude: 30.0619,
      },
      province: "Kigali",
      district: "Nyarugenge",
      sector: "Nyamirambo",
      available: true,
      status: "approved",
      views: 0,
      owner: {
        userId: "owner1",
        name: "Jean Claude Uwimana",
        email: "jean@example.com",
        phone: "788123456",
        type: "individual",
      },
      images: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400",
      ],
      isPaid: true,
      paymentWarningSent: false,
      trialEndDate: null,
      rating: 4.8,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      _id: "2",
      title: "Toyota Camry 2022 - Premium Sedan",
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      type: "Sedan",
      transmission: "Automatic",
      fuelType: "Gasoline",
      seatings: 5,
      plate_number: "RWA002A",
      mileage: 15000,
      color: "Silver",
      description: "Reliable and comfortable sedan ideal for business meetings and daily commute.",
      features: ["GPS", "Bluetooth", "AC", "Backup Camera", "Cruise Control", "Power Steering"],
      category: "Economy",
      price: 3000,
      dailyRate: 3000,
      weeklyDiscount: 12,
      monthlyDiscount: 22,
      currency: "FRW",
      location: "KG 21 Ave, Nyarugenge",
      coordinates: {
        latitude: -1.9456,
        longitude: 30.0598,
      },
      province: "Kigali",
      district: "Nyarugenge",
      sector: "Muhima",
      available: false,
      status: "approved",
      views: 0,
      owner: {
        userId: "owner2",
        name: "Marie Uwimana",
        email: "marie@example.com",
        phone: "788987654",
        type: "individual",
      },
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
      ],
      isPaid: true,
      paymentWarningSent: false,
      trialEndDate: null,
      rating: 4.5,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
    },
  ]
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
  
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log("Error fetching user location:", error);
      }
    };
  
    getUserLocation();
  }, []);
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };
  
  // Get cars from route params, Redux, or fallback
  const allCars =
    route?.params?.cars || route?.params?.filteredCars || (reduxCars && reduxCars.length > 0 ? reduxCars : fallbackCars)

  // Categories must match MongoDB schema enum
  const categories = ["All", "Economy", "Compact", "Mid-Size", "Full-Size", "Premium", "Luxury", "Sports", "Family", "Business", "Wedding", "Airport Transfer", "Off-Road", "Commercial"]

  // Fetch cars on component mount if Redux is empty
  useEffect(() => {
    if (!reduxCars || reduxCars.length === 0) {
      dispatch(getApprovedCarsAction())
    }
  }, [dispatch, reduxCars])

  useEffect(() => {
    filterCars()
  }, [searchText, selectedCategory, allCars])

  // Normalize car data to handle different property names and match MongoDB schema
  const normalizeCar = (car) => {
    if (!car) return null

    return {
      // Primary identifiers
      _id: car._id,
      id: car._id || car.id,
      
      // Core car information from schema
      title: car.title || `${car.brand || ""} ${car.model || ""}`.trim(),
      brand: car.brand || "",
      make: car.brand || "",
      model: car.model || "",
      year: car.year || new Date().getFullYear(),
      type: car.type || "",
      
      // Engine & transmission
      transmission: car.transmission || "Manual",
      fuelType: car.fuelType || "Gasoline",
      fuel_type: car.fuelType || "Gasoline",
      
      // Vehicle specs
      seatings: car.seatings || 4,
      plate_number: car.plate_number || "",
      mileage: car.mileage || 0,
      color: car.color || "",
      description: car.description || "",
      
      // Features and images
      features: car.features || [],
      images:
        car.images && car.images.length > 0
          ? car.images.length >= 4
            ? [car.images[1], car.images[2], car.images[3], car.images[0]] // front, side, rear, interior
            : car.images
          : ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"],
      
      // Pricing
      price: car.price || 0,
      dailyRate: car.dailyRate || 0,
      base_price: car.price || 0,
      weeklyDiscount: car.weeklyDiscount || 0,
      monthlyDiscount: car.monthlyDiscount || 0,
      currency: car.currency || "FRW",
      
      // Category
      category: car.category || "Economy",
      
      // Location data
      location: car.location || car.address || "",
      address: car.location || car.address || "",
      coordinates: car.coordinates || { latitude: -1.9441, longitude: 30.0619 },
      latitude: car.coordinates?.latitude || car.latitude || -1.9441,
      longitude: car.coordinates?.longitude || car.longitude || 30.0619,
      province: car.province || "",
      district: car.district || "",
      sector: car.sector || "",
      
      // Availability
      available: car.available !== undefined ? car.available : true,
      status: car.status || "pending",
      views: car.views || 0,
      
      // Owner information from schema
      owner: {
        userId: car.owner?.userId || "",
        name: car.owner?.name || "",
        email: car.owner?.email || "",
        phone: car.owner?.phone || "",
        type: car.owner?.type || "individual",
      },
      ownerName: car.owner?.name || car.ownerName || "",
      ownerPhone: car.owner?.phone || car.ownerPhone || "",
      ownerType: car.owner?.type || car.ownerType || "individual",
      countryCode: car.countryCode || "+250",
      
      // Payment & trial
      trialEndDate: car.trialEndDate || null,
      isPaid: car.isPaid || false,
      paymentWarningSent: car.paymentWarningSent || false,
      
      // Timestamps
      createdAt: car.createdAt || new Date(),
      updatedAt: car.updatedAt || new Date(),
      
      // Additional fields
      rating: car.rating || 4.0,
    }
  }

  const filterCars = () => {
    if (!allCars || allCars.length === 0) {
      setFilteredCars([])
      return
    }

    let filtered = allCars.map(normalizeCar).filter(Boolean)

    // Filter by search text
    if (searchText.length > 0) {
      filtered = filtered.filter(
        (car) =>
          car.make?.toLowerCase().includes(searchText.toLowerCase()) ||
          car.model?.toLowerCase().includes(searchText.toLowerCase()) ||
          car.type?.toLowerCase().includes(searchText.toLowerCase()) ||
          `${car.make} ${car.model}`.toLowerCase().includes(searchText.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((car) => getCarCategory(car) === selectedCategory)
    }

    setFilteredCars(filtered)
  }

  const getCarCategory = (car) => {
    if (!car) return "Economy"
    
    // Use category from database if available
    if (car.category) {
      return car.category
    }

    // Fallback to calculation if category not in database
    if (car.type === "SUV" && car.features?.includes("4WD")) return "Adventure"
    if (car.type === "Electric") return "Electric"
    if (car.type === "Luxury" || car.make === "BMW") return "Luxury"
    if (Number.parseInt(car.price || car.base_price || "0") < 3000) return "Economy"
    if (Number.parseInt(car.seatings || "0") >= 7) return "Family"
    return "Economy"
  }

  const handleCarSelect = (car) => {
    const normalizedCar = normalizeCar(car)

    // Update view count
    if (normalizedCar && (normalizedCar._id || normalizedCar.id)) {
      try {
        const currentViews = normalizedCar.views || 0
        dispatch(
          updateCarViewsAction({
            carId: normalizedCar._id || normalizedCar.id,
            views: currentViews + 1,
          }),
        )
      } catch (error) {
        console.log("Error updating views:", error)
      }
    }

    setSelectedCar(normalizedCar)
    setShowCarDetails(true)
  }

  const renderCarCard = ({ item: car }) => {
    const normalizedCar = normalizeCar(car)
    if (!normalizedCar) return null
    const distance =
    userLocation && normalizedCar.latitude && normalizedCar.longitude
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          normalizedCar.latitude,
          normalizedCar.longitude
        )
      : null;
  
    return (
      <TouchableOpacity style={styles.carCard} onPress={() => handleCarSelect(normalizedCar)}>
        <View style={styles.carImageContainer}>
          <Image
            source={{ uri: normalizedCar.images[0] }}
            style={styles.carImage}
           
          />
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{normalizedCar.make}</Text>
          </View>
          <View
            style={[
              styles.availabilityBadge,
              normalizedCar.available ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text style={styles.availabilityText}>{normalizedCar.available ? "Available" : "Rented"}</Text>
          </View>
        </View>

        <View style={styles.carInfo}>
          <Text style={styles.carName} numberOfLines={2}>
            {normalizedCar.make || "Car"} {normalizedCar.model || ""} ({normalizedCar.year || ""})
          </Text>
          <Text style={styles.carLocation} numberOfLines={1}>
            {[normalizedCar.location, normalizedCar.province].filter(Boolean).join(", ")}
          </Text>
          <Text style={styles.carCategory}>{getCarCategory(normalizedCar) || "Economy"}</Text>

          <View style={styles.carFooter}>
            <Text style={styles.carPrice}>
              {normalizedCar.price} {normalizedCar.currency}
              <Text style={styles.perDay}>/{t("perDay", "day")}</Text>
            </Text>

            <View style={styles.rating}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{normalizedCar.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(getApprovedCarsAction())}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007EFD" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t("availableCars", "Available Cars")}</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t("searchCars", "Search cars, brands, models...")}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearButton}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                {t(category.toLowerCase(), category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredCars.length} {t("carsFound", "cars found")}
        </Text>
      </View>

      {/* Cars List */}
      <FlatList
        data={filteredCars}
        renderItem={renderCarCard}
        keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
        numColumns={2}
        contentContainerStyle={styles.carsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="car" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{t("noCarsFound", "No cars found")}</Text>
            <Text style={styles.emptySubtext}>{t("tryDifferentSearch", "Try adjusting your search or filters")}</Text>
          </View>
        }
      />

      {/* Car Details Modal */}
      <CarDetailsModal
        visible={showCarDetails}
        onClose={() => setShowCarDetails(false)}
        car={selectedCar}
        userLocation={userLocation}
        currentLanguage="en"
        navigation={navigation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#007EFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  categoriesContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: "#007EFD",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "white",
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultsText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  carsList: {
    padding: 10,
  },
  carCard: {
    backgroundColor: "white",
    borderRadius: 15,
    margin: 5,
    width: (width - 30) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  brandText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#007EFD",
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
    fontSize: 8,
    fontWeight: "bold",
    color: "white",
  },
  carInfo: {
    padding: 12,
  },
  carName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  carLocation: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  carCategory: {
    fontSize: 11,
    color: "#007EFD",
    fontWeight: "600",
    marginBottom: 8,
  },
  carFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  perDay: {
    fontSize: 10,
    fontWeight: "normal",
    color: "#666",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
})

export default CarListing
