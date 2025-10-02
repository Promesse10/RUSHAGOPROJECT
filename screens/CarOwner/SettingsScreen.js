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
import { updateUserSettings, fetchUserSettings } from "../../redux/action/settingAction"
import * as ImagePicker from "expo-image-picker"
import { createSelector } from "reselect"

const selectSettingsState = (state) => state.settings || {}
const selectGeneralSettings = createSelector(selectSettingsState, (settings) => settings.general || {})
const selectNotificationSettings = createSelector(selectSettingsState, (settings) => settings.notifications || {})
const selectSettingsLoading = createSelector(selectSettingsState, (settings) => settings.loading || false)
const selectSettingsError = createSelector(selectSettingsState, (settings) => settings.error || null)

const SettingsScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  // Get authenticated user data from auth slice
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth || {})

  // Get settings data from settings slice
  const general = useSelector(selectGeneralSettings)
  const notifications = useSelector(selectNotificationSettings)
  const settingsLoading = useSelector(selectSettingsLoading)
  const settingsError = useSelector(selectSettingsError)

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "Individual",
    address: "",
    profileImage: "https://via.placeholder.com/100x100",
    isPremium: false,
    memberSince: "Jan 2024",
  })
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)

  // Load user data and settings on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("👤 Loading user profile:", user.name)

      // Populate profile with real user data
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "Individual",
        address: user.address || "",
        profileImage: user.profileImage || "https://via.placeholder.com/100x100",
        isPremium: user.isPremium || false,
        memberSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "Jan 2024",
      })

      // Fetch user settings
      dispatch(updateUserSettings({}))
    }
  }, [user, isAuthenticated, dispatch])

  // Update notification state when settings are loaded
  useEffect(() => {
    if (notifications) {
      setIsNotificationsEnabled(notifications.pushNotifications || true)
    }
  }, [notifications])

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

  // Proper logout with Redux action
  const handleLogout = async () => {
    Alert.alert(t("logout", "Logout"), t("logoutConfirm", "Are you sure you want to logout?"), [
      {
        text: t("cancel", "Cancel"),
        style: "cancel",
      },
      {
        text: t("logout", "Logout"),
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🚪 Logging out user...")
            await dispatch(logoutAction()).unwrap()
            console.log("✅ Logout successful")
            navigation.reset({
              index: 0,
              routes: [{ name: "AuthScreen" }],
            })
          } catch (error) {
            console.error("❌ Logout error:", error)
            Alert.alert(t("error", "Error"), t("logoutError", "Failed to logout properly"))
          }
        },
      },
    ])
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

  // Save profile changes to Redux and backend via settings API
  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      console.log("💾 Saving profile changes...")
      const profileData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        businessName: profile.businessName,
        businessType: profile.businessType,
        address: profile.address,
        profileImage: profile.profileImage,
      }
  
      // ✅ Update the user profile
      await dispatch(updateUserProfileAction(profileData)).unwrap()
  
      // ✅ Refresh Redux auth state from SecureStore
      await dispatch(loadAuthFromStorage()).unwrap()
  
      console.log("✅ Profile saved successfully")
      Alert.alert(t("success", "Success"), t("profileSaved", "Profile saved successfully!"))
    } catch (error) {
      console.error("❌ Save profile error:", error)
      Alert.alert(t("error", "Error"), error?.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }
  

  // Show loading if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>{t("loading", "Loading...")}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("settings", "Settings")}</Text>
        <Text style={styles.subtitle}>{t("manageAccount", "Manage your account and preferences")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
              <TouchableOpacity style={styles.cameraButton} onPress={handleProfileImageUpload}>
                <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="diamond-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.premiumText}>{t("premium", "Premium")}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.memberSince}>
                {t("memberSince", "Member since")} {profile.memberSince}
              </Text>
            </View>
          </View>

          {/* Premium Banner */}
          {profile.isPremium && (
            <View style={styles.premiumBanner}>
              <View>
                <Text style={styles.premiumBannerTitle}>{t("premiumPlanActive", "Premium Plan Active")}</Text>
                <Text style={styles.premiumBannerSubtitle}>{t("expiresIn", "Expires in 25 days")}</Text>
              </View>
              <TouchableOpacity style={styles.managePlanButton}>
                <Text style={styles.managePlanButtonText}>{t("managePlan", "Manage Plan")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("personalInformation", "Personal Information")}</Text>
          <View style={styles.sectionContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("fullName", "Full Name")}</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder={t("enterFullName", "Enter your full name")}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("email", "Email")}</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                keyboardType="email-address"
                placeholder={t("enterEmail", "Enter your email")}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("phone", "Phone")}</Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                keyboardType="phone-pad"
                placeholder={t("enterPhone", "Enter your phone number")}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("address", "Address")}</Text>
              <TextInput
                style={styles.input}
                value={profile.address}
                onChangeText={(text) => setProfile({ ...profile, address: text })}
                placeholder={t("enterAddress", "Enter your address")}
              />
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("appSettings", "App Settings")}</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{t("notifications", "Notifications")}</Text>
                  <Text style={styles.settingSubtitle}>{t("receiveNotifications", "Receive push notifications")}</Text>
                </View>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#E2E8F0", true: "#007EFD" }}
                thumbColor={isNotificationsEnabled ? "#FFFFFF" : "#FFFFFF"}
                disabled={settingsLoading}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("PaymentMethods")}>
            <Ionicons name="card-outline" size={20} color="#475569" />
            <Text style={styles.actionButtonText}>{t("paymentMethods", "Payment Methods")}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("SavedDrafts")}>
            <Ionicons name="document-outline" size={20} color="#475569" />
            <Text style={styles.actionButtonText}>{t("savedDrafts", "Saved Drafts")}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("PrivacySecurity")}>
            <Ionicons name="shield-outline" size={20} color="#475569" />
            <Text style={styles.actionButtonText}>{t("privacySecurity", "Privacy & Security")}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (loading || isLoading || settingsLoading) && styles.disabledButton]}
          onPress={handleSaveProfile}
          disabled={loading || isLoading || settingsLoading}
        >
          <Text style={styles.saveButtonText}>
            {loading || isLoading || settingsLoading ? t("saving", "Saving...") : t("saveChanges", "Save Changes")}
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutButtonText}>{t("logout", "Logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

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
})

export default SettingsScreen
