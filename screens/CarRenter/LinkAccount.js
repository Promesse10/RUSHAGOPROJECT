import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Switch, Alert } from 'react-native';
import { ChevronLeft } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LinkAccount = () => {
  const navigation = useNavigation();
  const [googleLinked, setGoogleLinked] = useState(true);
  const [appleLinked, setAppleLinked] = useState(true);
  const [twitterLinked, setTwitterLinked] = useState(false);
  const [profileImage, setProfileImage] = useState(require('../../assets/WhatsApp Image 2024-12-10 at 11.45.08.jpeg'));
  const [profileName, setProfileName] = useState('UMUBYEYI Kevine');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        const savedFullName = await AsyncStorage.getItem('fullName');

        if (savedProfileImage) setProfileImage({ uri: savedProfileImage });
        if (savedFullName) setProfileName(savedFullName);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const navigateBack = () => {
    navigation.goBack();
  };

  const handleGoogleToggle = (value) => {
    if (value) {
      Alert.alert(
        'Allow Sign-In',
        'Do you want to allow sign-in with Google?',
        [
          { text: 'Cancel', onPress: () => setGoogleLinked(false), style: 'cancel' },
          { text: 'OK', onPress: () => setGoogleLinked(true) },
        ]
      );
    } else {
      setGoogleLinked(false);
    }
  };

  const handleAppleToggle = (value) => {
    if (value) {
      Alert.alert(
        'Allow Sign-In',
        'Do you want to allow sign-in with Apple?',
        [
          { text: 'Cancel', onPress: () => setAppleLinked(false), style: 'cancel' },
          { text: 'OK', onPress: () => setAppleLinked(true) },
        ]
      );
    } else {
      setAppleLinked(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack}>
            <ChevronLeft width={24} height={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Link account</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileSection}>
          <Image
            source={profileImage}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.accountType}>Car Renter Account</Text>
        </View>

        <View style={styles.linksContainer}>
          <View style={styles.linkItem}>
            <View style={styles.linkLeft}>
              <Image
                source={require('../../assets/google-logo.png')}
                style={styles.socialLogo}
              />
              <Text style={styles.linkText}>Login with Google</Text>
            </View>
            <Switch
              value={googleLinked}
              onValueChange={handleGoogleToggle}
              trackColor={{ false: '#E0E0E0', true: '#007EFD' }}
              thumbColor="#FFFFFF"
            />
          </View>

      
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007EFD',
  },
  container: {
    flex: 1,
    backgroundColor: '#007EFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  accountType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  linksContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  linkText: {
    fontSize: 16,
  },
});

export default LinkAccount;