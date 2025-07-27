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
  const [step, setStep] = useState(1) // For car owner multi-step process
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

  // Redux state
const { isLoading, isSignupSuccess, isSignupFailed, error } = useSelector(
  (state) => state.signup || {}
);
  
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
    setStep(1)
    // dispatch(clearSignupState());
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
            // dispatch(clearSignupState());
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

  const validateOwnerEmailStep = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Validate email
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!validateEmail(inputs.email)) {
      newErrors.email = "Enter a valid email address"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleVerifyEmail = () => {
    if (!validateOwnerEmailStep()) {
      return
    }

    // Simulate email verification process
    setTimeout(() => {
      setStep(2)
      // In a real app, you would send a verification code to the email
      // and then verify it in the next step
    }, 1500)
  }

  const handleSignUp = async () => {
    console.log("Signup button clicked");
    let isValid = validateForm();
  
    if (!isValid) {
      console.log("Form validation failed");
      return;
    }
  
    const userData = {
      role: userType,  
      
      name: inputs.name,
      email: inputs.email,
      phone: inputs.phone,
      password: inputs.password,
      isVerified: false,
    };
  
    console.log("Dispatching signupAction with:", userData);
    dispatch(signupAction(userData));
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
        {isLoading 
  ? <ActivityIndicator color="#fff" size="small" /> 
  : <Text style={styles.signUpButtonText}>Sign Up</Text>
}

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

// Styles remain the same as in your original file
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