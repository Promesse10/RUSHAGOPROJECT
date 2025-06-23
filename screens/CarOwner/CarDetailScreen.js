"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { fetchData } from "../../utils/api" // Import the API utility

const CarDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { carId } = route.params // Expect `carId` to be passed from the previous screen
  const [loading, setLoading] = useState(true)
  const [carDetails, setCarDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const data = await fetchData(`/cars/${carId}`) // Replace `/cars/:id` with the actual endpoint
        setCarDetails(data)
      } catch (err) {
        setError("Failed to load car details. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [carId])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007EFD" style={{ marginTop: 20 }} />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.errorText}>{error}</Text>
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
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
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007EFD",
  },
})

export default CarDetailScreen