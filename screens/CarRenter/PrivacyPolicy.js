import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PRIVACY_URL = 'https://www.getcarconnect.com/LegalTerms';

const PrivacyPolicy = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#ffffff';
  const textColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';

  const onRetry = () => {
    setError(false);
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <View style={[styles.header, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F8FAFC' }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor }]}> 
          <Text style={[styles.errorText, { color: textColor }]}>Unable to load content. Please check your internet connection.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webviewContainer}>
          <WebView
            key={reloadKey}
            source={{ uri: PRIVACY_URL }}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
            onLoadStart={() => {
              setLoading(true);
              setError(false);
            }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            style={styles.webview}
            originWhitelist={["*"]}
          />

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007EFD" />
              <Text style={styles.loadingText}>Loading privacy policy...</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 18,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007EFD',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default PrivacyPolicy;
