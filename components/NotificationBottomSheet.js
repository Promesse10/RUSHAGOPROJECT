import React, { useState, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useDispatch, useSelector } from "react-redux"
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../redux/action/notificationActions"

const { width, height } = Dimensions.get("window")

const NotificationBottomSheet = ({ visible, onClose }) => {
  const dispatch = useDispatch()
  const notifications = useSelector((state) => state.notifications?.notifications ?? [])
  const isLoading = useSelector((state) => state.notifications?.isLoading ?? false)
  const filteredNotifications = notifications.filter(n => n && typeof n === 'object' && n._id)
  const [expandedId, setExpandedId] = useState(null)

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  const handleDelete = (id) => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteNotification(id)),
      },
    ])
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return "calendar"
      case "payment":
        return "card"
      case "message":
        return "chatbubble"
      case "system":
        return "settings"
      default:
        return "notifications"
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "booking":
        return "#3B82F6"
      case "payment":
        return "#10B981"
      case "message":
        return "#F59E0B"
      case "system":
        return "#8B5CF6"
      default:
        return "#007EFD"
    }
  }

  const renderNotificationItem = ({ item }) => {
    if (!item || typeof item !== 'object') {
      return null
    }
    const notificationId = item._id || item.id
    const isExpanded = expandedId === notificationId
    const isUnread = !item.isRead

    return (
      <View style={styles.notificationItemContainer}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            isUnread && styles.unreadNotification,
          ]}
          onPress={() => {
            if (isUnread) {
              handleMarkAsRead(notificationId)
            }
            setExpandedId(isExpanded ? null : notificationId)
          }}
        >
          <View style={styles.notificationMainContent}>
            <View
              style={[
                styles.notificationIconContainer,
                { backgroundColor: getNotificationColor(item.type) + "20" },
              ]}
            >
              <Ionicons
                name={getNotificationIcon(item.type)}
                size={20}
                color={getNotificationColor(item.type)}
              />
            </View>

            <View style={styles.notificationContent}>
              <Text
                style={[
                  styles.notificationTitle,
                  isUnread && styles.unreadNotificationTitle,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.notificationTime}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.notificationActions}>
              {isUnread && <View style={styles.unreadIndicator} />}
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color="#9CA3AF"
              />
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedMessage}>{item.message}</Text>
              <View style={styles.expandedActions}>
                {isUnread && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.markReadButton]}
                    onPress={() => handleMarkAsRead(notificationId)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Mark as Read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(notificationId)}
                >
                  <Ionicons name="trash" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#007EFD" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007EFD" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item?._id || item?.id || Math.random().toString()}
              scrollEnabled
              style={styles.notificationsList}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheet: {
    backgroundColor: "white",
    borderRadius: 24,
    width: width * 0.9,
    height: height * 0.8,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  notificationItem: {
    padding: 16,
  },
  unreadNotification: {
    backgroundColor: "#F0F9FF",
  },
  notificationMainContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: "700",
  },
  notificationMessage: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  expandedMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1E293B",
    marginBottom: 12,
  },
  expandedActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  markReadButton: {
    backgroundColor: "#10B981",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
})

export default NotificationBottomSheet
