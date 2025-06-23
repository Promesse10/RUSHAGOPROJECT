"use client"

import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StatusBar } from "react-native"

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen"
import AuthScreen from "../screens/auth-screen"
import LoginScreen from "../screens/CarRenter/LoginScreen" // Import the LoginScreen
import UserTypeSelectionScreen from "../screens/UserTypeSelectionScreen"

// Car Owner Screens
import CarOwnerSignupScreen from "../screens/CarOwner/SignupScreen"
import CarOwnerLoginScreen from "../screens/CarOwner/LoginScreen"

// Car Owner Dashboard Screens
import DashboardScreen from "../screens/CarOwner/DashboardScreen"
import MyCarsScreen from "../screens/CarOwner/MyCarsScreen"
import AddNewCarScreen from "../screens/CarOwner/AddNewCarScreen"
import CarDetailScreen from "../screens/CarOwner/CarDetailScreen"
import TopChoiceAdsScreen from "../screens/CarOwner/TopChoiceAdsScreen"
import SubscriptionPlanScreen from "../screens/CarOwner/SubscriptionPlanScreen"
import ProfileSettingsScreen from "../screens/CarOwner/ProfileSettingsScreen"

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
import Settings from "../screens/CarRenter/Settings"


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

// Import the drawer navigator for car owner dashboard
import { createDrawerNavigator } from "@react-navigation/drawer"
import CustomDrawer from "../components/Map/CustomDrawer"

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

// Car Owner Dashboard Drawer Navigator
const CarOwnerDashboardNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#333333",
        drawerActiveBackgroundColor: "#007EFD",
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#333333",
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen
        name="MyCars"
        component={MyCarsScreen}
        options={{
          title: "My Cars",
        }}
      />
      <Drawer.Screen
        name="AddNewCar"
        component={AddNewCarScreen}
        options={{
          title: "Add New Car",
        }}
      />
      <Drawer.Screen
        name="TopChoiceAds"
        component={TopChoiceAdsScreen}
        options={{
          title: "Top Choice Ads",
        }}
      />
      <Drawer.Screen
        name="SubscriptionPlan"
        component={SubscriptionPlanScreen}
        options={{
          title: "Subscription Plan",
        }}
      />
      <Drawer.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          title: "Profile & Settings",
        }}
      />
    </Drawer.Navigator>
  )
}

// Main App Navigator - always showing onboarding for testing
const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Stack.Navigator
        initialRouteName="Onboarding" // Always start with Onboarding for testing
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        {/* Always include Onboarding in the stack */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
            gestureEnabled: false, // Disable swipe back from onboarding
          }}
        />

        <Stack.Screen
          name="AuthScreen"
          component={AuthScreen}
          options={{
            headerShown: false,
            presentation: "fullScreenModal", // Make it full screen
            gestureEnabled: true, // Enable swipe gestures
          }}
        />

        {/* Add LoginScreen to the navigator */}
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />

        <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} options={{ headerShown: false }} />

        {/* Car Owner Auth Screens */}
        <Stack.Screen name="CarOwnerSignup" component={CarOwnerSignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CarOwnerLogin" component={CarOwnerLoginScreen} options={{ headerShown: false }} />

        {/* Car Owner Dashboard Screens */}
        <Stack.Screen
          name="CarOwnerDashboard"
          component={CarOwnerDashboardNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
  name="CarDetail"
  component={CarDetailScreen}
  options={{ headerShown: false }}
/>

        {/* Car Rental Auth Screens */}
        <Stack.Screen name="CarRentalSignup" component={CarRentalSignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CarRentalLogin" component={CarRentalLoginScreen} options={{ headerShown: false }} />

        {/* Verification Screen */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />

        {/* Car Brand Selection Screen */}
        <Stack.Screen name="CarBrandSelection" component={CarBrandSelection} options={{ headerShown: false }} />
        
        {/* Main App Screens */}
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Bookings" component={AllCarsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CompaniesScreen" component={CompaniesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MapView" component={MapView} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />

        {/* Settings Related Screens */}
        <Stack.Screen name="AccountInformation" component={AccountInformation} options={{ headerShown: false }} />
        <Stack.Screen name="LinkAccount" component={LinkAccount} options={{ headerShown: false }} />
        <Stack.Screen name="Language" component={Language} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AboutRushGo" component={AboutRushGo} options={{ headerShown: false }} />
        <Stack.Screen name="GetHelp" component={GetHelp} options={{ headerShown: false }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: false }} />
        <Stack.Screen name="PushNotifications" component={PushNotifications} options={{ headerShown: false }} />
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

// Wrap with NavigationContainer if this is your root navigator
const RootNavigator = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}

// Export the appropriate navigator based on your app structure
export default AppNavigator // or export default RootNavigator;
