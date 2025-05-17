import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, Platform } from 'react-native'; // Import React Native components
import AppNavigator from './navigation/AppNavigator';

// Polyfill for setImmediate
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// Simple error boundary component
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
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
};

// Styles for the error boundary
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da', // Light red background
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24', // Dark red text
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#721c24', // Dark red text
  },
});

export default App;
