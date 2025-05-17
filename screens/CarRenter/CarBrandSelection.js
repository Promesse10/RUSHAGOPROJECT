import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"

// Car brands with their corresponding local image paths
const carBrands = [
  { id: 1, name: "Tesla", logo: require("../../assets/tesla.png") },
  { id: 2, name: "Nissan", logo: require("../../assets/nissan.png") },
  { id: 3, name: "Lamborghini", logo: require("../../assets/lamborghini.png") },
  { id: 4, name: "Ford", logo: require("../../assets/ford.png") },
  { id: 5, name: "Land Rover", logo: require("../../assets/land rover.png") },
  { id: 6, name: "Toyota", logo: require("../../assets/toyota.png") },
  { id: 7, name: "Audi", logo: require("../../assets/audi.png") },
  { id: 8, name: "Ferrari", logo: require("../../assets/ferrari.png") },
]

const CarBrandSelection = () => {
  const navigation = useNavigation()
  const [selectedBrands, setSelectedBrands] = useState([])

  const toggleBrandSelection = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId))
    } else {
      setSelectedBrands([...selectedBrands, brandId])
    }
  }

  const handleFinish = () => {
    navigation.navigate("Home")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Which brand of car do you prefer?</Text>
      <Text style={styles.subtitle}>Select all that you interested in.</Text>

      <ScrollView style={styles.brandsContainer}>
        <View style={styles.brandsGrid}>
          {carBrands.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={[
                styles.brandCard,
                selectedBrands.includes(brand.id) && styles.selectedBrandCard,
              ]}
              onPress={() => toggleBrandSelection(brand.id)}
            >
              <Image 
                source={brand.logo}
                style={[
                  styles.brandLogo,
                  selectedBrands.includes(brand.id) && styles.selectedBrandLogo
                ]} 
                resizeMode="contain"
              />
              <Text style={styles.brandName}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.finishButton, selectedBrands.length === 0 && styles.disabledButton]}
        onPress={handleFinish}
        disabled={selectedBrands.length === 0}
      >
        <Text style={styles.finishButtonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  backButton: {
    fontSize: 24,
  },
  skipButton: {
    fontSize: 16,
    color: "#007EFD",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  brandsContainer: {
    flex: 1,
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  brandCard: {
    width: "48%",
    aspectRatio: 1.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  selectedBrandCard: {
    backgroundColor: "#F5F6FF",
    borderColor: "#007EFD",
  },
  brandLogo: {
    width: 60,
    height: 60,
    
  },
  selectedBrandLogo: {
    tintColor: "#007EFD",
  },
  brandName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  finishButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#007EFD",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default CarBrandSelection