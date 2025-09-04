"use client"

import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"

const { width } = Dimensions.get("window")

const ErrorModal = ({ visible, onClose, onRetry, title, message, type = "error" }) => {
  const getIconName = () => {
    switch (type) {
      case "network":
        return "wifi-outline"
      case "location":
        return "location-outline"
      case "data":
        return "server-outline"
      case "warning":
        return "warning-outline"
      default:
        return "alert-circle-outline"
    }
  }

  const getIconColor = () => {
    switch (type) {
      case "network":
        return "#FF6B35"
      case "location":
        return "#007EFD"
      case "data":
        return "#FF9500"
      case "warning":
        return "#FFD60A"
      default:
        return "#FF3B30"
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
            <Icon name={getIconName()} size={48} color={getIconColor()} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            {onRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Icon name="refresh" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#007EFD",
  },
  retryButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
})

export default ErrorModal
