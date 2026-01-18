"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

const AuthScreen = () => {
  const navigation = useNavigation();
  const [isSignup, setIsSignup] = useState(true);
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [appleEnabled, setAppleEnabled] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);

  useEffect(() => {
    const loadLinkStatus = async () => {
      const googleLinked = await AsyncStorage.getItem("googleLinked");
      const appleLinked = await AsyncStorage.getItem("appleLinked");
      setGoogleEnabled(googleLinked === "true");
      setAppleEnabled(appleLinked === "true");
    };
    loadLinkStatus();
  }, []);

  const handleAuth = async () => {
    if (isSignup) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        Alert.alert("Error", "Please fill all required fields.");
        return;
      }
      setRoleModalVisible(true); // Show role selection modal
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Please fill all required fields.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate("Home");
      }, 1500);
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setRoleModalVisible(false);
    if (selectedRole === "owner" || selectedRole === "both") {
      setPhoneModalVisible(true); // Show phone number modal for OTP
    } else {
      proceedWithSignup();
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number.");
      return;
    }
    setPhoneModalVisible(false);
    await AsyncStorage.setItem("userRole", role);
    if (role === "owner" || role === "both") {
      await AsyncStorage.setItem("phoneNumber", phoneNumber);
    }
    proceedWithSignup();
  };

  const proceedWithSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("VerificationScreen", {
        userType: role,
        verificationType: "email",
        email: email,
      });
    }, 1500);
  };

  const handleGoogleLogin = () => {
    if (googleEnabled) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate("Home");
      }, 1500);
    } else {
      Alert.alert("Error", "Google login is not enabled.");
    }
  };

  const handleAppleLogin = () => {
    if (appleEnabled) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate("Home");
      }, 1500);
    } else {
      Alert.alert("Error", "Apple login is not enabled.");
    }
  };

  const handleGoBack = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Onboarding" }],
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>×</Text>
      </TouchableOpacity>

      <Image source={require("../MUVCARApp/assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>{isSignup ? "Sign Up" : "Login"}</Text>
      <Text style={styles.subtitle}>
        {isSignup ? "Create Your Account" : "Welcome Back"}
      </Text>

      <View style={styles.inputContainer}>
        <Feather name="user" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#666"
          editable={isSignup}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <Feather name="eye" size={20} color="#666" />
          ) : (
            <Feather name="eye-off" size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      {!isSignup && (
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isSignup ? "Sign Up" : "Login"}
          </Text>
        )}
      </TouchableOpacity>

      {!isSignup && (
        <View style={styles.socialLoginContainer}>
          {googleEnabled && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
            >
              <Feather name="log-in" size={20} color="#000" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Login with Google</Text>
            </TouchableOpacity>
          )}
          {appleEnabled && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleLogin}
            >
              <Feather name="phone" size={20} color="#000" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Login with Apple</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isSignup && (
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing up, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Text
            style={styles.link}
            onPress={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign Up"}
          </Text>
        </Text>
      </View>

      {/* Role Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleRoleSelection("renter")}
            >
              <Text style={styles.modalButtonText}>Car Renter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleRoleSelection("owner")}
            >
              <Text style={styles.modalButtonText}>Car Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleRoleSelection("both")}
            >
              <Text style={styles.modalButtonText}>Both</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Phone Number Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={phoneModalVisible}
        onRequestClose={() => setPhoneModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Enter Phone Number for OTP</Text>
            <View style={styles.inputContainer}>
              <Phone width={20} height={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#666"
              />
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePhoneSubmit}
            >
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setPhoneModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    fontSize: 24,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
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
  },
  eyeButton: {
    padding: 10,
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
    width: "100",
    height: 60,
    backgroundColor: "#007EFD",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  socialLoginContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    padding: 10,
    width: "80%",
    marginVertical: 10,
    justifyContent: "center",
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: "#333",
  },
  termsContainer: {
    marginTop: 20,
  },
  termsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  link: {
    color: "#007EFD",
    textDecorationLine: "underline",
  },
  switchContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  switchText: {
    fontSize: 16,
    color: "#666",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    width: "100%",
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#007EFD",
    alignItems: "center",
    marginVertical: 10,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
});

export default AuthScreen;