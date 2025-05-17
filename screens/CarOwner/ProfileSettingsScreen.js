"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  SafeAreaView,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import LoadingSkeleton from "../../components/Map/LoadingSkeleton"

const ProfileSettingsScreen = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)

  useFocusEffect(
    useCallback(() => {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setProfile({
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "+1 (555) 123-4567",
          businessName: "Smith Car Rentals",
          businessType: "Individual",
          address: "123 Main St, New York, NY 10001",
          profileImage:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png",
        })

        setLoading(false)
      }, 1500)

      return () => {
        // Cleanup if needed
      }
    }, []),
  )

  const handleSaveProfile = () => {
    // In a real app, this would call an API to save the profile data
    alert("Profile saved successfully")
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.loadingContainer}>
            <LoadingSkeleton style={styles.profileImageSkeleton} />
            <LoadingSkeleton style={styles.inputSkeleton} />
            <LoadingSkeleton style={styles.inputSkeleton} />
            <LoadingSkeleton style={styles.inputSkeleton} />
            <LoadingSkeleton style={styles.inputSkeleton} />
            <LoadingSkeleton style={styles.settingsSkeleton} />
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileImageSection}>
          <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.changeImageButton}>
            <MaterialIcons name="camera-alt" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={profile.businessName}
            onChangeText={(text) => setProfile({ ...profile, businessName: text })}
          />

          <Text style={styles.inputLabel}>Business Type</Text>
          <TextInput
            style={styles.input}
            value={profile.businessType}
            onChangeText={(text) => setProfile({ ...profile, businessType: text })}
          />

          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={profile.address}
            onChangeText={(text) => setProfile({ ...profile, address: text })}
            multiline
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Enable dark theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#D1D1D6", true: "#007EFD" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive push notifications</Text>
            </View>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: "#D1D1D6", true: "#007EFD" }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  profileImageSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
  },
  inputSkeleton: {
    height: 60,
    width: "100%",
    marginBottom: 16,
    borderRadius: 8,
  },
  settingsSkeleton: {
    height: 120,
    width: "100%",
    marginBottom: 16,
    borderRadius: 8,
  },
  profileImageSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#007EFD",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  formSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: "#007EFD",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
  },
})

export default ProfileSettingsScreen

