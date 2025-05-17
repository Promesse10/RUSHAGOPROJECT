"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, Image, Animated, Easing, PanResponder } from "react-native"

const { width, height } = Dimensions.get("window")

const OnboardingScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  // Animation references
  const slideAnimation = useRef(new Animated.Value(0)).current
  const buttonSlideAnimation = useRef(new Animated.Value(0)).current
  const fadeAnimation = useRef(new Animated.Value(0)).current
  const hintAnimation = useRef(new Animated.Value(0)).current

  // Logo animation references (for loading screen)
  const carPosition = useRef(new Animated.Value(-width)).current
  const carScale = useRef(new Animated.Value(1)).current

  // Arrow animations
  const arrowAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]

  // Logo for loading screen
  const logoScreen = {
    logo: require("../assets/logo.png"),
  }

  // Function to animate the hint sliding
  const animateHintSlide = () => {
    // Don't show hint animation if user is interacting with the button
    if (isUserInteracting) return

    // Reset hint animation
    hintAnimation.setValue(0)

    // Animate to 40% of the full slide distance
    Animated.sequence([
      // Slide to 40% of the way
      Animated.timing(hintAnimation, {
        toValue: 0.4,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Pause briefly at the extended position
      Animated.delay(300),
      // Return to start
      Animated.timing(hintAnimation, {
        toValue: 0,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Start hint animation every 2 seconds
  useEffect(() => {
    if (isVisible && !isLoading) {
      const hintInterval = setInterval(() => {
        animateHintSlide()
      }, 2000)

      return () => clearInterval(hintInterval)
    }
  }, [isVisible, isLoading, isUserInteracting])

  // Pan responder for slide gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Start arrow animation sequence when user touches the button
        startArrowAnimation()
        setIsUserInteracting(true)
      },
      onPanResponderMove: (event, gestureState) => {
        // Calculate how far the user has dragged as a percentage (0-1)
        const dragPercentage = Math.min(Math.max(gestureState.dx / (width * 0.3), 0), 1)
        buttonSlideAnimation.setValue(dragPercentage)
      },
      onPanResponderRelease: (event, gestureState) => {
        // If dragged more than halfway, complete the animation
        if (gestureState.dx > width * 0.15) {
          Animated.timing(buttonSlideAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // Navigate to next screen
            setTimeout(() => {
              navigation?.navigate("AuthScreen")
            }, 300)
          })
        } else {
          // Otherwise, snap back to start
          Animated.timing(buttonSlideAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setIsUserInteracting(false)
          })
        }
      },
    }),
  ).current

  useEffect(() => {
    // Initial loading animation sequence
    const animationSequence = Animated.sequence([
      Animated.timing(carPosition, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(carScale, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(carScale, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(carScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(carPosition, {
        toValue: width * 0.3,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(carPosition, {
        toValue: width,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ])

    animationSequence.start(() => {
      setTimeout(() => {
        setIsLoading(false)
        setIsVisible(true)

        // Start onboarding animations once loading is complete
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimation, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start()
      }, 200)
    })

    return () => {
      carPosition.setValue(-width)
      carScale.setValue(1)
    }
  }, [])

  // Function to animate arrows in sequence
  const startArrowAnimation = () => {
    // Reset all animations
    arrowAnimations.forEach((anim) => anim.setValue(0))

    // Animate each arrow in sequence
    const animateArrow = (index) => {
      if (index >= arrowAnimations.length) return

      Animated.timing(arrowAnimations[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Animate next arrow
        setTimeout(() => {
          animateArrow(index + 1)
        }, 150)
      })
    }

    // Start the sequence
    animateArrow(0)
  }

  // Start arrow animation on component mount
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        startArrowAnimation()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isVisible])

  // Loading screen with animated logo
  const renderLoadingScreen = () => {
    return (
      <View style={styles.loadingContainer}>
        <Animated.Image
          source={logoScreen.logo}
          style={[
            styles.loadingLogo,
            {
              transform: [{ translateX: carPosition }, { scale: carScale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    )
  }

  // Navigation Controls
  const renderNavigationControls = () => {
    return (
      <View style={styles.navigationWrapper}>
        <View style={styles.sliderContainer}>
          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                transform: [
                  {
                    translateX: Animated.add(
                      buttonSlideAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width * 0.3],
                      }),
                      hintAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width * 0.3],
                      }),
                    ),
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.getStartedButton}>
              <View style={styles.carIconContainer}>
                <Image source={require("../assets/rent.png")} style={styles.carIcon} resizeMode="contain" />
              </View>
              <Text style={styles.getStartedText}>Get Started</Text>
            </View>
          </Animated.View>

          {/* Arrow indicators */}
          <View style={styles.arrowsContainer}>
            {[0, 1, 2, 3].map((index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.arrowText,
                  {
                    opacity: arrowAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              >
                {">"}
              </Animated.Text>
            ))}
          </View>
        </View>
      </View>
    )
  }

  const renderMainContent = () => {
    if (!isVisible) return null

    return (
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnimation,
            transform: [
              {
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>RUSHGO</Text>
          <Text style={styles.sloganText}>Your Driving Partner</Text>
        </View>

        {/* Description - English */}
        <Text style={styles.description}>
          Connecting car owners and renters seamlessly. Experience the freedom of mobility with just a few taps.
        </Text>

        {/* Description - Kinyarwanda */}
        <Text style={styles.descriptionKinyarwanda}>
          Guhuza ba nyir'imodoka n'abakodesha mu buryo bworoshye. Bona uburenganzira bwo kugenda aho ushaka mu buryo
          bworoshye.
        </Text>

        {/* Navigation Controls - Positioned directly here instead of in a car image container */}
        {renderNavigationControls()}
      </Animated.View>
    )
  }

  return <View style={styles.container}>{isLoading ? renderLoadingScreen() : renderMainContent()}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingLogo: {
    width: width * 0.4,
    height: height * 0.2,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 150,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007EFD",
    textAlign: "center",
    lineHeight: 40,
  },
  sloganText: {
    fontSize: 18,
    color: "#333333",
    textAlign: "center",
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  descriptionKinyarwanda: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
    fontStyle: "italic",
  },
  navigationWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  sliderContainer: {
    width: width * 0.7, // Reduced size as requested
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  buttonWrapper: {
    position: "absolute",
    left: 5,
    zIndex: 10,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007EFD",
    paddingHorizontal: 15,
  },
  carIconContainer: {
    marginRight: 10,
  },
  carIcon: {
    width: 16,
    height: 16,
    tintColor: "#FFFFFF",
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  arrowsContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 20,
    alignItems: "center",
  },
  arrowText: {
    color: "#999999",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "bold",
  },
})

export default OnboardingScreen
