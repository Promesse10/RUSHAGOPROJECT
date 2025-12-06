"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Image, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

const PrivacySecurityScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)

  const securityOptions = [
    {
      id: "changePassword",
      title: t("changePassword", "Change Password"),
      subtitle: "Update your account password",
      icon: "lock-closed-outline",
      action: () => console.log("Change password"),
    },
    {
      id: "twoFactor",
      title: t("twoFactorAuth", "Two-Factor Authentication"),
      subtitle: "Add an extra layer of security",
      icon: "shield-checkmark-outline",
      toggle: true,
      value: twoFactorEnabled,
      onToggle: setTwoFactorEnabled,
    },
    {
      id: "biometric",
      title: "Biometric Login",
      subtitle: "Use fingerprint or face ID",
      icon: "finger-print-outline",
      toggle: true,
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      id: "loginActivity",
      title: t("loginActivity", "Login Activity"),
      subtitle: "View recent login sessions",
      icon: "time-outline",
      action: () => console.log("View login activity"),
    },
  ]

  const privacyOptions = [
    {
      id: "dataPrivacy",
      title: t("dataPrivacy", "Data Privacy"),
      subtitle: "Manage your data preferences",
      icon: "document-text-outline",
      action: () => console.log("Data privacy"),
    },
    {
      id: "location",
      title: "Location Services",
      subtitle: "Allow location access for better service",
      icon: "location-outline",
      toggle: true,
      value: locationEnabled,
      onToggle: setLocationEnabled,
    },
    {
      id: "deleteAccount",
      title: t("deleteAccount", "Delete Account"),
      subtitle: "Permanently delete your account",
      icon: "trash-outline",
      action: () => console.log("Delete account"),
      danger: true,
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t("privacySecurity", "Privacy & Security")}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* MUVCAR Logo */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: "/placeholder.svg?height=80&width=200" }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoSubtitle}>Your security is our priority</Text>
        </View>

        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("accountSecurity", "Account Security")}</Text>
          <View style={styles.sectionContent}>
            {securityOptions.map((option) => (
              <View key={option.id} style={styles.optionItem}>
                <View style={styles.optionInfo}>
                  <View style={[styles.optionIcon, option.danger && styles.dangerIcon]}>
                    <Ionicons name={option.icon} size={20} color={option.danger ? "#DC2626" : "#64748B"} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, option.danger && styles.dangerText]}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>

                {option.toggle ? (
                  <Switch
                    value={option.value}
                    onValueChange={option.onToggle}
                    trackColor={{ false: "#E2E8F0", true: "#007EFD" }}
                    thumbColor={option.value ? "#FFFFFF" : "#FFFFFF"}
                  />
                ) : (
                  <TouchableOpacity onPress={option.action} style={styles.actionButton}>
                    <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Data Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("dataPrivacy", "Data Privacy")}</Text>
          <View style={styles.sectionContent}>
            {privacyOptions.map((option) => (
              <View key={option.id} style={styles.optionItem}>
                <View style={styles.optionInfo}>
                  <View style={[styles.optionIcon, option.danger && styles.dangerIcon]}>
                    <Ionicons name={option.icon} size={20} color={option.danger ? "#DC2626" : "#64748B"} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, option.danger && styles.dangerText]}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>

                {option.toggle ? (
                  <Switch
                    value={option.value}
                    onValueChange={option.onToggle}
                    trackColor={{ false: "#E2E8F0", true: "#007EFD" }}
                    thumbColor={option.value ? "#FFFFFF" : "#FFFFFF"}
                  />
                ) : (
                  <TouchableOpacity onPress={option.action} style={styles.actionButton}>
                    <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipText}>Enable two-factor authentication for enhanced security</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-outline" size={20} color="#10B981" />
            <Text style={styles.tipText}>Use a strong, unique password for your account</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="eye-outline" size={20} color="#007EFD" />
            <Text style={styles.tipText}>Regularly review your login activity</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
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
  logo: {
    width: 200,
    height: 80,
    marginBottom: 12,
  },
  logoSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: "#FEF2F2",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  dangerText: {
    color: "#DC2626",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  actionButton: {
    padding: 8,
  },
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 12,
    flex: 1,
  },
})

export default PrivacySecurityScreen
