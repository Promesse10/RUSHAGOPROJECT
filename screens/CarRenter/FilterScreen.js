"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native"
import Slider from "@react-native-community/slider"

const FilterScreen = () => {
  const [priceRange, setPriceRange] = useState([20, 80])
  const [mileageRange, setMileageRange] = useState([10000, 50000])
  const [selectedBrands, setSelectedBrands] = useState([])

  const carBrands = [
    {
      id: "ferrari",
      name: "Ferrari",
      logo: { uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/ferrari_logo_dzgvwz.png" },
    },
    {
      id: "toyota",
      name: "Toyota",
      logo: { uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/toyota_logo_uwzuxj.png" },
    },
    {
      id: "bmw",
      name: "BMW",
      logo: { uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/bmw_logo_x9jggx.png" },
    },
    {
      id: "audi",
      name: "Audi",
      logo: { uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/audi_logo_y9jttl.png" },
    },
    {
      id: "mercedes",
      name: "Mercedes",
      logo: { uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/mercedes_logo_m3xqec.png" },
    },
    {
      id: "ford",
      name: "Ford",
      logo: { uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/ford_logo_vsmrma.png" },
    },
  ]

  const handlePriceValuesChange = (values) => {
    setPriceRange(values)
  }

  const handleMileageValuesChange = (values) => {
    setMileageRange(values)
  }

  const toggleBrandSelection = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId))
    } else {
      setSelectedBrands([...selectedBrands, brandId])
    }
  }

  const renderBrandItem = (brand) => (
    <TouchableOpacity
      key={brand.id}
      style={[styles.brandItem, selectedBrands.includes(brand.id) && styles.selectedBrandItem]}
      onPress={() => toggleBrandSelection(brand.id)}
    >
      <Image source={brand.logo} style={styles.brandLogo} resizeMode="contain" />
      <Text style={styles.brandName}>{brand.name}</Text>
    </TouchableOpacity>
  )

  const testDriveContainer = () => {
    return (
      <View style={styles.testDriveContainer}>
        <View style={styles.testDriveLeft}>
          <View style={styles.testDriveIcon}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/steering_wheel_iq8jfh.png",
              }}
              style={styles.steeringIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.testDriveText}>Free test drive</Text>
        </View>
        <Image
          source={{ uri: "https://res.cloudinary.com/dajwtlsot/image/upload/v1699971996/steering_wheel_iq8jfh.png" }}
          style={styles.steeringIcon}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Filter</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Range</Text>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={priceRange[0]}
          onValueChange={handlePriceValuesChange}
        />
        <View style={styles.rangeDisplay}>
          <Text>{priceRange[0]}K</Text>
          <Text>{priceRange[1]}K</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mileage</Text>
        <Slider
          minimumValue={0}
          maximumValue={100000}
          step={1000}
          value={mileageRange[0]}
          onValueChange={handleMileageValuesChange}
        />
        <View style={styles.rangeDisplay}>
          <Text>{mileageRange[0]}</Text>
          <Text>{mileageRange[1]}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Car Brand</Text>
        <View style={styles.brandList}>{carBrands.map(renderBrandItem)}</View>
      </View>

      {testDriveContainer()}

      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  rangeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  brandList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  brandItem: {
    width: "30%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    marginRight: "3%",
  },
  selectedBrandItem: {
    backgroundColor: "#e0f7fa",
    borderColor: "#4dd0e1",
  },
  brandLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  brandName: {
    fontSize: 12,
    textAlign: "center",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  testDriveContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  testDriveTextContainer: {
    flex: 1,
  },
  testDriveTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  testDriveSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  steeringIcon: {
    width: 80,
    height: 80,
  },
  testDriveLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  testDriveIcon: {
    marginRight: 10,
  },
  testDriveText: {
    fontSize: 16,
  },
})

export default FilterScreen
