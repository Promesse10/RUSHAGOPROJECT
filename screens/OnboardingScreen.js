import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import I18n from "../utils/i18n"

const { width, height } = Dimensions.get("window")
const ONBOARDING_KEY = "hasSeenOnboarding"

const OnboardingScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const listRef = useRef(null)

  const fadeAnimation = useRef(new Animated.Value(0)).current
  const slideAnimation = useRef(new Animated.Value(0)).current
  const carPosition = useRef(new Animated.Value(-width)).current
  const carScale = useRef(new Animated.Value(1)).current

  const logoScreen = {
    logo: require("../assets/logo.png"),
  }

  const slides = [
    {
      id: "group-21",
      title: I18n.t("onboarding1"),
      cta: I18n.t("next"),
       image: { uri: "https://res.cloudinary.com/def0cjmh2/image/upload/v1765010340/e2652669-ac1e-40fb-a829-13a1319f04f2_lentwk_1_coowtb.png" },
      onPress: (idx) => listRef.current?.scrollToIndex({ index: idx + 1, animated: true }),
    },
    {
      id: "group-20",
      title: I18n.t("onboarding2"),
      cta: I18n.t("continue"),
      image: { uri: "https://res.cloudinary.com/def0cjmh2/image/upload/v1765010340/ae94073a-f8c7-4a28-a618-f810f74ccc26_xkrf6b_1_j0jmqi.png" },
      onPress: (idx) => listRef.current?.scrollToIndex({ index: idx + 1, animated: true }),
    },
    {
      id: "group-19",
      title: I18n.t("onboarding3"),
      cta: I18n.t("getStarted"),
      image: { uri: "https://res.cloudinary.com/def0cjmh2/image/upload/v1765010344/0ca8425d-afff-4dac-93d9-c868ffdbfaf1_srpxvy_1_lgjbaj.png" },
      onPress: async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true")
  navigation.replace("AuthScreen")
},
    },
  ]

  const selectLanguage = async (language) => {
    I18n.changeLanguage(language)
    await AsyncStorage.setItem("userLanguage", language)
    setShowLanguageModal(false)
    setIsVisible(true)
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
  }

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.timing(carPosition, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(carScale, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(carScale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        Animated.timing(carScale, { toValue: 1, duration: 150, useNativeDriver: true }),
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
      setTimeout(async () => {
        const hasSeen = await AsyncStorage.getItem(ONBOARDING_KEY)
        if (hasSeen === "true") {
          navigation.replace("AuthScreen")
        } else {
          setIsLoading(false)
          setShowLanguageModal(true)
        }
      }, 200)
    })

    return () => {
      carPosition.setValue(-width)
      carScale.setValue(1)
    }
  }, [navigation])

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

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <SafeAreaView style={styles.safeTop}>
          <TouchableOpacity
            onPress={async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true")
  navigation.replace("AuthScreen")
}}
            style={styles.skipBtn}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>{I18n.t("skip")}</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.blueBackground} />
        <View style={styles.blueBackgroundContainer}>
          <View style={styles.curvedBlueSection} />
        </View>

        <View style={styles.heroContainer}>
          <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.captionText}>{item.title}</Text>
          <TouchableOpacity style={styles.primaryCta} onPress={() => item.onPress(index)} activeOpacity={0.85}>
            <Text style={styles.primaryCtaText}>{item.cta}</Text>
          </TouchableOpacity>
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
        <FlatList
          ref={listRef}
          data={slides}
          keyExtractor={(s) => s.id}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width)
            setActiveIndex(newIndex)
          }}
          initialNumToRender={3}
        />
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      {isLoading ? renderLoadingScreen() : renderMainContent()}
      <LanguageModal visible={showLanguageModal} onSelectLanguage={selectLanguage} />
    </View>
  )
}

const LanguageModal = ({ visible, onSelectLanguage }) => {
  const languages = [
    {
      code: "rw",
      name: "kinyarwanda",
      flag: "https://cdn4.iconfinder.com/data/icons/world-flags-circular/1000/Flag_of_Rwanda_-_Circle-512.png",
    },
    {
      code: "en",
      name: "english",
      flag: "https://images.vexels.com/media/users/3/163966/isolated/preview/6ecbb5ec8c121c0699c9b9179d6b24aa-england-flag-language-icon-circle.png",
    },
    {
      code: "fr",
      name: "french",
      flag: "https://cdn-icons-png.flaticon.com/512/197/197560.png",
    },
  ]

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.languageModalOverlay}>
        <View style={styles.languageModalContainer}>
          <Text style={styles.languageModalTitle}>{I18n.t("chooseLanguage")}</Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.languageOption}
              onPress={() => onSelectLanguage(lang.code)}
            >
              <Image source={{ uri: lang.flag }} style={styles.languageFlag} />
              <Text style={styles.languageText}>{I18n.t(lang.name)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  )
}

const BLUE = "#007EFD"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingLogo: {
    width: width * 0.9,
    height: height * 0.4,
  },
  contentContainer: {
    flex: 1,
  },
  slide: {
    width,
    height,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  safeTop: {
    paddingHorizontal: 16,
    zIndex: 10,
    position: "absolute",
    top: 0,
    right: 0,
  },
  skipBtn: {
    alignSelf: "flex-end",
    marginTop: 66,
    marginRight: 26,
  },
  skipText: {
    color: BLUE,
    fontSize: 16,
    fontWeight: "600",
  },
  blueBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: BLUE,
    zIndex: 1,
  },
  blueBackgroundContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    zIndex: 1,
  },
  curvedBlueSection: {
    // Placeholder for curved section if needed
  },
  heroContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: height * 0.35,
    zIndex: 2,
  },

  heroImage: {
    width: width * 1.0,
    height: height * 0.74,
    
    borderBottomLeftRadius: width * 0.2,
    borderBottomRightRadius: width * 0.2,
    backgroundColor: BLUE,
  },
  contentSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    zIndex: 3,
    justifyContent: "center",
    paddingBottom: 40,
  },
  captionText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    marginBottom: 32,
  },
  primaryCta: {
    height: 52,
    paddingHorizontal: 40,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 140,
  },
  primaryCtaText: {
    color: BLUE,
    fontSize: 18,
    fontWeight: "600",
  },
  languageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  languageModalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: width * 0.8,
    alignItems: "center",
  },
  languageModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
    width: "100%",
  },
  languageFlag: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  languageText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
})

export default OnboardingScreen
