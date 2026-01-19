"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Animated,
  StatusBar,
  SafeAreaView,
  BackHandler,
  Platform,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")

const AuthScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [lastBackPress, setLastBackPress] = useState(0)

  // Animation references
  const fadeAnimation = useRef(new Animated.Value(0)).current
  const slideAnimation = useRef(new Animated.Value(50)).current
  const buttonFadeIn = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonFadeIn, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsLoading(false)
    })
  }, [])

  // Handle back button press - allow going back to onboarding
useFocusEffect(
  React.useCallback(() => {
    if (Platform.OS !== "android") return

    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack()
        return true
      }
      return false // allow Android to close app
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    )

    return () => subscription.remove()
  }, [navigation])
)



  const handleSignIn = () => {
    navigation?.navigate("LoginScreen")
  }

  const handleSignUp = () => {
    navigation?.navigate("CarRentalSignup")
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground source={require("../assets/background.jpg")} style={styles.container} resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {/* Hello Text */}
            <Animated.View
              style={{
                opacity: fadeAnimation,
                transform: [{ translateY: slideAnimation }],
              }}
            >
              <Text style={styles.helloText}>HELLO</Text>
              <Text style={styles.subtitleText}>Welcome to MUVCAR</Text>
            </Animated.View>

            {/* Buttons Container */}
            <Animated.View style={[styles.buttonsContainer, { opacity: buttonFadeIn }]}>
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} activeOpacity={0.8}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} activeOpacity={0.8}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: height * 0.15,
    paddingBottom: height * 0.08,
    paddingHorizontal: 24,
  },
  helloText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 50,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    marginTop: "auto",
    paddingBottom: 20,
  },
  signInButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signUpText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AuthScreen
