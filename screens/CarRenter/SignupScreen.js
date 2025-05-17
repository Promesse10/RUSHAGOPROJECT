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
  ActivityIndicator,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

const SignupScreen = ({ navigation }) => {
  const [userType, setUserType] = useState("renter") // 'renter' or 'owner'
  const [step, setStep] = useState(1) // For car owner multi-step process
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")

  // Form validation errors
  const [fullNameError, setFullNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [verificationError, setVerificationError] = useState("")

  // UI states
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Update placeholders when user type changes
  useEffect(() => {
    // Clear form and errors when switching user types
    clearForm()
    setStep(1)
  }, [userType])

  const clearForm = () => {
    setFullName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setConfirmPassword("")
    setVerificationCode("")
    setFullNameError("")
    setEmailError("")
    setPhoneError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setVerificationError("")
  }

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const validateRenterForm = () => {
    let isValid = true

    // Validate full name
    if (!fullName.trim()) {
      setFullNameError("Full name is required")
      isValid = false
    } else {
      setFullNameError("")
    }

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
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    } else {
      setPasswordError("")
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required")
      isValid = false
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match")
      isValid = false
    } else {
      setConfirmPasswordError("")
    }

    return isValid
  }

  const validateOwnerEmailStep = () => {
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

    return isValid
  }

  const validateOwnerDetailsStep = () => {
    let isValid = true

    // Validate full name
    if (!fullName.trim()) {
      setFullNameError("Full name is required")
      isValid = false
    } else {
      setFullNameError("")
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    } else {
      setPasswordError("")
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required")
      isValid = false
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match")
      isValid = false
    } else {
      setConfirmPasswordError("")
    }

    return isValid
  }

  const handleVerifyEmail = () => {
    if (!validateOwnerEmailStep()) {
      return
    }

    setIsLoading(true)

    // Simulate email verification process
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
      // In a real app, you would send a verification code to the email
      // and then verify it in the next step
    }, 1500)
  }

  const handleSignUp = async () => {
    let isValid = false

    if (userType === "renter") {
      isValid = validateRenterForm()
    } else {
      isValid = validateOwnerDetailsStep()
    }

    if (!isValid) {
      return
    }

    setIsLoading(true)

    try {
      // Create user object based on user type
      const userData = {
        userType,
        fullName,
        email,
        password,
        phone: userType === "renter" ? "" : phone,
      }

      // Store user data in AsyncStorage
      await AsyncStorage.setItem(`${userType}_${email}`, JSON.stringify(userData))

      // Show success modal
      setShowSuccessModal(true)

      // Redirect to login after a delay
      setTimeout(() => {
        setShowSuccessModal(false)
        setIsLoading(false)
        navigation.navigate("LoginScreen")
      }, 2000)
    } catch (error) {
      console.log("Error signing up:", error)
      Alert.alert("Error", "An error occurred while signing up. Please try again.")
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    Alert.alert("Google Sign Up", "Google Sign Up functionality will be implemented soon.")
  }

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  const toggleSecureConfirmTextEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry)
  }

  const handleSignIn = () => {
    navigation.navigate("LoginScreen")
  }

  const renderRenterForm = () => {
    return (
      <View style={styles.form}>
        {/* Full Name Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, fullNameError && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Enter your email"
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
              placeholder="Create password"
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

        {/* Confirm Password Field */}
        <View style={styles.inputContainer}>
          <View style={[styles.passwordInputContainer, confirmPasswordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm password"
              placeholderTextColor="#999"
              secureTextEntry={secureConfirmTextEntry}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={toggleSecureConfirmTextEntry} style={styles.eyeIcon}>
              <Ionicons name={secureConfirmTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
          <Text style={styles.signUpButtonText}>{isLoading ? "Signing Up..." : "Sign Up"}</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
          <Image source={require("../../assets/google-logo.png")} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderOwnerEmailVerification = () => {
    return (
      <View style={styles.form}>
        <Text style={styles.verificationText}>
          Please enter your email address to verify your account as a car owner.
        </Text>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Verify Email Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleVerifyEmail} disabled={isLoading}>
          <Text style={styles.signUpButtonText}>{isLoading ? "Verifying..." : "Verify Email"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderOwnerDetailsForm = () => {
    return (
      <View style={styles.form}>
        <Text style={styles.verificationText}>Great! Now complete your profile information.</Text>

        {/* Full Name Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, fullNameError && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <View style={[styles.passwordInputContainer, passwordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create password"
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

        {/* Confirm Password Field */}
        <View style={styles.inputContainer}>
          <View style={[styles.passwordInputContainer, confirmPasswordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm password"
              placeholderTextColor="#999"
              secureTextEntry={secureConfirmTextEntry}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={toggleSecureConfirmTextEntry} style={styles.eyeIcon}>
              <Ionicons name={secureConfirmTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        {/* Phone Field (Optional for car owner) */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, phoneError && styles.inputError]}
            placeholder="Enter your phone number (optional)"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
          <Text style={styles.signUpButtonText}>{isLoading ? "Signing Up..." : "Sign Up"}</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
          <Image source={require("../../assets/google-logo.png")} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Section with Background Image */}
          <View style={styles.topSection}>
            <Image source={require("../../assets/Screenshot 2025-05-16 at 10.22.10 PM.png")} style={styles.backgroundImage} />
          </View>

          {/* Bottom Section with White Background */}
          <View style={styles.bottomSection}>
            {/* Choose To Sign Up Section */}
            <Text style={styles.signUpHeading}>Choose To Sign Up As:</Text>

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

            {/* Form based on user type and step */}
            {userType === "renter"
              ? renderRenterForm()
              : step === 1
                ? renderOwnerEmailVerification()
                : renderOwnerDetailsForm()}

            {/* Already have an account */}
            <View style={styles.signinContainer}>
              <Text style={styles.haveAccountText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signinText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007EFD" />
            <Text style={styles.modalText}>Account created successfully!</Text>
            <Text style={styles.modalSubText}>Redirecting to login...</Text>
          </View>
        </View>
      </Modal>
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
    height: height * 0.25,
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
  signUpHeading: {
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
  verificationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
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
  signUpButton: {
    backgroundColor: "#007EFD",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  signUpButtonText: {
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
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  haveAccountText: {
    fontSize: 14,
    color: "#333",
  },
  signinText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  modalSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
})

export default SignupScreen
