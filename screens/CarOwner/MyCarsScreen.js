"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Switch, SafeAreaView, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

const CarDetailsModal = ({ visible, car, onClose, onEdit }) => {
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
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#007EFD" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.carImageContainer}>
            <Image source={{ uri: car.image }} style={styles.carDetailImage} />
            <View style={styles.statusBadgeModal}>
              <Text style={styles.statusTextModal}>{car.status}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.carNameModal}>
              {car.name} {car.model}
            </Text>
            <Text style={styles.carYearModal}>{car.year}</Text>

            <View style={styles.priceSection}>
              <Text style={styles.priceModal}>{car.price?.toLocaleString()} FRW</Text>
              <Text style={styles.priceUnitModal}>per day</Text>
            </View>

            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={20} color="#64748B" />
                <Text style={styles.statLabel}>Views</Text>
                <Text style={styles.statValue}>{car.views}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Rating</Text>
                <Text style={styles.statValue}>
                  {car.rating} ({car.reviews})
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
                <Text style={styles.detailValue}>{car.fuelType || "Gasoline"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Seats</Text>
                <Text style={styles.detailValue}>{car.seats || "5"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{car.address || "Kigali"}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{car.phone || "+250 788 123 456"}</Text>
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
  const [loading, setLoading] = useState(true)
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setCars([
        {
          id: 1,
          name: "BMW X5",
          model: "xDrive40i",
          year: 2023,
          price: 120000,
          image: "https://via.placeholder.com/300x200/E2E8F0/64748B?text=Car+Image",
          status: "active",
          available: true,
          views: 245,
          rating: 4.8,
          reviews: 12,
          type: "SUV",
          transmission: "Automatic",
          fuelType: "Gasoline",
          seats: "7",
          address: "Kigali - Gasabo",
          phone: "+250 788 123 456",
          features: ["Air Conditioning", "GPS Navigation", "Bluetooth", "Backup Camera"],
          description:
            "Luxury SUV in excellent condition with premium features and comfortable seating for 7 passengers.",
        },
        {
          id: 2,
          name: "Audi Q7",
          model: "Premium Plus",
          year: 2022,
          price: 110000,
          image: "https://via.placeholder.com/300x200/E2E8F0/64748B?text=Car+Image",
          status: "active",
          available: true,
          views: 189,
          rating: 4.9,
          reviews: 8,
          type: "SUV",
          transmission: "Automatic",
          fuelType: "Gasoline",
          seats: "7",
          address: "Kigali - Kicukiro",
          phone: "+250 788 123 456",
          features: ["Air Conditioning", "Leather Seats", "Premium Sound", "Sunroof"],
          description: "Premium luxury SUV with advanced safety features and exceptional comfort.",
        },
        {
          id: 3,
          name: "Mercedes GLE",
          model: "350 4MATIC",
          year: 2023,
          price: 135000,
          image: "https://via.placeholder.com/300x200/E2E8F0/64748B?text=Car+Image",
          status: "pending",
          available: false,
          views: 67,
          rating: 4.7,
          reviews: 5,
          type: "SUV",
          transmission: "Automatic",
          fuelType: "Gasoline",
          seats: "5",
          address: "Kigali - Nyarugenge",
          phone: "+250 788 123 456",
          features: ["Air Conditioning", "GPS Navigation", "Heated Seats", "Keyless Entry"],
          description: "Elegant and powerful SUV with cutting-edge technology and superior performance.",
        },
      ])
      setLoading(false)
    }, 1500)
  }, [])

  const toggleAvailability = (carId) => {
    setCars(cars.map((car) => (car.id === carId ? { ...car, available: !car.available } : car)))
  }

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
    // Navigate to edit screen with car data
    navigation.navigate("AddCar", {
      draftData: {
        id: selectedCar.id,
        formData: selectedCar,
        currentStep: 5, // Start at review step for editing
        isEditing: true,
      },
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>{t("loading", "Loading...")}</Text>
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
          {cars.map((car) => (
            <View key={car.id} style={styles.carCard}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: car.image }} style={styles.carImage} />
                <View style={[styles.statusBadge, getStatusColor(car.status)]}>
                  <Text style={[styles.statusText, { color: getStatusColor(car.status).color }]}>
                    {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.carInfo}>
                <View style={styles.carHeader}>
                  <View style={styles.carDetails}>
                    <Text style={styles.carName}>
                      {car.name} {car.model}
                    </Text>
                    <Text style={styles.carYear}>{car.year}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      {car.price.toLocaleString()} {t("currency", "FRW")}
                    </Text>
                    <Text style={styles.priceUnit}>{t("perDay", "per day")}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={16} color="#64748B" />
                    <Text style={styles.statText}>
                      {car.views} {t("views", "views")}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.statText}>
                      {car.rating} ({car.reviews})
                    </Text>
                  </View>
                </View>

                {/* Availability Toggle */}
                <View style={styles.availabilityContainer}>
                  <View style={styles.switchContainer}>
                    <Switch
                      value={car.available}
                      onValueChange={() => toggleAvailability(car.id)}
                      trackColor={{ false: "#E2E8F0", true: "#007EFD" }}
                      thumbColor={car.available ? "#FFFFFF" : "#FFFFFF"}
                      style={styles.switch}
                    />
                    <Text style={styles.availabilityText}>
                      {car.available ? t("available", "Available") : t("unavailable", "Unavailable")}
                    </Text>
                  </View>
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
  availabilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
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
})

export default MyCarsScreen
