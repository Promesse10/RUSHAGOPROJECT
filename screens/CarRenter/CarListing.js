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


const { width, height } = Dimensions.get("window")

const CarListing = ({ navigation, route }) => {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [filteredCars, setFilteredCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [showCarDetails, setShowCarDetails] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  // Get cars from route params or use default
  const allCars = route?.params?.cars || [
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
      category: "Luxury",
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
      ],
      rating: 4.5,
      category: "Economy",
    },
    // Add more cars...
  ]

  const categories = ["All", "Economy", "Luxury", "SUV", "Electric", "Family", "Adventure"]

  useEffect(() => {
    filterCars()
  }, [searchText, selectedCategory])

  const filterCars = () => {
    let filtered = allCars

    // Filter by search text
    if (searchText.length > 0) {
      filtered = filtered.filter(
        (car) =>
          car.make.toLowerCase().includes(searchText.toLowerCase()) ||
          car.model.toLowerCase().includes(searchText.toLowerCase()) ||
          car.type.toLowerCase().includes(searchText.toLowerCase()) ||
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
    if (car.type === "SUV" && car.features.includes("4WD")) return "Adventure"
    if (car.type === "Electric") return "Electric"
    if (car.type === "Luxury" || car.make === "BMW") return "Luxury"
    if (Number.parseInt(car.base_price) < 3000) return "Economy"
    if (car.seatings >= 7) return "Family"
    return "Economy"
  }

  const handleCarSelect = (car) => {
    setSelectedCar(car)
    setShowCarDetails(true)
  }

  const renderCarCard = ({ item: car }) => (
    <TouchableOpacity style={styles.carCard} onPress={() => handleCarSelect(car)}>
      <View style={styles.carImageContainer}>
        <Image source={{ uri: car.images[0] }} style={styles.carImage} />
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>{car.make}</Text>
        </View>
        <View style={[styles.availabilityBadge, car.available ? styles.availableBadge : styles.unavailableBadge]}>
          <Text style={styles.availabilityText}>{car.available ? "Available" : "Rented"}</Text>
        </View>
      </View>

      <View style={styles.carInfo}>
        <Text style={styles.carName}>
          {car.make} {car.model} ({car.year})
        </Text>
        <Text style={styles.carLocation}>
          {car.sector}, {car.district}
        </Text>
        <Text style={styles.carCategory}>{getCarCategory(car)}</Text>

        <View style={styles.carFooter}>
          <Text style={styles.carPrice}>
            {car.base_price} {car.currency}
            <Text style={styles.perDay}>/{t("perDay", "day")}</Text>
          </Text>

          <View style={styles.rating}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{car.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

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
        keyExtractor={(item) => item.id.toString()}
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

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
