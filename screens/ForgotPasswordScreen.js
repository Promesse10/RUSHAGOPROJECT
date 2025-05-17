"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

const ForgotPasswordScreen = ({ navigation }) => {
  // Track the current step in the password reset flow
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState(["", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secureNewPassword, setSecureNewPassword] = useState(true)
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [timerActive, setTimerActive] = useState(false)
  const [generatedOTP, setGeneratedOTP] = useState("")

  // References for OTP input fields
  const otpInputRefs = useRef([])

  // Timer for OTP expiration
  useEffect(() => {
    let timer
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setTimerActive(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timerActive, timeLeft])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  const handleSendCode = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required")
      return
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    } else {
      setEmailError("")
    }

    setIsLoading(true)

    try {
      // Check if the email exists in AsyncStorage (either as renter or owner)
      const renterKey = `renter_${email}`
      const ownerKey = `owner_${email}`
      const renterData = await AsyncStorage.getItem(renterKey)
      const ownerData = await AsyncStorage.getItem(ownerKey)

      if (!renterData && !ownerData) {
        setEmailError("No account found with this email address")
        setIsLoading(false)
        return
      }

      // Generate a random 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString()
      setGeneratedOTP(otp)
      console.log("Generated OTP:", otp) // For testing purposes

      // Reset OTP timer
      setTimeLeft(120)
      setTimerActive(true)

      // Move to OTP verification step
      setTimeout(() => {
        setIsLoading(false)
        setStep(2)
      }, 1000)
    } catch (error) {
      console.log("Error sending code:", error)
      Alert.alert("Error", "An error occurred while sending the code. Please try again.")
      setIsLoading(false)
    }
  }

  const handleResendCode = () => {
    // Generate a new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedOTP(otp)
    console.log("New OTP:", otp) // For testing purposes

    // Reset OTP timer
    setTimeLeft(120)
    setTimerActive(true)

    // Clear previous OTP input
    setOtpCode(["", "", "", ""])
    setOtpError("")

    // Show confirmation
    Alert.alert("Code Sent", "A new verification code has been sent to your email.")
  }

  const handleOtpChange = (text, index) => {
    // Update the OTP code array
    const newOtpCode = [...otpCode]
    newOtpCode[index] = text

    setOtpCode(newOtpCode)
    setOtpError("")

    // Auto-focus next input if current input is filled
    if (text && index < 3) {
      otpInputRefs.current[index + 1].focus()
    }
  }

  const handleVerifyOtp = () => {
    const enteredOtp = otpCode.join("")

    if (enteredOtp.length !== 4) {
      setOtpError("Please enter the complete verification code")
      return
    }

    if (!timerActive && timeLeft === 0) {
      setOtpError("Code expired. Please request a new code")
      return
    }

    if (enteredOtp === generatedOTP) {
      // OTP is correct, move to reset password step
      setStep(3)
      setOtpError("")
    } else {
      setOtpError("Wrong code, please try again")
    }
  }

  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword.trim()) {
      setPasswordError("New password is required")
      return
    } else if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    } else {
      setPasswordError("")
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required")
      return
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match")
      return
    } else {
      setConfirmPasswordError("")
    }

    setIsLoading(true)

    try {
      // Update password in AsyncStorage for both user types if they exist
      const renterKey = `renter_${email}`
      const ownerKey = `owner_${email}`
      const renterData = await AsyncStorage.getItem(renterKey)
      const ownerData = await AsyncStorage.getItem(ownerKey)

      if (renterData) {
        const renterUser = JSON.parse(renterData)
        renterUser.password = newPassword
        await AsyncStorage.setItem(renterKey, JSON.stringify(renterUser))
      }

      if (ownerData) {
        const ownerUser = JSON.parse(ownerData)
        ownerUser.password = newPassword
        await AsyncStorage.setItem(ownerKey, JSON.stringify(ownerUser))
      }

      // Move to success step
      setTimeout(() => {
        setIsLoading(false)
        setStep(4)
      }, 1000)
    } catch (error) {
      console.log("Error resetting password:", error)
      Alert.alert("Error", "An error occurred while resetting your password. Please try again.")
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigation.navigate("LoginScreen")
  }

  // Render the email input step
  const renderEmailStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Don't worry! It occurs. Please enter the email address linked with your account.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="Your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setEmailError("")
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? "Sending..." : "Send Code"}</Text>
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.rememberText}>Remember Password? </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Render the OTP verification step
  const renderOtpStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the verification code we just sent on your email address.</Text>

        <View style={styles.otpContainer}>
          {otpCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpInputRefs.current[index] = ref)}
              style={[styles.otpInput, otpError && styles.otpInputError]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text.replace(/[^0-9]/g, ""), index)}
              keyboardType="number-pad"
              maxLength={1}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                  otpInputRefs.current[index - 1].focus()
                }
              }}
            />
          ))}
        </View>

        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>Verify</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {timerActive ? (
            <Text style={styles.timerText}>Send code again {formatTime(timeLeft)}</Text>
          ) : (
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>I didn't receive a code. </Text>
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    )
  }

  // Render the reset password step
  const renderResetPasswordStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.subtitle}>Your new password must be unique from those previously used.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={[styles.passwordInputContainer, passwordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter at least 6 characters"
              placeholderTextColor="#999"
              secureTextEntry={secureNewPassword}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                setPasswordError("")
              }}
            />
            <TouchableOpacity onPress={() => setSecureNewPassword(!secureNewPassword)} style={styles.eyeIcon}>
              <Ionicons name={secureNewPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.passwordInputContainer, confirmPasswordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repeat password"
              placeholderTextColor="#999"
              secureTextEntry={secureConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text)
                setConfirmPasswordError("")
              }}
            />
            <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={secureConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? "Resetting..." : "Reset password"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Render the success step
  const renderSuccessStep = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Password Changed!</Text>
        <Text style={styles.subtitle}>Your password has been changed successfully.</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleBackToLogin}>
          <Text style={styles.primaryButtonText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.content}>
          {step === 1 && renderEmailStep()}
          {step === 2 && renderOtpStep()}
          {step === 3 && renderResetPasswordStep()}
          {step === 4 && renderSuccessStep()}
        </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  stepContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputError: {
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  primaryButton: {
    backgroundColor: "#007EFD",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 14,
    color: "#333",
  },
  loginLink: {
    fontSize: 14,
    color: "#007EFD",
    fontWeight: "bold",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
  },
  otpInputError: {
    borderColor: "red",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#333",
  },
  resendLink: {
    fontSize: 14,
    color: "#007EFD",
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 14,
    color: "#666",
  },
  successIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007EFD",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ForgotPasswordScreen
