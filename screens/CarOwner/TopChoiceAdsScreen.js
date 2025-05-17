"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import LoadingSkeleton from "../../components/Map/LoadingSkeleton"

const TopChoiceAdsScreen = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [promotedCars, setPromotedCars] = useState([])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setPromotedCars([
          {
            id: "1",
            name: "Audi Q7 50 Quattro",
            image:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png",
            model: "2023",
            status: "active",
            views: 245,
            clicks: 32,
            impressions: 1250,
            endDate: "2023-12-31",
          },
          {
            id: "4",
            name: "Tesla Model Y",
            image:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41.%20Car%20Buy%20-%20Step%201%20-%20Purchase%20Method-fJF7Jxc1TrBOt5jYsRg5DqhDD7ML05.png",
            model: "2023",
            status: "active",
            views: 187,
            clicks: 24,
            impressions: 980,
            endDate: "2023-12-15",
          },
        ])
        setLoading(false)
      }, 1500)

      return () => {
        // Cleanup if needed
      }
    }, []),
  )

  const renderItem = ({ item }) => (
    <View style={styles.promotionCard}>
      <Image source={{ uri: item.image }} style={styles.carImage} resizeMode="cover" />

      <View style={styles.cardContent}>
        <Text style={styles.carName}>{item.name}</Text>
        <Text style={styles.modelYear}>{item.model}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.clicks}</Text>
            <Text style={styles.statLabel}>Clicks</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{((item.clicks / item.views) * 100).toFixed(1)}%</Text>
            <Text style={styles.statLabel}>CTR</Text>
          </View>
        </View>

        <View style={styles.promotionFooter}>
          <Text style={styles.endDate}>Ends: {item.endDate}</Text>
          <TouchableOpacity style={styles.extendButton}>
            <Text style={styles.extendButtonText}>Extend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top Choice Ads</Text>
        <TouchableOpacity style={styles.newAdButton} onPress={() => navigation.navigate("MyCars")}>
          <Text style={styles.newAdButtonText}>New Ad</Text>
          <MaterialIcons name="add" size={18} color="#007EFD" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <MaterialIcons name="info" size={20} color="#007EFD" />
        <Text style={styles.infoText}>
          Top Choice Ads get 5x more visibility and appear at the top of search results.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton style={styles.promotionSkeleton} />
          <LoadingSkeleton style={styles.promotionSkeleton} />
        </View>
      ) : promotedCars.length > 0 ? (
        <FlatList
          data={promotedCars}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="star-border" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Top Choice Ads</Text>
          <Text style={styles.emptyText}>
            Promote your cars to get more visibility and increase your chances of renting them out.
          </Text>
          <TouchableOpacity style={styles.createAdButton} onPress={() => navigation.navigate("MyCars")}>
            <Text style={styles.createAdButtonText}>Create Your First Ad</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  newAdButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 126, 253, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newAdButtonText: {
    color: "#007EFD",
    fontWeight: "600",
    marginRight: 4,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 126, 253, 0.05)",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007EFD",
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: "#666666",
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    padding: 16,
  },
  promotionSkeleton: {
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
  },
  promotionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  carImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  carName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  modelYear: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  promotionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  endDate: {
    fontSize: 14,
    color: "#666666",
  },
  extendButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  extendButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  createAdButton: {
    backgroundColor: "#007EFD",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createAdButtonText: {
    color: "white",
    fontWeight: "600",
  },
})

export default TopChoiceAdsScreen

