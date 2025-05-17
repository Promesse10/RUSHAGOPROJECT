"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import LoadingSkeleton from "../../components/Map/LoadingSkeleton"

const SubscriptionPlanScreen = () => {
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [plans, setPlans] = useState([])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setCurrentPlan({
          name: "Premium",
          price: "$29.99",
          period: "month",
          expiryDate: "2023-12-31",
          features: ["Up to 10 car listings", "Top Choice Ads available", "Advanced analytics", "Priority support"],
        })

        setPlans([
          {
            id: "basic",
            name: "Basic",
            price: "$9.99",
            period: "month",
            features: ["Up to 3 car listings", "Basic analytics", "Email support"],
          },
          {
            id: "premium",
            name: "Premium",
            price: "$29.99",
            period: "month",
            features: ["Up to 10 car listings", "Top Choice Ads available", "Advanced analytics", "Priority support"],
            isRecommended: true,
          },
          {
            id: "business",
            name: "Business",
            price: "$59.99",
            period: "month",
            features: [
              "Unlimited car listings",
              "Premium Top Choice Ads",
              "Comprehensive analytics dashboard",
              "Dedicated account manager",
              "API access",
            ],
          },
        ])

        setLoading(false)
      }, 1500)

      return () => {
        // Cleanup if needed
      }
    }, []),
  )

  const renderPlanCard = (plan, isCurrentPlan = false) => (
    <View
      key={plan.id}
      style={[
        styles.planCard,
        isCurrentPlan && styles.currentPlanCard,
        plan.isRecommended && styles.recommendedPlanCard,
      ]}
    >
      {plan.isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}

      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPeriod}>/{plan.period}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {isCurrentPlan ? (
        <View style={styles.currentPlanInfo}>
          <Text style={styles.expiryText}>Expires on {currentPlan.expiryDate}</Text>
          <TouchableOpacity style={styles.renewButton}>
            <Text style={styles.renewButtonText}>Renew Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select Plan</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subscription Plan</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSkeleton style={styles.currentPlanSkeleton} />
            <LoadingSkeleton style={styles.planSkeleton} />
            <LoadingSkeleton style={styles.planSkeleton} />
          </View>
        ) : (
          <>
            <View style={styles.currentPlanSection}>
              <Text style={styles.sectionTitle}>Current Plan</Text>
              {currentPlan && renderPlanCard(currentPlan, true)}
            </View>

            <View style={styles.availablePlansSection}>
              <Text style={styles.sectionTitle}>Available Plans</Text>
              {plans.map((plan) => renderPlanCard(plan))}
            </View>

            <View style={styles.infoCard}>
              <MaterialIcons name="info" size={20} color="#007EFD" />
              <Text style={styles.infoText}>
                If your subscription expires, your car listings will be temporarily hidden until you renew your plan.
              </Text>
            </View>
          </>
        )}
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
  loadingContainer: {
    padding: 16,
  },
  currentPlanSkeleton: {
    height: 250,
    marginBottom: 24,
    borderRadius: 12,
  },
  planSkeleton: {
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 12,
    color: "#333333",
  },
  currentPlanSection: {
    marginBottom: 24,
  },
  availablePlansSection: {
    marginBottom: 16,
  },
  planCard: {
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
  currentPlanCard: {
    borderWidth: 2,
    borderColor: "#007EFD",
  },
  recommendedPlanCard: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 16,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recommendedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007EFD",
  },
  planPeriod: {
    fontSize: 16,
    color: "#666666",
  },
  featuresContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666666",
  },
  currentPlanInfo: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 16,
  },
  expiryText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  renewButton: {
    backgroundColor: "#007EFD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  renewButtonText: {
    color: "white",
    fontWeight: "600",
  },
  selectButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#333333",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 126, 253, 0.05)",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007EFD",
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: "#666666",
    fontSize: 14,
  },
})

export default SubscriptionPlanScreen

