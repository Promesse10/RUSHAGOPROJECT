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
import { useDispatch, useSelector } from "react-redux"
import { loginAction } from "../../redux/action/LoginActions"
import { clearLoginState } from "../../redux/slices/loginSlice"

const { width, height } = Dimensions.get("window")

const LoginScreen = ({ navigation , route  }) => {
   const recoveredEmail = route?.params?.recoveredEmail
  const dispatch = useDispatch()
  const { isLoading, isLoginSuccess, isLoginFailed, error, user } = useSelector((state) => state.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("renter")
  const [rememberMe, setRememberMe] = useState(false)
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

useEffect(() => {
  const getStoredCredentials = async () => {
    try {
      // 🔥 1️⃣ FORCE OVERRIDE (recovery flow)
      const forcedEmail = await AsyncStorage.getItem("FORCE_LOGIN_EMAIL");
      if (forcedEmail) {
        setEmail(forcedEmail);
        await AsyncStorage.removeItem("FORCE_LOGIN_EMAIL");
        return;
      }

      // 2️⃣ Navigation param fallback
      if (recoveredEmail) {
        setEmail(recoveredEmail);
        return;
      }

      // 3️⃣ Remember-me normal behavior
      const storedRememberMe = await AsyncStorage.getItem("rememberMe");
      if (storedRememberMe === "true") {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedPassword = await AsyncStorage.getItem("userPassword");
        const storedUserType = await AsyncStorage.getItem("userType");

        if (storedEmail && storedPassword) {
          setEmail(storedEmail);
          setPassword(storedPassword);
          setRememberMe(true);
          if (storedUserType) setUserType(storedUserType);
        }
      }
    } catch (err) {
      console.log("Error retrieving stored credentials:", err);
    }
  };

  getStoredCredentials();
}, [recoveredEmail]);

  useEffect(() => {
    setEmailError("")
    setPasswordError("")
  }, [userType])

  useEffect(() => {
    if (isLoginSuccess && user) {
      if (rememberMe) {
        AsyncStorage.setItem("userEmail", email)
        AsyncStorage.setItem("userPassword", password)
        AsyncStorage.setItem("rememberMe", "true")
        AsyncStorage.setItem("userType", userType)
      } else {
        AsyncStorage.removeItem("userEmail")
        AsyncStorage.removeItem("userPassword")
        AsyncStorage.removeItem("rememberMe")
        AsyncStorage.removeItem("userType")
      }

      navigation.navigate(userType === "renter" ? "Home" : "CarOwnerDashboard")
      dispatch(clearLoginState())
    }

    if (isLoginFailed && error) {
      Alert.alert("Login Failed", error)
    }
  }, [isLoginSuccess, isLoginFailed, error])

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email)

  const validateForm = () => {
    let isValid = true

    if (!email.trim()) {
      setEmailError("Email is required")
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address")
      isValid = false
    } else {
      setEmailError("")
    }

    if (!password.trim()) {
      setPasswordError("Password is required")
      isValid = false
    } else {
      setPasswordError("")
    }

    return isValid
  }

  const handleSignIn = () => {
    if (!validateForm()) return
  dispatch(loginAction({ email, password, userType }))


  }

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe)
  }

  const handleSignUp = () => {
    navigation.navigate(userType === "renter" ? "CarRentalSignup" : "CarOwnerSignup")
  }

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen")
  }

  const handleGoogleSignIn = () => {
    Alert.alert("Google Sign In", "Google Sign In functionality will be implemented soon.")
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
          {/* Top Image Section */}
          <View style={styles.topSection}>
            <Image source={require("../../assets/Group 15.jpg")} style={styles.backgroundImage} />
          </View>

          {/* Bottom Login Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.signInHeading}>Choose To Sign In Us:</Text>

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
                <Text style={[styles.userTypeText, userType === "owner" && styles.activeUserTypeText]}>
                  Car Owner
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder={userType === "renter" ? "Enter renter email" : "Enter owner email"}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

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

              <View style={styles.rememberContainer}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={toggleRememberMe}>
                  <View style={[styles.customCheckbox, rememberMe && styles.checkedCheckbox]}>
                    {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Email or Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={isLoading}>
                <Text style={styles.signInButtonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                <Image source={require("../../assets/google-logo.png")} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flexGrow: 1 },
  topSection: { height: height * 0.25, width: "100%", overflow: "hidden" },
  backgroundImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bottomSection: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 24, paddingVertical: 15 },
  signInHeading: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: "#000" },
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
  userTypeButton: { flex: 1, justifyContent: "center", alignItems: "center" },
  activeUserTypeButton: { backgroundColor: "#007EFD" },
  userTypeText: { fontSize: 16, fontWeight: "500", color: "#888" },
  activeUserTypeText: { color: "#fff" },
  form: { width: "100%" },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: "#f5f5f5", borderRadius: 10, padding: 12, fontSize: 16 },
  inputError: { borderWidth: 1, borderColor: "red" },
  errorText: { color: "red", fontSize: 12, marginTop: 5 },
  passwordInputContainer: { flexDirection: "row", backgroundColor: "#f5f5f5", borderRadius: 10, alignItems: "center" },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  eyeIcon: { padding: 10 },
  rememberContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  checkboxContainer: { flexDirection: "row", alignItems: "center" },
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
  checkedCheckbox: { backgroundColor: "#007EFD" },
  rememberText: { fontSize: 14, color: "#333" },
  forgotText: { fontSize: 14, color: "#007EFD", fontWeight: "500" },
  signInButton: {
    backgroundColor: "#007EFD",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  signInButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  orContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  divider: { flex: 1, height: 1, backgroundColor: "#ddd" },
  orText: { paddingHorizontal: 10, color: "#888", fontSize: 14 },
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
  googleIcon: { width: 24, height: 24, marginRight: 10, resizeMode: "contain" },
  googleButtonText: { color: "#333", fontSize: 16, fontWeight: "500" },
  signupContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 10 },
  noAccountText: { fontSize: 14, color: "#333" },
  signupText: { fontSize: 14, color: "#000", fontWeight: "bold" },
})

export default LoginScreen
