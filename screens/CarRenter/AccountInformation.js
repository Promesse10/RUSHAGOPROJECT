"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { ChevronLeft, Edit2, Eye, EyeOff } from "react-native-feather"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
// First, add the import for the cloudinary image utility at the top of the file
import { cloudinaryImages, getCloudinaryImage } from "../../utils/image-loader"

// Import icon images
const userIcon = getCloudinaryImage(cloudinaryImages.ui.user)
const mailIcon = getCloudinaryImage("https://res.cloudinary.com/def0cjmh2/image/upload/v1747228483/mail_icon.png") // You'll need to upload this
const lockIcon = getCloudinaryImage("https://res.cloudinary.com/def0cjmh2/image/upload/v1747228483/padlock.png") // You'll need to upload this
const locationIcon = getCloudinaryImage(cloudinaryImages.ui.carMarker)

const AccountInformation = () => {
  const navigation = useNavigation()
  const [fullName, setFullName] = useState("Saski Ropokova")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  // Update the profileImage state
  const [profileImage, setProfileImage] = useState(getCloudinaryImage(cloudinaryImages.ui.profilePhoto))
  const [location, setLocation] = useState("Kigali, Rwanda")
  const [initialEmail] = useState("")

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedFullName = await AsyncStorage.getItem("fullName")
        const savedEmail = await AsyncStorage.getItem("email")
        const savedPassword = await AsyncStorage.getItem("password")
        const savedProfileImage = await AsyncStorage.getItem("profileImage")
        const savedLocation = await AsyncStorage.getItem("location")

        if (savedFullName) setFullName(savedFullName)
        if (savedEmail) {
          setEmail(savedEmail)
          setIsEmailVerified(savedEmail === initialEmail)
        }
        if (savedPassword) setPassword(savedPassword)
        if (savedProfileImage) setProfileImage({ uri: savedProfileImage })
        if (savedLocation) setLocation(savedLocation)
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
    loadSavedData()
    ;(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Sorry, we need camera roll permissions to select images!")
      }
    })()
  }, [])

  const navigateBack = () => {
    navigation.goBack()
  }

  // Update the handleChangeProfileImage function to work with Cloudinary URLs
  const handleChangeProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      // In a real app, you would upload this to Cloudinary here
      // For now, we'll just set the local URI
      setProfileImage({ uri: result.assets[0].uri })
    }
  }

  const handleEmailVerificationPress = () => {
    if (!isEmailVerified && email !== initialEmail) {
      Alert.prompt(
        "Enter OTP",
        "An OTP (1234) has been sent to your email. Please enter it to verify:",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Verify",
            onPress: (otp) => {
              if (otp === "1234") {
                setIsEmailVerified(true)
                Alert.alert("Success", "Email verified successfully!")
              } else {
                Alert.alert("Error", "Invalid OTP. Please try again.")
              }
            },
          },
        ],
        "plain-text",
      )
    }
  }

  const handleSaveChanges = async () => {
    try {
      await AsyncStorage.setItem("fullName", fullName)
      await AsyncStorage.setItem("email", email)
      await AsyncStorage.setItem("password", password)
      if (typeof profileImage === "object" && profileImage.uri) {
        await AsyncStorage.setItem("profileImage", profileImage.uri)
      }
      await AsyncStorage.setItem("location", location)
      Alert.alert("Success", "Changes saved successfully!")

      // Auto-update HomeScreen by navigating back and refreshing
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    } catch (error) {
      console.error("Error saving changes:", error)
      Alert.alert("Error", "Failed to save changes. Please try again.")
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={navigateBack}>
              <ChevronLeft width={24} height={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit account</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.profileImageContainer}>
            <Image source={profileImage} style={styles.profileImage} />
            <TouchableOpacity style={styles.editImageButton} onPress={handleChangeProfileImage}>
              <Edit2 width={20} height={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full name</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Image source={userIcon} style={styles.iconImage} resizeMode="contain" />
              </View>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email address</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Image source={mailIcon} style={styles.iconImage} resizeMode="contain" />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setIsEmailVerified(text === initialEmail)
                }}
                placeholder="Enter your email address"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[styles.verificationBadge, !isEmailVerified && styles.unverifiedBadge]}
                onPress={handleEmailVerificationPress}
              >
                <Text style={[styles.verificationText, !isEmailVerified && styles.unverifiedText]}>
                  {isEmailVerified ? "Verified" : "Unverified"}
                </Text>
                <ChevronLeft
                  width={16}
                  height={16}
                  color={isEmailVerified ? "#4CAF50" : "#FF3B30"}
                  style={{ transform: [{ rotate: "180deg" }] }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Image source={locationIcon} style={styles.iconImage} resizeMode="contain" />
              </View>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your location"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Image source={lockIcon} style={styles.iconImage} resizeMode="contain" />
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff width={20} height={20} color="#999" />
                ) : (
                  <Eye width={20} height={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Change</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    backgroundColor: "#007EFD",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#007EFD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#999",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: "center",
  },
  iconImage: {
    width: 20,
    height: 20,

    resizeMode: "contain",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  verificationText: {
    fontSize: 12,
    color: "#4CAF50",
    marginRight: 5,
  },
  unverifiedBadge: {
    backgroundColor: "#FFEBEE",
  },
  unverifiedText: {
    color: "#FF3B30",
  },
  eyeButton: {
    padding: 10,
  },
  saveButton: {
    backgroundColor: "#007EFD",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default AccountInformation
