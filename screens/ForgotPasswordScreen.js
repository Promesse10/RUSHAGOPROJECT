// ForgotPasswordScreen.jsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  verifyPasswordResetOtpAction,
  sendForgotEmailOtpAction,
  verifyOtpAndUpdateEmailAction,
  verifyOtpAction,
  sendPasswordResetEmailAction,
  resetPasswordAction,
  sendRecoveryFormAction,
} from "../redux/action/AuthRecoveryActions"
import { clearAuthRecoveryState, setRecoveryContact, clearOtpVerification, clearError } from "../redux/slices/authRecoverySlice"

const { width, height } = Dimensions.get("window")

const ForgotPasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const {
    isLoading,
    error,
    otpSent,
    emailUpdated,
    resetEmailSent,
    passwordReset,
    generatedOtp,
    maskedEmail,
    profilePic,
    otpVerified,
    fullName: storedname,
    selectedPhone: storedPhone,
  } = useSelector((state) => state.authRecovery)

  // Track recovery type: 'email' or 'password'
  const [recoveryType, setRecoveryType] = useState(null)
  const [step, setStep] = useState(1)
  
  // Forgot Email fields
  const [fullName, setFullName] = useState(storedname|| "")
  const [phone, setPhone] = useState(storedPhone || "")
  const [otpCode, setOtpCode] = useState("") // single OTP input
  const [newEmail, setNewEmail] = useState("")

  // Forgot Password fields
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  // Forgot Password OTP
const [passwordOtp, setPasswordOtp] = useState("");
const [passwordResetSession, setPasswordResetSession] = useState(null);

  const [confirmPassword, setConfirmPassword] = useState("")
  const [secureNewPassword, setSecureNewPassword] = useState(true)
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true)

  // Errors
  const [phoneError, setPhoneError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [nameError, setNameError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  // Timer
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [timerActive, setTimerActive] = useState(false)
  const [emailOtp, setEmailOtp] = useState("");
const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  const otpInputRef = useRef(null)

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


  // When OTP sent -> show OTP entry
  useEffect(() => {
    if (otpSent) {
      setStep(2)
      setTimeLeft(300)
      setTimerActive(true)
      // focus OTP input
      setTimeout(() => {
        otpInputRef.current?.focus()
      }, 300)
    }
  }, [otpSent])

  // When verify-only succeeded (maskedEmail available)
  useEffect(() => {
    if (otpVerified && maskedEmail) {
      // move to confirmation step where user can choose continue or update
      setStep(2) // keep same step but show confirmed UI
      setTimerActive(false) // stop timer for display; server still enforces TTL
    }
  }, [otpVerified, maskedEmail])

  // When email updated
  useEffect(() => {
    if (emailUpdated) {
      setStep(3)
      Alert.alert(
        "Success",
        "Your email has been updated successfully. Please sign in with your new email.",
        [
          {
            text: "Sign In",
            onPress: async () => {
              try {
                // optional: clear token storage
              } catch (err) {
                console.warn("Failed to clear token:", err)
              }
              dispatch(clearAuthRecoveryState())
             navigation.reset({
  index: 0,
  routes: [
    {
      name: "LoginScreen",
      params: {
        recoveredEmail: maskedEmail.replace("XXXX", ""), // optional
      },
    },
  ],
});

            },
          },
        ]
      )
    }
  }, [emailUpdated])

  // When reset email sent
useEffect(() => {
  if (passwordReset) {
    setStep(4); // ✅ SUCCESS STEP
  }
}, [passwordReset]);


  // When password reset
  useEffect(() => {
    if (passwordReset) {
      setStep(3)
      Alert.alert("Success", "Your password has been changed. Please sign in again.", [
        {
          text: "OK",
          onPress: async () => {
            try {
              // clear token if needed
            } catch (err) {
              console.warn("Failed to clear token:", err)
            }
            dispatch(clearAuthRecoveryState())
            navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] })
          },
        },
      ])
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
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^\+?[1-9]\d{7,14}$/.test(cleaned);
};

const normalizePhone = (phone) => {
  let cleaned = (phone || "").replace(/[\s\-()]/g, "");
  if (!cleaned.startsWith("+")) cleaned = `+${cleaned}`;
  return cleaned;
};
const handleVerifyPasswordOtp = (otp) => {
  if (otp.length !== 6) return;

  dispatch(verifyPasswordResetOtpAction({ email, otp }))
    .unwrap()
    .then(() => {
      setTimerActive(false);
      setStep(3); // go to create new password
    })
    .catch((err) => {
      Alert.alert("Invalid or expired code");
      setPasswordOtp("");
    });
};


// ========== FORGOT EMAIL FLOW ==========
// send OTP (use DB field name "name")
const handleSendOtp = () => {
  if (!fullName.trim()) {
    setNameError("Full name is required");
    return;
  } else setNameError("");

  if (!phone.trim()) {
    setPhoneError("Phone number is required");
    return;
  } else if (!validatePhone(phone)) {
    setPhoneError("Enter a valid phone number (e.g., +1234567890)");
    return;
  } else {
    setPhoneError("");
  }

  const payload = { name: fullName.trim(), phone: normalizePhone(phone) };
  dispatch(setRecoveryContact({ fullName: fullName.trim(), phone: normalizePhone(phone) }));
  dispatch(sendForgotEmailOtpAction(payload));
};

const handleResendOtp = () => {
  const payload = { name: fullName.trim(), phone: normalizePhone(phone) };
  dispatch(sendForgotEmailOtpAction(payload));
  setOtpCode("");
  setOtpError("");
  setTimeLeft(300);
  setTimerActive(true);
};

// When OTP single-input changes (auto-verify on 6 digits)
const handleOtpChange = (text) => {
  const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
  setOtpCode(cleaned);
  setOtpError("");
  if (cleaned.length === 6) {
    // auto verify to reveal masked email
    handleVerifyOtpOnly(cleaned);
  }
};

// Verify OTP only -> returns masked email + profile (does NOT change email)
const handleVerifyOtpOnly = (value) => {
  const code = value || otpCode;
  if (code.length !== 6) {
    setOtpError("Please enter the complete 6-digit code");
    return;
  }
  if (!timerActive && timeLeft === 0) {
    setOtpError("Code expired. Please request a new code");
    return;
  }

  dispatch(verifyOtpAction({
    phone: normalizePhone(phone),
    otp: code,
    
  }))
    .then(() => {
      // success handled via slice: maskedEmail, profilePic, otpVerified true
      // step remains 2 but UI will show masked card
    })
    .catch((err) => {
      console.error("verifyOtpOnly error:", err);
      setOtpError(err?.message || "Invalid OTP");
      setOtpCode("");
      dispatch(clearError());
      // Allow resend immediately if OTP not found
      if (err?.message?.includes("OTP not found")) {
        setTimerActive(false);
      }
    });
};

// Update email using OTP (server will verify OTP again and update)
const handleVerifyOtpAndUpdateEmail = () => {
  if (otpCode.length !== 6) {
    setOtpError("Please enter the complete 6-digit code");
    return;
  }
  if (!newEmail.trim()) {
    setEmailError("New email is required");
    return;
  } else if (!validateEmail(newEmail)) {
    setEmailError("Enter a valid email address");
    return;
  } else {
    setEmailError("");
  }

  dispatch(verifyOtpAndUpdateEmailAction({
    phone: normalizePhone(phone),
    otp: otpCode,
    newEmail: newEmail.trim(),
   
  }))
    .then(() => {
      // success handled by slice -> emailUpdated true -> step 3
    })
    .catch((err) => {
      console.error("handleVerifyOtpAndUpdateEmail error:", err);
      setOtpError(err?.message || "Failed to verify OTP");
      dispatch(clearError());
    });


  }

  // ========== FORGOT PASSWORD FLOW ==========
const handleSendResetEmail = () => {
  if (!email.trim()) {
    setEmailError("Email is required");
    return;
  } else if (!validateEmail(email)) {
    setEmailError("Enter a valid email address");
    return;
  } else {
    setEmailError("");
  }

  dispatch(sendPasswordResetEmailAction({ email }))
    .unwrap()
    .then(() => {
      // 🔥 MOVE TO OTP SCREEN
      setStep(2);
      setTimeLeft(300);
      setTimerActive(true);
    })
    .catch((err) => {
      Alert.alert("Error", err || "Failed to send OTP");
    });
};

 const handleResetPassword = () => {
  if (!newPassword.trim()) {
    setPasswordError("New password is required");
    return;
  } else if (newPassword.length < 6) {
    setPasswordError("Password must be at least 6 characters");
    return;
  } else {
    setPasswordError("");
  }

  if (newPassword !== confirmPassword) {
    setConfirmPasswordError("Passwords do not match");
    return;
  } else {
    setConfirmPasswordError("");
  }

  dispatch(
    resetPasswordAction({
      email,
      otp: passwordOtp,
      newPassword,
    })
  );
};


  const handleBackToLogin = () => {
    dispatch(clearAuthRecoveryState())
    navigation.navigate("LoginScreen")
  }

  // ========== RENDER SELECTION SCREEN ==========
  const renderForgotPasswordOtpStep = () => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>

      <TextInput
        value={passwordOtp}
        onChangeText={(text) => {
          const cleaned = text.replace(/\D/g, "").slice(0, 6);
          setPasswordOtp(cleaned);
          if (cleaned.length === 6) {
            handleVerifyPasswordOtp(cleaned);
          }
        }}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        style={styles.googleOtpInput}
      />

      <View style={styles.resendContainer}>
        {timerActive ? (
          <Text style={styles.timerText}>
            Code expires in {formatTime(timeLeft)}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleSendResetEmail}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
                          onPress: (emailAddr) => {
                            if (!validateEmail(emailAddr)) {
                              Alert.alert("Error", "Enter a valid email");
                              return;
                            }
                            dispatch(sendRecoveryFormAction({ email: emailAddr }))
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
        <Text style={styles.subtitle}>Enter your full name and phone number used at registration</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            placeholder="John Doe"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text)
              setNameError("")
            }}
            autoCapitalize="words"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

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
const handleUseMaskedEmail = async () => {
  try {
    /**
     * IMPORTANT:
     * Backend MUST return realEmail in verifyOtpAction response
     * If it doesn't yet, add it there (not masked).
     */
    if (!maskedEmail) {
      Alert.alert("Error", "Email not available");
      return;
    }

    // 🔥 STORE ONE-TIME OVERRIDE
    await AsyncStorage.setItem(
      "FORCE_LOGIN_EMAIL",
      maskedEmail.replace(/X/g, "") // only if backend masks with X
    );

    dispatch(clearAuthRecoveryState());

    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  } catch (e) {
    console.error("Failed to continue with recovered email:", e);
  }
};


  const renderForgotEmailOtpStep = () => {
    // If otpVerified and maskedEmail exist, show masked info + options
    if (otpVerified && maskedEmail) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Account Found</Text>
          <Text style={styles.subtitle}>We found an account matching your info</Text>

          <View style={styles.maskedCard}>
            {profilePic ? <Image source={{ uri: profilePic }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={28} color="#fff" /></View>}
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.maskedLabel}>Email</Text>
              <Text style={styles.maskedValue}>{maskedEmail}</Text>
              <Text style={styles.maskedSmall}>If this is your account you can continue with this email or change it.</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={handleUseMaskedEmail}>
            <Text style={styles.primaryButtonText}>Continue with this email</Text>
          </TouchableOpacity>

          <Text style={[styles.subtitle, { marginTop: 18 }]}>Or update to a new email</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="email@example.com"
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
            <Text style={styles.primaryButtonText}>{isLoading ? "Updating..." : "Update Email"}</Text>
          </TouchableOpacity>

        </View>
      )
    }

    // Otherwise show OTP single input
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your phone</Text>

        <View style={{ marginBottom: 12 }}>
       <TextInput
  ref={otpInputRef}
  value={otpCode}
  onChangeText={(text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 6);
    setOtpCode(cleaned);
   if (cleaned.length === 6) handleVerifyOtpOnly(cleaned);

  }}
  maxLength={6}
  keyboardType="number-pad"
  textContentType="oneTimeCode"
  autoComplete="sms-otp"
  style={styles.googleOtpInput}
/>

        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtpOnly} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? "Verifying..." : "Verify Code"}</Text>
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
{recoveryType === "password" && step === 2 && renderForgotPasswordOtpStep()}
{recoveryType === "password" && step === 3 && renderResetPasswordStep()}

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
  singleOtpInput: {
    width: "100%",
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
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
  googleOtpInput: {
  letterSpacing: 24,
  fontSize: 28,
  textAlign: "center",
  paddingVertical: 12,
  backgroundColor: "#f5f5f5",
  borderRadius: 12,
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
  maskedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fbff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6f0ff",
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007EFD",
    alignItems: "center",
    justifyContent: "center",
  },
  maskedLabel: {
    fontSize: 12,
    color: "#666",
  },
  maskedValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  maskedSmall: {
    fontSize: 12,
    color: "#666",
  }
})

export default ForgotPasswordScreen
