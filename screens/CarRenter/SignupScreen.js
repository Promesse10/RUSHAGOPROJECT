import { useState, useEffect, useRef } from "react"
import { Animated } from "react-native"
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
import PhoneNumberInput from "../../components/PhoneNumberInput"
import { openPrivacyTerms } from "../../utils/inAppBrowser"
import { signupAction } from "../../redux/action/signupAction"
import {
  sendVerificationCodeAction,
 verifyEmailOtpAction,
} from "../../redux/action/verificationAction"
import { useTranslation } from 'react-i18next'
import I18n from "../../utils/i18n"
import CaptchaImage from "../../components/CaptchaImage";


const { height } = Dimensions.get("window")

const SignupScreen = ({ navigation }) => {
  const { t } = useTranslation()

  const privacyItems = [
    {
      id: 1,
      title: t("privacyItem1Title"),
      content: t("privacyItem1Content"),
    },
    {
      id: 2,
      title: t("privacyItem2Title"),
      content: t("privacyItem2Content"),
    },
    {
      id: 3,
      title: t("privacyItem3Title"),
      content: t("privacyItem3Content"),
    },
    {
      id: 4,
      title: t("privacyItem4Title"),
      content: t("privacyItem4Content"),
    },
    {
      id: 5,
      title: t("privacyItem5Title"),
      content: t("privacyItem5Content"),
    },
    {
      id: 6,
      title: t("privacyItem6Title"),
      content: t("privacyItem6Content"),
    },
    {
      id: 7,
      title: t("privacyItem7Title"),
      content: t("privacyItem7Content"),
    },
  ]

  const faqItems = [
    {
      id: 1,
      question: t("faqItem1Question"),
      answer: t("faqItem1Answer"),
      category: 'general',
    },
    {
      id: 2,
      question: t("faqItem2Question"),
      answer: t("faqItem2Answer"),
      category: 'general',
    },
    {
      id: 3,
      question: t("faqItem3Question"),
      answer: t("faqItem3Answer"),
      category: 'general',
    },
    {
      id: 4,
      question: t("faqItem4Question"),
      answer: t("faqItem4Answer"),
      category: 'general',
    },
    {
      id: 5,
      question: t("faqItem5Question"),
      answer: t("faqItem5Answer"),
      category: 'general',
    },
    {
      id: 6,
      question: t("faqItem6Question"),
      answer: t("faqItem6Answer"),
      category: 'general',
    },
    {
      id: 7,
      question: t("faqItem7Question"),
      answer: t("faqItem7Answer"),
      category: 'general',
    },
  ]

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
  const [passwordStrength, setPasswordStrength] = useState("poor")
  const [showPasswordRequirementsModal, setShowPasswordRequirementsModal] = useState(false)
const shakeAnimation = useRef(new Animated.Value(0)).current
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
 
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)
  const [otp, setOtp] = useState("");
  const OTP_LENGTH = 6
  const [otpAttempts, setOtpAttempts] = useState(0)
const [captchaToken, setCaptchaToken] = useState(null)

const generateCaptcha = (length = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


  const { isLoading, isSignupSuccess, isSignupFailed, error } = useSelector((state) => state.signup || {})
  const { isSending, error: verificationError } = useSelector((state) => state.verification || {})
const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [fullPhone, setFullPhone] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showCaptchaModal, setShowCaptchaModal] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaText, setCaptchaText] = useState('')

  const dispatch = useDispatch()

const shake = () => {
  Animated.sequence([
    Animated.timing(shakeAnimation,{toValue:10,duration:50,useNativeDriver:true}),
    Animated.timing(shakeAnimation,{toValue:-10,duration:50,useNativeDriver:true}),
    Animated.timing(shakeAnimation,{toValue:0,duration:50,useNativeDriver:true})
  ]).start()
}

const handleSignUp = () => {
  if (passwordStrength === "poor") {
    shake()
    setShowPasswordRequirementsModal(true)
    return
  }

  if (!validateForm()) return

  proceedWithSignup()
}

useEffect(() => {
  if (!showVerificationModal) return

  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        setCanResend(true)
        clearInterval(interval)
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(interval)
}, [showVerificationModal])






  useEffect(() => {
    if (isSignupFailed && error) {
      Alert.alert(I18n.t("signupFailed"), typeof error === 'string' ? error : I18n.t("pleaseFillAllRequiredFields"))
    }
  }, [isSignupFailed, error])

  const validatePhone = (phone) => phone.length === 9 && /^\d+$/.test(phone)

  const getPasswordRequirementStatus = (password) => {
    const requirements = [
      {
        key: "length",
        label: "At least 8 characters",
        example: "abcdefgh",
        passed: password.length >= 8,
      },
      {
        key: "lower",
        label: "Lowercase letter",
        example: "abc",
        passed: /[a-z]/.test(password),
      },
      {
        key: "upper",
        label: "Uppercase letter",
        example: "ABC",
        passed: /[A-Z]/.test(password),
      },
      {
        key: "digit",
        label: "Number",
        example: "123",
        passed: /\d/.test(password),
      },
      {
        key: "special",
        label: "Special character",
        example: "@#$",
        passed: /[@$!%*?&]/.test(password),
      },
    ]

    return requirements
  }

 const checkPasswordStrength = (password) => {
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
  const mediumRegex =
    /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/

  if (strongRegex.test(password)) {
    setPasswordStrength("strong")
  } else if (mediumRegex.test(password)) {
    setPasswordStrength("medium")
  } else {
    setPasswordStrength("poor")
  }
}
const validateEmail = (email) => /^[A-Z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)

  const proceedWithSignup = async () => {
  const result = await dispatch(
    sendVerificationCodeAction({
      email: inputs.email,
      userName: inputs.name,
      captchaInput,
      captchaToken,
    })
  )
if (result.payload?.requireCaptcha) {
  setCaptchaText(result.payload.captchaText); // 👈 USE BACKEND TEXT
  setCaptchaInput("");
  setCaptchaToken(result.payload.captchaToken);
  setShowCaptchaModal(true);
  return;
}

  if (sendVerificationCodeAction.fulfilled.match(result)) {
    setOtp("")
    setShowVerificationModal(true)
    setTimeLeft(300)
    setCanResend(false)
  } else {
    Alert.alert(
      I18n.t("error"),
      result.payload?.error || I18n.t("couldNotSendVerificationCode")
    )
  }
}


const handleCaptchaSubmit = () => {
  if (captchaInput.trim().toUpperCase() === captchaText) {
    setShowCaptchaModal(false)
    proceedWithSignup()
  } else {
    Alert.alert("Error", "CAPTCHA does not match")
   
    setCaptchaInput("")
  }
}


  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    if (!inputs.name.trim()) {
      newErrors.name = I18n.t("invalidName")
      isValid = false
    }
    if (!inputs.email.trim()) {
      newErrors.email = I18n.t("invalidEmail")
      isValid = false
    } else if (!validateEmail(inputs.email)) {
      newErrors.email = I18n.t("invalidEmail")
      isValid = false
    }
    if (!inputs.phone.trim()) {
      newErrors.phone = I18n.t("invalidPhone")
      isValid = false
    } else if (!validatePhone(inputs.phone)) {
      newErrors.phone = I18n.t("invalidPhone")
      isValid = false
    }
    if (!inputs.password.trim()) {
      newErrors.password = I18n.t("passwordIsRequired")
      isValid = false
    } else if (inputs.password.length < 6) {
      newErrors.password = I18n.t("passwordMinLength")
      isValid = false
    }
    if (!inputs.confirmPassword.trim()) {
      newErrors.confirmPassword = I18n.t("confirmPasswordIsRequired")
      isValid = false
    } else if (inputs.confirmPassword !== inputs.password) {
      newErrors.confirmPassword = I18n.t("passwordsDoNotMatch")
      isValid = false
    }
if (!acceptedTerms) {
  newErrors.terms = I18n.t("acceptTermsRequired")
  isValid = false
}

    setErrors(newErrors)
    return isValid
  }

const handleVerifyEmail = async () => {
  if (otp.length !== OTP_LENGTH) {
    setErrors({ ...errors, verification: I18n.t("enterOtpCode") })
    return
  }

  setIsVerifying(true)

  try {
    const verifyResult = await dispatch(
      verifyEmailOtpAction({
        email: inputs.email,
        otp,
      })
    )

    if (!verifyEmailOtpAction.fulfilled.match(verifyResult)) {
      throw new Error(
        verifyResult.payload?.error || I18n.t("invalidVerificationCode")
      )
    }

    const signupResult = await dispatch(
      signupAction({
        role: userType,
        name: inputs.name,
        email: inputs.email,
        phone: fullPhone,
        password: inputs.password,
      })
    )

    if (!signupAction.fulfilled.match(signupResult)) {
      throw new Error(
        signupResult.payload?.error || I18n.t("signupFailed")
      )
    }

    setShowVerificationModal(false)
    navigation.navigate("LoginScreen")
  } catch (err) {
  setOtpAttempts(prev => prev + 1)

  setErrors(prev => ({
    ...prev,
    verification: err.message,
  }))
}
 finally {
    setIsVerifying(false)
  }
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
  Alert.alert(I18n.t("success"), I18n.t("newVerificationCodeSent"))
})

    .catch(() => {
      Alert.alert(I18n.t("error"), I18n.t("couldNotResendCode"))
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
                <Text style={styles.modalTitle}>{I18n.t("termsAndPrivacyPolicy")}</Text>
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
                  <Text style={styles.confirmButtonText}>{I18n.t("iAgreeButton")}</Text>
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
                <Text style={styles.modalTitle}>{I18n.t("faq")}</Text>
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
                  <Text style={styles.confirmButtonText}>{I18n.t("gotIt")}</Text>
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
        <Text style={styles.captchaTitle}>Verify you’re human</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CaptchaImage text={captchaText} />

          <TouchableOpacity
            onPress={() => proceedWithSignup()}
            style={{ marginLeft: 10 }}
          >
            <Ionicons name="refresh" size={24} color="#007EFD" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.captchaInput}
          value={captchaInput}
          onChangeText={setCaptchaInput}
          placeholder="Enter CAPTCHA"
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.captchaSubmitButton}
          onPress={handleCaptchaSubmit}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)

  const renderPasswordRequirementsModal = () => {
    const requirements = getPasswordRequirementStatus(inputs.password)

    return (
      <Modal visible={showPasswordRequirementsModal} animationType="fade" transparent>
        <View style={styles.passwordModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowPasswordRequirementsModal(false)}>
            <View style={styles.passwordModalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.passwordModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{I18n.t("weakPassword") || "Strong password needed"}</Text>
              <TouchableOpacity onPress={() => setShowPasswordRequirementsModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordModalSubtitle}>
              {I18n.t("passwordRequirementsHint") || "Make sure your password contains:"}
            </Text>
            {requirements.map((req) => (
              <View key={req.key} style={styles.passwordRequirementRow}>
                <Ionicons
                  name={req.passed ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={req.passed ? "#2ECC71" : "#E74C3C"}
                />
                <View style={styles.passwordRequirementTextContainer}>
                  <Text style={[styles.passwordRequirementText, req.passed && styles.passwordRequirementTextPassed]}>
                    {req.label}
                  </Text>
                  <Text style={[styles.passwordRequirementExample, req.passed && styles.passwordRequirementExamplePassed]}>
                    {req.passed ? 
                      `${I18n.t("done") || "Done"}: ${req.example}` :
                      `${I18n.t("missing") || "Missing"}: ${req.example}`
                    }
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.confirmButton} onPress={() => setShowPasswordRequirementsModal(false)}>
              <Text style={styles.confirmButtonText}>{I18n.t("gotIt") || "Got it"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  const renderForm = () => (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <TextInput
        
          style={[styles.input, errors.name && styles.inputError]}
          placeholder={I18n.t("fullName")}
          placeholderTextColor="#999"
          value={inputs.name}
          onChangeText={(value) => setInputs({ ...inputs, name: value })}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder={I18n.t("email")}
          placeholderTextColor="#999"
          value={inputs.email}
          onChangeText={(value) => setInputs({ ...inputs, email: value })}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    <View style={styles.inputContainer}>
      <View style={[styles.phoneContainer, errors.phone && styles.inputError]}>
        <PhoneNumberInput
          value={inputs.phone}
          onChangeText={(text) => setInputs({ ...inputs, phone: text })}
          onChangeFormattedText={(text) => setFullPhone(text)}
          defaultCountry="RW"
          placeholder={I18n.t("phoneNumber")}
          containerStyle={styles.phoneInputContainer}
          inputStyle={styles.phoneInput}
        />
      </View>
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
    </View>

    <View style={styles.inputContainer}>
      <Animated.View
        style={{
          transform: [{ translateX: shakeAnimation }],
        }}
      />
      <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
  
          <TextInput
            style={styles.passwordInput}
            placeholder={I18n.t("createPassword")}
            placeholderTextColor="#999"
            secureTextEntry={secureTextEntry}
            value={inputs.password}
            onChangeText={(value) => {
  setInputs({ ...inputs, password: value })
  checkPasswordStrength(value)
}}
             textContentType="none"
  autoComplete="off"
  importantForAutofill="no"
          />
          <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
            <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

<View style={{flexDirection:"row",marginTop:5}}>
<View style={{
flex:1,
height:5,
marginRight:4,
backgroundColor: passwordStrength==="poor"?"red":"#ddd"
}}/>

<View style={{
flex:1,
height:5,
marginRight:4,
backgroundColor: passwordStrength==="medium"?"orange":"#ddd"
}}/>

<View style={{
flex:1,
height:5,
backgroundColor: passwordStrength==="strong"?"green":"#ddd"
}}/>
</View>
      </View>
      <View style={styles.inputContainer}>
        <View style={[styles.passwordInputContainer, errors.confirmPassword && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder={I18n.t("confirmPassword")}
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
    {I18n.t("iAgree")} {" "}
    <Text style={styles.linkText} onPress={openPrivacyTerms}>
      {I18n.t("policyAndTerms", "Privacy&Terms")}
    </Text>
  </Text>
</View>

{errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

      <TouchableOpacity style={[styles.signUpButton, !acceptedTerms && styles.disabledButton]} onPress={handleSignUp} disabled={isLoading || isSending || !acceptedTerms}>
        {isLoading || isSending ? (
          <ActivityIndicator color="#007EFD" size="small" />
        ) : (
          <Text style={styles.signUpButtonText}>{I18n.t("signUp")}</Text>
        )}
      </TouchableOpacity>
    </View>
  )

  const renderVerificationModal = () => (
    <Modal transparent visible={showVerificationModal} animationType="slide">
      <View style={styles.verificationModalContainer}>
        <View style={styles.verificationModalContent}>
          <Ionicons name="mail" size={40} color="#007EFD" style={{ marginBottom: 10 }} />
          <Text style={styles.verificationTitle}>{I18n.t("checkYourEmail")}</Text>
          <Text style={styles.emailDisplay}>{inputs.email}</Text>
          <Text style={styles.timerText}>
            {timeLeft > 0 ? `${I18n.t("codeExpiresIn")} ${formatTime(timeLeft)}` : I18n.t("codeExpired")}
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
            disabled={!canResend || otpAttempts >= 2}
            style={[styles.resendContainer, !canResend && { opacity: 0.5 }]}
          >
            <Text style={styles.resendText}>
              {canResend ? I18n.t("resendCode") : `${I18n.t("resendIn")} ${formatTime(timeLeft)}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail} disabled={isVerifying}>
            {isVerifying ? (
              <ActivityIndicator color="#007EFD" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>{I18n.t("verifyEmail")}</Text>
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
            <Text style={styles.signUpHeading}>{I18n.t("signUpHeading")}</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "renter" && styles.activeUserTypeButton]}
                onPress={() => setUserType("renter")}
              >
                <Text style={[styles.userTypeText, userType === "renter" && styles.activeUserTypeText]}>{I18n.t("renter")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === "owner" && styles.activeUserTypeButton]}
                onPress={() => setUserType("owner")}
              >
                <Text style={[styles.userTypeText, userType === "owner" && styles.activeUserTypeText]}>{I18n.t("owner")}</Text>
              </TouchableOpacity>
            </View>
            {renderForm()}
            <View style={styles.signinContainer}>
              <Text style={styles.haveAccountText}>{I18n.t("alreadyHaveAccount")} </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signinText}>{I18n.t("signIn")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderVerificationModal()}
      {renderTermsModal()}
      {renderPrivacyModal()}
      {renderCaptchaModal()}
      {renderPasswordRequirementsModal()}
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
  linkText: {
    color: "#007EFD",
    textDecorationLine: "underline",
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
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
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
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  passwordModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  passwordModalContent: {
    width: '85%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  passwordModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  passwordRequirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passwordRequirementTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  passwordRequirementText: {
    fontSize: 14,
    color: '#333',
  },
  passwordRequirementTextPassed: {
    color: '#2ECC71',
  },
  passwordRequirementExample: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 2,
  },
  passwordRequirementExamplePassed: {
    color: '#2ECC71',
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
