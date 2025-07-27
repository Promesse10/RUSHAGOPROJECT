"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from "react-native"
import Slider from '@react-native-community/slider'
import Icon from "react-native-vector-icons/Ionicons"

const { width, height } = Dimensions.get("window")

const FilterSidebar = ({ visible, onClose, onApplyFilters, cars }) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    make: "all",
    model: "all",
    type: "all",
    transmission: "all",
    fuelType: "all",
    features: [],
    year: "all",
    seatings: "all",
  })

  // Extract unique values from cars data
  const uniqueMakes = [...new Set(cars.map((car) => car.make))]
  const uniqueModels = [...new Set(cars.map((car) => car.model))]
  const uniqueTypes = [...new Set(cars.map((car) => car.type))]
  const uniqueYears = [...new Set(cars.map((car) => car.year))]
  const uniqueSeatings = [...new Set(cars.map((car) => car.seatings))]
  const allFeatures = [...new Set(cars.flatMap((car) => car.features || []))]

  const handleFeatureToggle = (feature) => {
    const updatedFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature]

    setFilters({ ...filters, features: updatedFeatures })
  }

  const applyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      make: "all",
      model: "all",
      type: "all",
      transmission: "all",
      fuelType: "all",
      features: [],
      year: "all",
      seatings: "all",
    })
  }

  const renderFilterSection = (title, options, selectedValue, onSelect) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        <TouchableOpacity
          style={[styles.filterOption, selectedValue === "all" && styles.selectedOption]}
          onPress={() => onSelect("all")}
        >
          <Text style={[styles.optionText, selectedValue === "all" && styles.selectedOptionText]}>All</Text>
        </TouchableOpacity>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.filterOption, selectedValue === option && styles.selectedOption]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, selectedValue === option && styles.selectedOptionText]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Price Range (FRW)</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceText}>
                  {filters.priceRange[0]} - {filters.priceRange[1]}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10000}
                  value={filters.priceRange[1]}
                  onValueChange={(value) => setFilters({ ...filters, priceRange: [0, Math.round(value)] })}
                  minimumTrackTintColor="#007EFD"
                  maximumTrackTintColor="#ddd"
                  thumbStyle={styles.sliderThumb}
                />
              </View>
            </View>

            {/* Make */}
            {renderFilterSection("Make", uniqueMakes, filters.make, (make) => setFilters({ ...filters, make }))}

            {/* Model */}
            {renderFilterSection("Model", uniqueModels, filters.model, (model) => setFilters({ ...filters, model }))}

            {/* Type */}
            {renderFilterSection("Type", uniqueTypes, filters.type, (type) => setFilters({ ...filters, type }))}

            {/* Year */}
            {renderFilterSection("Year", uniqueYears, filters.year, (year) => setFilters({ ...filters, year }))}

            {/* Transmission */}
            {renderFilterSection("Transmission", ["Automatic", "Manual"], filters.transmission, (transmission) =>
              setFilters({ ...filters, transmission }),
            )}

            {/* Fuel Type */}
            {renderFilterSection(
              "Fuel Type",
              ["Gasoline", "Electric", "Hybrid", "Diesel"],
              filters.fuelType,
              (fuelType) => setFilters({ ...filters, fuelType }),
            )}

            {/* Seatings */}
            {renderFilterSection("Seats", uniqueSeatings, filters.seatings, (seatings) =>
              setFilters({ ...filters, seatings }),
            )}

            {/* Features */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresGrid}>
                {allFeatures.map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={[styles.featureOption, filters.features.includes(feature) && styles.selectedFeature]}
                    onPress={() => handleFeatureToggle(feature)}
                  >
                    <Icon
                      name={filters.features.includes(feature) ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={filters.features.includes(feature) ? "#007EFD" : "#666"}
                    />
                    <Text
                      style={[styles.featureText, filters.features.includes(feature) && styles.selectedFeatureText]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: width * 0.85,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#007EFD",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  optionsScroll: {
    flexDirection: "row",
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
    marginRight: 10,
  },
  selectedOption: {
    backgroundColor: "#007EFD",
    borderColor: "#007EFD",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
  },
  selectedOptionText: {
    color: "white",
  },
  priceRangeContainer: {
    paddingVertical: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007EFD",
    textAlign: "center",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#007EFD",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
    marginBottom: 5,
  },
  selectedFeature: {
    backgroundColor: "#f0f8ff",
    borderColor: "#007EFD",
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  selectedFeatureText: {
    color: "#007EFD",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 15,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: "#666",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#007EFD",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
})

export default FilterSidebar
