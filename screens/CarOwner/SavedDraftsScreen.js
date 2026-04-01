"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { loadDrafts, deleteDraft } from "../../redux/action/draftsActions"

const SavedDraftsScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const dispatch = useDispatch()

  // Redux state
  const { drafts, loading, error } = useSelector((state) => state.drafts || { drafts: [], loading: false, error: null })
  const [page, setPage] = useState(1)
  const DRAFTS_PER_PAGE = 5

  const totalPages = Math.ceil(drafts.length / DRAFTS_PER_PAGE)
  const displayedDrafts = drafts.slice((page - 1) * DRAFTS_PER_PAGE, page * DRAFTS_PER_PAGE)
  const hasMore = page < totalPages

  useEffect(() => {
    // If the current page no longer has items (e.g. after deleting the last item on a page),
    // go back to the previous page
    if (page > 1 && (page - 1) * DRAFTS_PER_PAGE >= drafts.length) {
      setPage((prev) => Math.max(1, prev - 1))
    }
  }, [drafts.length])

  useEffect(() => {
    dispatch(loadDrafts())
  }, [dispatch])

  // Refresh drafts when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadDrafts())
    }, [dispatch])
  )

  const navigateToAddCar = (options = {}) => {
    navigation.navigate("CarOwnerDashboard", {
      screen: "AddCar",
      params: options,
    })
  }

  const handleEditDraft = (draft) => {
    const draftWithStep = {
      ...draft,
      currentStep: draft.currentStep || 1,
    }

    navigateToAddCar({
      draftData: draftWithStep,
      isDraft: true,
    })
  }

  const handleDeleteDraft = (draftId) => {
    Alert.alert(
      t("deleteDraft", "Delete Draft"),
      t("deleteDraftConfirm", "Are you sure you want to delete this draft? This cannot be undone."),
      [
        {
          text: t("cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteDraft(draftId))
              // Refresh the list after deletion
              setTimeout(() => {
                dispatch(loadDrafts())
              }, 500)
            } catch (error) {
              console.error('Error deleting draft:', error)
              Alert.alert(t("Error"), t("Failed to delete draft. Please try again."))
            }
          },
        },
      ],
    )
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

  const getDraftTitle = (draft) => {
    const make = draft.formData?.make || ""
    const model = draft.formData?.model || ""
    const year = draft.formData?.year || ""
    const customMake = draft.formData?.customMake || ""

    const parts = []
    if (make && make !== "Other") parts.push(make)
    else if (make === "Other" && customMake) parts.push(customMake)
    if (model) parts.push(model)
    if (year) parts.push(`(${year})`)

    if (parts.length === 0) {
      // Fallback: use owner name if available
      if (draft.formData?.ownerName) return `Draft – ${draft.formData.ownerName}`
      return t("carDraft", "Car Draft")
    }

    return parts.join(" ")
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>{t("savedDrafts", "Saved Drafts")}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007EFD" />
          <Text style={styles.loadingText}>{t("loading", "Loading...")}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("savedDrafts", "Saved Drafts")}</Text>
        <View style={styles.placeholder} />
      </View>

      {drafts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>{t("noDrafts", "No Saved Drafts")}</Text>
          <Text style={styles.emptyDescription}>{t("noDraftsDesc", "Your saved car listings will appear here")}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigateToAddCar({ forceNew: true })}> 
            <Text style={styles.addButtonText}>{t("addCar", "Add New Car")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {displayedDrafts.map((draft) => (
            <View key={draft.id} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                {getCarImage(draft) && <Image source={getCarImage(draft)} style={styles.carImage} />}
                <View style={styles.draftInfo}>
                  <Text style={styles.carTitle}>
                    {getDraftTitle(draft)}
                  </Text>
                  <Text style={styles.carDetails}>
                    {draft.formData?.year && `${draft.formData.year} • `}
                    {draft.formData?.type || "Car"}
                  </Text>
                  <Text style={styles.savedDate}>
                    {t("saved", "Saved")}: {formatDate(draft.updatedAt || draft.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {t("step", "Step")} {draft.currentStep || 1} {t("of", "of")} 5
                  {" – "}
                  {[
                    t("vehicleInfo", "Vehicle Info"),
                    t("ownerInfo", "Owner Info"),
                    t("location", "Location"),
                    t("pricing", "Pricing"),
                    t("media", "Media"),
                  ][(draft.currentStep || 1) - 1]}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((draft.currentStep || 1) / 5) * 100}%` }]} />
                </View>
              </View>

              <View style={styles.draftActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditDraft(draft)}>
                  <Ionicons name="pencil-outline" size={20} color="#007EFD" />
                  <Text style={styles.editButtonText}>{t("continue", "Continue")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDraft(draft.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {drafts.length > DRAFTS_PER_PAGE && (
            <View style={styles.paginationContainer}>
              <Text style={styles.paginationInfo}>
                {t("showing", "Showing")} {displayedDrafts.length} {t("of", "of")} {drafts.length} {t("drafts", "drafts")}
              </Text>
              <View style={styles.paginationButtons}>
                <TouchableOpacity
                  style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  <Ionicons name="chevron-back-outline" size={18} color={page === 1 ? "#CBD5E1" : "#007EFD"} />
                </TouchableOpacity>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <TouchableOpacity
                    key={`page-${p}`}
                    style={[styles.pageButton, page === p && styles.pageButtonActive]}
                    onPress={() => setPage(p)}
                  >
                    <Text style={[styles.pageButtonText, page === p && styles.pageButtonTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.pageButton, !hasMore && styles.pageButtonDisabled]}
                  onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={!hasMore}
                >
                  <Ionicons name="chevron-forward-outline" size={18} color={!hasMore ? "#CBD5E1" : "#007EFD"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  draftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  draftHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F1F5F9",
  },
  draftInfo: {
    flex: 1,
    justifyContent: "center",
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  carDetails: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  savedDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007EFD",
    borderRadius: 2,
  },
  draftActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 12,
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    color: "#007EFD",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
  },
  loadMoreButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    marginBottom: 20,
  },
  loadMoreText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  paginationContainer: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 20,
    gap: 10,
  },
  paginationInfo: {
    fontSize: 13,
    color: "#64748B",
  },
  paginationButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pageButtonActive: {
    backgroundColor: "#007EFD",
    borderColor: "#007EFD",
  },
  pageButtonDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  pageButtonTextActive: {
    color: "#FFFFFF",
  },
})

export default SavedDraftsScreen