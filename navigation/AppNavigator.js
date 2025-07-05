"use client"

import { createStackNavigator } from "@react-navigation/stack"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StatusBar } from "react-native"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import "../utils/i18n" // Import i18n configuration

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen"
import AuthScreen from "../screens/auth-screen"
import LoginScreen from "../screens/CarRenter/LoginScreen"
import UserTypeSelectionScreen from "../screens/UserTypeSelectionScreen"

// Car Owner Screens
import CarOwnerSignupScreen from "../screens/CarOwner/SignupScreen"
import CarOwnerLoginScreen from "../screens/CarOwner/LoginScreen"

// Car Owner Dashboard Screens
import DashboardScreen from "../screens/CarOwner/DashboardScreen"
import MyCarsScreen from "../screens/CarOwner/MyCarsScreen"
import AddCarScreen from "../screens/CarOwner/AddCarScreen"
import SettingsScreen from "../screens/CarOwner/SettingsScreen"
import PaymentMethodsScreen from "../screens/CarOwner/PaymentMethodsScreen"
import SavedDraftsScreen from "../screens/CarOwner/SavedDraftsScreen"

// Car Rental Screens
import CarRentalSignupScreen from "../screens/CarRenter/SignupScreen"
import CarRentalLoginScreen from "../screens/CarRenter/LoginScreen"
import CarBrandSelection from "../screens/CarRenter/CarBrandSelection"
import FilterScreen from "../screens/CarRenter/FilterScreen"

// Main App Screens
import Home from "../screens/CarRenter/Home"
import AllCarsScreen from "../screens/CarRenter/AllCarsScreen"
import CompaniesScreen from "../screens/CarRenter/CompaniesScreen"
import MapView from "../screens/CarRenter/MapView"

// Settings Related Screens
import AccountInformation from "../screens/CarRenter/AccountInformation"
import LinkAccount from "../screens/CarRenter/LinkAccount"
import Language from "../screens/CarRenter/Language"
import AboutRushGo from "../screens/CarRenter/AboutRushGo"
import GetHelp from "../screens/CarRenter/Privacy"
import PrivacyPolicy from "../screens/CarRenter/PrivacyPolicy"
import NotificationsScreen from "../screens/CarRenter/NotificationsScreen"
import PushNotifications from "../screens/CarRenter/PushNotifications"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"

// Import bottom tab navigator
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Car Owner Bottom Tab Navigator - Enhanced with better padding
const CarOwnerTabNavigator = () => {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "MyCars") {
            iconName = focused ? "car" : "car-outline"
          } else if (route.name === "AddCar") {
            iconName = focused ? "add" : "add-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          }
          return <Ionicons name={iconName} size={24} color={color} />
        },
        tabBarActiveTintColor: "#007EFD",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          paddingBottom: 20,
          paddingTop: 12,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
          marginBottom: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t("home", "Home"),
        }}
      />
      <Tab.Screen
        name="MyCars"
        component={MyCarsScreen}
        options={{
          tabBarLabel: t("myCars", "My Cars"),
        }}
      />
      <Tab.Screen
        name="AddCar"
        component={AddCarScreen}
        options={{
          tabBarLabel: t("addCar", "Add Car"),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t("settings", "Settings"),
        }}
      />
    </Tab.Navigator>
  )
}

// Main App Navigator
const AppNavigator = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Set Kinyarwanda as default language for car owner screens
    if (!i18n.language || i18n.language === "en") {
      i18n.changeLanguage("rw")
    }
  }, [i18n])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="AuthScreen"
          component={AuthScreen}
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="UserTypeSelection"
          component={UserTypeSelectionScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="FilterScreen"
          component={FilterScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Car Owner Auth Screens */}
        <Stack.Screen
          name="CarOwnerSignup"
          component={CarOwnerSignupScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="CarOwnerLogin"
          component={CarOwnerLoginScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Car Owner Dashboard - Direct to Tab Navigator */}
        <Stack.Screen
          name="CarOwnerDashboard"
          component={CarOwnerTabNavigator}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Additional Screens */}
        <Stack.Screen
          name="PaymentMethods"
          component={PaymentMethodsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="SavedDrafts"
          component={SavedDraftsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Car Rental Auth Screens */}
        <Stack.Screen
          name="CarRentalSignup"
          component={CarRentalSignupScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="CarRentalLogin"
          component={CarRentalLoginScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Verification Screen */}
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Car Brand Selection Screen */}
        <Stack.Screen
          name="CarBrandSelection"
          component={CarBrandSelection}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="Bookings"
          component={AllCarsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="CompaniesScreen"
          component={CompaniesScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="MapView" component={MapView} options={{ headerShown: false, gestureEnabled: false }} />

        {/* Settings Related Screens */}
        <Stack.Screen
          name="AccountInformation"
          component={AccountInformation}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="LinkAccount"
          component={LinkAccount}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="Language" component={Language} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="NotificationsScreen"
          component={NotificationsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="AboutRushGo"
          component={AboutRushGo}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="GetHelp" component={GetHelp} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="PushNotifications"
          component={PushNotifications}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </GestureHandlerRootView>
  )
}

export default AppNavigator
