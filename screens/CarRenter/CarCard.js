import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
import { Star, MapPin } from "lucide-react-native"

const { width } = Dimensions.get("window")

const CarCard = ({ car, onPress, fullWidth = false }) => {
  const cardWidth = fullWidth ? width - 40 : 280

  return (
    <TouchableOpacity style={[styles.container, { width: cardWidth }]} onPress={() => onPress(car)} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: car.image }} style={styles.carImage} />
        <View style={[styles.availabilityBadge, !car.available && styles.unavailableBadge]}>
          <Text style={styles.availabilityText}>{car.available ? "Available" : "Not Available"}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.carName}>{car.name}</Text>
          <View style={styles.rating}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{car.rating}</Text>
          </View>
        </View>

        <Text style={styles.carModel}>{car.model}</Text>

        <View style={styles.specs}>
          <Text style={styles.specText}>{car.seats} seats</Text>
          <Text style={styles.specDivider}>•</Text>
          <Text style={styles.specText}>{car.fuel}</Text>
          <Text style={styles.specDivider}>•</Text>
          <Text style={styles.specText}>{car.transmission}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${car.price}</Text>
            <Text style={styles.priceUnit}>/hour</Text>
          </View>
          {car.location && (
            <View style={styles.locationContainer}>
              <MapPin size={12} color="#666" />
              <Text style={styles.locationText}>Nearby</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginRight: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageContainer: {
    position: "relative",
    height: 160,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  carImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  availabilityBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableBadge: {
    backgroundColor: "#FF5722",
  },
  availabilityText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  carName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  carModel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  specs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  specText: {
    fontSize: 12,
    color: "#999",
  },
  specDivider: {
    marginHorizontal: 6,
    fontSize: 12,
    color: "#999",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007EFD",
  },
  priceUnit: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
})

export default CarCard
