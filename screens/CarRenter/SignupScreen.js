"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

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
import { signupAction } from "../../redux/action/signupAction"

const { width, height } = Dimensions.get("window")

const SignupScreen = ({ navigation }) => {
  const [userType, setUserType] = useState("renter") // 'renter' or 'owner'
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  })

  // Form validation errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verification: "",
  })

  // UI states
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)

  // Redux state
  const { isLoading, isSignupSuccess, isSignupFailed, error } = useSelector((state) => state.signup || {})

  const dispatch = useDispatch()

  // Handle input changes
  const handleChange = (field_name, value) => {
    setInputs({
      ...inputs,
      [field_name]: value,
    })
    // Clear error when user starts typing
    if (errors[field_name]) {
      setErrors({
        ...errors,
        [field_name]: "",
      })
    }
  }

  // Update placeholders when user type changes
  useEffect(() => {
    // Clear form and errors when switching user types
    clearForm()
  }, [userType])

  // Handle signup success
  useEffect(() => {
    const handleSignupSuccess = async () => {
      if (isSignupSuccess) {
        try {
          // Store user data in AsyncStorage
          const userData = {
            role: userType,
            name: inputs.name,
            email: inputs.email,
            phone: inputs.phone,
            password: inputs.password,
          }

          await AsyncStorage.setItem(`${userType}_${inputs.email}`, JSON.stringify(userData))
          await AsyncStorage.setItem("process", "signupComplete")
          await AsyncStorage.setItem("userEmail", inputs.email)

          // Show success modal
          setShowSuccessModal(true)

          // Redirect to login after a delay
          setTimeout(() => {
            setShowSuccessModal(false)
            navigation.navigate("LoginScreen")
          }, 2000)
        } catch (storageError) {
          console.log("Error storing user data:", storageError)
          Alert.alert("Error", "Account created but failed to save locally. Please try logging in.")
        }
      }
    }

    handleSignupSuccess()
  }, [isSignupSuccess])

  // Handle signup failure
  useEffect(() => {
    if (isSignupFailed && error) {
      Alert.alert("Signup Failed", error)
    }
  }, [isSignupFailed, error])

  const clearForm = () => {
    setInputs({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
    })
    setErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      verification: "",
    })
    setVerificationCode(["", "", "", "", ""])
  }

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Validate name
    if (!inputs.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    // Validate email
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!validateEmail(inputs.email)) {
      newErrors.email = "Enter a valid email address"
      isValid = false
    }

    // Validate phone
    if (!inputs.phone.trim()) {
      newErrors.phone = "Phone number is required"
      isValid = false
    } else if (!validatePhone(inputs.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number"
      isValid = false
    }

    // Validate password
    if (!inputs.password.trim()) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    // Validate confirm password
    if (!inputs.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required"
      isValid = false
    } else if (inputs.confirmPassword !== inputs.password) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignUp = async () => {
    console.log("Signup button clicked")
    const isValid = validateForm()

    if (!isValid) {
      console.log("Form validation failed")
      return
    }

    // Show verification modal instead of directly dispatching signup
    setShowVerificationModal(true)
  }

  const handleVerificationCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto focus next input
      if (value && index < 4) {
        // Focus next input (you might need to use refs for this in a real implementation)
      }
    }
  }

  const handleVerifyEmail = async () => {
    const enteredCode = verificationCode.join("")

    if (enteredCode.length !== 5) {
      setErrors({ ...errors, verification: "Please enter the complete verification code" })
      return
    }

    setIsVerifying(true)

    // Check if entered code matches default code "12345"
    if (enteredCode === "12345") {
      // Code is correct, proceed with signup
      setTimeout(async () => {
        setIsVerifying(false)
        setShowVerificationModal(false)

        const userData = {
          role: userType,
          name: inputs.name,
          email: inputs.email,
          phone: inputs.phone,
          password: inputs.password,
          isVerified: true,
        }

        console.log("Dispatching signupAction with:", userData)
        dispatch(signupAction(userData))
      }, 1500)
    } else {
      // Code is incorrect
      setTimeout(() => {
        setIsVerifying(false)
        setErrors({ ...errors, verification: "Invalid verification code. Please try again." })
      }, 1500)
    }
  }

  const handleResendCode = () => {
    Alert.alert("Code Resent", "A new verification code has been sent to your email.")
    setVerificationCode(["", "", "", "", ""])
    setErrors({ ...errors, verification: "" })
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

  const renderForm = () => {
    return (
      <View style={styles.form}>
        {/* Name Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={inputs.name}
            onChangeText={(value) => handleChange("name", value)}
            autoCapitalize="words"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={inputs.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {/* Phone Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            value={inputs.phone}
            onChangeText={(value) => handleChange("phone", value)}
            keyboardType="phone-pad"
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create password"
              placeholderTextColor="#999"
              secureTextEntry={secureTextEntry}
              value={inputs.password}
              onChangeText={(value) => handleChange("password", value)}
            />
            <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
              <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {/* Confirm Password Field */}
        <View style={styles.inputContainer}>
          <View style={[styles.passwordInputContainer, errors.confirmPassword && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm password"
              placeholderTextColor="#999"
              secureTextEntry={secureConfirmTextEntry}
              value={inputs.confirmPassword}
              onChangeText={(value) => handleChange("confirmPassword", value)}
            />
            <TouchableOpacity onPress={toggleSecureConfirmTextEntry} style={styles.eyeIcon}>
              <Ionicons name={secureConfirmTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
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

  const renderVerificationModal = () => {
    return (
      <Modal
        transparent={true}
        visible={showVerificationModal}
        animationType="slide"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.verificationModalContainer}>
          <View style={styles.verificationModalContent}>
            {/* Email Icon */}
            <View style={styles.emailIconContainer}>
              <Ionicons name="mail" size={40} color="#007EFD" />
            </View>

            {/* Title */}
            <Text style={styles.verificationTitle}>Check your email</Text>

            {/* Email Display */}
            <Text style={styles.emailDisplay}>{inputs.email}</Text>

            {/* Code Input */}
            <View style={styles.codeInputContainer}>
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[styles.codeInput, digit && styles.codeInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleVerificationCodeChange(index, value)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            {/* Error Message */}
            {errors.verification ? <Text style={styles.verificationErrorText}>{errors.verification}</Text> : null}

            {/* Resend Code */}
            <TouchableOpacity onPress={handleResendCode} style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't get a code? </Text>
              <Text style={styles.resendLink}>resend</Text>
            </TouchableOpacity>

            {/* Verify Button */}
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail} disabled={isVerifying}>
              {isVerifying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
            <Image source={require("../../assets/Group 15.jpg")} style={styles.backgroundImage} />
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

            {/* Form for both user types */}
            {renderForm()}

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

      {/* Verification Modal */}
      {renderVerificationModal()}

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
  // Verification Modal Styles
  verificationModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  verificationModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
  },
  emailIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emailDisplay: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  codeInputFilled: {
    borderColor: "#007EFD",
    backgroundColor: "#F0F8FF",
  },
  verificationErrorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 15,
    textAlign: "center",
  },
  resendContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: "#007EFD",
    fontWeight: "500",
  },
  verifyButton: {
    backgroundColor: "#007EFD",
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
})

export default SignupScreen
