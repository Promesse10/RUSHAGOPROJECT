"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, SafeAreaView } from "react-native"
import { ChevronLeft, Search, Grid, List } from "react-native-feather"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import CarDetailsModal from "../../components/Map/CarDetaiilsModal"

// First, add the import for the cloudinary image utility at the top of the file
import { cloudinaryImages, getCloudinaryImage } from "../../utils/image-loader"

// Updated car data with Rwandan Franc prices and rental periods
const allCars = [
  {
    id: 1,
    title: "Jeep Rubicon",
    brand: "Jeep",
    price: "25,000",
    rentalPeriod: "/day",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 5.0,
    available: true,
    company: "Rushago Car Rentals",
  },
  {
    id: 2,
    title: "Audi A8 Quattro",
    brand: "Audi",
    price: "40,000",
    rentalPeriod: "/day",
    image: getCloudinaryImage(cloudinaryImages.cars.audiA8),
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.8,
    available: true,
    company: "Keza Motors Ltd",
  },
  {
    id: 3,
    title: "Tesla Model X",
    brand: "Tesla",
    price: "900,000",
    rentalPeriod: "/month",
    image: getCloudinaryImage(cloudinaryImages.cars.teslaModelX),
    transmission: "Automatic",
    fuel: "Electric",
    rating: 5.0,
    available: true,
    company: "Rwanda Premium Cars",
  },
  {
    id: 4,
    title: "Ford Mustang GT",
    brand: "Ford",
    price: "35,000",
    rentalPeriod: "/day",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.9,
    available: false,
    company: "Jean-Claude Mutabazi",
  },
  {
    id: 5,
    title: "Audi Q5",
    brand: "Audi",
    price: "30,000",
    rentalPeriod: "/day",
    image: getCloudinaryImage(cloudinaryImages.cars.audiA8),
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 4.8,
    available: true,
    company: "Marie-Claire Uwimana",
  },
  {
    id: 6,
    title: "BMW X5",
    brand: "BMW",
    price: "750,000",
    rentalPeriod: "/month",
    image: getCloudinaryImage(cloudinaryImages.cars.teslaModelX),
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 4.9,
    available: false,
    company: "Rushago Car Rentals",
  },
  {
    id: 7,
    title: "Mercedes GLE",
    brand: "Mercedes",
    price: "38,000",
    rentalPeriod: "/day",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.7,
    available: true,
    company: "Keza Motors Ltd",
  },
  {
    id: 8,
    title: "Toyota Land Cruiser",
    brand: "Toyota",
    price: "800,000",
    rentalPeriod: "/month",
    image: getCloudinaryImage(cloudinaryImages.cars.audiA8),
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 4.9,
    available: true,
    company: "Rwanda Premium Cars",
  },
  {
    id: 9,
    title: "Range Rover Sport",
    brand: "Land Rover",
    price: "850,000",
    rentalPeriod: "/month",
    image: getCloudinaryImage(cloudinaryImages.cars.teslaModelX),
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 4.8,
    available: false,
    company: "Jean-Claude Mutabazi",
  },
  {
    id: 10,
    title: "Porsche Cayenne",
    brand: "Porsche",
    price: "40,000",
    rentalPeriod: "/day",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 5.0,
    available: true,
    company: "Marie-Claire Uwimana",
  },
]

// Company logos mapping
const companyLogos = {
  "Rushago Car Rentals": getCloudinaryImage(cloudinaryImages.companies.companyLogo),
  "Jean-Claude Mutabazi": getCloudinaryImage(
    "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228499/WhatsApp_Image_2024-12-10_at_11.45.08_rodply.jpg",
  ),
  "Keza Motors Ltd": getCloudinaryImage(cloudinaryImages.companies.companyLogo2),
  "Marie-Claire Uwimana": getCloudinaryImage(
    "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228499/WhatsApp_Image_2024-12-10_at_11.45.08_rodply.jpg",
  ),
  "Rwanda Premium Cars": getCloudinaryImage(cloudinaryImages.companies.logo),
}

const AllCarsScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { t } = useTranslation()

  const [isGridView, setIsGridView] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCars, setFilteredCars] = useState(allCars)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'available', 'unavailable'
  const [selectedCar, setSelectedCar] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(route.params?.selectedCompany || null)

  // Translations for rental periods
  const rentalPeriodTranslations = {
    "/day": t("rentalPeriods.perDay", "/day"),
    "/month": t("rentalPeriods.perMonth", "/month"),
  }

  // Translations for fuel types and transmission
  const fuelTypeTranslations = {
    Diesel: t("fuelTypes.diesel", "Diesel"),
    Petrol: t("fuelTypes.petrol", "Petrol"),
    Electric: t("fuelTypes.electric", "Electric"),
  }

  const transmissionTranslations = {
    Automatic: t("transmissionTypes.automatic", "Automatic"),
    Manual: t("transmissionTypes.manual", "Manual"),
  }

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Filter cars based on search query, availability filter, and selected company
    let filtered = allCars

    // Apply company filter if a company is selected
    if (selectedCompany) {
      filtered = filtered.filter((car) => car.company === selectedCompany)
    }
    // Otherwise apply availability filter
    else if (activeFilter === "available") {
      filtered = filtered.filter((car) => car.available)
    } else if (activeFilter === "unavailable") {
      filtered = filtered.filter((car) => !car.available)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((car) => {
        return (
          car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          car.company.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    setFilteredCars(filtered)
  }, [searchQuery, activeFilter, selectedCompany])

  const handleSelectCar = (car) => {
    setSelectedCar(car)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  const handleSearch = (text) => {
    setSearchQuery(text)
  }

  const handleFilter = (filter) => {
    setActiveFilter(filter)
    setSelectedCompany(null)
  }

  const navigateToCompanies = () => {
    navigation.navigate("CompaniesScreen", {
      searchQuery: searchQuery,
      onSelectCompany: (companyName) => {
        setSelectedCompany(companyName)
        setActiveFilter("all")
      },
    })
  }

  const renderContent = () => {
    if (isLoading) {
      // Skeleton loading for car cards
      return (
        <View style={isGridView ? styles.carsGrid : styles.carsList}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <View
                key={`skeleton-${index}`}
                style={[styles.carCard, !isGridView && styles.carCardList, styles.carCardSkeleton]}
              >
                <View style={[styles.carImageSkeleton, !isGridView && styles.carImageListSkeleton]} />
                <View style={styles.carInfoSkeleton}>
                  <View style={styles.carTitleSkeleton} />
                  <View style={styles.carPriceSkeleton} />
                  <View style={styles.carSpecsSkeleton} />
                </View>
              </View>
            ))}
        </View>
      )
    }

    if (filteredCars.length === 0) {
      return (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>{t("noAvailableCars")}</Text>
        </View>
      )
    }

    return (
      <View style={isGridView ? styles.carsGrid : styles.carsList}>
        {filteredCars.map((car) => (
          <TouchableOpacity
            key={car.id}
            style={[styles.carCard, !isGridView && styles.carCardList, !car.available && styles.carCardUnavailable]}
            onPress={() => handleSelectCar(car)}
            disabled={!car.available}
          >
            <Image
              source={{ uri: car.image }}
              style={[styles.carImage, !isGridView && styles.carImageList]}
              resizeMode="contain"
            />

            <View style={styles.carInfo}>
              <Text style={styles.carTitle}>{car.title}</Text>
              <Text style={styles.carPrice}>
                {car.price} FRW{rentalPeriodTranslations[car.rentalPeriod]}
              </Text>

              <View style={styles.carSpecs}>
                <Text style={styles.specText}>{fuelTypeTranslations[car.fuel]}</Text>
                <Text style={styles.specText}>{transmissionTranslations[car.transmission]}</Text>
              </View>

              <View style={styles.carFooter}>
                <View style={styles.availabilityContainer}>
                  <View
                    style={[
                      styles.availabilityIndicator,
                      car.available ? styles.availableIndicator : styles.unavailableIndicator,
                    ]}
                  />
                  <Text
                    style={[styles.availabilityText, car.available ? styles.availableText : styles.unavailableText]}
                  >
                    {car.available
                      ? t("availability.available", "Available")
                      : t("availability.unavailable", "Unavailable")}
                  </Text>
                </View>

                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.ratingText}>{car.rating}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.companyButton}
                onPress={() => {
                  setSelectedCompany(car.company)
                  setActiveFilter("all")
                }}
              >
                <Image
                  source={{ uri: companyLogos[car.company] }}
                  style={styles.companyButtonLogo}
                  resizeMode="contain"
                />
                <Text style={styles.companyButtonName}>{car.company}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft width={24} height={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedCompany ? `${selectedCompany}` : t("availableCars")}</Text>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t("searchForCar")}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Search width={20} height={20} color="#999" style={styles.searchIcon} />
          </View>
        </View>

        {/* Filter and Sort Options */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, activeFilter === "all" && styles.filterButtonActive]}
              onPress={() => handleFilter("all")}
            >
              <Text style={[styles.filterButtonText, activeFilter === "all" && styles.filterButtonTextActive]}>
                {t("categories.all")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, activeFilter === "available" && styles.filterButtonActive]}
              onPress={() => handleFilter("available")}
            >
              <Text style={[styles.filterButtonText, activeFilter === "available" && styles.filterButtonTextActive]}>
                {t("availability.available", "Available")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, activeFilter === "unavailable" && styles.filterButtonActive]}
              onPress={() => handleFilter("unavailable")}
            >
              <Text style={[styles.filterButtonText, activeFilter === "unavailable" && styles.filterButtonTextActive]}>
                {t("availability.unavailable", "Unavailable")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterButton} onPress={navigateToCompanies}>
              <Text style={styles.filterButtonText}>{t("companies", "Companies")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>{t("recommended", "Recommended")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.testDriveButton}>
              <Text style={styles.testDriveText}>{t("testDriveSubtitle")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleButton, !isGridView && styles.viewToggleButtonActive]}
            onPress={() => setIsGridView(false)}
          >
            <List stroke={!isGridView ? "#007EFD" : "#666"} width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, isGridView && styles.viewToggleButtonActive]}
            onPress={() => setIsGridView(true)}
          >
            <Grid stroke={isGridView ? "#007EFD" : "#666"} width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Content (Cars) */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {selectedCompany && (
            <TouchableOpacity
              style={styles.backToCompanies}
              onPress={() => {
                setSelectedCompany(null)
                setActiveFilter("all")
              }}
            >
              <ChevronLeft width={16} height={16} color="#007EFD" />
              <Text style={styles.backToCompaniesText}>{t("backToAll", "Back to all cars")}</Text>
            </TouchableOpacity>
          )}

          {renderContent()}

          {/* Add padding at the bottom for scrolling past the bottom nav */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Car Details Modal */}
        <CarDetailsModal car={selectedCar} visible={modalVisible} onClose={closeModal} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    width: 150,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  searchIcon: {
    marginLeft: 5,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#007EFD",
    borderColor: "#007EFD",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#333",
  },
  testDriveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  testDriveText: {
    fontSize: 14,
    color: "#333",
  },
  viewToggleContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  viewToggleButtonActive: {
    backgroundColor: "#F0F2FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backToCompanies: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backToCompaniesText: {
    color: "#007EFD",
    fontSize: 14,
    fontWeight: "500",
  },
  // Car grid/list styles
  carsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  carsList: {
    flexDirection: "column",
  },
  carCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  carCardList: {
    width: "100%",
    flexDirection: "row",
    borderRadius: 12,
  },
  carCardUnavailable: {
    opacity: 0.9,
  },
  carImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F8F9FA",
  },
  carImageList: {
    width: 120,
    height: 120,
  },
  carInfo: {
    padding: 12,
    flex: 1,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007EFD",
    marginBottom: 8,
  },
  carSpecs: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  specText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  carFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  availableIndicator: {
    backgroundColor: "#4CAF50",
  },
  unavailableIndicator: {
    backgroundColor: "#F44336",
  },
  availabilityText: {
    fontSize: 12,
  },
  availableText: {
    color: "#4CAF50",
  },
  unavailableText: {
    color: "#F44336",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    color: "#FFD700",
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
  },
  companyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  companyButtonLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 8,
  },
  companyButtonName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  // Skeleton styles
  carCardSkeleton: {
    backgroundColor: "#FFFFFF",
  },
  carImageSkeleton: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  carImageListSkeleton: {
    width: 120,
    height: 120,
  },
  carInfoSkeleton: {
    padding: 12,
    flex: 1,
  },
  carTitleSkeleton: {
    width: "80%",
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 4,
  },
  carPriceSkeleton: {
    width: "50%",
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 8,
  },
  carSpecsSkeleton: {
    width: "100%",
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  noResults: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
  },
  bottomPadding: {
    height: 80, // Add padding at the bottom for scrolling past the nav bar
  },
})

export default AllCarsScreen
