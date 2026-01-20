import { useState, useEffect, useRef } from "react"
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
  TouchableWithoutFeedback,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import PhoneInput from 'react-native-phone-number-input'
import { signupAction } from "../../redux/action/signupAction"
import {
  sendVerificationCodeAction,
 verifyEmailOtpAction,
} from "../../redux/action/verificationAction"


const privacyItems = [
  {
    id: 1,
    title: "1. What information do we collect?",
    content:
      "We obtain information about you through the means discussed below when we provide the Services. Please note that we need certain types of information to provide the Services to you. If you do not provide us with such information, or if you ask us to delete that information, you may no longer be able to access or use certain Services.\n\nWhen you register for MUVCAR, we collect your name, email, phone number, and location. For car owners, we collect vehicle information including make, model, year, license plate, and photos. For renters, we collect driver's license information and payment details. We also collect usage data such as rental history, reviews, and communication between users.",
  },
  {
    id: 2,
    title: "2. We Use Your Information For?",
    content:
      "We use your information to facilitate car rentals between owners and renters, process payments, verify identities, provide customer support, improve our services, send notifications about bookings and updates, and ensure compliance with our terms of service. We may also use your information for marketing purposes, but you can opt out at any time. Location data helps us show nearby available vehicles and optimize the rental experience.",
  },
  {
    id: 3,
    title: "3. How Do We Protect?",
    content:
      "MUVCAR employs industry-standard security measures to protect your personal information. We use encryption for all data transmissions, secure payment processing, and regular security audits. Access to user data is restricted to authorized personnel only. We implement multi-factor authentication for account access and continuously monitor our systems for potential vulnerabilities. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.",
  },
  {
    id: 4,
    title: "4. Online Analytics",
    content:
      "We use analytics tools to understand how users interact with our app. This helps us improve the user experience and develop new features. These tools collect information such as how often you use the app, which features you use, and performance data. We may share anonymous, aggregated data with third-party analytics providers. You can opt out of certain analytics tracking through your device settings.",
  },
  {
    id: 5,
    title: "5. Children's Privacy",
    content:
      "MUVCAR services are not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information from our servers. If you believe we might have any information from or about a child under 18, please contact us immediately.",
  },
  {
    id: 6,
    title: "6. Sharing Your Information",
    content:
      "We share your information with other users as necessary to facilitate rentals (e.g., car owners receive renter information and vice versa). We may share data with service providers who help us operate our platform, including payment processors, identity verification services, and cloud hosting providers. We may also disclose information when required by law or to protect our rights or the safety of users. We do not sell your personal information to third parties.",
  },
  {
    id: 7,
    title: "7. Your Rights and Choices",
    content:
      "You have the right to access, correct, or delete your personal information. You can update most information directly through your account settings. You can also request a copy of your data or ask us to delete your account by contacting our support team. Depending on your location, you may have additional rights under applicable privacy laws, such as the right to data portability or the right to restrict processing.",
  },
]

const faqItems = [
  {
    id: 1,
    question: 'What is MUVCAR?',
    answer: 'MUVCAR is a platform that connects car owners with people who want to rent cars. We provide an app where car owners can list their vehicles and renters can browse and contact owners directly to arrange car rentals. Our platform enables seamless and secure car rentals between individuals.',
    category: 'general',
  },
  {
    id: 2,
    question: 'How do I get in contact with MUVCAR support?',
    answer: 'You can contact MUVCAR support through our email at support@MUVCAR.com or by phone at +250780114522.',
    category: 'general',
  },
  {
    id: 3,
    question: 'Do you offer discounts?',
    answer: 'MUVCAR itself doesn\'t offer discounts, but car owners can set their own prices and may offer discounts directly to renters during their negotiations through the app\'s contact feature.',
    category: 'general',
  },
  {
    id: 4,
    question: 'Is MUVCAR hiring?',
    answer: 'MUVCAR is always looking for talented individuals to join our team. Check our careers page at MUVCAR.com/careers for current openings.',
    category: 'general',
  },
  {
    id: 5,
    question: 'How do I list my car on MUVCAR?',
    answer: 'To list your car, create an account as a car owner, verify your identity, add your car details including photos, set your pricing and availability, and publish your listing. Renters can then contact you through the app to arrange a rental.',
    category: 'general',
  },
  {
    id: 6,
    question: 'How do I rent a car on MUVCAR?',
    answer: 'To rent a car, create an account as a renter, verify your identity, browse available cars in your area, select a car you like, and click the contact button to reach the car owner via call through the app to negotiate and finalize the rental deal.',
    category: 'general',
  },
  {
    id: 7,
    question: 'How do car owners and renters connect?',
    answer: 'Through the MUVCAR app, renters can choose a car they wish to rent and click the contact button, which initiates a call to the car owner. Both parties can then discuss and agree on the rental terms directly.',
    category: 'general',
  },
]


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
 
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)
  const [otp, setOtp] = useState("");
  const OTP_LENGTH = 6


  const { isLoading, isSignupSuccess, isSignupFailed, error } = useSelector((state) => state.signup || {})
  const { isSending, error: verificationError } = useSelector((state) => state.verification || {})
const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [fullPhone, setFullPhone] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showCaptchaModal, setShowCaptchaModal] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const phoneInputRef = useRef(null)

  const dispatch = useDispatch()

  const handleSignUp = () => {
    try {
      if (!validateForm()) return

      // Randomly show captcha (30% chance)
      if (Math.random() < 0.3) {
        const words = ['human', 'robot', 'verify', 'check', 'confirm']
        const randomWord = words[Math.floor(Math.random() * words.length)]
        setCaptchaText(randomWord)
        setCaptchaInput('')
        setShowCaptchaModal(true)
        return
      }

      proceedWithSignup()
    } catch (error) {
      console.error('Error in handleSignUp:', error)
      Alert.alert('Error', 'An unexpected error occurred during sign up')
    }
  }

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





  useEffect(() => {
    if (isSignupFailed && error) {
      Alert.alert("Signup Failed", typeof error === 'string' ? error : "An error occurred")
    }
  }, [isSignupFailed, error])

  const validatePhone = (phone) => phone.length === 9 && /^\d+$/.test(phone)

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email)

  const proceedWithSignup = () => {
  dispatch(
    sendVerificationCodeAction({
      email: inputs.email,
      userName: inputs.name,
    })
  )
    .unwrap()
   .then(() => {
  setOtp("")
  setShowVerificationModal(true)
  setTimeLeft(300)
  setCanResend(false)
})

    .catch((err) => {
      Alert.alert("Error", err?.error || "Could not send verification code")
    })
}

  const handleCaptchaSubmit = () => {
    if (captchaInput.toLowerCase() === captchaText.toLowerCase()) {
      setShowCaptchaModal(false)
      proceedWithSignup()
    } else {
      Alert.alert("Error", "Incorrect captcha. Please try again.")
      setCaptchaInput('')
    }
  }

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
      newErrors.phone = "Enter a valid 9-digit phone number"
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
if (!acceptedTerms) {
  newErrors.terms = "You must accept Terms & Privacy Policy"
  isValid = false
}

    setErrors(newErrors)
    return isValid
  }

const handleVerifyEmail = () => {
  if (otp.length !== OTP_LENGTH) {
    setErrors({ ...errors, verification: `Please enter the ${OTP_LENGTH}-digit code` })

    return
  }

  if (!fullPhone || fullPhone.trim() === '') {
    setErrors({ ...errors, verification: "Phone number is required" })
    return
  }

  setIsVerifying(true)

  dispatch(
    verifyEmailOtpAction({
      email: inputs.email,
      otp,
    })
  )
    .unwrap()
    .then(() => {
      return dispatch(
        signupAction({
          role: userType,
          name: inputs.name,
          email: inputs.email,
          phone: fullPhone,
          password: inputs.password,
        })
      ).unwrap()
    })
    .then(() => {
      setShowVerificationModal(false)
      console.log("Signup successful, navigating to LoginScreen")
      try {
        navigation.navigate("LoginScreen")
      } catch (navError) {
        console.error('Navigation error:', navError)
        Alert.alert('Error', 'Failed to navigate after signup')
      }
    })
    .catch((err) => {
      setErrors(prev => ({
  ...prev,
  verification: err?.error || "Invalid verification code",
}));

    })
    .finally(() => setIsVerifying(false))
}


  const handleResendCode = () => {
  if (!canResend) return

  dispatch(
    sendVerificationCodeAction({
      email: inputs.email,
      userName: inputs.name,
    })
  )
    .unwrap()
   .then(() => {
  setOtp("")
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

  const renderTermsModal = () => (
    <Modal visible={showTermsModal} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={() => setShowTermsModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Terms & Privacy Policy</Text>
                <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent} contentContainerStyle={{flexGrow: 1, paddingBottom: 20}} showsVerticalScrollIndicator={false}>
                {privacyItems.map((item) => (
                  <View key={item.id} style={styles.policyItemModal}>
                    <Text style={styles.policyTitleModal}>{item.title}</Text>
                    <Text style={styles.policyTextModal}>{item.content}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.confirmButton} onPress={() => { setAcceptedTerms(true); setShowTermsModal(false); }}>
                  <Text style={styles.confirmButtonText}>I Agree</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  const renderPrivacyModal = () => (
    <Modal visible={showPrivacyModal} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={() => setShowPrivacyModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>FAQ</Text>
                <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent} contentContainerStyle={{flexGrow: 1, paddingBottom: 20}} showsVerticalScrollIndicator={false}>
                {faqItems.map((item) => (
                  <View key={item.id} style={styles.policyItemModal}>
                    <Text style={styles.policyTitleModal}>{item.question}</Text>
                    <Text style={styles.policyTextModal}>{item.answer}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.confirmButton} onPress={() => setShowPrivacyModal(false)}>
                  <Text style={styles.confirmButtonText}>Got it</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  const renderCaptchaModal = () => (
    <Modal visible={showCaptchaModal} animationType="fade" transparent>
      <View style={styles.captchaModalContainer}>
        <View style={styles.captchaModalContent}>
          <Text style={styles.captchaTitle}>Verify You're Human</Text>
          <Text style={styles.captchaInstruction}>Please type the word below to continue:</Text>
          <Text style={styles.captchaText}>{captchaText}</Text>
          <TextInput
            style={styles.captchaInput}
            value={captchaInput}
            onChangeText={setCaptchaInput}
            placeholder="Type the word here"
            autoCapitalize="none"
          />
          <View style={styles.captchaButtons}>
            <TouchableOpacity style={styles.captchaButton} onPress={() => setShowCaptchaModal(false)}>
              <Text style={styles.captchaButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.captchaButton, styles.captchaSubmitButton]} onPress={handleCaptchaSubmit}>
              <Text style={styles.captchaSubmitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  const renderForm = () => (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <TextInput
        
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Full name"
          placeholderTextColor="#999"
          value={inputs.name}
          onChangeText={(value) => setInputs({ ...inputs, name: value })}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#999"
          value={inputs.email}
          onChangeText={(value) => setInputs({ ...inputs, email: value })}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    <View style={styles.inputContainer}>
      <View style={[styles.phoneContainer, errors.phone && styles.inputError]}>
        <PhoneInput
          ref={phoneInputRef}
          defaultCode="RW"
          layout="first"
          onChangeText={(text) => setInputs({ ...inputs, phone: text })}
          onChangeFormattedText={(text) => setFullPhone(text)}
          containerStyle={styles.phoneInputContainer}
          textContainerStyle={styles.phoneTextContainer}
          textInputProps={{
            maxLength: 9,
            placeholder: "Phone number",
          }}
          textInputStyle={styles.phoneInput}
        />
      </View>
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
             textContentType="none"
  autoComplete="off"
  importantForAutofill="no"
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
            textContentType="none"
  autoComplete="off"
  importantForAutofill="no"
          />
          <TouchableOpacity onPress={toggleSecureConfirmTextEntry} style={styles.eyeIcon}>
            <Ionicons name={secureConfirmTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
      <View style={styles.termsContainer}>
  <TouchableOpacity
    style={styles.checkbox}
    onPress={() => setAcceptedTerms(!acceptedTerms)}
  >
    {acceptedTerms && <Ionicons name="checkmark" size={16} color="#007EFD" />}
  </TouchableOpacity>

  <Text style={styles.termsText}>
    I agree to the{" "}
    <Text style={styles.linkText} onPress={() => setShowTermsModal(true)}>
      Terms
    </Text>{" "}
    and{" "}
    <Text style={styles.linkText} onPress={() => setShowPrivacyModal(true)}>
      Privacy Policy
    </Text>
  </Text>
</View>

{errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

      <TouchableOpacity style={[styles.signUpButton, !acceptedTerms && styles.disabledButton]} onPress={handleSignUp} disabled={isLoading || isSending || !acceptedTerms}>
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
    <TextInput
  value={otp}
  onChangeText={(text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(cleaned);
  }}
  keyboardType="number-pad"
  maxLength={OTP_LENGTH}
  textContentType="oneTimeCode"
  autoComplete="one-time-code"
  style={styles.googleOtpInput}
/>

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
      {renderTermsModal()}
      {renderPrivacyModal()}
      {renderCaptchaModal()}
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
  }, termsContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
},
checkbox: {
  width: 22,
  height: 22,
  borderWidth: 1,
  borderColor: "#007EFD",
  marginRight: 10,
  justifyContent: "center",
  alignItems: "center",
},

  userTypeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#888",
  },
  activeUserTypeText: {
    color: "#ffffff",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 15,
       color: "#000000",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
       color: "#000000",
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
     color: "#000000",
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
     color: "#000000",
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
  disabledButton: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  phoneTextContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  phoneInputContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
   
   
  },
  phoneInput: {
    fontSize: 16,
    color: "#000000",
    
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
  googleOtpInput: {
  width: "100%",
  height: 55,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 10,
  paddingHorizontal: 15,
  fontSize: 20,
  letterSpacing: 10, // Google-style spacing
  textAlign: "center",
  marginBottom: 15,
  backgroundColor: "#f9f9f9",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  policyItemModal: {
    marginBottom: 25,
  },
  policyTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  policyTextModal: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  confirmButton: {
    backgroundColor: '#007EFD',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  captchaModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captchaModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  captchaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  captchaInstruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  captchaText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007EFD',
    marginBottom: 20,
    letterSpacing: 5,
  },
  captchaInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  captchaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  captchaButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  captchaButtonText: {
    fontSize: 16,
    color: '#666',
  },
  captchaSubmitButton: {
    backgroundColor: '#007EFD',
  },
  captchaSubmitButtonText: {
    color: '#fff',
  },
})

export default SignupScreen