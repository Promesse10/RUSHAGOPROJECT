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
import { sendVerificationCodeAction } from "../../redux/action/verificationAction"

const { height } = Dimensions.get("window")

const SignupScreen = ({ navigation }) => {
  const [userType, setUserType] = useState("renter")
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")

  const { isLoading, isSignupSuccess, isSignupFailed, error } = useSelector((state) => state.signup || {})
  const { isSending, error: verificationError } = useSelector((state) => state.verification || {})

  const dispatch = useDispatch()

  // Countdown timer effect
  useEffect(() => {
    let interval = null
    if (showVerificationModal && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showVerificationModal, timeLeft])

  // Auto-fill simulation after showing modal
  useEffect(() => {
    if (showVerificationModal && generatedCode.length === 5) {
      const timer = setTimeout(() => {
        setVerificationCode(generatedCode.split(""))
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showVerificationModal, generatedCode])

  useEffect(() => {
    if (isSignupSuccess) {
      (async () => {
        try {
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
          setShowSuccessModal(true)
          setTimeout(() => {
            setShowSuccessModal(false)
            navigation.navigate("LoginScreen")
          }, 2000)
        } catch {
          Alert.alert("Error", "Account created but failed to save locally.")
        }
      })()
    }
  }, [isSignupSuccess])

  useEffect(() => {
    if (isSignupFailed && error) {
      Alert.alert("Signup Failed", error)
    }
  }, [isSignupFailed, error])

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email)
  const validatePhone = (phone) => /^\d{10}$/.test(phone)

  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    if (!inputs.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!validateEmail(inputs.email)) {
      newErrors.email = "Enter a valid email address"
      isValid = false
    }
    if (!inputs.phone.trim()) {
      newErrors.phone = "Phone number is required"
      isValid = false
    } else if (!validatePhone(inputs.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number"
      isValid = false
    }
    if (!inputs.password.trim()) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }
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

  const handleSignUp = () => {
    if (!validateForm()) return

    dispatch(sendVerificationCodeAction({
      email: inputs.email,
      userName: inputs.name,
    }))
      .unwrap()
      .then((code) => {
        setGeneratedCode(code)
        setVerificationCode(["", "", "", "", ""])
        setShowVerificationModal(true)
        setTimeLeft(300)
        setCanResend(false)
      })
      .catch((err) => {
        Alert.alert("Error", err || "Could not send verification code")
      })
  }

  const handleVerificationCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)
    }
  }

  const handleVerifyEmail = () => {
    const enteredCode = verificationCode.join("")
    if (enteredCode.length !== 5) {
      setErrors({ ...errors, verification: "Please enter the complete verification code" })
      return
    }
    setIsVerifying(true)

    if (enteredCode === generatedCode) {
      setTimeout(() => {
        setIsVerifying(false)
        setShowVerificationModal(false)
        dispatch(
          signupAction({
            role: userType,
            name: inputs.name,
            email: inputs.email,
            phone: inputs.phone,
            password: inputs.password,
            isVerified: true,
          })
        )
      }, 1000)
    } else {
      setTimeout(() => {
        setIsVerifying(false)
        setErrors({ ...errors, verification: "Invalid verification code. Please try again." })
      }, 1000)
    }
  }

  const handleResendCode = () => {
    if (!canResend) return

    dispatch(sendVerificationCodeAction({
      email: inputs.email,
      userName: inputs.name,
    }))
      .unwrap()
      .then((code) => {
        setGeneratedCode(code)
        setVerificationCode(["", "", "", "", ""])
        setErrors({ ...errors, verification: "" })
        setTimeLeft(300)
        setCanResend(false)
        Alert.alert("Success", "New verification code sent!")
      })
      .catch(() => {
        Alert.alert("Error", "Could not resend verification code")
      })
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry)
  const toggleSecureConfirmTextEntry = () => setSecureConfirmTextEntry(!secureConfirmTextEntry)
  const handleSignIn = () => navigation.navigate("LoginScreen")

  const renderForm = () => (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={inputs.name}
          onChangeText={(value) => setInputs({ ...inputs, name: value })}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={inputs.email}
          onChangeText={(value) => setInputs({ ...inputs, email: value })}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Enter your phone number"
          placeholderTextColor="#999"
          value={inputs.phone}
          onChangeText={(value) => setInputs({ ...inputs, phone: value })}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create password"
            placeholderTextColor="#999"
            secureTextEntry={secureTextEntry}
            value={inputs.password}
            onChangeText={(value) => setInputs({ ...inputs, password: value })}
          />
          <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
            <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <View style={[styles.passwordInputContainer, errors.confirmPassword && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            secureTextEntry={secureConfirmTextEntry}
            value={inputs.confirmPassword}
            onChangeText={(value) => setInputs({ ...inputs, confirmPassword: value })}
          />
          <TouchableOpacity onPress={toggleSecureConfirmTextEntry} style={styles.eyeIcon}>
            <Ionicons name={secureConfirmTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading || isSending}>
        {isLoading || isSending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  )

  const renderVerificationModal = () => (
    <Modal transparent visible={showVerificationModal} animationType="slide">
      <View style={styles.verificationModalContainer}>
        <View style={styles.verificationModalContent}>
          <Ionicons name="mail" size={40} color="#007EFD" style={{ marginBottom: 10 }} />
          <Text style={styles.verificationTitle}>Check your email</Text>
          <Text style={styles.emailDisplay}>{inputs.email}</Text>
          <Text style={styles.timerText}>
            {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : "Code expired"}
          </Text>
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
          {errors.verification && <Text style={styles.verificationErrorText}>{errors.verification}</Text>}
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={!canResend}
            style={[styles.resendContainer, !canResend && { opacity: 0.5 }]}
          >
            <Text style={styles.resendText}>
              {canResend ? "Resend code" : `Resend in ${formatTime(timeLeft)}`}
            </Text>
          </TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <Image source={require("../../assets/Group 15.jpg")} style={styles.backgroundImage} />
          </View>
          <View style={styles.bottomSection}>
            <Text style={styles.signUpHeading}>Choose To Sign Up As:</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "renter" && styles.activeUserTypeButton]}
                onPress={() => setUserType("renter")}
              >
                <Text style={[styles.userTypeText, userType === "renter" && styles.activeUserTypeText]}>Car Renter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "owner" && styles.activeUserTypeButton]}
                onPress={() => setUserType("owner")}
              >
                <Text style={[styles.userTypeText, userType === "owner" && styles.activeUserTypeText]}>Car Owner</Text>
              </TouchableOpacity>
            </View>
            {renderForm()}
            <View style={styles.signinContainer}>
              <Text style={styles.haveAccountText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signinText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderVerificationModal()}
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
    maxWidth: 400,
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
  resendDisabled: {
    opacity: 0.5,
  },
  resendLinkDisabled: {
    color: "#999",
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
  timerContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
})

export default SignupScreen
