import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const CarCard = ({ car, viewType, onPress, onEdit, onPromote, onDelete }) => {
  if (viewType === "grid") {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={onPress}>
        <Image source={{ uri: car.image }} style={styles.gridImage} resizeMode="cover" />
        <View style={styles.gridContent}>
          <Text style={styles.carName} numberOfLines={1}>
            {car.name}
          </Text>
          <Text style={styles.modelYear}>{car.model}</Text>

          <View style={styles.gridFooter}>
            <Text style={styles.price}>{car.price}</Text>
            <View style={[styles.statusBadge, car.status === "active" ? styles.activeBadge : styles.pendingBadge]}>
              <Text style={styles.statusText}>{car.status === "active" ? "Active" : "Pending"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <MaterialIcons name="edit" size={16} color="#007EFD" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onPromote}>
            <MaterialIcons name="star" size={16} color="#007EFD" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <MaterialIcons name="delete" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress}>
      <Image source={{ uri: car.image }} style={styles.listImage} resizeMode="cover" />
      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <Text style={styles.carName}>{car.name}</Text>
          <View style={[styles.statusBadge, car.status === "active" ? styles.activeBadge : styles.pendingBadge]}>
            <Text style={styles.statusText}>{car.status === "active" ? "Active" : "Pending"}</Text>
          </View>
        </View>

        <View style={styles.listDetails}>
          <View style={styles.detailItem}>
            <MaterialIcons name="calendar-today" size={14} color="#666666" />
            <Text style={styles.detailText}>{car.model}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="settings" size={14} color="#666666" />
            <Text style={styles.detailText}>{car.gearType}</Text>
          </View>
        </View>

        <View style={styles.listFooter}>
          <Text style={styles.price}>{car.price}</Text>
          <View style={styles.listActions}>
            <TouchableOpacity style={styles.listActionButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={18} color="#007EFD" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listActionButton} onPress={onPromote}>
              <MaterialIcons name="star" size={18} color="#007EFD" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.listActionButton, styles.listDeleteButton]} onPress={onDelete}>
              <MaterialIcons name="delete" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  gridCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: "1%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridImage: {
    width: "100%",
    height: 120,
  },
  gridContent: {
    padding: 12,
  },
  gridFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  gridActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  listCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listImage: {
    width: 120,
    height: "100%",
  },
  listContent: {
    flex: 1,
    padding: 12,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listDetails: {
    flexDirection: "row",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    color: "#666666",
    fontSize: 12,
  },
  listFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  listActions: {
    flexDirection: "row",
  },
  listActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  listDeleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  carName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  modelYear: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007EFD",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  pendingBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  statusText: {
    fontWeight: "600",
    fontSize: 10,
  },
})

export default CarCard

