"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

const SavedDraftsScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState([])

  useEffect(() => {
    // Simulate loading drafts from storage
    setTimeout(() => {
      setDrafts([
        {
          id: "1",
          carName: "Toyota Corolla 2023",
          currentStep: 2,
          savedAt: "2024-06-20T10:30:00Z",
          formData: {
            make: "Toyota",
            year: "2023",
            type: "Sedan",
            phone: "+250 788 123 456",
            ownerType: "individual",
            transmission: "Automatic",
            fuelType: "Gasoline",
            seats: "5",
          },
        },
        {
          id: "2",
          carName: "BMW X5 2022",
          currentStep: 4,
          savedAt: "2024-06-19T15:45:00Z",
          formData: {
            make: "BMW",
            year: "2022",
            type: "SUV",
            phone: "+250 788 123 456",
            ownerType: "company",
            companyName: "Elite Cars Rwanda",
            companyPhone: "+250 788 654 321",
            transmission: "Automatic",
            fuelType: "Gasoline",
            seats: "7",
            address: "Kigali - Gasabo",
            price: "120000",
            pricingType: "daily",
          },
        },
        {
          id: "3",
          carName: "Honda Civic 2021",
          currentStep: 1,
          savedAt: "2024-06-18T09:15:00Z",
          formData: {
            make: "Honda",
            year: "2021",
            type: "Sedan",
            phone: "+250 788 123 456",
            ownerType: "individual",
          },
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getStepName = (step) => {
    const steps = ["Basic Info", "Specifications", "Location", "Pricing", "Review"]
    return steps[step - 1] || "Unknown"
  }

  const getProgressPercentage = (step) => {
    return (step / 5) * 100
  }

  const handleContinueEditing = (draft) => {
    navigation.navigate("AddCar", { draftData: draft })
  }

  const handleDeleteDraft = (draftId) => {
    Alert.alert("Delete Draft", "Are you sure you want to delete this draft? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setDrafts(drafts.filter((draft) => draft.id !== draftId))
        },
      },
    ])
  }

  if (loading) {
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t("savedDrafts", "Saved Drafts")}</Text>
          <Text style={styles.subtitle}>{drafts.length} draft(s) saved</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {drafts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Saved Drafts</Text>
            <Text style={styles.emptySubtitle}>
              Your saved car listing drafts will appear here. Start creating a new listing to save a draft.
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("AddCar")}>
              <Ionicons name="add-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create New Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.draftsList}>
            {drafts.map((draft) => (
              <View key={draft.id} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <View style={styles.draftInfo}>
                    <Text style={styles.draftTitle}>{draft.carName}</Text>
                    <Text style={styles.draftDate}>Saved {formatDate(draft.savedAt)}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDraft(draft.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      Step {draft.currentStep} of 5 - {getStepName(draft.currentStep)}
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(getProgressPercentage(draft.currentStep))}% complete
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${getProgressPercentage(draft.currentStep)}%` }]} />
                  </View>
                </View>

                <View style={styles.draftDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="car-outline" size={16} color="#64748B" />
                    <Text style={styles.detailText}>
                      {draft.formData.make} {draft.formData.year} - {draft.formData.type}
                    </Text>
                  </View>
                  {draft.formData.ownerType === "company" && (
                    <View style={styles.detailRow}>
                      <Ionicons name="business-outline" size={16} color="#64748B" />
                      <Text style={styles.detailText}>{draft.formData.companyName}</Text>
                    </View>
                  )}
                  {draft.formData.address && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={styles.detailText}>{draft.formData.address}</Text>
                    </View>
                  )}
                  {draft.formData.price && (
                    <View style={styles.detailRow}>
                      <Ionicons name="pricetag-outline" size={16} color="#64748B" />
                      <Text style={styles.detailText}>
                        {draft.formData.price} FRW{" "}
                        {draft.formData.pricingType === "daily"
                          ? "per day"
                          : draft.formData.pricingType === "weekly"
                            ? "per week"
                            : "per month"}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.continueButton} onPress={() => handleContinueEditing(draft)}>
                  <Text style={styles.continueButtonText}>Continue Editing</Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007EFD",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  draftsList: {
    gap: 16,
    paddingBottom: 20,
  },
  draftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  draftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  draftDate: {
    fontSize: 14,
    color: "#64748B",
  },
  deleteButton: {
    padding: 8,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 12,
    color: "#64748B",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007EFD",
    borderRadius: 3,
  },
  draftDetails: {
    gap: 8,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007EFD",
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default SavedDraftsScreen
