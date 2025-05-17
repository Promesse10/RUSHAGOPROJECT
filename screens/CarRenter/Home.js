"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { Bell, Filter, Home as HomeIcon, Map as MapIcon, FileText, Settings, Star } from "react-native-feather"
import MapComponent from "../../components/Map"
import CarDetailsModal from "../../components/Map/CarDetaiilsModal"
import { useNavigation } from "@react-navigation/native"
import { useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import AsyncStorage from "@react-native-async-storage/async-storage"

// First, add the import for the cloudinary image utility at the top of the file
import { cloudinaryImages, getCloudinaryImage } from "../../utils/image-loader"

// Car marker icon for map
import CarMarkerIcon from "../../utils/image-loader"

const { width } = Dimensions.get("window")

// Banner images for auto-sliding carousel with company names
const bannerImages = [
  { image: getCloudinaryImage(cloudinaryImages.banners.banner1), brand: "Rushago Car Rentals" },
  { image: getCloudinaryImage(cloudinaryImages.banners.banner2), brand: "Keza Motors Ltd" },
  { image: getCloudinaryImage(cloudinaryImages.banners.banner3), brand: "Rwanda Premium Cars" },
]

const categories = [
  { id: "all", title: "All" },
  { id: "wedding", title: "Wedding Cars" },
  { id: "family", title: "Family Trips" },
  { id: "events", title: "Events & VIP" },
  { id: "casual", title: "Casual & City" },
  { id: "adventure", title: "Adventure" },
  { id: "business", title: "Business" },
  { id: "economy", title: "Economy" },
]

const carBrands = [
  { id: "audi", name: "Audi", logo: getCloudinaryImage(cloudinaryImages.brands.audi) },
  { id: "bmw", name: "BMW", logo: getCloudinaryImage(cloudinaryImages.brands.bmw) },
  { id: "mercedes", name: "Mercedes", logo: getCloudinaryImage(cloudinaryImages.brands.mercedes) },
  { id: "toyota", name: "Toyota", logo: getCloudinaryImage(cloudinaryImages.brands.toyota) },
  { id: "hyundai", name: "Hyundai", logo: getCloudinaryImage(cloudinaryImages.brands.hyundai) },
]

const carLocations = [
  {
    id: 1,
    coordinate: {
      latitude: -1.9441,
      longitude: 30.0619,
    },
    price: "40K/Day",
    title: "Sentafee Hyundai 2010",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228499/WhatsApp_Image_2024-12-10_at_11.45.08_rodply.jpg",
    ),
    specs: {
      transmission: "Automatic",
      fuel: "Diesel",
      mileage: "40,000 Frw",
    },
  },
  {
    id: 2,
    coordinate: {
      latitude: -1.9541,
      longitude: 30.0719,
    },
    price: "35K/Day",
    title: "Prius TOYOTA 2013",
    image: getCloudinaryImage(cloudinaryImages.cars.toyotaCamry),
    specs: {
      transmission: "Automatic",
      fuel: "Petrol",
      mileage: "35,000 Frw",
    },
  },
  {
    id: 3,
    coordinate: {
      latitude: -1.9341,
      longitude: 30.0519,
    },
    price: "45K/Day",
    title: "Mercedes C-Class 2015",
    image: getCloudinaryImage("https://res.cloudinary.com/def0cjmh2/image/upload/v1747228432/cadillac_mtf1mh.png"),
    specs: {
      transmission: "Manual",
      fuel: "Petrol",
      mileage: "45,000 Frw",
    },
  },
]

const availableCars = [
  {
    id: 1,
    title: "Audi A8 Quattro",
    brand: "Audi",
    price: "176,037.11",
    image: getCloudinaryImage(cloudinaryImages.cars.audiA8),
    transmission: "Automatic",
    fuel: "Petrol",
    horsepower: "540 hp",
    rating: 4.8,
    category: "business",
    company: "Rushago Car Rentals",
    available: true,
  },
  {
    id: 2,
    title: "Jeep Rubicon",
    brand: "Jeep",
    price: "75,500.00",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228498/Ultimate-Guide-to-Car-Rental-Cape-Town-Airport-Cars-in-Africa-scaled_ypy7l8.png",
    ),
    transmission: "Automatic",
    fuel: "Diesel",
    horsepower: "470 hp",
    rating: 5.0,
    category: "adventure",
    company: "Keza Motors Ltd",
    available: true,
  },
  {
    id: 3,
    title: "Tesla Model X",
    brand: "Tesla",
    price: "127,690.00",
    image: getCloudinaryImage(cloudinaryImages.cars.teslaModelX),
    transmission: "Automatic",
    fuel: "Electric",
    horsepower: "670 hp",
    rating: 5.0,
    category: "family",
    company: "Rwanda Premium Cars",
    available: false,
  },
  // Continue updating the rest of the array in the same way
]

const topChoiceCars = [
  {
    id: 1,
    title: "Sentafee Hyundai 2010",
    brand: "Hyundai",
    price: "40K/Day",
    image: getCloudinaryImage(
      "https://res.cloudinary.com/def0cjmh2/image/upload/v1747228499/WhatsApp_Image_2024-12-10_at_11.45.08_rodply.jpg",
    ),
    transmission: "Automatic",
    fuel: "Diesel",
    mileage: "40,000 Frw",
    rating: 4.5,
    company: "Rushago Car Rentals",
    available: true,
  },
  {
    id: 2,
    title: "Prius TOYOTA 2013",
    brand: "Toyota",
    price: "35K/Day",
    image: getCloudinaryImage(cloudinaryImages.cars.toyotaCamry),
    transmission: "Automatic",
    fuel: "Petrol",
    mileage: "35,000 Frw",
    rating: 4.2,
    company: "Keza Motors Ltd",
    available: false,
  },
  {
    id: 3,
    title: "Mercedes C-Class 2015",
    brand: "Mercedes",
    price: "45K/Day",
    image: getCloudinaryImage("https://res.cloudinary.com/def0cjmh2/image/upload/v1747228432/cadillac_mtf1mh.png"),
    transmission: "Automatic",
    fuel: "Diesel",
    mileage: "45,000 Frw",
    rating: 4.8,
    company: "Rwanda Premium Cars",
    available: true,
  },
  {
    id: 4,
    title: "BMW 3 Series 2018",
    brand: "BMW",
    price: "50K/Day",
    image: getCloudinaryImage(cloudinaryImages.cars.bmw3Series),
    transmission: "Automatic",
    fuel: "Petrol",
    mileage: "50,000 Frw",
    rating: 4.7,
    company: "Rushago Car Rentals",
    available: true,
  },
  {
    id: 5,
    title: "Audi A4 2017",
    brand: "Audi",
    price: "48K/Day",
    image: getCloudinaryImage(cloudinaryImages.cars.audiA4),
    transmission: "Automatic",
    fuel: "Diesel",
    mileage: "48,000 Frw",
    rating: 4.6,
    company: "Keza Motors Ltd",
    available: false,
  },
]

// Skeleton item component for loading state
const SkeletonItem = () => (
  <View style={styles.skeletonItem}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
      <View style={[styles.skeletonText, { width: "50%" }]} />
    </View>
  </View>
)

const HomeScreen = () => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const [selectedCar, setSelectedCar] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isGridView, setIsGridView] = useState(true)
  const [filteredCars, setFilteredCars] = useState(topChoiceCars)
  const [activeTab, setActiveTab] = useState("home")
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [filteredAvailableCars, setFilteredAvailableCars] = useState(availableCars)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const bannerScrollRef = useRef(null)
  const [layoutMode, setLayoutMode] = useState("default")
  const [hasNewNotifications, setHasNewNotifications] = useState(true)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "App Update Available",
      message: "Rushago has released new features including improved car filtering and booking experience.",
      time: "10:30 AM",
      date: new Date(),
      icon: getCloudinaryImage(cloudinaryImages.companies.logo),
      read: false,
      section: "today",
    },
    {
      id: 3,
      title: "New Cars Added",
      message: "Check out the latest Toyota Land Cruiser 2023 models added to our fleet.",
      time: "02:45 PM",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: getCloudinaryImage(cloudinaryImages.brands.toyota),
      read: true,
      section: "week",
    },
    {
      id: 4,
      title: "Weekend Special Offer",
      message: "Get 15% off on all luxury car rentals this weekend. Use code WEEKEND15.",
      time: "11:20 AM",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: getCloudinaryImage(cloudinaryImages.companies.logo),
      read: true,
      section: "week",
    },
  ])
  const [profileImage, setProfileImage] = useState(getCloudinaryImage(cloudinaryImages.ui.profilePhoto))
  const [fullName, setFullName] = useState("UMUBYEYI Kevine")
  const [location, setLocation] = useState("Kigali, Rwanda")

  const handleNotificationPress = useCallback(() => {
    navigation.navigate("Notifications", { notifications, setNotifications })
    setHasNewNotifications(false)
  }, [navigation, notifications])

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % bannerImages.length
      setCurrentBannerIndex(nextIndex)

      if (bannerScrollRef.current) {
        bannerScrollRef.current.scrollTo({
          x: width * nextIndex,
          animated: true,
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [currentBannerIndex])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedFullName = await AsyncStorage.getItem("fullName")
        const savedProfileImage = await AsyncStorage.getItem("profileImage")
        const savedLocation = await AsyncStorage.getItem("location")

        if (savedFullName) setFullName(savedFullName)
        if (savedProfileImage) setProfileImage({ uri: savedProfileImage })
        if (savedLocation) setLocation(savedLocation)
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
    loadUserData()
  }, [])

  useEffect(() => {
    // Filter top choice cars based on search query, category, and brand
    const filtered = topChoiceCars.filter((car) => {
      const matchesSearch =
        car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (car.brand && car.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (car.company && car.company.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "wedding" && car.brand === "Mercedes") ||
        (selectedCategory === "family" && ["Toyota", "Hyundai"].includes(car.brand)) ||
        (selectedCategory === "business" && ["BMW", "Audi", "Mercedes"].includes(car.brand))

      const matchesBrand = !selectedBrand || car.brand.toLowerCase() === selectedBrand.toLowerCase()

      return matchesSearch && matchesCategory && matchesBrand
    })

    setFilteredCars(filtered)

    if (selectedCategory === "all") {
      setLayoutMode("default")
    } else {
      setLayoutMode("grid")
    }

    // Filter available cars
    filterAvailableCars(selectedCategory, selectedBrand, searchQuery)
  }, [searchQuery, selectedCategory, selectedBrand])

  const filterAvailableCars = (category, brand, query) => {
    setIsLoading(true)

    setTimeout(() => {
      let filtered = [...availableCars]

      if (category !== "all") {
        filtered = filtered.filter((car) => car.category === category)
      }

      if (brand) {
        filtered = filtered.filter((car) => car.brand.toLowerCase() === brand.toLowerCase())
      }

      if (query) {
        filtered = filtered.filter(
          (car) =>
            car.title.toLowerCase().includes(query.toLowerCase()) ||
            car.brand.toLowerCase().includes(query.toLowerCase()) ||
            (car.company && car.company.toLowerCase().includes(query.toLowerCase())),
        )
      }

      setFilteredAvailableCars(filtered)
      setIsLoading(false)
    }, 1000)
  }

  const handleSelectCar = (car) => {
    setSelectedCar(car)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  const handleFilterPress = () => {
    navigation.navigate("FilterScreen")
  }

  const handleSearch = (text) => {
    setSearchQuery(text)
  }

  const handleBrandPress = (brandId) => {
    setSelectedBrand(brandId === selectedBrand ? null : brandId)
  }

  const handleCategoryPress = (categoryId) => {
    setIsLoading(true)
    setSelectedCategory(categoryId)

    if (categoryId === "all") {
      setLayoutMode("default")
    } else {
      setLayoutMode("grid")
    }
  }

  const handleTabPress = (tabName) => {
    setActiveTab(tabName)

    switch (tabName) {
      case "home":
        setSelectedCategory("all")
        setLayoutMode("default")
        break
      case "bookings":
        navigation.navigate("Bookings")
        break
      case "mapview":
        navigation.navigate("MapView")
        break
      case "settings":
        navigation.navigate("Settings")
        break
    }
  }

  const handleBannerPress = (company) => {
    // Navigate to CompaniesScreen with the selected company
    navigation.navigate("CompaniesScreen", { selectedCompany: company })
  }

  useFocusEffect(
    useCallback(() => {
      setActiveTab("home")
      return () => {}
    }, []),
  )

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} fill="#FFD700" stroke="#FFD700" width={14} height={14} />
        ))}
        {hasHalfStar && (
          <View style={styles.halfStarContainer}>
            <Star fill="#FFD700" stroke="#FFD700" width={14} height={14} style={styles.halfStarFull} />
            <Star fill="transparent" stroke="#FFD700" width={14} height={14} style={styles.halfStarEmpty} />
          </View>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} fill="transparent" stroke="#FFD700" width={14} height={14} />
        ))}
        <Text style={styles.ratingText}> {rating.toFixed(1)}</Text>
      </View>
    )
  }

  // Render availability badge
  const renderAvailabilityBadge = (available) => (
    <View style={[styles.availabilityBadge, available ? styles.availableBadge : styles.unavailableBadge]}>
      <Text style={[styles.availabilityText, available ? styles.availableText : styles.unavailableText]}>
        {available ? t("available") : t("unavailable")}
      </Text>
    </View>
  )

  // Render company logo
  const renderCompanyLogo = (company) => {
    let logo
    switch (company) {
      case "Rushago Car Rentals":
        logo = getCloudinaryImage(cloudinaryImages.companies.companyLogo)
        break
      case "Keza Motors Ltd":
        logo = getCloudinaryImage(cloudinaryImages.companies.companyLogo2)
        break
      case "Rwanda Premium Cars":
        logo = getCloudinaryImage(cloudinaryImages.companies.logo)
        break
      default:
        logo = getCloudinaryImage(cloudinaryImages.companies.logo)
    }

    return (
      <View style={styles.companyLogoContainer}>
        <Image source={logo} style={styles.companyLogo} resizeMode="contain" />
        <Text style={styles.companyName} numberOfLines={1}>
          {company}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image source={profileImage} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileLocation}>{location}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <Bell stroke="#000" width={24} height={24} />
            {hasNewNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.carBanner}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
            >
              {bannerImages.map((banner, index) => (
                <TouchableOpacity key={`banner-${index}`} onPress={() => handleBannerPress(banner.brand)}>
                  <Image source={banner.image} style={styles.bannerImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.bannerIndicators}>
              {bannerImages.map((_, index) => (
                <View
                  key={`indicator-${index}`}
                  style={[styles.bannerIndicator, currentBannerIndex === index && styles.bannerIndicatorActive]}
                />
              ))}
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={t("searchForCar")}
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
              <Filter stroke="#000" width={20} height={20} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categories}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {t(`categories.${category.id}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {layoutMode === "default" ? (
            <>
              <View style={styles.mapContainer}>
                <MapComponent
                  style={styles.map}
                  initialRegion={{
                    latitude: -1.9441,
                    longitude: 30.0619,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  markers={carLocations}
                  onSelectCar={handleSelectCar}
                  markerIcon={CarMarkerIcon}
                />
              </View>

              <View style={styles.topChoiceContainer}>
                <View style={styles.topChoiceHeader}>
                  <Text style={styles.topChoiceTitle}>{t("topChoice")}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carCardsContainer}
                >
                  {filteredCars.map((car) => (
                    <View key={car.id} style={styles.carCard}>
                      <Image source={car.image} style={styles.carImage} />
                      <View style={styles.carInfo}>
                        <View style={styles.carTitleRow}>
                          <Text style={styles.carTitle} numberOfLines={1}>
                            {car.title}
                          </Text>
                          {renderAvailabilityBadge(car.available)}
                        </View>
                        {renderCompanyLogo(car.company)}
                        {renderStars(car.rating)}
                        <View style={styles.carSpecs}>
                          <View style={styles.specItem}>
                            <Text style={styles.specText}>{car.transmission}</Text>
                          </View>
                          <View style={styles.specItem}>
                            <Text style={styles.specText}>{car.fuel}</Text>
                          </View>
                        </View>
                        <Text style={styles.carPrice}>{car.price}</Text>
                        <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleSelectCar(car)}>
                          <Text style={styles.viewDetailsText}>{t("viewDetails")}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          ) : (
            <View style={styles.gridContainer}>
              <Text style={styles.categoryTitle}>
                {t(`categories.${selectedCategory}`)} {t("cars")}
              </Text>

              {isLoading ? (
                <View style={styles.gridSkeleton}>
                  <View style={styles.gridSkeletonItem} />
                  <View style={styles.gridSkeletonItem} />
                  <View style={styles.gridSkeletonItem} />
                  <View style={styles.gridSkeletonItem} />
                  <View style={styles.gridSkeletonItem} />
                  <View style={styles.gridSkeletonItem} />
                </View>
              ) : (
                <View style={styles.gridContent}>
                  {filteredAvailableCars.map((car) => (
                    <TouchableOpacity key={car.id} style={styles.gridCard} onPress={() => handleSelectCar(car)}>
                      <Image source={car.image} style={styles.gridCardImage} resizeMode="cover" />
                      <View style={styles.gridCardInfo}>
                        <Text style={styles.gridCardTitle} numberOfLines={1}>
                          {car.title}
                        </Text>
                        {renderStars(car.rating)}
                        <Text style={styles.gridCardPrice}>{car.price} Frw</Text>
                        {renderAvailabilityBadge(car.available)}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("chooseAnyCarModel")}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>{t("viewAll")}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
              {carBrands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[styles.brandItem, selectedBrand === brand.id && styles.brandItemActive]}
                  onPress={() => handleBrandPress(brand.id)}
                >
                  <View style={[styles.brandLogo, selectedBrand === brand.id && styles.brandLogoActive]}>
                    <Image source={brand.logo} style={styles.brandLogoImage} />
                  </View>
                  <Text style={[styles.brandName, selectedBrand === brand.id && styles.brandNameActive]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.testDriveCard}>
            <View style={styles.testDriveContent}>
              <Text style={styles.testDriveTitle}>{t("testDriveArea")}</Text>
              <Text style={styles.testDriveSubtitle}>{t("testDriveSubtitle")}</Text>
              <TouchableOpacity style={styles.viewCarsButton}>
                <Text style={styles.viewCarsText}>{t("viewCars")}</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={getCloudinaryImage(cloudinaryImages.cars.carFree)}
              style={styles.testDriveImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t("availableCars")}</Text>

            {isLoading ? (
              <View>
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </View>
            ) : filteredAvailableCars.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>{t("noAvailableCars")}</Text>
              </View>
            ) : (
              <View>
                {filteredAvailableCars.map((car) => (
                  <TouchableOpacity key={car.id} style={styles.carListItem} onPress={() => handleSelectCar(car)}>
                    <Image source={car.image} style={styles.carListImage} resizeMode="contain" />
                    <View style={styles.carListInfo}>
                      <View style={styles.carListHeader}>
                        <View>
                          <Text style={styles.carListTitle}>{car.title}</Text>
                          <Text style={styles.carListBrand}>{car.brand}</Text>
                        </View>
                        {renderAvailabilityBadge(car.available)}
                      </View>
                      {renderCompanyLogo(car.company)}
                      <View style={styles.ratingContainer}>{renderStars(car.rating)}</View>
                      <View style={styles.carListSpecs}>
                        <Text style={styles.carListSpecText}>{car.transmission}</Text>
                        <Text style={styles.carListSpecText}>{car.fuel}</Text>
                      </View>
                      <Text style={styles.carListPrice}>{car.price} Frw</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <CarDetailsModal car={selectedCar} visible={modalVisible} onClose={closeModal} />

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("home")}>
            <HomeIcon stroke={activeTab === "home" ? "#007EFD" : "#666"} width={24} height={24} />
            <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>{t("home")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("bookings")}>
            <FileText stroke={activeTab === "bookings" ? "#007EFD" : "#666"} width={24} height={24} />
            <Text style={[styles.navText, activeTab === "bookings" && styles.navTextActive]}>{t("bookings")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("mapview")}>
            <MapIcon stroke={activeTab === "mapview" ? "#007EFD" : "#666"} width={24} height={24} />
            <Text style={[styles.navText, activeTab === "mapview" && styles.navTextActive]}>{t("map")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleTabPress("settings")}>
            <Settings stroke={activeTab === "settings" ? "#007EFD" : "#666"} width={24} height={24} />
            <Text style={[styles.navText, activeTab === "settings" && styles.navTextActive]}>{t("settings")}</Text>
          </TouchableOpacity>
        </View>
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    justifyContent: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  profileLocation: {
    fontSize: 14,
    color: "#666",
  },
  notificationButton: {
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  carBanner: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    position: "relative",
  },
  bannerImage: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  bannerIndicators: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  bannerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  bannerIndicatorActive: {
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 23,
    marginRight: 10,
  },
  searchInput: {
    height: 46,
    paddingHorizontal: 20,
  },
  filterButton: {
    width: 46,
    height: 46,
    backgroundColor: "#F5F5F5",
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  categories: {
    maxHeight: 50,
    marginBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  categoryButtonActive: {
    backgroundColor: "#007EFD",
  },
  categoryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#FFFFFF",
  },
  mapContainer: {
    height: 200,
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  topChoiceContainer: {
    marginBottom: 20,
  },
  topChoiceHeader: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#007EFD",
  },
  topChoiceTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  carCardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  carCard: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  carImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  carInfo: {
    padding: 15,
  },
  carTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007EFD",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  halfStarContainer: {
    position: "relative",
    width: 14,
    height: 14,
  },
  halfStarFull: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 7,
    overflow: "hidden",
  },
  halfStarEmpty: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
  carSpecs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  specItem: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  specText: {
    fontSize: 12,
    color: "#666",
  },
  viewDetailsButton: {
    backgroundColor: "#007EFD",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  viewDetailsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#666",
  },
  brandsScroll: {
    flexDirection: "row",
  },
  brandItem: {
    alignItems: "center",
    marginRight: 25,
  },
  brandItemActive: {
    opacity: 1,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  brandLogoActive: {
    backgroundColor: "#E6E8FF",
    borderWidth: 1,
    borderColor: "#007EFD",
  },
  brandLogoImage: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  brandName: {
    fontSize: 14,
    color: "#333",
  },
  brandNameActive: {
    color: "#007EFD",
    fontWeight: "bold",
  },
  testDriveCard: {
    flexDirection: "row",
    backgroundColor: "#121628",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    overflow: "hidden",
  },
  testDriveContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  testDriveTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  testDriveSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 15,
  },
  viewCarsButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  viewCarsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  testDriveImage: {
    width: 150,
    height: 100,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  skeletonItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonImage: {
    width: 120,
    height: 80,
    marginRight: 15,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText: {
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginBottom: 8,
  },
  noResultsContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  carListItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  carListImage: {
    width: 120,
    height: 80,
    marginRight: 15,
  },
  carListInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  carListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  carListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  carListBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  carListSpecs: {
    flexDirection: "row",
    marginBottom: 4,
  },
  carListSpecText: {
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  carListPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007EFD",
  },
  bottomPadding: {
    height: 80,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    height: 60,
  },
  navItem: {
    alignItems: "center",
    padding: 8,
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  navTextActive: {
    color: "#007EFD",
  },
  gridContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  gridCardImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridCardInfo: {
    padding: 10,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  gridCardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007EFD",
    marginTop: 5,
    marginBottom: 5,
  },
  gridSkeleton: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridSkeletonItem: {
    width: "48%",
    height: 180,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    marginBottom: 15,
  },
  // Availability badge styles
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  availableBadge: {
    backgroundColor: "#E6F7ED",
  },
  unavailableBadge: {
    backgroundColor: "#FFEBEE",
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "500",
  },
  availableText: {
    color: "#00A36C",
  },
  unavailableText: {
    color: "#D32F2F",
  },
  // Company logo styles
  companyLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  companyLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  companyName: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
})

export default HomeScreen
