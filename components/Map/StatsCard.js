import { View, Text, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const StatsCard = ({ title, count, icon }) => {
  return (
    <View style={styles.card}>
      <MaterialIcons name={icon} size={24} color="#007EFD" />
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
})

export default StatsCard

