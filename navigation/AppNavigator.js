import "react-native-gesture-handler"
import { createStackNavigator } from "@react-navigation/stack"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StatusBar, Platform } from "react-native"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import "../utils/i18n" // <-- Make sure this is present to initialize i18n
import Ionicons from "react-native-vector-icons/Ionicons";
// Screens
import OnboardingScreen from "../screens/OnboardingScreen"
import AuthScreen from "../screens/auth-screen"
import LoginScreen from "../screens/CarRenter/LoginScreen"
import UserTypeSelectionScreen from "../screens/UserTypeSelectionScreen"
import CarOwnerSignupScreen from "../screens/CarOwner/SignupScreen"
import CarOwnerLoginScreen from "../screens/CarOwner/LoginScreen"
import DashboardScreen from "../screens/CarOwner/DashboardScreen"
import MyCarsScreen from "../screens/CarOwner/MyCarsScreen"
import AddCarScreen from "../screens/CarOwner/AddCarScreen"
import SettingsScreen from "../screens/CarOwner/SettingsScreen"
import PaymentMethodsScreen from "../screens/CarOwner/PaymentMethodsScreen"
import SavedDraftsScreen from "../screens/CarOwner/SavedDraftsScreen"
import CarRentalSignupScreen from "../screens/CarRenter/SignupScreen"
import CarRentalLoginScreen from "../screens/CarRenter/LoginScreen"
import FilterSidebar from "../screens/CarRenter/FilterSidebar"
import Home from "../screens/CarRenter/Home"
import CarListing from "../screens/CarRenter/CarListing"
import MapView from "../screens/CarRenter/MapView"
import CarDetailsScreen from "../screens/CarRenter/CarDetailsScreen"
import LinkAccount from "../screens/CarRenter/LinkAccount"
import AboutRushGo from "../screens/CarRenter/AboutRushGo"
import GetHelp from "../screens/CarRenter/Privacy"
import PrivacyPolicy from "../screens/CarRenter/PrivacyPolicy"
import NotificationsScreen from "../screens/CarRenter/NotificationsScreen"
import PushNotifications from "../screens/CarRenter/PushNotifications"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"
import ResetPasswordScreen from "../screens/ResetPasswordScreen"

import { Home as HomeIcon, Car, Settings } from "lucide-react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { LocationProvider } from "../screens/CarRenter/LocationContext"
import { LanguageProvider } from "../screens/CarRenter/LanguageContext"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Car Owner Bottom Tab Navigator
const CarOwnerTabNavigator = () => {
  const { t } = useTranslation()

  return (
<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      if (route.name === "Dashboard") {
        iconName = focused ? "home" : "home-outline";
      } else if (route.name === "MyCars") {
        iconName = focused ? "car" : "car-outline";
      } else if (route.name === "AddCar") {
        iconName = focused ? "add-circle" : "add-circle-outline";
      } else if (route.name === "Settings") {
        iconName = focused ? "settings" : "settings-outline";
      }

      return <Ionicons name={iconName} size={30} color={color} />;
    },
    tabBarShowLabel: false, // 👈 hides the text labels
    tabBarActiveTintColor: "#007EFD",
    tabBarInactiveTintColor: "#9CA3AF",
    headerShown: false,
    tabBarStyle: {
      backgroundColor: "#FFFFFF",
      elevation: 8,
      height: 100,
      paddingTop: 12,
      paddingBottom: 30,
    },
  })}
>
  <Tab.Screen name="Dashboard" component={DashboardScreen} />
  <Tab.Screen name="MyCars" component={MyCarsScreen} />
  <Tab.Screen name="AddCar" component={AddCarScreen} />
  <Tab.Screen name="Settings" component={SettingsScreen} />
</Tab.Navigator>
  )
}

// Car Renter Bottom Tab Navigator
const CarRenterTabNavigator = () => {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "HomeTab") return <HomeIcon size={size} color={color} />
          if (route.name === "CarsTab") return <Car size={size} color={color} />
          if (route.name === "SettingsTab") return <Settings size={size} color={color} />
        },
        tabBarActiveTintColor: "#007EFD",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 20,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ tabBarLabel: t("home") }} />
      <Tab.Screen name="CarsTab" component={CarListing} options={{ tabBarLabel: "Cars" }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: t("settings") }} />
    </Tab.Navigator>
  )
}

// Main App Navigator
const AppNavigator = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Default language
    i18n.changeLanguage("rw")
  }, [i18n])

  return (
    <LanguageProvider>
      <LocationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AuthScreen" component={AuthScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
            <Stack.Screen name="FilterSidebar" component={FilterSidebar} />
            <Stack.Screen name="CarOwnerSignup" component={CarOwnerSignupScreen} />
            <Stack.Screen name="CarOwnerLogin" component={CarOwnerLoginScreen} />
            <Stack.Screen name="CarOwnerDashboard" component={CarOwnerTabNavigator} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="SavedDrafts" component={SavedDraftsScreen} />
            <Stack.Screen name="CarRentalSignup" component={CarRentalSignupScreen} />
            <Stack.Screen name="CarRentalLogin" component={CarRentalLoginScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CarRenterDashboard" component={CarRenterTabNavigator} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="CarListing" component={CarListing} />
            <Stack.Screen name="CarDetails" component={CarDetailsScreen} />
            <Stack.Screen name="MapView" component={MapView} />
            <Stack.Screen name="LinkAccount" component={LinkAccount} />
            <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
            <Stack.Screen name="AboutRushGo" component={AboutRushGo} />
            <Stack.Screen name="GetHelp" component={GetHelp} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen name="PushNotifications" component={PushNotifications} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ gestureEnabled: true }} />
            <Stack.Screen
  name="ResetPasswordScreen"
  component={ResetPasswordScreen}
  options={{ gestureEnabled: true }}
/>

          </Stack.Navigator>
        </GestureHandlerRootView>
      </LocationProvider>
    </LanguageProvider>
  )
}

export default AppNavigator
