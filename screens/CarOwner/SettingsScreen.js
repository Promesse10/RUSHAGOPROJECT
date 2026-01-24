"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  Image,
  SafeAreaView,
  Vibration,
  Alert,
  Modal,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import {
  logoutAction,
  updateUserProfileAction,
  loadAuthFromStorage,
} from "../../redux/action/LoginActions"
import { uploadProfileImageAction } from "../../redux/action/UserActions"
import { updateUserSettings, fetchUserProfile } from "../../redux/actions/settingAction"
import { loadDrafts, deleteDraft } from "../../redux/action/draftsActions"
import * as ImagePicker from "expo-image-picker"
import { createSelector } from "reselect"
import LoadingSkeleton from "../../components/Map/LoadingSkeleton"

const SettingsScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  // For owners: use auth slice
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth || {})

  const settings = useSelector((state) => state.settings || {})
  const notifications = settings.notifications || {}
  const isSettingsLoading = settings.loading || false
  const settingsError = settings.error || null

  const { drafts, loading: draftsLoading, error: draftsError } = useSelector((state) => state.drafts || { drafts: [], loading: false, error: null })

  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [legalType, setLegalType] = useState("terms")
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showNumber, setShowNumber] = useState(false)
  const phoneNumber = "+250780114522"

  const [tempProfile, setTempProfile] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)

  const [showSavedDraftsModal, setShowSavedDraftsModal] = useState(false)

  // Load user data when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      setTempProfile({
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || user.telephone || "",
      })
    }
  }, [isAuthenticated, user])

  // Update notification state when settings are loaded
  useEffect(() => {
    if (notifications) {
      setIsNotificationsEnabled(notifications.pushNotifications || true)
    }
  }, [notifications])

  // Load drafts
  useEffect(() => {
    dispatch(loadDrafts())
  }, [dispatch])

  // Load auth from storage if not loaded
  useEffect(() => {
    if (!user) {
      dispatch(loadAuthFromStorage())
    }
  }, [dispatch, user])

  // Fetch latest user data from server
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, dispatch])

  const handleNotificationToggle = async (value) => {
    setIsNotificationsEnabled(value)
    // Add haptic feedback
    Vibration.vibrate(50)

    // Update settings in Redux and backend
    try {
      await dispatch(
        updateUserSettings({
          notifications: {
            ...notifications,
            pushNotifications: value,
          },
        }),
      ).unwrap()
      console.log("✅ Notification setting updated")
    } catch (error) {
      console.error("❌ Failed to update notification setting:", error)
      // Revert the toggle if update failed
      setIsNotificationsEnabled(!value)
      Alert.alert(t("error", "Error"), t("settingsUpdateError", "Failed to update notification settings"))
    }
  }

  const handleProfileImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert(
        t("permissionNeeded", "Permission Needed"),
        t("cameraPermission", "We need camera roll permissions to upload photos"),
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfile({ ...profile, profileImage: result.assets[0].uri })
    }
  }

  // Update profile info (name, email, phone) for owners
  const handleSaveProfile = async () => {
    if (!tempProfile.name || !tempProfile.email || !tempProfile.phone) {
      return Alert.alert(t("error", "Error"), t("fillAllFields", "Please fill all required fields"))
    }

    try {
      await dispatch(updateUserProfileAction(tempProfile)).unwrap()
      Alert.alert(t("success", "Success"), t("profileUpdated", "Profile updated successfully"))
      setShowPersonalInfo(false)
      // Refresh auth state
      dispatch(fetchUserProfile())
    } catch (error) {
      Alert.alert(t("error", "Error"), error || t("failedToUpdate", "Failed to update profile"))
    }
  }

  // Profile image upload for owners
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(t("permissionNeeded", "Permission Needed"), t("cameraPermission", "We need camera roll permissions to upload photos"))
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
        // For owners, use the auth slice upload
        await dispatch(uploadProfileImageAction({ uri: imageUri })).unwrap()
        Alert.alert(t("success", "Success"), t("profileImageUpdated", "Profile picture updated successfully"))
        dispatch(fetchUserProfile())
      } catch (error) {
        console.error("❌ Upload error:", error)
        Alert.alert(t("error", "Error"), t("failedToUpdateImage", "Failed to update profile image"))
      }
    }
  }
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will deactivate your account. You will not be able to log in again. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteAccountAction()).unwrap()
  
              Alert.alert(
                "Account Deleted",
                "Your account has been deleted. You must sign up again to continue."
              )
  
              // Clear auth & redirect
              dispatch(logoutAction())
              navigation.reset({
                index: 0,
                routes: [{ name: "AuthScreen" }],
              })
            } catch (error) {
              Alert.alert("Error", error || "Failed to delete account")
            }
          },
        },
      ]
    )
  }
  
  const handleLogout = () => {
    Alert.alert(t("logout", "Logout"), t("logoutConfirm", "Are you sure you want to logout?"), [
      { text: t("cancel", "Cancel"), style: "cancel" },
      {
        text: t("logout", "Logout"),
        style: "destructive",
        onPress: () => {
          dispatch(logoutAction()).unwrap()
          navigation.reset({
            index: 0,
            routes: [{ name: "AuthScreen" }],
          })
        },
      },
    ])
  }

  const handleWhatsAppContact = () => {
    setShowNumber(true)
    const url = `https://wa.me/${phoneNumber.replace("+", "")}`
    Linking.openURL(url).catch(() => Alert.alert(t("error", "Error"), t("unableToOpenWhatsApp", "Unable to open WhatsApp")))
  }

  const handlePhoneContact = () => {
    setShowNumber(true)
    Linking.openURL(`tel:${phoneNumber}`).catch(() => Alert.alert(t("error", "Error"), t("unableToCall", "Unable to start a call")))
  }

  const handleMessageContact = () => {
    setShowNumber(true)
    Linking.openURL(`sms:${phoneNumber}`).catch(() => Alert.alert(t("error", "Error"), t("unableToMessage", "Unable to open messaging app")))
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (error) {
      return "Recently"
    }
  }

  const getCarImage = (draft) => {
    if (draft.formData?.photos?.frontExterior) {
      return { uri: draft.formData.photos.frontExterior }
    }
    if (draft.formData?.images?.exterior_front) {
      return { uri: draft.formData.images.exterior_front }
    }
    return null
  }

  const handleDeleteDraft = (draftId) => {
    Alert.alert(
      t("deleteDraft", "Delete Draft"),
      t("deleteDraftConfirm", "Are you sure you want to delete this draft?"),
      [
        {
          text: t("cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("delete", "Delete"),
          style: "destructive",
          onPress: () => dispatch(deleteDraft(draftId)),
        },
      ],
    )
  }

  const handlePersonalInfoSave = async () => {
    try {
      await dispatch(updateUserProfileAction({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      })).unwrap()
      Alert.alert(t("success", "Success"), t("profileUpdated", "Profile updated successfully"))
      setShowPersonalInfo(false)
    } catch (error) {
      Alert.alert(t("error", "Error"), error || t("failedToUpdate", "Failed to update profile"))
    }
  }

  // Show loading if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <LoadingSkeleton style={{ width: 120, height: 24, marginBottom: 4 }} />
          <LoadingSkeleton style={{ width: 200, height: 16 }} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section Skeleton */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <LoadingSkeleton style={{ width: 80, height: 80, borderRadius: 40 }} />
              <View style={styles.profileInfo}>
                <LoadingSkeleton style={{ width: 150, height: 20, marginBottom: 4 }} />
                <LoadingSkeleton style={{ width: 120, height: 14, marginBottom: 2 }} />
                <LoadingSkeleton style={{ width: 100, height: 12 }} />
              </View>
            </View>
          </View>
          {/* Personal Information Section Skeleton */}
          <View style={styles.section}>
            <LoadingSkeleton style={{ width: 180, height: 18, marginBottom: 16 }} />
            <View style={styles.sectionContent}>
              <View style={styles.inputContainer}>
                <LoadingSkeleton style={{ width: 80, height: 14, marginBottom: 8 }} />
                <LoadingSkeleton style={{ width: '100%', height: 48, borderRadius: 8 }} />
              </View>
              <View style={styles.inputContainer}>
                <LoadingSkeleton style={{ width: 60, height: 14, marginBottom: 8 }} />
                <LoadingSkeleton style={{ width: '100%', height: 48, borderRadius: 8 }} />
              </View>
              <View style={styles.inputContainer}>
                <LoadingSkeleton style={{ width: 70, height: 14, marginBottom: 8 }} />
                <LoadingSkeleton style={{ width: '100%', height: 48, borderRadius: 8 }} />
              </View>
            </View>
          </View>
          {/* App Settings Section Skeleton */}
          <View style={styles.section}>
            <LoadingSkeleton style={{ width: 120, height: 18, marginBottom: 16 }} />
            <View style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <LoadingSkeleton style={{ width: 20, height: 20, borderRadius: 10, marginRight: 12 }} />
                  <View style={styles.settingText}>
                    <LoadingSkeleton style={{ width: 100, height: 16, marginBottom: 2 }} />
                    <LoadingSkeleton style={{ width: 140, height: 14 }} />
                  </View>
                </View>
                <LoadingSkeleton style={{ width: 50, height: 24, borderRadius: 12 }} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

const profileImageUrl =
  user?.profileImage?.url ??
  user?.profileImage ??
  "https://cdn-icons-png.flaticon.com/512/149/149071.png"



  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("settings", "Settings")}</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={handleImagePicker} style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: profileImageUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.profileImage}
              />
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "No Name"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "No Email"}</Text>
              <Text style={styles.profilePhone}>{user?.phone || "No Phone"}</Text>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowPersonalInfo(true)}>
          <View style={styles.settingLeft}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.settingText}>{t("personalInfo", "Personal Information")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Saved Drafts - Only for owners */}
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowSavedDraftsModal(true)}>
          <View style={styles.settingLeft}>
            <Ionicons name="document-outline" size={24} color="#333" />
            <Text style={styles.settingText}>{t("savedDrafts", "Saved Drafts")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowHelpModal(true)}>
          <View style={styles.settingLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
            <Text style={styles.settingText}>{t("helpSupport", "Help & Support")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
            <Ionicons name="document-text-outline" size={24} color="#333" />
            <Text style={styles.settingText}>{t("termsOfUse", "Terms of Use")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
            <Text style={styles.settingText}>{t("privacyPolicy", "Privacy Policy")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={[styles.settingText, styles.logoutText]}>{t("logout", "Logout")}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity
  style={[styles.settingItem, { marginTop: 10 }]}
  onPress={handleDeleteAccount}
>
  <View style={styles.settingLeft}>
    <Icon name="trash" size={24} color="#FF3B30" />
    <Text style={[styles.settingText, { color: "#FF3B30" }]}>
      Delete Account
    </Text>
  </View>
</TouchableOpacity>

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
              <View style={[styles.modalContainer, { maxHeight: Dimensions.get("window").height * 0.6 }]}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.headerIndicator} />
                  <View style={styles.headerContent}>
                    <Text style={styles.modalTitle}>{t("personalInfo", "Personal Information")}</Text>
                    <TouchableOpacity onPress={() => setShowPersonalInfo(false)} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="#333" />
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
                      <Text style={styles.inputLabel}>{t("fullName", "Full Name")}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempProfile.name}
                        onChangeText={(text) => setTempProfile({ ...tempProfile, name: text })}
                        placeholder={t("enterFullName", "Enter your full name")}
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{t("email", "Email")}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempProfile.email}
                        onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
                        keyboardType="email-address"
                        placeholder={t("enterEmail", "Enter your email")}
                        returnKeyType="next"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{t("phone", "Phone")}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempProfile.phone}
                        onChangeText={(text) => setTempProfile({ ...tempProfile, phone: text })}
                        keyboardType="phone-pad"
                        placeholder={t("enterPhone", "Enter your phone number")}
                        returnKeyType="done"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveProfile}
                    >
                      <Text style={styles.saveButtonText}>{t("save", "Save")}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Help Modal */}
      <Modal visible={showHelpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.headerIndicator} />
              <View style={styles.headerContent}>
                <Text style={styles.modalTitle}>{t("helpSupport", "Help & Support")}</Text>
                <TouchableOpacity onPress={() => setShowHelpModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scrollContent}>
              <View style={styles.helpSection}>
                <View style={styles.logoContainer}>
                  <Image source={require("../../assets/logo.png")} style={styles.helpLogo} resizeMode="contain" />
                </View>

                <Text style={styles.helpTitle}>{t("contactUs", "Contact Us")}</Text>
                <Text style={styles.helpSubtitle}>{t("helpSubtitle", "We're here to help you 24/7")}</Text>

                <View style={styles.contactOptions}>
                  <TouchableOpacity style={styles.contactOption} onPress={handleWhatsAppContact}>
                    <Ionicons name="logo-whatsapp" size={30} color="#25D366" />
                    <Text style={styles.contactText}>WhatsApp</Text>
                    {showNumber && <Text style={styles.contactNumber}>{phoneNumber}</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactOption} onPress={handlePhoneContact}>
                    <Ionicons name="call" size={30} color="#007EFD" />
                    <Text style={styles.contactText}>{t("phoneCall", "Phone Call")}</Text>
                    {showNumber && <Text style={styles.contactNumber}>{phoneNumber}</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactOption} onPress={handleMessageContact}>
                    <Ionicons name="chatbubble" size={30} color="#007EFD" />
                    <Text style={styles.contactText}>SMS</Text>
                    {showNumber && <Text style={styles.contactNumber}>{phoneNumber}</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Legal Modal */}
      <Modal visible={showLegalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.headerIndicator} />
              <View style={styles.headerContent}>
                <Text style={styles.modalTitle}>
                  {legalType === "terms" ? t("termsOfUse", "Terms of Use") : t("privacyPolicy", "Privacy Policy")}
                </Text>
                <TouchableOpacity onPress={() => setShowLegalModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={legalStyles.legalLogoContainer}>
                <Image
                  source={{
                    uri: "https://res.cloudinary.com/def0cjmh2/image/upload/v1766088439/logocarconect_f0dhta.png",
                  }}
                  style={legalStyles.legalLogo}
                  resizeMode="contain"
                />
              </View>

              <Text style={legalStyles.title}>
                {legalType === "terms" ? "MUVCAR Terms of Use" : "MUVCAR Privacy Policy"}
              </Text>

              <Text style={legalStyles.text}>
                {legalType === "terms"
                  ? "MUVCAR is a digital car rental platform designed to connect vehicle owners with renters in a secure and transparent environment. MUVCAR is a product of CarConnect Ltd. By accessing or using the MUVCAR mobile application, you agree to comply with these Terms of Use."
                  : "This Privacy Policy explains how MUVCAR, a product of CarConnect Ltd, collects, uses, and protects your personal information. We collect personal data such as name, contact details, and usage data to provide and improve our services."
                }
              </Text>

              <Text style={legalStyles.footer}>
                © {new Date().getFullYear()} CarConnect Ltd. All rights reserved.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Saved Drafts Modal */}
      <Modal visible={showSavedDraftsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.headerIndicator} />
              <View style={styles.headerContent}>
                <Text style={styles.modalTitle}>{t("savedDrafts", "Saved Drafts")}</Text>
                <TouchableOpacity onPress={() => setShowSavedDraftsModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scrollContent}>
              {draftsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007EFD" />
                  <Text style={styles.loadingText}>{t("loading", "Loading...")}</Text>
                </View>
              ) : drafts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>{t("noDrafts", "No saved drafts")}</Text>
                </View>
              ) : (
                drafts.map((draft) => (
                  <TouchableOpacity key={draft._id} style={styles.draftItem} onPress={() => { setShowSavedDraftsModal(false); navigation.navigate("AddCar", { draftData: draft, isDraft: true }) }}>
                    <Image source={getCarImage(draft)} style={styles.draftImage} />
                    <View style={styles.draftInfo}>
                      <Text style={styles.draftTitle}>{draft.formData?.carDetails?.make || "Unknown"} {draft.formData?.carDetails?.model || ""}</Text>
                      <Text style={styles.draftDate}>{formatDate(draft.createdAt)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteDraft(draft._id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const legalStyles = StyleSheet.create({
  legalLogoContainer: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  legalLogo: {
    width: 380,
    height: 100,
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
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007EFD",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  memberSince: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  premiumBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007EFD",
    padding: 16,
    borderRadius: 12,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    color: "#BFDBFE",
    marginTop: 2,
  },
  managePlanButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  managePlanButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007EFD",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  quickActions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
    flex: 1,
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: "#007EFD",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    gap: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  // Modal styles from SettingsModal
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: Dimensions.get("window").height * 0.85,
    minHeight: Dimensions.get("window").height * 0.6,
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
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
  profilePhone: {
    fontSize: 14,
    color: "#64748B",
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
  draftItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  draftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  draftInfo: {
    flex: 1,
    marginLeft: 15,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  draftDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
})

export default SettingsScreen
