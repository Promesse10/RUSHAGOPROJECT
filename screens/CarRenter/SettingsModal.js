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
import { getCurrentUserAction, updateUserAction, uploadProfileImageAction } from "../../redux/action/UserActions"
import axiosInstance from "../../utils/axios"

const { width, height } = Dimensions.get("window")

const SettingsModal = ({ visible, onClose, navigation }) => {
  const dispatch = useDispatch()
const { currentUser, isUpdating } = useSelector((state) => state.user)

 const profileImageUrl =
    typeof currentUser?.profileImage === "string"
      ? currentUser.profileImage
      : currentUser?.profileImage?.url

  const [showPersonalInfo, setShowPersonalInfo] = useState(false)

const [showLegalModal, setShowLegalModal] = useState(false)
const [legalType, setLegalType] = useState("terms") // or "privacy"


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
      await dispatch(
        uploadProfileImageAction({ uri: imageUri })
      ).unwrap()

      Alert.alert("Success", "Profile picture updated successfully")
      dispatch(getCurrentUserAction())
    } catch (error) {
      console.error("❌ Upload error:", error)
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
const TermsContent = () => (
  <>
    <Text style={legalStyles.title}>MUVCAR Terms of Use</Text>

    <Text style={legalStyles.text}>
      MUVCAR is a digital car rental platform designed to connect vehicle owners
      with renters in a secure and transparent environment.
    </Text>

    <Text style={legalStyles.text}>
      MUVCAR is a product of CarConnect Ltd. By accessing or using the MUVCAR
      mobile application, you agree to comply with these Terms of Use.
    </Text>

    <Text style={legalStyles.subtitle}>1. User Responsibilities</Text>
    <Text style={legalStyles.text}>
      Users must provide accurate information and maintain the security of
      their accounts. Any misuse of the platform may result in suspension.
    </Text>

    <Text style={legalStyles.subtitle}>2. Rentals & Payments</Text>
    <Text style={legalStyles.text}>
      MUVCAR facilitates car rental agreements but does not own vehicles listed
      on the platform.
    </Text>

    <Text style={legalStyles.subtitle}>3. Liability</Text>
    <Text style={legalStyles.text}>
      CarConnect Ltd shall not be liable for damages arising from misuse of the
      platform or third-party actions.
    </Text>

    <Text style={legalStyles.footer}>
      © {new Date().getFullYear()} CarConnect Ltd. All rights reserved.
    </Text>
  </>
)
const PrivacyContent = () => (
  <>
    <Text style={legalStyles.title}>MUVCAR Privacy Policy</Text>

    <Text style={legalStyles.text}>
      This Privacy Policy explains how MUVCAR, a product of CarConnect Ltd,
      collects, uses, and protects your personal information.
    </Text>

    <Text style={legalStyles.subtitle}>1. Information We Collect</Text>
    <Text style={legalStyles.text}>
      We collect personal data such as name, contact details, and usage data to
      provide and improve our services.
    </Text>

    <Text style={legalStyles.subtitle}>2. Data Security</Text>
    <Text style={legalStyles.text}>
      We use industry-standard security measures to protect your information.
    </Text>

    <Text style={legalStyles.subtitle}>3. Third-Party Services</Text>
    <Text style={legalStyles.text}>
      MUVCAR may integrate with third-party services such as payment providers.
    </Text>

    <Text style={legalStyles.footer}>
      © {new Date().getFullYear()} CarConnect Ltd. All rights reserved.
    </Text>
  </>
)


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
  source={{
    uri:
      profileImageUrl ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  }}
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
          
           

            {/* Help */}
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowHelpModal(true)}>
              <View style={styles.settingLeft}>
                <Icon name="help-circle" size={24} color="#007EFD" />
                <Text style={styles.settingText}>{I18n.t("help")}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
{/* Terms of Use */}
<TouchableOpacity
  style={styles.settingItem}
  onPress={() => {
    setLegalType("terms")
    setShowLegalModal(true)
  }}
>

  <View style={styles.settingLeft}>
    <Icon name="document-text" size={24} color="#007EFD" />
    <Text style={styles.settingText}>Terms of Use</Text>
  </View>
  <Icon name="chevron-forward" size={20} color="#666" />
</TouchableOpacity>

{/* Privacy Policy */}
<TouchableOpacity
  style={styles.settingItem}
  onPress={() => {
    setLegalType("privacy")
    setShowLegalModal(true)
  }}
>

  <View style={styles.settingLeft}>
    <Icon name="shield-checkmark" size={24} color="#007EFD" />
    <Text style={styles.settingText}>Privacy Policy</Text>
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

      <Modal visible={showLegalModal} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>

      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.headerIndicator} />
        <View style={styles.headerContent}>
          <Text style={styles.modalTitle}>
            {legalType === "terms" ? "Terms of Use" : "Privacy Policy"}
          </Text>

          <TouchableOpacity onPress={() => setShowLegalModal(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {/* Logo */}
  <View style={legalStyles.legalLogoContainer}>
  <Image
    source={{
      uri: "https://res.cloudinary.com/def0cjmh2/image/upload/v1766088439/logocarconect_f0dhta.png",
    }}
    style={legalStyles.legalLogo}
    resizeMode="contain"
  />
  
</View>


        {/* Text */}
        {legalType === "terms" ? <TermsContent /> : <PrivacyContent />}
      </ScrollView>

    </View>
  </View>
</Modal>

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
                  {/* MUVCAR Logo */}
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

                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  )
}
const legalStyles = StyleSheet.create({
legalLogoContainer: {
  alignItems: "center",
  marginTop: 5,
  marginBottom: 10,   // 🔥 more space below
},


  legalLogo: {
    width: 380,   // ✅ bigger width
    height: 100,   // ✅ bigger height
  },

  legalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    marginBottom: 12,
  },

  footer: {
    marginTop: 30,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
     marginBottom: 56,
  },
})

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
    paddingVertical: 13,
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
    marginTop: 0,
    
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
