"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import { ChevronLeft, Plus, Minus } from "react-native-feather"
import { useNavigation } from "@react-navigation/native"

const privacyItems = [
  {
    id: 1,
    title: "1. What information do we collect?",
    content:
      "We obtain information about you through the means discussed below when we provide the Services. Please note that we need certain types of information to provide the Services to you. If you do not provide us with such information, or if you ask us to delete that information, you may no longer be able to access or use certain Services.\n\nWhen you register for MUVCAR, we collect your name, email, phone number, and location. For car owners, we collect vehicle information including make, model, year, license plate, and photos. For renters, we collect driver's license information and payment details. We also collect usage data such as rental history, reviews, and communication between users.",
  },
  {
    id: 2,
    title: "2. We Use Your Information For?",
    content:
      "We use your information to facilitate car rentals between owners and renters, process payments, verify identities, provide customer support, improve our services, send notifications about bookings and updates, and ensure compliance with our terms of service. We may also use your information for marketing purposes, but you can opt out at any time. Location data helps us show nearby available vehicles and optimize the rental experience.",
  },
  {
    id: 3,
    title: "3. How Do We Protect?",
    content:
      "MUVCAR employs industry-standard security measures to protect your personal information. We use encryption for all data transmissions, secure payment processing, and regular security audits. Access to user data is restricted to authorized personnel only. We implement multi-factor authentication for account access and continuously monitor our systems for potential vulnerabilities. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.",
  },
  {
    id: 4,
    title: "4. Online Analytics",
    content:
      "We use analytics tools to understand how users interact with our app. This helps us improve the user experience and develop new features. These tools collect information such as how often you use the app, which features you use, and performance data. We may share anonymous, aggregated data with third-party analytics providers. You can opt out of certain analytics tracking through your device settings.",
  },
  {
    id: 5,
    title: "5. Children's Privacy",
    content:
      "MUVCAR services are not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information from our servers. If you believe we might have any information from or about a child under 18, please contact us immediately.",
  },
  {
    id: 6,
    title: "6. Sharing Your Information",
    content:
      "We share your information with other users as necessary to facilitate rentals (e.g., car owners receive renter information and vice versa). We may share data with service providers who help us operate our platform, including payment processors, identity verification services, and cloud hosting providers. We may also disclose information when required by law or to protect our rights or the safety of users. We do not sell your personal information to third parties.",
  },
  {
    id: 7,
    title: "7. Your Rights and Choices",
    content:
      "You have the right to access, correct, or delete your personal information. You can update most information directly through your account settings. You can also request a copy of your data or ask us to delete your account by contacting our support team. Depending on your location, you may have additional rights under applicable privacy laws, such as the right to data portability or the right to restrict processing.",
  },
]

const Privacy = () => {
  const navigation = useNavigation()
  const [expandedItem, setExpandedItem] = useState(1)

  const navigateBack = () => {
    navigation.goBack()
  }

  const toggleItem = (id) => {
    if (expandedItem === id) {
      setExpandedItem(null)
    } else {
      setExpandedItem(id)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack}>
            <ChevronLeft width={24} height={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>MUVCAR privacy policy</Text>
          <Text style={styles.lastUpdated}>Last updated: Mar 18, 2025</Text>

          <View style={styles.appInfoContainer}>
            <Text style={styles.appInfoText}>
              MUVCAR is an app that connects car owners with people who want to rent cars. Our platform enables
              seamless and secure car rentals between individuals.
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView style={styles.policyList}>
            {privacyItems.map((item) => (
              <View key={item.id} style={styles.policyItem}>
                <TouchableOpacity style={styles.policyHeader} onPress={() => toggleItem(item.id)}>
                  <Text style={styles.policyTitle}>{item.title}</Text>
                  {expandedItem === item.id ? (
                    <Minus width={20} height={20} color="#8E8E93" />
                  ) : (
                    <Plus width={20} height={20} color="#8E8E93" />
                  )}
                </TouchableOpacity>

                {expandedItem === item.id && (
                  <View style={styles.policyContent}>
                    <Text style={styles.policyText}>{item.content}</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#007EFD", // Changed to a slightly different blue
  },
  container: {
    flex: 1,
    backgroundColor: "#007EFD",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
  },
  appInfoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  appInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  policyList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  policyItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 12,
    overflow: "hidden",
  },
  policyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: "#333333",
  },
  policyContent: {
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
  },
  bottomPadding: {
    height: 50,
  },
})

export default Privacy

