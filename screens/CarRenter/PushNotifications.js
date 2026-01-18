// PushNotifications.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PushNotifications = () => {
  const navigation = useNavigation();
  const [recommendations, setRecommendations] = useState(true);
  const [communication, setCommunication] = useState(true);
  const [promotion, setPromotion] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack}>
            <Feather name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Push notification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.iconContainer}>
                <Feather name="thumbs-up" size={20} color="#007EFD" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Recommendation</Text>
                <Text style={styles.notificationDescription}>
                  Receive recommendations based on your activities
                </Text>
              </View>
            </View>
            <Switch
              value={recommendations}
              onValueChange={setRecommendations}
              trackColor={{ false: '#E0E0E0', true: '#007EFD' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.iconContainer}>
                <Feather name="message-square" size={20} color="#007EFD" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Communication</Text>
                <Text style={styles.notificationDescription}>
                  Receive updates, offers and more
                </Text>
              </View>
            </View>
            <Switch
              value={communication}
              onValueChange={setCommunication}
              trackColor={{ false: '#E0E0E0', true: '#007EFD' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.iconContainer}>
                <Feather name="tag" size={20} color="#007EFD" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Promotion</Text>
                <Text style={styles.notificationDescription}>
                  Receive offers based on your activity
                </Text>
              </View>
            </View>
            <Switch
              value={promotion}
              onValueChange={setPromotion}
              trackColor={{ false: '#E0E0E0', true: '#007EFD' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={20} color="#007EFD" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Get alert in your email</Text>
                <Text style={styles.notificationDescription}>
                  Get updates in your email inbox
                </Text>
              </View>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: '#E0E0E0', true: '#007EFD' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <View style={styles.iconContainer}>
                <Feather name="file-text" size={20} color="#007EFD" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Newsletter</Text>
                <Text style={styles.notificationDescription}>
                  Receive email with cars recommendation
                </Text>
              </View>
            </View>
            <Switch
              value={newsletter}
              onValueChange={setNewsletter}
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#999',
  },
});

export default PushNotifications;