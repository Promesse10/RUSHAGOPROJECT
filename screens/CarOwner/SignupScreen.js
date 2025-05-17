"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"

const CarOwnerSignupScreen = () => {
  const navigation = useNavigation()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = () => {
    if (!phoneNumber) {
      alert("Please enter your phone number")
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      navigation.navigate("VerificationScreen", {
        userType: "owner",
        verificationType: "phone",
      })
    }, 1500)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>×</Text>
      </TouchableOpacity>

      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>as Car Owner</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>👤</Text>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#666" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>📱</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>📧</Text>
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" placeholderTextColor="#666" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#666" />
        <Text style={styles.eyeIcon}>👁️</Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By signing up, you agree to our <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("CarOwnerLogin")}>
            Sign In
          </Text>
        </Text>
      </View>
    </View>
  )
}

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
    fontSize: 20,
  },
  eyeIcon: {
    fontSize: 20,
    position: "absolute",
    right: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  submitButton: {
    width: "100%",
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
})

export default CarOwnerSignupScreen

