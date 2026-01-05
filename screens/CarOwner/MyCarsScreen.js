"use client"

import { useState, useEffect, useMemo } from "react"
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView, Modal, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import Swiper from 'react-native-swiper'
import { getMyCarsAction, deleteCarAction } from "../../redux/action/CarActions"

const CarDetailsModal = ({ visible, car, onClose, onEdit, onDelete }) => {
  const { t } = useTranslation()

  if (!car) return null

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Car Details</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Ionicons name="pencil-outline" size={20} color="#007EFD" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.carImageContainer}>
            {car.images && car.images.length > 0 ? (
              <Swiper style={styles.modalWrapper} showsButtons={false} autoplay={false} showsPagination={true} paginationStyle={styles.modalPagination}>
                {car.images.map((image, index) => (
                  <View key={index} style={styles.modalSlide}>
                    <Image source={{ uri: image }} style={styles.carDetailImage} />
                  </View>
                ))}
              </Swiper>
            ) : (
              <Image source={{ uri: car.image || "/placeholder.svg?height=200&width=300" }} style={styles.carDetailImage} />
            )}
            <View style={styles.statusBadgeModal}>
              <Text style={styles.statusTextModal}>{car.status}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.carNameModal}>
              {car.brand || car.name} {car.model}
            </Text>
            <Text style={styles.carYearModal}>{car.year}</Text>

            <View style={styles.priceSection}>
              <Text style={styles.priceModal}>{(car.price || car.base_price || 0).toLocaleString()} FRW</Text>
              <Text style={styles.priceUnitModal}>per day</Text>
            </View>

            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={20} color="#64748B" />
                <Text style={styles.statLabel}>Views</Text>
                <Text style={styles.statValue}>{car.views || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Rating</Text>
                <Text style={styles.statValue}>
                  {car.rating || 0} ({car.reviews || 0})
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{car.type || "Sedan"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Transmission</Text>
                <Text style={styles.detailValue}>{car.transmission || "Automatic"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fuel Type</Text>
                <Text style={styles.detailValue}>{car.fuelType || car.fuel_type || "Gasoline"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Seats</Text>
                <Text style={styles.detailValue}>{car.seatings || car.seats || "5"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{car.location?.address || car.address || "Kigali"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{car.owner?.phone || car.phone || "+250 788 123 456"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Plate Number</Text>
                <Text style={styles.detailValue}>{car.plateNumber || "Not set"}</Text>
              </View>
            </View>

            {car.features && car.features.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.featuresGrid}>
                  {car.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {car.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{car.description}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

const MyCarsScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const dispatch = useDispatch()

  // ✅ FIXED: Get authenticated user and cars data
  const { user, isAuthenticated } = useSelector((state) => state.auth || {})
  const { cars, isLoading, error } = useSelector((state) => state.cars || {})

  // Reorder images to show front exterior first
  const reorderedCars = useMemo(() => {
    if (!cars) return []
    return cars.map(car => ({
      ...car,
      images: car.images && car.images.length >= 4
        ? [car.images[1], car.images[2], car.images[3], car.images[0]] // front, side, rear, interior
        : car.images
    }))
  }, [cars])

  const [selectedCar, setSelectedCar] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  // ✅ FIXED: Check authentication and fetch cars
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("❌ User not authenticated, should redirect to login...")
      return
    }

    console.log("🚗 Fetching my cars for user:", user.name)
    dispatch(getMyCarsAction())
  }, [dispatch, isAuthenticated, user])
  
  // ✅ FIXED: Refetch when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (isAuthenticated && user) {
        console.log("🔄 MyCars screen focused, refetching cars...")
        dispatch(getMyCarsAction())
      }
    })

    return unsubscribe
  }, [navigation, dispatch, isAuthenticated, user])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { backgroundColor: "#DCFCE7", color: "#166534" }
      case "pending":
        return { backgroundColor: "#FEF3C7", color: "#92400E" }
      case "inactive":
        return { backgroundColor: "#F1F5F9", color: "#475569" }
      default:
        return { backgroundColor: "#F1F5F9", color: "#475569" }
    }
  }

  const handleViewDetails = (car) => {
    setSelectedCar(car)
    setModalVisible(true)
  }

  const handleEditCar = () => {
    setModalVisible(false)
    navigation.navigate("EditCar", {
      carData: selectedCar,
    })
  }

  const handleDeleteCar = (carId) => {
    Alert.alert(
      "Delete Car",
      "Are you sure you want to delete this car listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteCarAction(carId)),
        },
      ],
    )
  }

  // ✅ FIXED: Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("myCars", "My Cars")}</Text>
          <Text style={styles.subtitle}>{t("manageVehicles", "Manage your vehicle listings")}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("loading", "Loading your cars...")}</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ✅ FIXED: Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("myCars")}</Text>
          <Text style={styles.subtitle}>{t("manageVehicles")}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(getMyCarsAction())}>
            <Text style={styles.retryButtonText}>{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ✅ FIXED: Show empty state when no cars
  if (!cars || cars.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("myCars")}</Text>
          <Text style={styles.subtitle}>{t("manageVehicles")}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>{t("noCars", "No Cars Listed")}</Text>
          <Text style={styles.emptySubtitle}>{t("addFirstCar", "Add your first car to get started")}</Text>
          <TouchableOpacity style={styles.addCarButton} onPress={() => navigation.navigate("AddCar")}>
            <Ionicons name="add-outline" size={20} color="#FFFFFF" />
            <Text style={styles.addCarButtonText}>{t("addCar", "Add Car")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("myCars", "My Cars")}</Text>
        <Text style={styles.subtitle}>{t("manageVehicles", "Manage your vehicle listings")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cars List */}
        <View style={styles.carsList}>
          {reorderedCars.map((car) => (
            <View key={car._id || car.id} style={styles.carCard}>
              <View style={styles.imageContainer}>
                {car.images && car.images.length > 0 ? (
                  <Swiper style={styles.wrapper} showsButtons={false} autoplay={false} showsPagination={true} paginationStyle={styles.pagination}>
                    {car.images.map((image, index) => (
                      <View key={index} style={styles.slide}>
                        <Image source={{ uri: image }} style={styles.carImage} />
                      </View>
                    ))}
                  </Swiper>
                ) : (
                  <Image source={{ uri: car.image || "/placeholder.svg?height=200&width=300" }} style={styles.carImage} />
                )}
                <View style={[styles.statusBadge, getStatusColor(car.status)]}>
                  <Text style={[styles.statusText, { color: getStatusColor(car.status).color }]}>
                    {car.status?.charAt(0).toUpperCase() + car.status?.slice(1) || "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.carInfo}>
                <View style={styles.carHeader}>
                  <View style={styles.carDetails}>
                    <Text style={styles.carName}>
                      {car.brand || car.name} {car.model}
                    </Text>
                    <Text style={styles.carYear}>{car.year}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      {(car.price || car.base_price || 0).toLocaleString()} {t("currency", "FRW")}
                    </Text>
                    <Text style={styles.priceUnit}>{t("perDay", "per day")}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={16} color="#64748B" />
                    <Text style={styles.statText}>
                      {car.views || 0} {t("views", "views")}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.statText}>
                      {car.rating || 0} ({car.reviews || 0})
                    </Text>
                  </View>
                </View>

                {/* Details Button */}
                <View style={styles.detailsContainer}>
                  <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewDetails(car)}>
                    <Text style={styles.detailsButtonText}>{t("viewDetails", "View Details")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <CarDetailsModal
        visible={modalVisible}
        car={selectedCar}
        onClose={() => setModalVisible(false)}
        onEdit={handleEditCar}
        onDelete={() => handleDeleteCar(selectedCar._id || selectedCar.id)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
  },
  addCarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007EFD",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCarButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  carsList: {
    gap: 20,
    paddingBottom: 20,
  },
  carCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  carImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E2E8F0",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  carInfo: {
    padding: 20,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  carDetails: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  carYear: {
    fontSize: 14,
    color: "#64748B",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007EFD",
    marginBottom: 2,
  },
  priceUnit: {
    fontSize: 12,
    color: "#64748B",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  detailsContainer: {
    alignItems: "flex-end",
  },
  detailsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#007EFD",
    borderRadius: 8,
    backgroundColor: "#F0F9FF",
  },
  detailsButtonText: {
    fontSize: 14,
    color: "#007EFD",
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F9FF",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007EFD",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  modalContent: {
    flex: 1,
  },
  carImageContainer: {
    position: "relative",
    height: 250,
    backgroundColor: "#E2E8F0",
  },
  carDetailImage: {
    width: "100%",
    height: "100%",
  },
  statusBadgeModal: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextModal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
    textTransform: "capitalize",
  },
  detailsSection: {
    padding: 20,
  },
  carNameModal: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  carYearModal: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 24,
  },
  priceModal: {
    fontSize: 28,
    fontWeight: "700",
    color: "#007EFD",
  },
  priceUnitModal: {
    fontSize: 16,
    color: "#64748B",
  },
  statsSection: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  detailsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  featureText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
  },
  descriptionSection: {
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  imageScroll: {
    height: 200,
  },
  modalImageScroll: {
    height: 300,
  },
})

export default MyCarsScreen
