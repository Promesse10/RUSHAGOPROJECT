"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import StepIndicator from "../../components/Map/StepIndicator"
import ImagePicker from "../../components/Map/ImagePicker"
import MapView, { Marker } from "react-native-maps"
import { Picker } from "@react-native-picker/picker"
import { Switch } from "react-native-gesture-handler"

const AddNewCarScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { car, isEditing } = route.params || {}
  const [currentStep, setCurrentStep] = useState(0)
  const scrollViewRef = useRef(null)

  const [carData, setCarData] = useState(
    car || {
      name: "",
      model: "",
      gearType: "Automatic",
      fuelType: "Gasoline",
      horsepower: "",
      dailyPrice: "",
      monthlyPrice: "",
      category: "Business",
      location: {
        latitude: 37.78825,
        longitude: -122.4324,
      },
      isAvailable: true,
      isTopChoice: false,
      images: [],
      bannerImage: null,
    },
  )

  const steps = ["Basic Info", "Images", "Pricing", "Location", "Availability"]

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true })
    }
  }, [currentStep])

  const handleNext = () => {
    // Validate current step
    if (!validateCurrentStep()) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      navigation.goBack()
    }
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        if (!carData.name.trim()) {
          Alert.alert("Error", "Please enter car name")
          return false
        }
        if (!carData.model.trim()) {
          Alert.alert("Error", "Please enter model year")
          return false
        }
        return true

      case 1: // Images
        if (!carData.bannerImage) {
          Alert.alert("Error", "Please upload a banner image")
          return false
        }
        return true

      case 2: // Pricing
        if (!carData.dailyPrice.trim()) {
          Alert.alert("Error", "Please enter daily rental price")
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleSaveOrPublish = (isDraft) => {
    // In a real app, this would call an API to save the car data
    Alert.alert("Success", isDraft ? "Car saved as draft" : "Car published successfully", [
      { text: "OK", onPress: () => navigation.navigate("MyCars") },
    ])
  }

  const handleMapPress = (e) => {
    setCarData({
      ...carData,
      location: e.nativeEvent.coordinate,
    })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Car Name</Text>
            <TextInput
              style={styles.input}
              value={carData.name}
              onChangeText={(text) => setCarData({ ...carData, name: text })}
              placeholder="e.g. Audi Q7 50 Quattro"
            />

            <Text style={styles.inputLabel}>Model Year</Text>
            <TextInput
              style={styles.input}
              value={carData.model}
              onChangeText={(text) => setCarData({ ...carData, model: text })}
              placeholder="e.g. 2023"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Horsepower</Text>
            <TextInput
              style={styles.input}
              value={carData.horsepower}
              onChangeText={(text) => setCarData({ ...carData, horsepower: text })}
              placeholder="e.g. 335 hp"
            />

            <Text style={styles.inputLabel}>Gear Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={carData.gearType}
                onValueChange={(value) => setCarData({ ...carData, gearType: value })}
                style={styles.picker}
              >
                <Picker.Item label="Automatic" value="Automatic" />
                <Picker.Item label="Manual" value="Manual" />
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Fuel Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={carData.fuelType}
                onValueChange={(value) => setCarData({ ...carData, fuelType: value })}
                style={styles.picker}
              >
                <Picker.Item label="Gasoline" value="Gasoline" />
                <Picker.Item label="Diesel" value="Diesel" />
                <Picker.Item label="Electric" value="Electric" />
                <Picker.Item label="Hybrid" value="Hybrid" />
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={carData.category}
                onValueChange={(value) => setCarData({ ...carData, category: value })}
                style={styles.picker}
              >
                <Picker.Item label="Business" value="Business" />
                <Picker.Item label="Family Trip" value="Family Trip" />
                <Picker.Item label="Wedding" value="Wedding" />
                <Picker.Item label="Luxury" value="Luxury" />
              </Picker>
            </View>
          </View>
        )
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Banner Image</Text>
            <ImagePicker
              image={carData.bannerImage}
              onImageSelected={(image) => setCarData({ ...carData, bannerImage: image })}
              style={styles.bannerPicker}
            />

            <Text style={styles.inputLabel}>Car Images (up to 5)</Text>
            <View style={styles.imagesContainer}>
              {[0, 1, 2, 3, 4].map((index) => (
                <ImagePicker
                  key={index}
                  image={carData.images[index]}
                  onImageSelected={(image) => {
                    const newImages = [...(carData.images || [])]
                    newImages[index] = image
                    setCarData({ ...carData, images: newImages })
                  }}
                  style={styles.imagePicker}
                />
              ))}
            </View>
          </View>
        )
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Daily Rental Price ($)</Text>
            <TextInput
              style={styles.input}
              value={carData.dailyPrice}
              onChangeText={(text) => setCarData({ ...carData, dailyPrice: text })}
              placeholder="e.g. 120"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Monthly Rental Price ($)</Text>
            <TextInput
              style={styles.input}
              value={carData.monthlyPrice}
              onChangeText={(text) => setCarData({ ...carData, monthlyPrice: text })}
              placeholder="e.g. 2800"
              keyboardType="numeric"
            />

            <View style={styles.topChoiceContainer}>
              <View>
                <Text style={styles.topChoiceTitle}>Top Choice Ad</Text>
                <Text style={styles.topChoiceDescription}>Get premium visibility for your car listing</Text>
              </View>
              <Switch
                value={carData.isTopChoice}
                onValueChange={(value) => setCarData({ ...carData, isTopChoice: value })}
                trackColor={{ false: "#D1D1D6", true: "#007EFD" }}
              />
            </View>
          </View>
        )
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.inputLabel}>Car Location (Tap to set location)</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: carData.location.latitude,
                  longitude: carData.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                <Marker coordinate={carData.location} title="Car Location" />
              </MapView>
            </View>

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address manually"
              multiline
              value={carData.address}
              onChangeText={(text) => setCarData({ ...carData, address: text })}
            />
          </View>
        )
      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.availabilityContainer}>
              <View>
                <Text style={styles.availabilityTitle}>Car Availability</Text>
                <Text style={styles.availabilityDescription}>Toggle off to hide your car from search results</Text>
              </View>
              <Switch
                value={carData.isAvailable}
                onValueChange={(value) => setCarData({ ...carData, isAvailable: value })}
                trackColor={{ false: "#D1D1D6", true: "#007EFD" }}
              />
            </View>

            <View style={styles.finalButtons}>
              <TouchableOpacity style={styles.draftButton} onPress={() => handleSaveOrPublish(true)}>
                <Text style={styles.draftButtonText}>Save as Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.publishButton} onPress={() => handleSaveOrPublish(false)}>
                <Text style={styles.publishButtonText}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Car" : "Add New Car"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <StepIndicator steps={steps} currentStep={currentStep} onStepPress={setCurrentStep} />

      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {currentStep < steps.length - 1 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  pickerContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  picker: {
    height: 50,
  },
  bannerPicker: {
    height: 150,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderStyle: "dashed",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  imagePicker: {
    width: "30%",
    aspectRatio: 1,
    margin: "1.66%",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderStyle: "dashed",
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topChoiceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  topChoiceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  topChoiceDescription: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    maxWidth: "80%",
  },
  availabilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  availabilityDescription: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    maxWidth: "80%",
  },
  finalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
  },
  draftButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  draftButtonText: {
    color: "#333333",
    fontWeight: "600",
  },
  publishButton: {
    flex: 1,
    backgroundColor: "#007EFD",
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  publishButtonText: {
    color: "white",
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  nextButton: {
    backgroundColor: "#007EFD",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "600",
    marginRight: 8,
  },
})

export default AddNewCarScreen

