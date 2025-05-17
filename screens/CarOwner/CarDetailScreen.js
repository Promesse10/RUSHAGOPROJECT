"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import LoadingSkeleton from "../../components/Map/LoadingSkeleton"

const CarDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { car } = route.params
  const [loading, setLoading] = useState(true)
  const [carDetails, setCarDetails] = useState(null)

  useEffect(() => {
    // Simulate API call to get detailed car info
    const fetchCarDetails = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setCarDetails({
          ...car,
          fuelType: car.fuelType || "Gasoline",
          description: "This premium vehicle offers exceptional comfort and performance for all your needs.",
          features: ["Leather Seats", "Navigation System", "Bluetooth", "Backup Camera", "Sunroof"],
          owner: {
            name: "John Smith",
            type: "Business Owner",
            location: "New York, NY",
            phone: "+1 (555) 123-4567",
          },
        })
        setLoading(false)
      }, 1000)
    }

    fetchCarDetails()
  }, [car])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <LoadingSkeleton style={styles.imageSkeleton} />

        <View style={styles.contentContainer}>
          <LoadingSkeleton style={styles.nameSkeleton} />
          <LoadingSkeleton style={styles.infoRowSkeleton} />
          <LoadingSkeleton style={styles.priceSkeleton} />
          <LoadingSkeleton style={styles.detailsSkeleton} />
          <LoadingSkeleton style={styles.ownerSkeleton} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Car Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddNewCar", { car: carDetails, isEditing: true })}>
          <MaterialIcons name="edit" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              carDetails.image ||
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png",
          }}
          style={styles.carImage}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.carName}>{carDetails.name}</Text>
            <View
              style={[styles.statusBadge, carDetails.status === "active" ? styles.activeBadge : styles.pendingBadge]}
            >
              <Text style={styles.statusText}>{carDetails.status === "active" ? "Active" : "Pending"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={20} color="#666666" />
              <Text style={styles.infoText}>{carDetails.model}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="speed" size={20} color="#666666" />
              <Text style={styles.infoText}>{carDetails.horsepower}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="settings" size={20} color="#666666" />
              <Text style={styles.infoText}>{carDetails.gearType}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Rental Price</Text>
            <Text style={styles.price}>{carDetails.price}</Text>
          </View>

          {carDetails.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{carDetails.description}</Text>
            </View>
          )}

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Car Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{carDetails.category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fuel Type</Text>
              <Text style={styles.detailValue}>{carDetails.fuelType}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability</Text>
              <View style={styles.availabilityIndicator}>
                <View style={[styles.statusDot, { backgroundColor: carDetails.isAvailable ? "#4CAF50" : "#FF9800" }]} />
                <Text style={styles.detailValue}>{carDetails.isAvailable ? "Available" : "Unavailable"}</Text>
              </View>
            </View>
          </View>

          {carDetails.features && carDetails.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresList}>
                {carDetails.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check-circle" size={16} color="#007EFD" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Details</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{carDetails.owner.name}</Text>
                <Text style={styles.ownerType}>{carDetails.owner.type}</Text>
                <Text style={styles.ownerLocation}>{carDetails.owner.location}</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  carImage: {
    width: "100%",
    height: 250,
  },
  imageSkeleton: {
    width: "100%",
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  carName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  nameSkeleton: {
    height: 30,
    marginBottom: 12,
    width: "100%",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  pendingBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  infoRowSkeleton: {
    height: 24,
    marginBottom: 20,
    width: "100%",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    color: "#666666",
    fontSize: 14,
  },
  priceContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceSkeleton: {
    height: 80,
    marginBottom: 20,
    width: "100%",
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007EFD",
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSkeleton: {
    height: 150,
    marginBottom: 20,
    width: "100%",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  availabilityIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666666",
  },
  ownerSection: {
    marginBottom: 20,
  },
  ownerSkeleton: {
    height: 100,
    width: "100%",
    borderRadius: 8,
  },
  ownerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  ownerType: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  ownerLocation: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  callButton: {
    backgroundColor: "#007EFD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default CarDetailScreen

