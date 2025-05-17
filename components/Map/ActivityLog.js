import { View, Text, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const ActivityLog = ({ type, message, time }) => {
  const getIcon = () => {
    switch (type) {
      case "approval":
        return "check-circle"
      case "view":
        return "visibility"
      case "inquiry":
        return "chat"
      default:
        return "notifications"
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={getIcon()} size={20} color="#007EFD" />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 126, 253, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  time: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
})

export default ActivityLog

