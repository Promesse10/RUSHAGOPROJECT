"use client"

import { useEffect } from "react"
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
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { loadDrafts, deleteDraft } from "../../redux/action/draftsActions"

const SavedDraftsScreen = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const dispatch = useDispatch()

  // Redux state
  const { drafts, loading, error } = useSelector((state) => state.drafts || { drafts: [], loading: false, error: null })

  useEffect(() => {
    dispatch(loadDrafts())
  }, [dispatch])

  const handleEditDraft = (draft) => {
    navigation.navigate("AddCar", {
      draftData: draft,
      isDraft: true,
    })
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
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddCar")}>
            <Text style={styles.addButtonText}>{t("addCar", "Add New Car")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {drafts.map((draft) => (
            <View key={draft.id} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                {getCarImage(draft) && <Image source={getCarImage(draft)} style={styles.carImage} />}
                <View style={styles.draftInfo}>
                  <Text style={styles.carTitle}>
                    {draft.formData?.make || "Unknown"} {draft.formData?.model || ""}
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
                  {t("step", "Step")} {draft.currentStep || 1} {t("of", "of")} 6
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((draft.currentStep || 1) / 6) * 100}%` }]} />
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
})

export default SavedDraftsScreen
