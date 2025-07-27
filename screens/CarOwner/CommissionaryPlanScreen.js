"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { Video } from "expo-av"

const { width, height } = Dimensions.get("window")

const CommissionaryPlanScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [selectedPlan, setSelectedPlan] = useState("basic")

  const plans = [
    {
      id: "basic",
      name: t("basicPlan", "Basic Plan"),
      price: "5,000",
      period: t("perMonth", "per month"),
      features: [
        t("feature1", "List up to 3 cars"),
        t("feature2", "Basic support"),
        t("feature3", "Standard visibility"),
        t("feature4", "Mobile app access"),
      ],
      color: "#007EFD",
      recommended: false,
    },
    {
      id: "premium",
      name: t("premiumPlan", "Premium Plan"),
      price: "15,000",
      period: t("perMonth", "per month"),
      features: [
        t("feature5", "List up to 10 cars"),
        t("feature6", "Priority support"),
        t("feature7", "Enhanced visibility"),
        t("feature8", "Analytics dashboard"),
        t("feature9", "Featured listings"),
      ],
      color: "#10B981",
      recommended: true,
    },
    {
      id: "enterprise",
      name: t("enterprisePlan", "Enterprise Plan"),
      price: "30,000",
      period: t("perMonth", "per month"),
      features: [
        t("feature10", "Unlimited car listings"),
        t("feature11", "24/7 dedicated support"),
        t("feature12", "Maximum visibility"),
        t("feature13", "Advanced analytics"),
        t("feature14", "Custom branding"),
        t("feature15", "API access"),
      ],
      color: "#8B5CF6",
      recommended: false,
    },
  ]

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = () => {
    const plan = plans.find((p) => p.id === selectedPlan)
    // Navigate to payment screen or handle subscription
    console.log("Subscribe to:", plan.name)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Background */}
      <View style={styles.videoContainer}>
        <Video
          source={{
            uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          }}
          style={styles.backgroundVideo}
          shouldPlay
          isLooping
          isMuted
          resizeMode="cover"
        />
        <View style={styles.videoOverlay} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("commissionaryPlans", "Commissionary Plans")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t("choosePlan", "Choose Your Perfect Plan")}</Text>
          <Text style={styles.heroSubtitle}>
            {t("planDescription", "Select a plan that fits your car rental business needs")}
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlanCard,
                { borderColor: plan.color },
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              {plan.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.recommendedText}>{t("recommended", "Recommended")}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currency}>RWF</Text>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {selectedPlan === plan.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={plan.color} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>{t("whyChooseUs", "Why Choose RushGo?")}</Text>

          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={32} color="#10B981" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{t("secure", "Secure & Reliable")}</Text>
              <Text style={styles.benefitDescription}>
                {t("secureDesc", "Your data and transactions are protected with bank-level security")}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="people" size={32} color="#007EFD" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{t("support", "24/7 Support")}</Text>
              <Text style={styles.benefitDescription}>
                {t("supportDesc", "Get help whenever you need it with our dedicated support team")}
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="trending-up" size={32} color="#8B5CF6" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{t("growth", "Grow Your Business")}</Text>
              <Text style={styles.benefitDescription}>
                {t("growthDesc", "Access powerful tools and analytics to expand your rental business")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>
            {t("subscribe", "Subscribe to")} {plans.find((p) => p.id === selectedPlan)?.name}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  videoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  backgroundVideo: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    marginTop: height * 0.25,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  heroSection: {
    padding: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPlanCard: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  recommendedB: {
    position: "absolute",
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  currency: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E293B",
  },
  period: {
    fontSize: 16,
    color: "#64748B",
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  selectedIndicator: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  benefitsSection: {
    padding: 24,
    marginTop: 32,
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  subscribeContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  subscribeButton: {
    backgroundColor: "#007EFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
})

export default CommissionaryPlanScreen
