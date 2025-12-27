"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  RefreshControl,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../redux/action/notificationActions"

const NotificationChatBot = () => {
  const dispatch = useDispatch()

  // Redux state
  const notifications = useSelector((state) => state.notifications?.notifications) || []
  const unreadCount = useSelector((state) => state.notifications?.unreadCount) || 0
  const isLoading = useSelector((state) => state.notifications?.isLoading) || false
  const error = useSelector((state) => state.notifications?.error) || null
  const [initialLoad, setInitialLoad] = useState(true);

  
  // Local state
  const [showModal, setShowModal] = useState(false)
  const [bounceAnimation] = useState(new Animated.Value(1))
  const [refreshing, setRefreshing] = useState(false)

  // Fetch notifications on component mount
  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  // Bounce animation for notification icon when there are unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      const bounceInterval = setInterval(() => {
        Animated.sequence([
          Animated.timing(bounceAnimation, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start()
      }, 3000)

      return () => clearInterval(bounceInterval)
    }
  }, [unreadCount, bounceAnimation])

  // Handle notification press - open modal and mark all as read
  const handleNotificationPress = useCallback(() => {
    setShowModal(true)

    // Mark all notifications as read when modal is opened
    if (unreadCount > 0) {
      notifications
        .filter((n) => !n.isRead)
        .forEach((n) => dispatch(markNotificationAsRead(n._id)))
    }
    
  }, [dispatch, unreadCount])

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    dispatch(fetchNotifications()).finally(() => {
      setRefreshing(false)
    })
  }, [dispatch])
// 🔁 Polling for new notifications every 5 seconds
useEffect(() => {
  const fetchData = async () => {
    await dispatch(fetchNotifications());
    if (initialLoad) setInitialLoad(false);
  };

  fetchData(); // fetch once immediately

  const interval = setInterval(() => {
    dispatch(fetchNotifications());
  }, 5000);

  return () => clearInterval(interval);
}, [dispatch]);


  // Handle delete notification
  const handleDeleteNotification = useCallback(
    (notificationId) => {
      Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteNotification(notificationId)),
        },
      ])
    },
    [dispatch],
  )
// ✅ Handle tapping a single notification
const handleNotificationItemPress = useCallback(
  (notification) => {
    // Toggle expansion (optional if you want to show full message)
    Alert.alert(
      notification.title,
      notification.message,
      [
        {
          text: "Mark as Read",
          onPress: () => {
            if (!notification.isRead) dispatch(markNotificationAsRead(notification._id))
          },
        },
        { text: "Close", style: "cancel" },
      ],
      { cancelable: true },
    )
  },
  [dispatch],
)

  // Format time helper
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "Unknown time"

    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diff = now - notificationTime
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }, [])

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "welcome":
        return "hand-left"
      case "update":
        return "car"
      case "promotion":
        return "pricetag"
      case "booking":
        return "calendar"
      case "payment":
        return "card"
      case "system":
        return "settings"
      default:
        return "notifications"
    }
  }, [])

  // Get notification color based on type
  const getNotificationColor = useCallback((type) => {
    switch (type) {
      case "welcome":
        return "#4CAF50"
      case "update":
        return "#2196F3"
      case "promotion":
        return "#FF9800"
      case "booking":
        return "#9C27B0"
      case "payment":
        return "#F44336"
      case "system":
        return "#607D8B"
      default:
        return "#007EFD"
    }
  }, [])

  return (
    <>
      {/* Floating Notification Button */}
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: unreadCount > 0 ? bounceAnimation : 1 }] }]}>
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
          <Icon name="chatbubble-ellipses" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Notification Modal */}
      <Modal visible={showModal} transparent={true} animationType="slide"   presentationStyle="overFullScreen"
  statusBarTranslucent={true} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <Icon name="chatbubble-ellipses" size={24} color="#007EFD" />
                <Text style={styles.modalTitle}>Notifications</Text>
                {notifications.length > 0 && <Text style={styles.notificationCount}>({notifications.length})</Text>}
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Chat Bot Interface */}
            <ScrollView
              style={styles.chatContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
         

           {/* Loading State */}
{initialLoad && isLoading && notifications.length === 0 && (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading notifications...</Text>
  </View>
)}


              {/* Error State */}
              {error && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={24} color="#F44336" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchNotifications())}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Notifications List */}
              {notifications.length > 0
                ? notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification._id}
                      style={[styles.botMessage, !notification.isRead && styles.unreadMessage]}
                      onPress={() => handleNotificationItemPress(notification)}
                      onLongPress={() => handleDeleteNotification(notification._id)}
                    >
                      <View style={[styles.botAvatar, { backgroundColor: getNotificationColor(notification.type) }]}>
                        <Icon name={getNotificationIcon(notification.type)} size={16} color="white" />
                      </View>
                      <View style={styles.messageContent}>
                        <Text style={styles.messageTitle}>{notification.title}</Text>
                        <Text style={styles.messageText}>{notification.message}</Text>
                        <View style={styles.messageFooter}>
                          <Text style={styles.messageTime}>{formatTime(notification.createdAt)}</Text>
                          {!notification.isRead && <View style={styles.unreadDot} />}
                          {notification.priority === "high" && <Icon name="alert" size={12} color="#F44336" />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                : !isLoading &&
                  !error && (
                    <View style={styles.emptyContainer}>
                      <Icon name="notifications-off" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>No notifications yet</Text>
                      <Text style={styles.emptySubtext}>
                        You'll receive notifications about new cars, offers, and updates here.
                      </Text>
                    </View>
                  )}

              {/* Bot End Message */}
              {notifications.length > 0 && (
                <View style={styles.botMessage}>
                  <View style={[styles.botAvatar, { backgroundColor: "#4CAF50" }]}>
                    <Icon name="checkmark-circle" size={16} color="white" />
                  </View>
                  <View style={styles.messageContent}>
                    <Text style={styles.messageText}>
                      That's all for now! I'll notify you when there are new updates.
                    </Text>
                    <Text style={styles.messageTime}>Now</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.chatFooter}>
              <Text style={styles.footerText}>You'll receive notifications about new cars, offers, and updates.</Text>
              {notifications.length > 0 && (
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={() => {
                    Alert.alert("Clear All Notifications", "Are you sure you want to delete all notifications?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear All",
                        style: "destructive",
                        onPress: () => {
                          notifications.forEach((notification) => {
                            dispatch(deleteNotification(notification._id))
                          })
                        },
                      },
                    ])
                  }}
                >
                  <Text style={styles.clearAllButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  notificationButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007EFD",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  notificationCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  closeButton: {
    padding: 5,
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  botMessage: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  unreadMessage: {
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: -10,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007EFD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderTopLeftRadius: 5,
    padding: 12,
  },
  botName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007EFD",
    marginBottom: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 6,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007EFD",
  },
  chatFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#f8f9fa",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 10,
  },
  clearAllButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 15,
  },
  clearAllButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})

export default NotificationChatBot
