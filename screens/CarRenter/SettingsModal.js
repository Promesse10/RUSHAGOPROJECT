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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import * as ImagePicker from "expo-image-picker"
import I18n from "../../utils/i18n"
import { useDispatch, useSelector } from "react-redux"
import { getCurrentUserAction, updateUserAction } from "../../redux/action/UserActions"

const { width, height } = Dimensions.get("window")

const SettingsModal = ({ visible, onClose, navigation }) => {
  const dispatch = useDispatch()
  const { currentUser, isLoading, isUpdating } = useSelector((state) => state.user)

  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showNumber, setShowNumber] = useState(false)
  const phoneNumber = "+250780114522"

  const handleWhatsAppContact = () => {
    setShowNumber(true)
    const url = `https://wa.me/${phoneNumber.replace("+", "")}`
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open WhatsApp"))
  }

  const handlePhoneContact = () => {
    setShowNumber(true)
    Linking.openURL(`tel:${phoneNumber}`).catch(() => Alert.alert("Error", "Unable to start a call"))
  }

  const handleMessageContact = () => {
    setShowNumber(true)
    Linking.openURL(`sms:${phoneNumber}`).catch(() => Alert.alert("Error", "Unable to open messaging app"))
  }

  const [tempProfile, setTempProfile] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // ✅ Fetch user data when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(getCurrentUserAction())
    }
  }, [visible])

  // ✅ Update temporary state when Redux store updates
  useEffect(() => {
    if (currentUser) {
      setTempProfile({
        _id: currentUser._id,
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || currentUser.telephone || "",
      })
    }
  }, [currentUser])

  // ✅ Update profile info (name, email, phone)
  const handleSaveProfile = async () => {
    if (!tempProfile.name || !tempProfile.email || !tempProfile.phone) {
      return Alert.alert("Error", "Please fill all required fields")
    }

    try {
      await dispatch(updateUserAction(tempProfile)).unwrap()
      Alert.alert("Success", "Profile updated successfully")
      setShowPersonalInfo(false)
      dispatch(getCurrentUserAction()) // Refresh after save
    } catch (error) {
      Alert.alert("Error", error || "Failed to update profile")
    }
  }

  // ✅ Change password
  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "Please fill all password fields")
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "New passwords do not match")
    }
    if (newPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters")
    }

    try {
      await dispatch(
        updateUserAction({
          _id: tempProfile._id,
          oldPassword,
          newPassword,
        })
      ).unwrap()

      Alert.alert("Success", "Password changed successfully")
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setShowChangePassword(false)
    } catch (error) {
      Alert.alert("Error", error || "Failed to update password")
    }
  }

  // ✅ Pick and update profile image (optional)
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow photo library access")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const imageUri = result.assets[0].uri
      try {
        await dispatch(updateUserAction({ _id: tempProfile._id, profileImage: imageUri })).unwrap()
        Alert.alert("Success", "Profile picture updated successfully")
        dispatch(getCurrentUserAction())
      } catch (error) {
        Alert.alert("Error", "Failed to update profile image")
      }
    }
  }

  const handleLogout = () => {
    Alert.alert(I18n.t("logout"), "Are you sure you want to logout?", [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("logout"),
        style: "destructive",
        onPress: () => {
          onClose()
          navigation.navigate("AuthScreen")
        },
      },
    ])
  }


  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
                <TouchableOpacity onPress={handleImagePicker} style={styles.profileImageContainer}>
                  <Image
                    source={
                      currentUser?.profileImage
                        ? { uri: currentUser.profileImage }
                        : { uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.cameraOverlay}>
                    <Icon name="camera" size={20} color="white" />
                  </View>
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{currentUser?.name || "No Name"}</Text>
                  <Text style={styles.profileEmail}>{currentUser?.email || "No Email"}</Text>
                  <Text style={styles.profilePhone}>{currentUser?.phone || "No Phone"}</Text>
                </View>
              </View>
            </View>

            {/* Personal Info */}
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
<Modal
  visible={showPersonalInfo}
  transparent
  animationType="slide"
  onRequestClose={() => setShowPersonalInfo(false)}
>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxHeight: height * 0.6 }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIndicator} />
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>{I18n.t("personalInfo")}</Text>
              <TouchableOpacity onPress={() => setShowPersonalInfo(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{I18n.t("name")}</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.name}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, name: text })}
                  placeholder={I18n.t("enterName")}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{I18n.t("email")}</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.email}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
                  keyboardType="email-address"
                  placeholder={I18n.t("enterEmail")}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{I18n.t("phone")}</Text>
                <TextInput
                  style={styles.textInput}
                  value={tempProfile.phone}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, phone: text })}
                  keyboardType="phone-pad"
                  placeholder={I18n.t("enterPhone")}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? I18n.t("saving") + "..." : I18n.t("save")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
</Modal>

{/* Change Password Modal */}
<Modal
  visible={showChangePassword}
  transparent
  animationType="slide"
  onRequestClose={() => setShowChangePassword(false)}
>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxHeight: height * 0.9 }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIndicator} />
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>{I18n.t("changePassword")}</Text>
              <TouchableOpacity onPress={() => setShowChangePassword(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{I18n.t("oldPassword")}</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={passwords.oldPassword}
                  onChangeText={(t) => setPasswords({ ...passwords, oldPassword: t })}
                  placeholder={I18n.t("enterOldPassword")}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{I18n.t("newPassword")}</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={passwords.newPassword}
                  onChangeText={(t) => setPasswords({ ...passwords, newPassword: t })}
                  placeholder={I18n.t("enterNewPassword")}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{I18n.t("confirmNewPassword")}</Text>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry
                  value={passwords.confirmPassword}
                  onChangeText={(t) => setPasswords({ ...passwords, confirmPassword: t })}
                  placeholder={I18n.t("confirmNewPassword")}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <Text style={styles.saveButtonText}>{I18n.t("update")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
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
          {showNumber && <Text style={styles.contactNumber}>{phoneNumber}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactOption} onPress={handlePhoneContact}>
          <Icon name="call" size={30} color="#007EFD" />
          <Text style={styles.contactText}>Phone Call</Text>
          {showNumber && <Text style={styles.contactNumber}>{phoneNumber}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactOption} onPress={handleMessageContact}>
          <Icon name="chatbubble" size={30} color="#007EFD" />
          <Text style={styles.contactText}>SMS</Text>
          {showNumber && <Text style={styles.contactNumber}>{phoneNumber}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.policySection}>
        <Text style={styles.policyTitle}>Our Policy</Text>
        <Text style={styles.policyText}>
          Rushago Ltd is a trusted car rental platform connecting vehicle owners with renters.
          We prioritize transparency, safety, and customer satisfaction in every transaction. 
          Our mission is to make renting a car seamless, affordable, and reliable — empowering 
          both car owners and renters with convenience and confidence.
          {"\n\n"}© 2025 RushaGo Inc. All Rights Reserved.
        </Text>
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
