"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("renter") // 'renter' or 'owner'
  const [rememberMe, setRememberMe] = useState(false)
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Retrieve stored credentials on component mount
  useEffect(() => {
    const getStoredCredentials = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail")
        const storedPassword = await AsyncStorage.getItem("userPassword")
        const storedRememberMe = await AsyncStorage.getItem("rememberMe")
        const storedUserType = await AsyncStorage.getItem("userType")

        if (storedRememberMe === "true" && storedEmail && storedPassword) {
          setEmail(storedEmail)
          setPassword(storedPassword)
          setRememberMe(true)
          if (storedUserType) {
            setUserType(storedUserType)
          }
        }
      } catch (error) {
        console.log("Error retrieving stored credentials:", error)
      }
    }

    getStoredCredentials()
  }, [])

  // Update placeholders when user type changes
  useEffect(() => {
    // Clear any errors when switching user types
    setEmailError("")
    setPasswordError("")
  }, [userType])

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    let isValid = true

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required")
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      isValid = false
    } else {
      setEmailError("")
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required")
      isValid = false
    } else {
      setPasswordError("")
    }

    return isValid
  }

  // Check if user exists in AsyncStorage for the specific user type
  const checkUserCredentials = async () => {
    try {
      // Check for user in AsyncStorage based on user type and email
      const userKey = `${userType}_${email}`
      const userData = await AsyncStorage.getItem(userKey)

      if (userData) {
        const user = JSON.parse(userData)
        // Verify that the user type matches the selected type
        if (user.userType === userType && user.password === password) {
          return true
        }
      }
      return false
    } catch (error) {
      console.log("Error checking user credentials:", error)
      return false
    }
  }

  const handleSignIn = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Default credentials based on user type
      const defaultRenterEmail = "renter@rushgo.com"
      const defaultRenterPassword = "1234"
      const defaultOwnerEmail = "owner@rushgo.com"
      const defaultOwnerPassword = "5678"

      let isAuthenticated = false

      // Check if credentials match based on user type (default credentials)
      if (userType === "renter" && email === defaultRenterEmail && password === defaultRenterPassword) {
        isAuthenticated = true
      } else if (userType === "owner" && email === defaultOwnerEmail && password === defaultOwnerPassword) {
        isAuthenticated = true
      } else {
        // Check if credentials match a user created during signup for the specific user type
        isAuthenticated = await checkUserCredentials()
      }

      if (isAuthenticated) {
        // Store credentials if "Remember me" is checked
        if (rememberMe) {
          await AsyncStorage.setItem("userEmail", email)
          await AsyncStorage.setItem("userPassword", password)
          await AsyncStorage.setItem("rememberMe", "true")
          await AsyncStorage.setItem("userType", userType)
        } else {
          // Clear stored credentials if "Remember me" is not checked
          await AsyncStorage.removeItem("userEmail")
          await AsyncStorage.removeItem("userPassword")
          await AsyncStorage.removeItem("rememberMe")
          await AsyncStorage.removeItem("userType")
        }

        // Navigate to appropriate screen based on user type
        if (userType === "renter") {
          navigation.navigate("Home")
        } else {
          navigation.navigate("CarOwnerDashboard")
        }
      } else {
        // Check if the user exists but with a different user type
        const otherUserType = userType === "renter" ? "owner" : "renter"
        const otherUserKey = `${otherUserType}_${email}`
        const otherUserData = await AsyncStorage.getItem(otherUserKey)

        if (otherUserData) {
          const otherUser = JSON.parse(otherUserData)
          if (otherUser.password === password) {
            Alert.alert(
              "Wrong User Type",
              `This email is registered as a ${otherUserType}. Please switch to the ${otherUserType} option to log in.`,
            )
          } else {
            Alert.alert("Login Failed", "Invalid email or password. Please try again.")
          }
        } else {
          Alert.alert("Login Failed", "Invalid email or password. Please try again.")
        }
      }
    } catch (error) {
      console.log("Error signing in:", error)
      Alert.alert("Error", "An error occurred while signing in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    Alert.alert("Google Sign In", "Google Sign In functionality will be implemented soon.")
  }

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe)
  }

  const handleSignUp = () => {
    if (userType === "renter") {
      navigation.navigate("CarRentalSignup")
    } else {
      navigation.navigate("CarOwnerSignup")
    }
  }

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={[styles.scrollView, { minHeight: height }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
        >
          {/* Top Section with Background Image */}
          <View style={styles.topSection}>
            <Image source={require("../../assets/Group 15.jpg")} style={styles.backgroundImage} />
          </View>

          {/* Bottom Section with White Background */}
          <View style={styles.bottomSection}>
            {/* Choose To Sign In Section */}
            <Text style={styles.signInHeading}>Choose To Sign In Us:</Text>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "renter" && styles.activeUserTypeButton]}
                onPress={() => setUserType("renter")}
              >
                <Text style={[styles.userTypeText, userType === "renter" && styles.activeUserTypeText]}>
                  Car Renter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "owner" && styles.activeUserTypeButton]}
                onPress={() => setUserType("owner")}
              >
                <Text style={[styles.userTypeText, userType === "owner" && styles.activeUserTypeText]}>Car Owner</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder={userType === "renter" ? "Enter renter email" : "Enter owner email"}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <View style={[styles.passwordInputContainer, passwordError && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={userType === "renter" ? "Enter renter password" : "Enter owner password"}
                    placeholderTextColor="#999"
                    secureTextEntry={secureTextEntry}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
                    <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Remember Me and Forgot Password */}
              <View style={styles.rememberContainer}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={toggleRememberMe}>
                  <View style={[styles.customCheckbox, rememberMe && styles.checkedCheckbox]}>
                    {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={isLoading}>
                <Text style={styles.signInButtonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
              </TouchableOpacity>

              {/* OR Divider */}
              <View style={styles.orContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                <Image source={require("../../assets/google-logo.png")} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              {/* Don't have an account */}
              <View style={styles.signupContainer}>
                <Text style={styles.noAccountText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupText}>Signup</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  topSection: {
    height: height * 0.25, // Reduced height to fit better
    width: "100%",
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 15,
  },
  signInHeading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#000",
  },
  userTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 30,
    height: 45,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userTypeButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeUserTypeButton: {
    backgroundColor: "#007EFD",
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#888",
  },
  activeUserTypeText: {
    color: "#fff",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  passwordInputContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#007EFD",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkedCheckbox: {
    backgroundColor: "#007EFD",
  },
  rememberText: {
    fontSize: 14,
    color: "#333",
  },
  forgotText: {
    fontSize: 14,
    color: "#007EFD",
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#007EFD",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    paddingHorizontal: 10,
    color: "#888",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: "contain",
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  noAccountText: {
    fontSize: 14,
    color: "#333",
  },
  signupText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
})

export default LoginScreen
