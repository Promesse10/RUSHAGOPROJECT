"use client"


import React, { useState, useEffect, useRef, useCallback } from "react";

import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux"
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
  Linking,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  sendForgotEmailOtpAction,
  verifyOtpAndUpdateEmailAction,
  sendPasswordResetEmailAction,
  resetPasswordAction,
  sendRecoveryFormAction,
} from "../redux/action/AuthRecoveryActions"
import { clearAuthRecoveryState } from "../redux/slices/authRecoverySlice"

const { width, height } = Dimensions.get("window")

const ForgotPasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const { isLoading, error, otpSent, emailUpdated, resetEmailSent, passwordReset, generatedOtp } = useSelector(
    (state) => state.authRecovery,
  )

  // Track recovery type: 'email' or 'password'
  const [recoveryType, setRecoveryType] = useState(null)
  const [step, setStep] = useState(1)

  // Forgot Email fields
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])
  const [newEmail, setNewEmail] = useState("")

  // Forgot Password fields
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secureNewPassword, setSecureNewPassword] = useState(true)
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true)

  // Errors
  const [phoneError, setPhoneError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  // Timer
  const [timeLeft, setTimeLeft] = useState(300) // Updated timer to 5 minutes (300 seconds) instead of 2 minutes
  const [timerActive, setTimerActive] = useState(false)

  const otpInputRefs = useRef([])

  // Timer countdown
  useEffect(() => {
    let timer
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0) {
      setTimerActive(false)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timerActive, timeLeft])
useFocusEffect(
  useCallback(() => {
    dispatch(clearAuthRecoveryState());
  }, [])
);


  // Handle OTP sent
  useEffect(() => {
    if (otpSent) {
      console.log("[v0] OTP sent successfully, showing verification modal")
      setStep(2)
      setTimeLeft(300) // 5 minutes timer
      setTimerActive(true)
    }
  }, [otpSent])

  // Handle email updated
  useEffect(() => {
    if (emailUpdated) {
      setStep(3)
      Alert.alert("Success", "Your email has been updated successfully!")
    }
  }, [emailUpdated])

  // Handle reset email sent
  useEffect(() => {
    if (resetEmailSent) {
      setStep(2)
      Alert.alert(
        "Email Sent",
        "Check your email for the password reset link.",
        [
          {
            text: "Open Mail App",
            onPress: () => {
              try {
                Linking.openURL("mailto:"); // opens default mail app
              } catch (error) {
                console.error("Could not open mail app:", error);
              }
            },
          },
          { text: "OK" },
        ]
      )
      
    }
  }, [resetEmailSent])

  // Handle password reset
  useEffect(() => {
    if (passwordReset) {
      setStep(3)
    }
  }, [passwordReset])

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error)
    }
  }, [error])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  // ========== FORGOT EMAIL FLOW ==========
  const handleSendOtp = () => {
    if (!phone.trim()) {
      setPhoneError("Phone number is required")
      return
    } else if (!validatePhone(phone)) {
      setPhoneError("Enter a valid phone number (e.g., +1234567890)")
      return
    } else {
      setPhoneError("")
    }

    dispatch(sendForgotEmailOtpAction({ phone }))
  }

  const handleResendOtp = () => {
    dispatch(sendForgotEmailOtpAction({ phone }))
    setOtpCode(["", "", "", "", "", ""])
    setOtpError("")
  }

  const handleOtpChange = (text, index) => {
    const newOtpCode = [...otpCode]
    newOtpCode[index] = text
    setOtpCode(newOtpCode)
    setOtpError("")

    if (text && index < 5) {
      otpInputRefs.current[index + 1].focus()
    }
  }

  const handleVerifyOtpAndUpdateEmail = () => {
    const enteredOtp = otpCode.join("")

    if (enteredOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit code")
      return
    }

    if (!newEmail.trim()) {
      setEmailError("New email is required")
      return
    } else if (!validateEmail(newEmail)) {
      setEmailError("Enter a valid email address")
      return
    } else {
      setEmailError("")
    }

    if (!timerActive && timeLeft === 0) {
      setOtpError("Code expired. Please request a new code")
      return
    }

    dispatch(verifyOtpAndUpdateEmailAction({ phone, otp: enteredOtp, newEmail }))
  }

  const handleSendResetEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required")
      return
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    } else {
      setEmailError("")
    }
  
    dispatch(sendPasswordResetEmailAction({ email }))
      .unwrap()
      .then(() => {
        Alert.alert(
          "Check Your Email",
          "We've sent a password reset link. Would you like to open your email app now?",
          [
            {
              text: "Open Mail",
              onPress: () => {
                // Open the default mail app on the device
                try {
                  Linking.openURL("mailto:")
                } catch (err) {
                  console.error("Could not open mail app:", err)
                  Alert.alert("Error", "Could not open your email app.")
                }
              },
            },
            { text: "Later", style: "cancel" },
          ],
        )
      })
      .catch((err) => {
        console.error("sendResetEmail error:", err)
        Alert.alert("Error", err || "Failed to send reset email")
      })
  }
  
  const handleResetPassword = () => {
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

    // In a real app, you'd extract the token from the email link
    // For now, we'll use a placeholder
    dispatch(resetPasswordAction({ token: resetToken, newPassword }))
  }

  const handleBackToLogin = () => {
    dispatch(clearAuthRecoveryState())
    navigation.navigate("LoginScreen")
  }

  // ========== RENDER SELECTION SCREEN ==========
  const renderSelectionScreen = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Account Recovery</Text>
        <Text style={styles.subtitle}>Choose how you want to recover your account</Text>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            setRecoveryType("email")
            setStep(1)
          }}
        >
          <Ionicons name="mail-outline" size={32} color="#007EFD" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Forgot Email</Text>
            <Text style={styles.optionSubtitle}>Use phone number to update email</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            setRecoveryType("password")
            setStep(1)
          }}
        >
          <Ionicons name="lock-closed-outline" size={32} color="#007EFD" />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Forgot Password</Text>
            <Text style={styles.optionSubtitle}>Reset password via email</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
       <TouchableOpacity
         style={styles.optionButton}
  onPress={() => {
    Alert.alert(
      "Account Recovery",
      "You can recover your account by either calling our helpline or receiving the account recovery form via email. Follow the instructions carefully.",
      [
        {
          text: "Call Us",
          onPress: () => {
            Linking.openURL("tel:0780114522").catch(() => {
              Alert.alert("Error", "Could not initiate call. Please dial manually.");
            });
          },
        },
        {
          text: "Use Email",
          onPress: () => {
            Alert.prompt(
              "Enter your registered email",
              "We will send you the account recovery form. After receiving, download it, fill it, scan it, and send it back to our email.",
              [
                {
                  text: "Send",
                  onPress: (email) => {
                    if (!validateEmail(email)) {
                      Alert.alert("Error", "Enter a valid email");
                      return;
                    }
                    dispatch(sendRecoveryFormAction({ email }))
                      .unwrap()
                      .then(() => {
                        Alert.alert(
                          "Email Sent",
                          "Check your email for the account recovery form. Download, fill it, scan it, and send it back to our email."
                        );
                      })
                      .catch(() => {
                        Alert.alert("Error", "Failed to send email. Try again later.");
                      });
                  },
                },
                { text: "Cancel", style: "cancel" },
              ],
              "plain-text"
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }}
      >
        <Ionicons name="help-circle-outline" size={32} color="#007EFD" />
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Contact Support</Text>
          <Text style={styles.optionSubtitle}>Receive account recovery form via email</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </TouchableOpacity>
        <View style={styles.loginLinkContainer}>
          <Text style={styles.rememberText}>Remember your credentials? </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ========== FORGOT EMAIL SCREENS ==========
  const renderForgotEmailPhoneStep = () => {
    return (
      <View style={styles.stepContainer}>
        <TouchableOpacity onPress={() => setRecoveryType(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Email?</Text>
        <Text style={styles.subtitle}>Enter your phone number to receive a verification code</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={[styles.input, phoneError && styles.inputError]}
            placeholder="+1234567890"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={(text) => {
              setPhone(text)
              setPhoneError("")
            }}
            keyboardType="phone-pad"
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? "Sending..." : "Send Code"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderForgotEmailOtpStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your phone</Text>

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
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                  otpInputRefs.current[index - 1].focus()
                }
              }}
            />
          ))}
        </View>

        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Email</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="your-new-email@example.com"
            placeholderTextColor="#999"
            value={newEmail}
            onChangeText={(text) => {
              setNewEmail(text)
              setEmailError("")
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtpAndUpdateEmail} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? "Verifying..." : "Update Email"}</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {timerActive ? (
            <Text style={styles.timerText}>Resend code in {formatTime(timeLeft)}</Text>
          ) : (
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    )
  }

  // ========== FORGOT PASSWORD SCREENS ==========
  const renderForgotPasswordEmailStep = () => {
    return (
      <View style={styles.stepContainer}>
        <TouchableOpacity onPress={() => setRecoveryType(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email to receive a password reset link</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            placeholder="your-email@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setEmailError("")
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSendResetEmail} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? "Sending..." : "Send Reset Link"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderResetPasswordStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>Your new password must be different from previous passwords</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={[styles.passwordInputContainer, passwordError && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="At least 6 characters"
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
          <Text style={styles.primaryButtonText}>{isLoading ? "Resetting..." : "Reset Password"}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ========== SUCCESS SCREEN ==========
  const renderSuccessStep = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>{recoveryType === "email" ? "Email Updated!" : "Password Changed!"}</Text>
        <Text style={styles.subtitle}>
          {recoveryType === "email"
            ? "Your email has been updated successfully"
            : "Your password has been changed successfully"}
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleBackToLogin}>
          <Text style={styles.primaryButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.content}>
          {!recoveryType && renderSelectionScreen()}
          {recoveryType === "email" && step === 1 && renderForgotEmailPhoneStep()}
          {recoveryType === "email" && step === 2 && renderForgotEmailOtpStep()}
          {recoveryType === "password" && step === 1 && renderForgotPasswordEmailStep()}
          {recoveryType === "password" && step === 2 && renderResetPasswordStep()}
          {step === 3 && renderSuccessStep()}
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
  backButton: {
    marginBottom: 20,
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
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
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
    marginTop: 20,
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
    width: 50,
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
