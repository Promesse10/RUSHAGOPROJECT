import 'react-native-gesture-handler';
import React from 'react';
import * as WebBrowser from 'expo-web-browser';

// ✅ MUST be called at the app root so the auth redirect is handled
// when Google sends the user back via the expo proxy deep-link.
WebBrowser.maybeCompleteAuthSession();

import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import './utils/i18n';
import { useEffect } from 'react';
import { loadAuthFromStorage } from './redux/action/LoginActions';

console.log('🔍 Verifying React Native runtime dependencies...');

if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong.</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  console.log('🚀 App component rendered');

  const StartApp = () => {
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(loadAuthFromStorage());
    }, [dispatch]);

    return (
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
  };

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <StartApp />
      </Provider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#721c24',
  },
});

export default App;