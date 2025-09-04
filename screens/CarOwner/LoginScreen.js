import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { loginAction } from "../../redux/action/LoginActions";
import { clearLoginState } from "../../redux/slices/LoginSlice";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth); // ✅ match your store key
  console.log("🟢 Redux auth state:", authState); // ✅ optional debug

  const {
    isLoading = false,
    isLoginSuccess = false,
    isLoginFailed = false,
    error = null,
    user = null,
    isAuthenticated = false,
  } = authState || {};

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoginSuccess && isAuthenticated && user) {
      dispatch(clearLoginState());
      // You can navigate here if needed
      // navigation.navigate("Home");
    }
  }, [isLoginSuccess, isAuthenticated, user]);

  useEffect(() => {
    if (isLoginFailed && error) {
      Alert.alert("Login Failed", error);
      dispatch(clearLoginState());
    }
  }, [isLoginFailed, error]);

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    if (!formData.email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    dispatch(
      loginAction({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Hey</Text>
      <Text style={styles.subtitle}>Login Now</Text>
      <Text style={styles.description}>
        If you are new.{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("CarOwnerSignup")}>
          Create Account
        </Text>
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>📧</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁‍🔨"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Log In</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  link: {
    color: "#007EFD",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 20,
    height: 60,
  },
  inputIcon: {
    marginRight: 10,
    fontSize: 20,
  },
  eyeIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#007EFD",
    fontSize: 16,
  },
  submitButton: {
    width: "100%",
    height: 60,
    backgroundColor: "#007EFD",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
