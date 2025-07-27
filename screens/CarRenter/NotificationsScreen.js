import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationChatBot = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bounceAnimation] = useState(new Animated.Value(1));

  // Sample notifications from admin
  const sampleNotifications = [
    {
      id: 1,
      title: 'Welcome to Rushago!',
      message: 'Thank you for joining our car rental platform. Explore amazing cars in your area.',
      timestamp: new Date(Date.now() - 60000 * 30), // 30 minutes ago
      isRead: false,
      type: 'welcome',
    },
    {
      id: 2,
      title: 'New Cars Available',
      message: 'We have added new BMW and Mercedes cars in Kigali area. Check them out!',
      timestamp: new Date(Date.now() - 60000 * 120), // 2 hours ago
      isRead: false,
      type: 'update',
    },
    {
      id: 3,
      title: 'Special Discount',
      message: 'Get 20% off on weekend rentals. Use code WEEKEND20 when booking.',
      timestamp: new Date(Date.now() - 60000 * 180), // 3 hours ago
      isRead: false,
      type: 'promotion',
    },
  ];

  useEffect(() => {
    // Simulate receiving notifications
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
  }, []);

  useEffect(() => {
    // Bounce animation for notification icon
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
        ]).start();
      }, 3000);

      return () => clearInterval(bounceInterval);
    }
  }, [unreadCount]);

  const handleNotificationPress = () => {
    setShowModal(true);
    // Mark all notifications as read when modal is opened
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'welcome': return 'hand-left';
      case 'update': return 'car';
      case 'promotion': return 'pricetag';
      default: return 'notifications';
    }
  };

  // Always show the notification button, but only bounce if there are unread notifications
  return (
    <>
      {/* Floating Notification Button */}
      <Animated.View 
        style={[
          styles.floatingButton,
          { transform: [{ scale: unreadCount > 0 ? bounceAnimation : 1 }] }
        ]}
      >
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Icon name="chatbubble-ellipses" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Notification Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <Icon name="chatbubble-ellipses" size={24} color="#007EFD" />
                <Text style={styles.modalTitle}>Notifications</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Chat Bot Interface */}
            <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.botMessage}>
                <View style={styles.botAvatar}>
                  <Icon name="robot" size={20} color="white" />
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.botName}>Rushago Assistant</Text>
                  <Text style={styles.messageText}>
                    Hi! I'm here to keep you updated with the latest news and offers from Rushago.
                  </Text>
                  <Text style={styles.messageTime}>Now</Text>
                </View>
              </View>

              {notifications.map((notification) => (
                <View key={notification.id} style={styles.botMessage}>
                  <View style={styles.botAvatar}>
                    <Icon 
                      name={getNotificationIcon(notification.type)} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <View style={styles.messageContent}>
                    <Text style={styles.messageTitle}>{notification.title}</Text>
                    <Text style={styles.messageText}>{notification.message}</Text>
                    <Text style={styles.messageTime}>
                      {formatTime(notification.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.botMessage}>
                <View style={styles.botAvatar}>
                  <Icon name="information-circle" size={16} color="white" />
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.messageText}>
                    That's all for now! I'll notify you when there are new updates.
                  </Text>
                  <Text style={styles.messageTime}>Now</Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.chatFooter}>
              <Text style={styles.footerText}>
                You'll receive notifications about new cars, offers, and updates.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  notificationButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007EFD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  botMessage: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007EFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderTopLeftRadius: 5,
    padding: 12,
  },
  botName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007EFD',
    marginBottom: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
  },
  chatFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default NotificationChatBot;