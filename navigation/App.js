import React, { useEffect } from "react"
import AppNavigator from "./AppNavigator"
import { I18nProvider } from "../utils/i18n"
import { AppContextProvider } from "../context/AppContext"
import { ThemeProvider } from "../navigation/theme-context"
import { Provider, useDispatch } from "react-redux"
import store from "../redux/store"
import { loadAuthFromStorage } from "../redux/action/LoginActions"
import * as Linking from "expo-linking"
import { NavigationContainer } from "@react-navigation/native"
import * as Notifications from 'expo-notifications'
// ✅ Define deep linking prefixes (for Expo Go + your website + custom URI)
const prefix = Linking.createURL("/") // works for Expo Go
const linking = {
  prefixes: [
    prefix,
    "MUVCAR://", // your app custom scheme (use same in backend email link)
    "https://MUVCAR.com", // if you host a website domain
    "http://localhost:3000", // for local testing
  ],
  config: {
    screens: {
      ResetPasswordScreen: "reset-password", // matches link path in email
    },
  },
}

const Startup = () => {
  const dispatch = useDispatch()
useEffect(() => {
  // App opened from killed state by notification
  Notifications.getLastNotificationResponseAsync().then(response => {
    if (response) {
      console.log('Opened from quit state:', response);
    }
  });

  // App opened from background by notification
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Opened from background:', response);
  });

  return () => subscription.remove();
}, []);

  useEffect(() => {
    dispatch(loadAuthFromStorage())
  }, [])

  return (
    <I18nProvider>
      <AppContextProvider>
        <ThemeProvider>
          {/* ✅ Add NavigationContainer with linking config */}
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </AppContextProvider>
    </I18nProvider>
  )
}

const App = () => (
  <Provider store={store}>
    <Startup />
  </Provider>
)

export default App
