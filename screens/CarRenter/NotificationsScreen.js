// NotificationsScreen.js
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView,
  Modal,
  Pressable
} from "react-native";
import { ArrowLeft, Check, CheckCheck } from "react-native-feather";
import { useNavigation, useRoute } from "@react-navigation/native";

const NotificationModal = ({ notification, visible, onClose, markAsRead }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Image source={notification?.icon} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>{notification?.title}</Text>
          </View>
          <Text style={styles.modalMessage}>{notification?.message}</Text>
          <Text style={styles.modalTime}>{notification?.time} • {formatDate(notification?.date)}</Text>
          
          {!notification?.read && (
            <TouchableOpacity 
              style={styles.markAsReadButton}
              onPress={() => {
                markAsRead(notification?.id);
                onClose();
              }}
            >
              <Text style={styles.markAsReadText}>Mark as read</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const formatDate = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date >= today) {
    return "Today";
  } else if (date >= yesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { notifications: initialNotifications, setNotifications: updateNotifications } = route.params || { notifications: [], setNotifications: () => {} };
  
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const todayNotifications = notifications.filter(n => n.section === "today");
  const weekNotifications = notifications.filter(n => n.section === "week");
  
  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };
  
  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    
    // Update parent component's state
    if (updateNotifications) {
      updateNotifications(updatedNotifications);
    }
  };
  
  const closeModal = () => {
    setModalVisible(false);
  };
  
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <Image source={notification.icon} style={styles.notificationIcon} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <View style={styles.notificationTimeContainer}>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft stroke="#000" width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {/* <View style={styles.readAllContainer}>
            <CheckCheck stroke="#007EFD" width={24} height={24} />
          </View> */}
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Today Section */}
          {todayNotifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today</Text>
              {todayNotifications.map(renderNotificationItem)}
            </View>
          )}
          
          {/* This Week Section */}
          {weekNotifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>This Week</Text>
              {weekNotifications.map(renderNotificationItem)}
            </View>
          )}
          
          {/* Empty State */}
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notifications yet</Text>
            </View>
          )}
        </ScrollView>
        
        {/* Notification Detail Modal */}
        <NotificationModal
          notification={selectedNotification}
          visible={modalVisible}
          onClose={closeModal}
          markAsRead={markAsRead}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  readAllContainer: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  unreadNotification: {
    backgroundColor: "rgba(75, 77, 255, 0.05)",
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
    justifyContent: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#000000",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  notificationTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 15,
    lineHeight: 22,
  },
  modalTime: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 20,
  },
  markAsReadButton: {
    backgroundColor: "#007EFD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  markAsReadText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotificationsScreen;