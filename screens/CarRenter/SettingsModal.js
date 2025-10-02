"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
  Linking,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import * as ImagePicker from "expo-image-picker"
import I18n from "../../utils/i18n"
import * as SecureStore from "expo-secure-store"

const { width, height } = Dimensions.get("window")

const SettingsModal = ({ visible, onClose, userProfile, onProfileUpdate, navigation }) => {
  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false) // Added help modal state
  const [editingProfile, setEditingProfile] = useState(false)
  const [tempProfile, setTempProfile] = useState(userProfile)
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadSavedProfile()
  }, [])

  const loadSavedProfile = async () => {
    try {
      const savedProfile = await SecureStore.getItemAsync("userProfile")
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        setTempProfile(parsedProfile)
      }
    } catch (error) {
      console.log("Error loading saved profile:", error)
    }
  }

  const saveProfileToStorage = async (profile) => {
    try {
      await SecureStore.setItemAsync("userProfile", JSON.stringify(profile))
    } catch (error) {
      console.log("Error saving profile:", error)
    }
  }

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        const updatedProfile = { ...tempProfile, profileImage: result.assets[0].uri }
        setTempProfile(updatedProfile)
        await saveProfileToStorage(updatedProfile)
        onProfileUpdate(updatedProfile)
        Alert.alert("Success", "Profile picture updated successfully")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleSaveProfile = async () => {
    await saveProfileToStorage(tempProfile)
    onProfileUpdate(tempProfile)
    setEditingProfile(false)
    Alert.alert("Success", "Profile updated successfully")
  }

  const handleChangePassword = () => {
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      Alert.alert("Error", "Please fill all password fields")
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert("Error", "New passwords don't match")
      return
    }

    if (passwords.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    Alert.alert("Success", "Password changed successfully")
    setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
    setShowChangePassword(false)
  }

  const handleWhatsAppContact = () => {
    const phoneNumber = "+250780114522"
    const url = `whatsapp://send?phone=${phoneNumber}`
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed on this device")
    })
  }

  const handlePhoneContact = () => {
    const phoneNumber = "+250780114522"
    const url = `tel:${phoneNumber}`
    Linking.openURL(url)
  }

  const handleMessageContact = () => {
    const phoneNumber = "+250780114522"
    const url = `sms:${phoneNumber}`
    Linking.openURL(url)
  }

  const handleLogout = () => {
    Alert.alert(I18n.t("logout"), "Are you sure you want to logout?", [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("logout"),
        style: "destructive",
        onPress: () => {
          onClose()
          // Navigate to login screen
          navigation.navigate("AuthScreen")
        },
      },
    ])
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIndicator} />
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>{I18n.t("settings")}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Profile Section */}
            <View style={styles.section}>
              <View style={styles.profileSection}>
                <TouchableOpacity
                  style={styles.profileImageContainer}
                  onPress={handleImagePicker} // Always allow image picking
                >
                  <Image source={{ uri: tempProfile.profileImage }} style={styles.profileImage} />
                  <View style={styles.cameraOverlay}>
                    <Icon name="camera" size={20} color="white" />
                  </View>
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{tempProfile.name}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      if (editingProfile) {
                        handleSaveProfile()
                      } else {
                        setEditingProfile(true)
                      }
                    }}
                  >
                    <Text style={styles.editButtonText}>{editingProfile ? I18n.t("save") : I18n.t("changePhoto")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Personal Information */}
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowPersonalInfo(true)}>
              <View style={styles.settingLeft}>
                <Icon name="person" size={24} color="#007EFD" />
                <Text style={styles.settingText}>{I18n.t("personalInfo")}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* Change Password */}
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowChangePassword(true)}>
              <View style={styles.settingLeft}>
                <Icon name="lock-closed" size={24} color="#007EFD" />
                <Text style={styles.settingText}>{I18n.t("changePassword")}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* Help */}
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowHelpModal(true)}>
              <View style={styles.settingLeft}>
                <Icon name="help-circle" size={24} color="#007EFD" />
                <Text style={styles.settingText}>{I18n.t("help")}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="shield-checkmark" size={24} color="#007EFD" />
                <Text style={styles.settingText}>{I18n.t("policy")}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <Icon name="log-out" size={24} color="#FF3B30" />
                <Text style={[styles.settingText, styles.logoutText]}>{I18n.t("logout")}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Personal Info Modal */}
        <Modal visible={showPersonalInfo} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.headerIndicator} />
                <View style={styles.headerContent}>
                  <Text style={styles.modalTitle}>{I18n.t("personalInfo")}</Text>
                  <TouchableOpacity onPress={() => setShowPersonalInfo(false)} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.scrollContent}>
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{I18n.t("name")}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={tempProfile.name}
                      onChangeText={(text) => setTempProfile({ ...tempProfile, name: text })}
                      placeholder="Enter your name"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.textInput}
                      value={tempProfile.email || ""}
                      onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{I18n.t("telephone")}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={tempProfile.telephone || ""}
                      onChangeText={(text) => setTempProfile({ ...tempProfile, telephone: text })}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                    <Text style={styles.saveButtonText}>{I18n.t("save")}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Change Password Modal */}
        <Modal visible={showChangePassword} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.headerIndicator} />
                <View style={styles.headerContent}>
                  <Text style={styles.modalTitle}>{I18n.t("changePassword")}</Text>
                  <TouchableOpacity onPress={() => setShowChangePassword(false)} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.scrollContent}>
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{I18n.t("oldPassword")}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={passwords.oldPassword}
                      onChangeText={(text) => setPasswords({ ...passwords, oldPassword: text })}
                      placeholder="Enter current password"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{I18n.t("newPassword")}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={passwords.newPassword}
                      onChangeText={(text) => setPasswords({ ...passwords, newPassword: text })}
                      placeholder="Enter new password"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <TextInput
                      style={styles.textInput}
                      value={passwords.confirmPassword}
                      onChangeText={(text) => setPasswords({ ...passwords, confirmPassword: text })}
                      placeholder="Confirm new password"
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                    <Text style={styles.saveButtonText}>{I18n.t("update")}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={showHelpModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.headerIndicator} />
                <View style={styles.headerContent}>
                  <Text style={styles.modalTitle}>Help & Support</Text>
                  <TouchableOpacity onPress={() => setShowHelpModal(false)} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.scrollContent}>
                <View style={styles.helpSection}>
                  {/* Rushago Logo */}
                  <View style={styles.logoContainer}>
                    <Image source={require("../../assets/logo.png")} style={styles.helpLogo} resizeMode="contain" />
                  </View>

                  <Text style={styles.helpTitle}>Contact Us</Text>
                  <Text style={styles.helpSubtitle}>We're here to help you 24/7</Text>

                  {/* Contact Options */}
                  <View style={styles.contactOptions}>
                    <TouchableOpacity style={styles.contactOption} onPress={handleWhatsAppContact}>
                      <Icon name="logo-whatsapp" size={30} color="#25D366" />
                      <Text style={styles.contactText}>WhatsApp</Text>
                      <Text style={styles.contactNumber}>+250780114522</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactOption} onPress={handlePhoneContact}>
                      <Icon name="call" size={30} color="#007EFD" />
                      <Text style={styles.contactText}>Phone Call</Text>
                      <Text style={styles.contactNumber}>+250780114522</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactOption} onPress={handleMessageContact}>
                      <Icon name="chatbubble" size={30} color="#007EFD" />
                      <Text style={styles.contactText}>SMS</Text>
                      <Text style={styles.contactNumber}>+250780114522</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Policy */}
                  <View style={styles.policySection}>
                    <Text style={styles.policyTitle}>Our Policy</Text>
                    <Text style={styles.policyText}>rushagoltd</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.85,
    minHeight: height * 0.6,
  },
  modalHeader: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 15,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ddd",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: "#007EFD",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 20,
  },
  logoutText: {
    color: "#FF3B30",
  },
  formSection: {
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  saveButton: {
    backgroundColor: "#007EFD",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  helpSection: {
    paddingVertical: 20,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  helpLogo: {
    width: 200,
    height: 80,
  },
  helpTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  helpSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  contactOptions: {
    width: "100%",
    marginBottom: 30,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  contactText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  contactNumber: {
    fontSize: 16,
    color: "#007EFD",
    fontWeight: "bold",
  },
  policySection: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  policyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})

export default SettingsModal
